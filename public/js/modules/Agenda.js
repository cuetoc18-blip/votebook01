/**
 * Módulo Agenda — citas y recordatorios
 * © 2026 Carlos Cueto Mejía
 * Títulos predefinidos + selección de líderes de Estructura + Supabase
 */
(function (global) {
  'use strict';

  var TITULOS_PREDEF = [
    'Reuniones barriales',
    'Atención a líder',
    'Nuevo líder'
  ];

  function createAgenda() {
    var citas = [];
    var STORAGE_KEY = 'agenda_citas_v1';
    var uiInyectada = false;

    function getSupabase() {
      if (global.SupabaseConfig && global.SupabaseConfig.client) {
        return global.SupabaseConfig.client;
      }
      return null;
    }

    function uid() {
      return 'AG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    /** Lee líderes (y coordinadores) desde el módulo Estructura */
    function obtenerPersonasEstructura() {
      var lista = [];
      try {
        var est = global.App && global.App.instance && global.App.instance.estructura;
        var data = null;

        // Intentar datos vivos del módulo
        if (est && typeof est.getData === 'function') {
          data = est.getData();
        }

        // Fallback: localStorage de estructura
        if (!data) {
          var raw = localStorage.getItem('estructura_organizacional_v1');
          data = raw ? JSON.parse(raw) : null;
        }

        if (!data || !data.coordinadores) return lista;

        data.coordinadores.forEach(function (c) {
          lista.push({
            id: c.id,
            rol: 'Coordinador',
            nombre: c.nombre || '',
            cedula: c.cedula || '',
            telefono: c.telefono || '',
            barrio: c.barrio || '',
            localidad: c.localidad || ''
          });
          (c.lideres || []).forEach(function (l) {
            lista.push({
              id: l.id,
              rol: 'Líder',
              nombre: l.nombre || '',
              cedula: l.cedula || '',
              telefono: l.telefono || '',
              barrio: l.barrio || '',
              localidad: l.localidad || '',
              coordinador: c.nombre || ''
            });
          });
        });
      } catch (e) {
        console.warn('[Agenda] No se pudo leer estructura:', e);
      }
      return lista;
    }

    function llenarSelectLideres(seleccionadoId) {
      var sel = document.getElementById('ag-lider');
      if (!sel) return;
      var personas = obtenerPersonasEstructura();
      var html = '<option value="">— Seleccionar líder / coordinador —</option>';
      personas.forEach(function (p) {
        var label = p.rol + ': ' + p.nombre;
        if (p.barrio) label += ' · ' + p.barrio;
        if (p.coordinador) label += ' (Coord: ' + p.coordinador + ')';
        var selected = (seleccionadoId && seleccionadoId === p.id) ? ' selected' : '';
        html += '<option value="' + p.id + '"' + selected +
          ' data-nombre="' + (p.nombre || '').replace(/"/g, '&quot;') + '"' +
          ' data-telefono="' + (p.telefono || '') + '"' +
          ' data-barrio="' + (p.barrio || '').replace(/"/g, '&quot;') + '"' +
          ' data-rol="' + p.rol + '">' + label + '</option>';
      });
      if (!personas.length) {
        html += '<option value="" disabled>No hay líderes en Estructura. Créalos primero.</option>';
      }
      html += '<option value="__otro__">Otro (escribir nombre)</option>';
      sel.innerHTML = html;
    }

    function onLiderChange() {
      var sel = document.getElementById('ag-lider');
      if (!sel) return;
      var otroWrap = document.getElementById('ag-lider-otro-wrap');
      var personaEl = document.getElementById('ag-persona');
      var telEl = document.getElementById('ag-telefono');
      var lugarEl = document.getElementById('ag-lugar');

      if (sel.value === '__otro__') {
        if (otroWrap) otroWrap.classList.remove('hidden');
        if (personaEl) { personaEl.value = ''; personaEl.focus(); }
        return;
      }
      if (otroWrap) otroWrap.classList.add('hidden');
      if (!sel.value) return;
      var opt = sel.options[sel.selectedIndex];
      if (!opt) return;
      var nombre = opt.getAttribute('data-nombre') || '';
      var tel = opt.getAttribute('data-telefono') || '';
      var barrio = opt.getAttribute('data-barrio') || '';
      if (personaEl) personaEl.value = nombre;
      if (telEl) telEl.value = tel;
      if (lugarEl && barrio && !lugarEl.value) lugarEl.value = barrio;
    }


    function normalizarTel(tel) {
      var d = String(tel || '').replace(/\D/g, '');
      if (!d) return '';
      if (d.startsWith('57') && d.length >= 12) return d;
      if (d.startsWith('0')) d = d.slice(1);
      if (d.length === 10) return '57' + d;
      if (!d.startsWith('57')) return '57' + d;
      return d;
    }

    function armarMensajeRecordatorio(item) {
      var lineas = [
        '📅 RECORDATORIO',
        '📆 Fecha: ' + (item.fecha || '—')
      ];
      if (item.hora) lineas.push('⏰ Hora: ' + item.hora);
      if (item.lugar) lineas.push('📍 Lugar: ' + item.lugar);
      lineas.push('CARLOS CUETO MEJIA Edil Norte-Centro Histórico · Barranquilla');
      return lineas.join('\n');
    }

    /**
     * Envía recordatorio por el bot de WhatsApp (módulo Mensajes)
     */
    async function cancelarRecordatorioProgramado(item) {
      var id = item && (item.waReminderId || (getRemindersSent()[item.id + '_wa']));
      var sb = getSupabase();
      if (!sb || !id) return;
      try {
        await sb.from('whatsapp_messages').delete().eq('id', id).eq('estado', 'pendiente');
      } catch (e) {}
    }

    async function programarRecordatorioBot(item) {
      if (!item || !item.recordatorio) return false;
      var tel = normalizarTel(item.telefono);
      if (!tel || tel.length < 12) {
        console.warn('[Agenda] Sin teléfono para programar recordatorio');
        return false;
      }
      var cuando = fechaHoraCita(item);
      if (!cuando) return false;
      var envio = new Date(cuando.getTime() - 60 * 60 * 1000);
      var mensaje = armarMensajeRecordatorio(item);
      await cancelarRecordatorioProgramado(item);
      if (envio.getTime() < Date.now() - 30000) {
        console.log('[Agenda] La hora de recordatorio ya pasó, no se programa');
        return false;
      }
      var horaIso = envio.toISOString();
      if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
        var r = await window.WhatsAppCola.encolar({
          destino: tel,
          mensaje: mensaje,
          hora_envio: horaIso
        });
        if (r && r.ok) {
          var wid = r.data && r.data.id;
          if (wid) {
            item.waReminderId = wid;
            var map = getRemindersSent();
            map[item.id + '_wa'] = wid;
            try { localStorage.setItem(REMINDER_KEY, JSON.stringify(map)); } catch (e) {}
          }
          console.log('[Agenda] Recordatorio programado en bot', horaIso, tel);
          return true;
        }
      }
      var sb = getSupabase();
      if (sb) {
        var ins = await sb.from('whatsapp_messages').insert([{
          destino: tel, mensaje: mensaje, estado: 'pendiente', hora_envio: horaIso
        }]).select();
        if (!ins.error) {
          console.log('[Agenda] Recordatorio insertado whatsapp_messages', horaIso);
          return true;
        }
        console.warn('[Agenda] programar', ins.error && ins.error.message);
      }
      return false;
    }

    function enviarRecordatorioWhatsApp(item, silencioso) {
      var tel = normalizarTel(item.telefono);
      if (!tel || tel.length < 12) {
        if (!silencioso) {
          console.warn('[Agenda] Sin teléfono válido para recordatorio');
        }
        return false;
      }
      var mensaje = armarMensajeRecordatorio(item);
      if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
        window.WhatsAppCola.encolar({ destino: tel, mensaje: mensaje });
      }

      // Asegurar módulo Mensajes iniciado
      try {
        if (typeof global.initModuloMensajes === 'function') {
          global.initModuloMensajes();
        }
      } catch (e) {}

      var api = global.App && global.App.instance && global.App.instance.mensajes;
      if (api && typeof api.enviar === 'function') {
        var ok = api.enviar({ to: tel, message: mensaje });
        console.log('[Agenda] Recordatorio WhatsApp →', tel, ok ? 'OK/cola' : 'falló');
        return !!ok;
      }

      // Fallback: encolar en localStorage wa_cola
      try {
        var raw = localStorage.getItem('wa_cola');
        var cola = raw ? JSON.parse(raw) : [];
        cola.push({
          id: Date.now(),
          to: tel,
          message: mensaje,
          timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('wa_cola', JSON.stringify(cola));
        console.log('[Agenda] Recordatorio encolado en wa_cola:', tel);
        return true;
      } catch (e) {
        console.error('[Agenda] No se pudo encolar WhatsApp:', e);
        return false;
      }
    }



    var REMINDER_KEY = 'agenda_reminders_sent_v1';
    var reminderTimer = null;

    function getRemindersSent() {
      try {
        var raw = localStorage.getItem(REMINDER_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    }

    function markReminderSent(id) {
      var map = getRemindersSent();
      map[id] = new Date().toISOString();
      try { localStorage.setItem(REMINDER_KEY, JSON.stringify(map)); } catch (e) {}
    }

    function yaEnvioRecordatorio1h(id) {
      var map = getRemindersSent();
      return !!map[id];
    }

    /** Combina fecha + hora de la cita → Date local */
    function fechaHoraCita(item) {
      if (!item || !item.fecha) return null;
      var f = String(item.fecha).slice(0, 10);
      var h = (item.hora || '00:00').trim();
      if (h.length === 5) h = h + ':00';
      // local time
      var d = new Date(f + 'T' + h);
      if (isNaN(d.getTime())) return null;
      return d;
    }

    /**
     * Respaldo: si no se pudo programar en el bot, intenta encolar 1h antes
     * mientras la pestaña esté abierta.
     */
    function revisarRecordatorios1h() {
      var ahora = new Date();
      var ventanaMin = 55;  // desde 65 min antes...
      var ventanaMax = 65;  // ...hasta 55 min antes (margen ~10 min)

      citas.forEach(function (item) {
        if (!item || !item.id) return;
        if (yaEnvioRecordatorio1h(item.id)) return;
        if (!item.telefono) return;

        var cuando = fechaHoraCita(item);
        if (!cuando) return;

        var diffMs = cuando.getTime() - ahora.getTime();
        var diffMin = diffMs / 60000;

        // ¿Está entre ~55 y ~65 minutos antes?
        if (diffMin >= ventanaMin && diffMin <= ventanaMax) {
          console.log('[Agenda] ⏰ Recordatorio 1h →', item.titulo, item.telefono, Math.round(diffMin) + ' min');
          var ok = enviarRecordatorioWhatsApp(item, true);
          if (ok) {
            markReminderSent(item.id);
            console.log('[Agenda] ✅ Recordatorio 1h enviado/encolado:', item.id);
          }
        }

        // Si ya pasó la hora, marcar para no reintentar
        if (diffMin < -5) {
          markReminderSent(item.id);
        }
      });
    }

    function iniciarSchedulerRecordatorios() {
      if (reminderTimer) return;
      // Primera revisión pronto
      setTimeout(revisarRecordatorios1h, 5000);
      // Cada 60 segundos
      reminderTimer = setInterval(revisarRecordatorios1h, 60 * 1000);
      console.log('[Agenda] Scheduler recordatorios 1h activo (cada 60s)');
    }


    function onTituloChange() {
      var sel = document.getElementById('ag-titulo-predef');
      var otroWrap = document.getElementById('ag-titulo-otro-wrap');
      var tituloHidden = document.getElementById('ag-titulo');
      var otroInput = document.getElementById('ag-titulo-otro');
      if (!sel) return;
      if (sel.value === '__otro__') {
        if (otroWrap) otroWrap.classList.remove('hidden');
        if (tituloHidden) tituloHidden.value = (otroInput && otroInput.value) ? otroInput.value.trim() : '';
        if (otroInput) otroInput.focus();
      } else {
        if (otroWrap) otroWrap.classList.add('hidden');
        if (tituloHidden) tituloHidden.value = sel.value;
      }
    }

    function loadFromLocal() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        citas = raw ? JSON.parse(raw) : [];
      } catch (e) {
        citas = [];
      }
    }

    function saveLocal() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
      } catch (e) {}
    }

    async function load() {
      var supabase = getSupabase();
      if (supabase) {
        try {
          var res = await supabase
            .from('agenda')
            .select('*')
            .order('fecha', { ascending: true });

          if (res.error) throw res.error;
          citas = (res.data || []).map(function (r) {
            return {
              id: r.id,
              titulo: r.titulo || '',
              fecha: r.fecha || null,
              hora: r.hora || '',
              lugar: r.lugar || '',
              descripcion: r.descripcion || '',
              telefono: r.telefono || '',
              persona: r.persona || '',
              liderId: r.lider_id || r.liderId || null,
              tipo: r.tipo || 'cita',
              recordatorio: r.recordatorio || false
            };
          });
          saveLocal();
          console.log('[Agenda] Cargado desde Supabase:', citas.length);
        } catch (err) {
          console.warn('[Agenda] Error Supabase, usando LocalStorage:', err.message);
          loadFromLocal();
        }
      } else {
        loadFromLocal();
      }
      render();
      actualizarStats();
    }

    async function saveToSupabase(item, esNuevo) {
      var supabase = getSupabase();
      if (!supabase) return;
      var row = {
        id: item.id,
        titulo: item.titulo,
        fecha: item.fecha,
        hora: item.hora,
        lugar: item.lugar,
        descripcion: item.descripcion,
        telefono: item.telefono,
        persona: item.persona,
        lider_id: item.liderId || null,
        tipo: item.tipo,
        recordatorio: item.recordatorio || false
      };
      try {
        if (esNuevo) {
          var ins = await supabase.from('agenda').insert([row]);
          if (ins.error) throw ins.error;
        } else {
          var up = await supabase.from('agenda').update(row).eq('id', item.id);
          if (up.error) throw up.error;
        }
        console.log('[Agenda] Guardado:', item.id);
      } catch (err) {
        console.error('[Agenda] Error guardando:', err.message);
      }
    }

    async function deleteFromSupabase(id) {
      var supabase = getSupabase();
      if (!supabase) return;
      try {
        await supabase.from('agenda').delete().eq('id', id);
      } catch (e) {
        console.error('[Agenda] Error eliminando:', e.message);
      }
    }

    function listar() {
      return citas.slice().sort(function (a, b) {
        return String(a.fecha || '').localeCompare(String(b.fecha || ''));
      });
    }

    function actualizarStats() {
      var hoy = new Date().toISOString().slice(0, 10);
      var total = citas.length;
      var hoyCount = citas.filter(function (c) {
        return String(c.fecha || '').slice(0, 10) === hoy;
      }).length;
      var proximasCount = citas.filter(function (c) {
        return String(c.fecha || '') >= hoy;
      }).length;

      var elT = document.getElementById('ag-stat-total');
      var elH = document.getElementById('ag-stat-hoy');
      var elP = document.getElementById('ag-stat-proximas');
      if (elT) elT.textContent = total;
      if (elH) elH.textContent = hoyCount;
      if (elP) elP.textContent = proximasCount;
    }

    function abrirForm(editItem) {
      var form = document.getElementById('form-agenda');
      if (!form) return;

      document.getElementById('ag-edit-id').value = editItem ? editItem.id : '';

      // Título predefinido
      var tituloVal = editItem ? (editItem.titulo || '') : 'Reuniones barriales';
      var predefSel = document.getElementById('ag-titulo-predef');
      var otroWrap = document.getElementById('ag-titulo-otro-wrap');
      var tituloInput = document.getElementById('ag-titulo');
      if (predefSel) {
        if (TITULOS_PREDEF.indexOf(tituloVal) >= 0) {
          predefSel.value = tituloVal;
          if (otroWrap) otroWrap.classList.add('hidden');
          if (tituloInput) tituloInput.value = tituloVal;
        } else if (tituloVal) {
          predefSel.value = '__otro__';
          if (otroWrap) otroWrap.classList.remove('hidden');
          if (tituloInput) tituloInput.value = tituloVal;
        } else {
          predefSel.value = 'Reuniones barriales';
          if (otroWrap) otroWrap.classList.add('hidden');
          if (tituloInput) tituloInput.value = 'Reuniones barriales';
        }
      }

      document.getElementById('ag-fecha').value = editItem && editItem.fecha
        ? String(editItem.fecha).slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      document.getElementById('ag-hora').value = editItem ? (editItem.hora || '') : '';
      document.getElementById('ag-lugar').value = editItem ? (editItem.lugar || '') : '';
      document.getElementById('ag-persona').value = editItem ? (editItem.persona || '') : '';
      document.getElementById('ag-telefono').value = editItem ? (editItem.telefono || '') : '';
      document.getElementById('ag-tipo').value = editItem ? (editItem.tipo || 'cita') : 'cita';
      document.getElementById('ag-descripcion').value = editItem ? (editItem.descripcion || '') : '';
      var rec = document.getElementById('ag-recordatorio');
      if (rec) rec.checked = !!(editItem && editItem.recordatorio);

      // Llenar líderes y seleccionar si hay
      llenarSelectLideres(editItem ? editItem.liderId : null);

      document.getElementById('form-agenda-titulo').textContent = editItem ? 'Editar cita' : 'Nueva cita / agenda';
      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function cerrarForm() {
      var form = document.getElementById('form-agenda');
      if (form) form.classList.add('hidden');
    }

    function guardar() {
      var editId = document.getElementById('ag-edit-id').value;

      // Resolver título
      var predef = (document.getElementById('ag-titulo-predef') || {}).value || '';
      var titulo = '';
      if (predef === '__otro__') {
        titulo = (document.getElementById('ag-titulo').value || '').trim();
      } else {
        titulo = predef || (document.getElementById('ag-titulo').value || '').trim();
      }

      var fecha = (document.getElementById('ag-fecha').value || '').trim();
      var hora = (document.getElementById('ag-hora').value || '').trim();
      var lugar = (document.getElementById('ag-lugar').value || '').trim();
      var persona = (document.getElementById('ag-persona').value || '').trim();
      var telefono = (document.getElementById('ag-telefono').value || '').trim();
      var tipo = (document.getElementById('ag-tipo').value || 'cita');
      var descripcion = (document.getElementById('ag-descripcion').value || '').trim();
      var recordatorio = !!(document.getElementById('ag-recordatorio') && document.getElementById('ag-recordatorio').checked);
      var liderSelVal = (document.getElementById('ag-lider') || {}).value || '';
      var liderId = (liderSelVal && liderSelVal !== '__otro__') ? liderSelVal : null;
      if (liderSelVal === '__otro__') {
        var otroNom = ((document.getElementById('ag-lider-otro') || {}).value || '').trim();
        if (otroNom && !persona) persona = otroNom;
        if (otroNom) persona = otroNom;
      }

      if (!titulo) {
        alert('Elige o escribe un título');
        return;
      }
      if (!fecha) {
        alert('La fecha es obligatoria para agendar');
        return;
      }

      var esNuevo = !editId;
      var item;

      if (esNuevo) {
        item = {
          id: uid(),
          titulo: titulo,
          fecha: fecha,
          hora: hora,
          lugar: lugar,
          persona: persona,
          telefono: telefono,
          liderId: liderId || null,
          tipo: tipo,
          descripcion: descripcion,
          recordatorio: recordatorio
        };
        citas.unshift(item);
      } else {
        var idx = citas.findIndex(function (c) { return c.id === editId; });
        if (idx === -1) return;
        item = citas[idx];
        item.titulo = titulo;
        item.fecha = fecha;
        item.hora = hora;
        item.lugar = lugar;
        item.persona = persona;
        item.telefono = telefono;
        item.liderId = liderId || null;
        item.tipo = tipo;
        item.descripcion = descripcion;
        item.recordatorio = recordatorio;
      }

      saveLocal();
      saveToSupabase(item, esNuevo);
      if (item.recordatorio) programarRecordatorioBot(item);
      else cancelarRecordatorioProgramado(item);
      cerrarForm();
      render();
      actualizarStats();
    }

    function eliminar(id) {
      if (!confirm('¿Eliminar esta cita?')) return;
      citas = citas.filter(function (c) { return c.id !== id; });
      saveLocal();
      deleteFromSupabase(id);
      render();
      actualizarStats();
    }

    function render() {
      var container = document.getElementById('lista-agenda');
      if (!container) return;

      var ordenadas = listar();
      if (!ordenadas.length) {
        container.innerHTML = '<div class="text-center py-14 text-slate-400 bg-white rounded-2xl border border-slate-200"><div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-50 flex items-center justify-center"><i class="fas fa-calendar-alt text-2xl text-violet-300"></i></div><p class="font-medium text-slate-600">No hay citas agendadas</p><p class="text-sm mt-1">Crea una con títulos predefinidos y elige un líder</p></div>';
        return;
      }

      var hoy = new Date().toISOString().slice(0, 10);
      var html = '';
      ordenadas.forEach(function (c) {
        var fechaStr = String(c.fecha || '').slice(0, 10);
        var esHoy = fechaStr === hoy;
        var esPasada = fechaStr < hoy;
        var fechaBadge = esHoy ? 'bg-emerald-100 text-emerald-800' : (esPasada ? 'bg-slate-100 text-slate-500' : 'bg-violet-100 text-violet-800');
        var tipoIcon = 'fa-calendar-check';
        if ((c.titulo || '').toLowerCase().indexOf('reunión') >= 0 || (c.titulo || '').toLowerCase().indexOf('reunion') >= 0) tipoIcon = 'fa-users';
        if ((c.titulo || '').toLowerCase().indexOf('atención') >= 0 || (c.titulo || '').toLowerCase().indexOf('atencion') >= 0) tipoIcon = 'fa-handshake';
        if ((c.titulo || '').toLowerCase().indexOf('nuevo líder') >= 0 || (c.titulo || '').toLowerCase().indexOf('nuevo lider') >= 0) tipoIcon = 'fa-user-plus';

        html += '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow ' + (esPasada ? 'opacity-60' : '') + '">';
        html += '<div class="flex flex-wrap justify-between items-start gap-3"><div class="min-w-0 flex-1">';
        html += '<div class="flex items-center gap-2 mb-1"><i class="fas ' + tipoIcon + ' text-violet-500"></i>';
        html += '<p class="font-semibold text-slate-800 truncate">' + (c.titulo || '') + '</p>';
        if (esHoy) html += '<span class="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">HOY</span>';
        html += '</div>';
        html += '<p class="text-xs text-slate-500 mb-1"><span class="inline-block px-2 py-0.5 rounded ' + fechaBadge + ' text-[11px] font-medium">' + (c.fecha || '') + (c.hora ? ' · ' + c.hora : '') + '</span></p>';
        if (c.lugar) html += '<p class="text-xs text-slate-500"><i class="fas fa-map-marker-alt mr-1"></i>' + c.lugar + '</p>';
        if (c.persona) html += '<p class="text-xs text-slate-500"><i class="fas fa-user mr-1"></i>' + c.persona + (c.telefono ? ' · ' + c.telefono : '') + '</p>';
        if (c.descripcion) html += '<p class="text-[11px] text-slate-400 mt-1">' + c.descripcion + '</p>';
        html += '</div><div class="flex gap-1 shrink-0">';
        html += '<button onclick="window.App.instance.agenda.enviarWhatsApp(\'' + c.id + '\')" class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center" title="Recordatorio WhatsApp"><i class="fab fa-whatsapp text-xs"></i></button>';
        html += '<button onclick="window.App.instance.agenda.editar(\'' + c.id + '\')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700 flex items-center justify-center" title="Editar"><i class="fas fa-pen text-xs"></i></button>';
        html += '<button onclick="window.App.instance.agenda.eliminar(\'' + c.id + '\')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>';
        html += '</div></div></div>';
      });
      container.innerHTML = html;
    }

    function inyectarUI() {
      if (uiInyectada) return;
      if (!document.body) return;

      var tabsContainer = document.querySelector('.flex.space-x-2.py-2');
      if (tabsContainer && !document.getElementById('tab-agenda')) {
        var btn = document.createElement('button');
        btn.id = 'tab-agenda';
        btn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all';
        btn.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i>Agenda';
        btn.onclick = function () {
          if (typeof cambiarModulo === 'function') cambiarModulo('agenda');
          if (window.App && window.App.instance && window.App.instance.agenda) {
            window.App.instance.agenda.init();
          }
        };
        tabsContainer.appendChild(btn);
      }

      var main = document.querySelector('main');
      if (main && !document.getElementById('modulo-agenda')) {
        var section = document.createElement('section');
        section.id = 'modulo-agenda';
        section.className = 'modulo-seccion fade-in';
        section.style.display = 'none';
        section.innerHTML =
          '<header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">' +
          '<div><h1 class="text-2xl font-bold text-slate-800">Agenda</h1>' +
          '<p class="text-slate-500 text-sm mt-0.5">Reuniones, atención a líderes y citas</p></div>' +
          '<button id="btn-nueva-cita" class="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-2">' +
          '<i class="fas fa-plus"></i> Nueva cita</button></header>' +

          '<div class="grid grid-cols-3 gap-3 mb-6">' +
          '<div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-slate-800" id="ag-stat-total">0</p><p class="text-xs text-slate-500 mt-1">Total</p></div>' +
          '<div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-emerald-600" id="ag-stat-hoy">0</p><p class="text-xs text-slate-500 mt-1">Hoy</p></div>' +
          '<div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-violet-600" id="ag-stat-proximas">0</p><p class="text-xs text-slate-500 mt-1">Próximas</p></div>' +
          '</div>' +

          '<div id="form-agenda" class="hidden mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">' +
          '<div class="px-5 py-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white flex justify-between items-center">' +
          '<h3 id="form-agenda-titulo" class="font-bold text-base">Nueva cita</h3>' +
          '<button type="button" id="btn-cerrar-form-agenda" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg">&times;</button>' +
          '</div>' +
          '<div class="p-5 space-y-4">' +
          '<input type="hidden" id="ag-edit-id" value="">' +
          '<input type="hidden" id="ag-titulo" value="Reuniones barriales">' +

          // Título predefinido
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de cita *</label>' +
          '<select id="ag-titulo-predef" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none">' +
          '<option value="Reuniones barriales">Reuniones barriales</option>' +
          '<option value="Atención a líder">Atención a líder</option>' +
          '<option value="Nuevo líder">Nuevo líder</option>' +
          '<option value="__otro__">Otro (escribir)</option>' +
          '</select></div>' +
          '<div id="ag-titulo-otro-wrap" class="hidden">' +
          '<label class="block text-xs font-semibold text-slate-600 mb-1.5">Título personalizado</label>' +
          '<input type="text" id="ag-titulo-otro" placeholder="Escribe el título..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">' +
          '</div>' +

          // Selector de líder
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5"><i class="fas fa-user-tie mr-1 text-violet-500"></i> Líder / Coordinador</label>' +
          '<select id="ag-lider" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none">' +
          '<option value="">— Seleccionar líder / coordinador —</option>' +
          '<option value="__otro__">Otro (escribir nombre)</option>' +
          '</select>' +
          '<div id="ag-lider-otro-wrap" class="hidden mt-2">' +
          '<input type="text" id="ag-lider-otro" placeholder="Nombre de la persona..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">' +
          '</div>' +
          '<p class="text-[11px] text-slate-400 mt-1">Lista desde Estructura · o elige Otro para escribir</p></div>' +

          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' +
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Fecha *</label>' +
          '<input type="date" id="ag-fecha" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"></div>' +
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Hora</label>' +
          '<input type="time" id="ag-hora" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"></div>' +
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Lugar / Barrio</label>' +
          '<input type="text" id="ag-lugar" placeholder="Barrio o dirección" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"></div>' +
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Tipo</label>' +
          '<select id="ag-tipo" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none">' +
          '<option value="cita">Cita</option><option value="reunion">Reunión</option><option value="seguimiento">Seguimiento</option><option value="otro">Otro</option>' +
          '</select></div>' +
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Persona</label>' +
          '<input type="text" id="ag-persona" placeholder="Nombre (se llena al elegir líder)" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"></div>' +
          '<div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>' +
          '<input type="text" id="ag-telefono" placeholder="3001234567" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"></div>' +
          '<div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1.5">Descripción</label>' +
          '<textarea id="ag-descripcion" rows="2" placeholder="Detalles de la cita..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"></textarea></div>' +
          '<div class="sm:col-span-2"><label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">' +
          '<input type="checkbox" id="ag-recordatorio" class="rounded border-slate-300 text-violet-600 focus:ring-violet-500"> Recordatorio automático por WhatsApp 1 hora antes (lo envía el bot, aunque la app esté cerrada)</label></div>' +
          '</div>' +

          '<div class="flex gap-3 pt-2">' +
          '<button type="button" id="btn-cancelar-ag" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition text-sm">Cancelar</button>' +
          '<button type="button" id="btn-guardar-ag" class="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2">' +
          '<i class="fas fa-save"></i> Agendar</button></div>' +
          '</div></div>' +

          '<div id="lista-agenda" class="space-y-3">' +
          '<div class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando agenda...</p></div></div>';

        main.appendChild(section);

        document.getElementById('btn-nueva-cita').onclick = function () { abrirForm(null); };
        document.getElementById('btn-guardar-ag').onclick = function () {
          // Si eligió "otro", copiar del input visible
          var predef = document.getElementById('ag-titulo-predef');
          if (predef && predef.value === '__otro__') {
            var otro = document.getElementById('ag-titulo-otro');
            var hidden = document.getElementById('ag-titulo');
            if (otro && hidden) hidden.value = (otro.value || '').trim();
          }
          guardar();
        };
        document.getElementById('btn-cancelar-ag').onclick = cerrarForm;
        document.getElementById('btn-cerrar-form-agenda').onclick = cerrarForm;

        var tituloSel = document.getElementById('ag-titulo-predef');
        if (tituloSel) tituloSel.onchange = onTituloChange;

        var liderSel = document.getElementById('ag-lider');
        if (liderSel) liderSel.onchange = onLiderChange;
      }

      uiInyectada = true;
      console.log('[Agenda] UI inyectada (títulos predef + líderes)');
    }

    return {
      init: function () {
        inyectarUI();
        load();
        iniciarSchedulerRecordatorios();
        if (!getSupabase()) {
          window.addEventListener('supabase-ready', function onReady() {
            window.removeEventListener('supabase-ready', onReady);
            load();
          }, { once: true });
        }
      },
      listar: listar,
      editar: function (id) {
        var item = citas.find(function (c) { return c.id === id; });
        if (item) abrirForm(item);
      },
      eliminar: eliminar,
      abrirNuevo: function () { abrirForm(null); },
      enviarWhatsApp: function (id) {
        var item = citas.find(function (c) { return c.id === id; });
        if (!item) { alert('Cita no encontrada'); return; }
        if (!item.telefono) {
          var manual = prompt('Esta cita no tiene teléfono. Escribe el número:', '');
          if (!manual) return;
          item.telefono = manual;
        }
        var ok = enviarRecordatorioWhatsApp(item, false);
        if (ok) alert('📤 Recordatorio enviado/encolado por WhatsApp bot\n' + item.telefono);
        else alert('No se pudo enviar. Revisa el módulo Mensajes y que el bot esté conectado.');
      }
    };
  }

  global.App = global.App || {};
  global.App.Agenda = { create: createAgenda };

  function bootstrap() {
    global.App.instance = global.App.instance || {};
    if (!global.App.instance.agenda) {
      var inst = createAgenda();
      global.App.instance.agenda = inst;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { inst.init(); });
      } else {
        setTimeout(function () { inst.init(); }, 130);
      }
    }
  }
  bootstrap();

})(typeof window !== 'undefined' ? window : globalThis);
