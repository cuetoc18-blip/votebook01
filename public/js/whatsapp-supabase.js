/**
 * Cola WhatsApp → tabla public.whatsapp_messages + Storage bucket whatsapp
 */
(function (global) {
  'use strict';

  var BUCKET = 'whatsapp';

  function client() {
    return global.SupabaseConfig && global.SupabaseConfig.client;
  }

  function normTel(tel) {
    var d = String(tel || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('0')) d = d.replace(/^0+/, '');
    if (d.startsWith('57') && d.length >= 12) return d;
    if (d.length === 10) return '57' + d;
    if (!d.startsWith('57')) return '57' + d;
    return d;
  }

  async function copiarAWhatsapp(pathOrigen, destino, bucketOrigen) {
    var sb = client();
    if (!sb || !sb.storage || !pathOrigen) return '';
    var origen = String(pathOrigen).replace(/^judicial\//, '').replace(/^whatsapp\//, '');
    var bucket = bucketOrigen || 'judicial';
    var dl = await sb.storage.from(bucket).download(origen);
    if (dl.error || !dl.data) {
      console.warn('[WhatsAppCola] no se pudo leer', bucket + '/' + origen, dl.error && dl.error.message);
      return '';
    }
    var nombre = origen.split('/').pop() || ('anexo_' + Date.now());
    var blob = dl.data;
    var path = destino + '/' + Date.now() + '_' + String(nombre).replace(/[^\w.\-]+/g, '_');
    var up = await sb.storage.from(BUCKET).upload(path, blob, {
      upsert: true,
      contentType: blob.type || 'application/octet-stream'
    });
    if (up.error) {
      console.warn('[WhatsAppCola] copia upload', up.error.message);
      return '';
    }
    return path;
  }

  async function subirArchivo(file, destino) {
    var sb = client();
    if (!sb || !sb.storage || !file) return '';
    var safe = String(file.name || 'anexo').replace(/[^\w.\-]+/g, '_');
    var path = destino + '/' + Date.now() + '_' + safe;
    var res = await sb.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream'
    });
    if (res.error) {
      console.warn('[WhatsAppCola] upload', res.error.message);
      return '';
    }
    return path;
  }

  async function encolar(opts) {
    opts = opts || {};
    var sb = client();
    var destino = normTel(opts.destino || opts.to || '');
    var mensaje = String(opts.mensaje || opts.message || '').trim();
    if (!destino || destino.length < 12) {
      return { ok: false, error: 'Teléfono inválido' };
    }
    var files = opts.files || [];
    var pathsPrevios = opts.paths || opts.imagenes || [];
    if (!mensaje && (files.length || pathsPrevios.length)) mensaje = 'Adjunto';
    if (!mensaje && !files.length && !pathsPrevios.length) {
      return { ok: false, error: 'Mensaje o anexo requerido' };
    }

    var paths = [];
    for (var i = 0; i < files.length; i++) {
      var p = await subirArchivo(files[i], destino);
      if (p) paths.push(p);
    }
    for (var k = 0; k < pathsPrevios.length; k++) {
      var origen = pathsPrevios[k];
      if (!origen) continue;
      if (typeof origen === 'object') origen = origen.path || origen.url || '';
      var copiado = await copiarAWhatsapp(origen, destino, opts.bucketOrigen || 'judicial');
      if (copiado) paths.push(copiado);
      else if (typeof origen === 'string' && origen.indexOf('/') >= 0) paths.push(origen);
    }

    if (!sb) {
      try {
        var raw = localStorage.getItem('wa_cola') || '[]';
        var cola = JSON.parse(raw);
        cola.push({
          id: Date.now(), to: destino, message: mensaje,
          imagen_path: paths[0] || null,
          timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('wa_cola', JSON.stringify(cola));
      } catch (e) {}
      return { ok: true, local: true, paths: paths };
    }

    var filas = [];
    if (!paths.length) {
      filas.push({
        destino: destino,
        mensaje: mensaje,
        imagen_path: null,
        estado: 'pendiente',
        hora_envio: opts.hora_envio || new Date().toISOString()
      });
    } else {
      for (var j = 0; j < paths.length; j++) {
        filas.push({
          destino: destino,
          mensaje: j === 0 ? mensaje : 'Adjunto',
          imagen_path: paths[j],
          estado: 'pendiente',
          hora_envio: opts.hora_envio || new Date().toISOString()
        });
      }
    }

    var ins = await sb.from('whatsapp_messages').insert(filas).select();
    if (ins.error) {
      console.error('[WhatsAppCola] insert', ins.error.message);
      return { ok: false, error: ins.error.message };
    }
    console.log('[WhatsAppCola] pendiente →', destino, paths);
    return { ok: true, data: (ins.data && ins.data[0]) || filas[0], paths: paths };
  }

  async function encolarMasivo(destinos, mensaje, files) {
    destinos = destinos || [];
    var ok = 0, fail = 0;
    for (var i = 0; i < destinos.length; i++) {
      var r = await encolar({ destino: destinos[i], mensaje: mensaje, files: files || [] });
      if (r && r.ok) ok++; else fail++;
    }
    return { ok: fail === 0, enviados: ok, fallidos: fail };
  }

  async function listar(limite) {
    var sb = client();
    if (!sb) return [];
    var q = await sb.from('whatsapp_messages').select('*').order('created_at', { ascending: false }).limit(limite || 50);
    if (q.error) {
      console.warn('[WhatsAppCola] listar', q.error.message);
      return [];
    }
    return q.data || [];
  }

  global.WhatsAppCola = {
    encolar: encolar,
    encolarMasivo: encolarMasivo,
    listar: listar,
    normTel: normTel,
    BUCKET: BUCKET
  };
})(typeof window !== 'undefined' ? window : globalThis);
