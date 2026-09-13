/**
 * Seguimiento sincronizado con Estructura
 * Vista 1: líderes  ·  Vista 2: ruta de visita a sus amigos
 * © 2026 Carlos Cueto Mejía
 */
(function (global) {
  'use strict';

  function createSeguimiento() {
    var visitas = [];
    var STORAGE_KEY = 'seguimientos_rutas_v1';
    var APERTURAS_KEY = 'seguimiento_aperturas_v1';
    var aperturas = {};
    var uiInyectada = false;
    var vista = 'lideres';
    var seccion = 'lideres';
    var liderActivo = null;
    var qLider = '';
    var filtroRuta = 'todos';
    var modoEdicion = false;
    var filtroCoord = '';
    var filtroLoc = '';

    function getSupabase() {
      return (global.SupabaseConfig && global.SupabaseConfig.client) || null;
    }

    function uid() {
      return 'SG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    function estructuraData() {
      try {
        var est = global.App && global.App.instance && global.App.instance.estructura;
        if (est && typeof est.getData === 'function') {
          var d = est.getData() || {};
          if (d.coordinadores && d.coordinadores.length) return d;
        }
      } catch (e) {}
      try {
        var raw = localStorage.getItem('estructura_organizacional_v1');
        if (raw) return JSON.parse(raw);
      } catch (e2) {}
      return { coordinadores: [] };
    }

    function listaLideres() {
      var out = [];
      (estructuraData().coordinadores || []).forEach(function (c) {
        (c.lideres || []).forEach(function (l) {
          var amigos = (l.amigos || []).slice();
          out.push({
            id: l.id,
            nombre: l.nombre || '',
            cedula: l.cedula || '',
            telefono: l.telefono || '',
            barrio: l.barrio || '',
            localidad: l.localidad || '',
            direccion: l.direccion || '',
            coordinadorId: c.id,
            coordinadorNombre: c.nombre || '',
            amigos: amigos,
            nAmigos: amigos.length
          });
        });
      });
      out.sort(function (a, b) {
        return String(a.nombre).localeCompare(String(b.nombre), 'es');
      });
      return out;
    }

    function findLider(id) {
      var all = listaLideres();
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    }

    function loadLocal() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        visitas = raw ? JSON.parse(raw) : [];
      } catch (e) { visitas = []; }
      try {
        var ap = localStorage.getItem(APERTURAS_KEY);
        aperturas = ap ? JSON.parse(ap) : {};
      } catch (e2) { aperturas = {}; }
    }

    function saveLocal() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(visitas)); } catch (e) {}
      try { localStorage.setItem(APERTURAS_KEY, JSON.stringify(aperturas)); } catch (e2) {}
    }

    function infoApertura(liderId) {
      var a = aperturas[liderId] || { n: 0, activa: 0 };
      return { n: Number(a.n) || 0, activa: Number(a.activa) || 0 };
    }

    function rutaActiva(liderId) {
      return infoApertura(liderId).activa || 0;
    }

    function visitaDe(amigoId, liderId) {
      var ruta = rutaActiva(liderId);
      return visitas.find(function (v) {
        return v.personaId === amigoId &&
          String(v.liderId || '') === String(liderId || '') &&
          Number(v.rutaNum || 0) === Number(ruta);
      }) || null;
    }

    function lideresAnalisis() {
      return listaLideres().filter(function (l) {
        if (filtroCoord && String(l.coordinadorNombre || '') !== filtroCoord) return false;
        if (filtroLoc && String(l.localidad || l.barrio || '') !== filtroLoc) return false;
        return true;
      });
    }

    function totales() {
      var lideres = lideresAnalisis();
      var t = { lideres: lideres.length, amigos: 0, visitados: 0, noEstaba: 0, pendientes: 0, noMilitante: 0, observaciones: 0 };
      var sumaCump = 0;
      var nRutas = 0;
      lideres.forEach(function (l) {
        var r = resumenRuta(l);
        t.amigos += r.total;
        t.visitados += r.visitados;
        t.noEstaba += r.noEstaba;
        t.pendientes += r.pendientes;
        t.noMilitante += r.noMilitante;
        if (infoApertura(l.id).n > 0) {
          sumaCump += r.cumplimiento;
          nRutas++;
        }
      });
      visitas.forEach(function (v) {
        if (v.observacion || (v.nota && String(v.nota).indexOf('Ruta de') !== 0)) t.observaciones++;
      });
      t.avance = t.amigos ? Math.round((t.visitados / t.amigos) * 100) : 0;
      t.cumplimiento = nRutas ? Math.round(sumaCump / nRutas) : 0;
      return t;
    }

    function barra(pct, color) {
      pct = Math.max(0, Math.min(100, pct || 0));
      return '<div class="h-2 rounded-full bg-slate-100 overflow-hidden">' +
        '<div class="h-2 rounded-full ' + color + '" style="width:' + pct + '%"></div></div>';
    }

    function panelGrafico() {
      var t = totales();
      var total = t.amigos || 0;
      var pVis = total ? Math.round((t.visitados / total) * 100) : 0;
      var pPen = total ? Math.round((t.pendientes / total) * 100) : 0;
      var pNo = total ? Math.round((t.noEstaba / total) * 100) : 0;
      var pNm = total ? Math.round((t.noMilitante / total) * 100) : 0;
      return '<div class="space-y-4">' +
        '<div class="flex flex-wrap justify-between gap-2">' +
          '<div><p class="text-sm font-bold text-slate-800">Estado de amigos</p>' +
          '<p class="text-xs text-slate-500">' + total + ' amigos en las rutas · ' + t.lideres + ' líderes</p></div>' +
          '<p class="text-[11px] text-slate-400">' + new Date().toLocaleTimeString('es-CO') + '</p>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">' +
          '<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">' +
            '<p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Visitados</p>' +
            '<p class="text-4xl font-bold text-emerald-700 mt-1">' + t.visitados + '</p>' +
            '<p class="text-sm text-emerald-600 mt-1">' + pVis + '% de los amigos</p></div>' +
          '<div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">' +
            '<p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Pendientes por visitar</p>' +
            '<p class="text-4xl font-bold text-amber-700 mt-1">' + t.pendientes + '</p>' +
            '<p class="text-sm text-amber-600 mt-1">' + pPen + '% de los amigos</p></div>' +
          '<div class="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">' +
            '<p class="text-xs font-semibold uppercase tracking-wide text-rose-700">No estaban</p>' +
            '<p class="text-4xl font-bold text-rose-700 mt-1">' + t.noEstaba + '</p>' +
            '<p class="text-sm text-rose-600 mt-1">' + pNo + '% de los amigos</p></div>' +
          '<div class="rounded-2xl border border-slate-300 bg-slate-100 p-5 text-center">' +
            '<p class="text-xs font-semibold uppercase tracking-wide text-slate-600">No militante</p>' +
            '<p class="text-4xl font-bold text-slate-700 mt-1">' + t.noMilitante + '</p>' +
            '<p class="text-sm text-slate-500 mt-1">' + pNm + '% de los amigos</p></div>' +
        '</div>' +
        '<div class="bg-white rounded-2xl border border-slate-200 p-4">' +
          '<p class="text-xs font-semibold text-slate-600 mb-2">Distribución de amigos</p>' +
          '<div class="h-4 rounded-full overflow-hidden flex bg-slate-100">' +
            '<div class="h-4 bg-emerald-500" style="width:' + pVis + '%" title="Visitados"></div>' +
            '<div class="h-4 bg-amber-400" style="width:' + pPen + '%" title="Pendientes"></div>' +
            '<div class="h-4 bg-rose-400" style="width:' + pNo + '%" title="No estaban"></div>' +
            '<div class="h-4 bg-slate-300" style="width:' + pNm + '%" title="No militante"></div>' +
          '</div>' +
          '<div class="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">' +
            '<span><i class="fas fa-circle text-emerald-500 text-[8px] mr-1"></i>Visitados ' + t.visitados + '</span>' +
            '<span><i class="fas fa-circle text-amber-400 text-[8px] mr-1"></i>Pendientes ' + t.pendientes + '</span>' +
            '<span><i class="fas fa-circle text-rose-400 text-[8px] mr-1"></i>No estaban ' + t.noEstaba + '</span>' +
            '<span><i class="fas fa-circle text-slate-300 text-[8px] mr-1"></i>No militante ' + t.noMilitante + '</span>' +
          '</div>' +
        '</div>' +
        htmlAnalisis() +
        '</div>';
    }


    function visitaDeRuta(amigoId, liderId, rutaNum) {
      return visitas.find(function (v) {
        return v.personaId === amigoId &&
          String(v.liderId || '') === String(liderId || '') &&
          Number(v.rutaNum || 0) === Number(rutaNum);
      }) || null;
    }

    function resumenEnRuta(lider, rutaNum) {
      var tot = (lider.amigos || []).length;
      var ok = 0, no = 0, nm = 0;
      (lider.amigos || []).forEach(function (a) {
        var v = visitaDeRuta(a.id, lider.id, rutaNum);
        var est = (v && v.estado) || 'pendiente';
        if (est === 'realizado') ok++;
        else if (est === 'no_asistio') no++;
        else if (est === 'no_militante') nm++;
      });
      var pen = Math.max(0, tot - ok - no - nm);
      var base = Math.max(0, tot - nm);
      return {
        total: tot, visitados: ok, noEstaba: no, noMilitante: nm, pendientes: pen,
        cumplimiento: base ? Math.round((ok / base) * 100) : 0
      };
    }

    function opcionesFiltro() {
      var coords = {}, locs = {};
      listaLideres().forEach(function (l) {
        if (l.coordinadorNombre) coords[l.coordinadorNombre] = 1;
        var loc = l.localidad || '';
        if (loc) locs[loc] = 1;
      });
      return { coords: Object.keys(coords).sort(), locs: Object.keys(locs).sort() };
    }

    function htmlAnalisis() {
      var lideres = lideresAnalisis();
      var opt = opcionesFiltro();
      var ranking = lideres.map(function (l) {
        var r = resumenRuta(l);
        return { l: l, r: r, ap: infoApertura(l.id) };
      }).sort(function (a, b) {
        return (b.r.cumplimiento - a.r.cumplimiento) || (b.r.visitados - a.r.visitados);
      });

      var porBarrio = {};
      var porLoc = {};
      lideres.forEach(function (l) {
        var r = resumenRuta(l);
        var b = l.barrio || 'Sin barrio';
        if (!porBarrio[b]) porBarrio[b] = { amigos: 0, visitados: 0, pendientes: 0, noEstaba: 0 };
        porBarrio[b].amigos += r.total;
        porBarrio[b].visitados += r.visitados;
        porBarrio[b].pendientes += r.pendientes;
        porBarrio[b].noEstaba += r.noEstaba;
        var loc = l.localidad || 'Sin localidad';
        if (!porLoc[loc]) porLoc[loc] = { amigos: 0, visitados: 0, pendientes: 0 };
        porLoc[loc].amigos += r.total;
        porLoc[loc].visitados += r.visitados;
        porLoc[loc].pendientes += r.pendientes;
      });
      function rowsObj(obj, extra) {
        return Object.keys(obj).sort().map(function (k) {
          var x = obj[k];
          var des = x.amigos ? Math.round((x.visitados / x.amigos) * 100) : 0;
          return '<tr class="border-t border-slate-100">' +
            '<td class="py-1.5 pr-2">' + k + '</td>' +
            '<td class="py-1.5 text-right">' + x.amigos + '</td>' +
            '<td class="py-1.5 text-right text-emerald-700">' + x.visitados + '</td>' +
            '<td class="py-1.5 text-right text-amber-700">' + x.pendientes + '</td>' +
            (extra ? '<td class="py-1.5 text-right text-rose-700">' + (x.noEstaba || 0) + '</td>' : '') +
            '<td class="py-1.5 text-right font-semibold">' + des + '%</td></tr>';
        }).join('') || '<tr><td class="py-2 text-slate-400" colspan="6">Sin datos</td></tr>';
      }

      var rutasCmp = [1, 2, 3].map(function (n) {
        var acc = { visitados: 0, pendientes: 0, noEstaba: 0, amigos: 0 };
        lideres.forEach(function (l) {
          if (infoApertura(l.id).n < n) return;
          var r = resumenEnRuta(l, n);
          acc.visitados += r.visitados;
          acc.pendientes += r.pendientes;
          acc.noEstaba += r.noEstaba;
          acc.amigos += r.total;
        });
        acc.des = acc.amigos ? Math.round((acc.visitados / acc.amigos) * 100) : 0;
        return acc;
      });

      var criticos = [];
      lideres.forEach(function (l) {
        (l.amigos || []).forEach(function (a) {
          var fallas = 0;
          var det = [];
          for (var n = 1; n <= 3; n++) {
            if (infoApertura(l.id).n < n) continue;
            var v = visitaDeRuta(a.id, l.id, n);
            var est = (v && v.estado) || 'pendiente';
            det.push('R' + n + ':' + est);
            if (est === 'pendiente' || est === 'no_asistio') fallas++;
          }
          if (fallas >= 2) {
            criticos.push({
              nombre: a.nombre || 'Amigo',
              lider: l.nombre || '',
              barrio: a.barrio || l.barrio || '',
              fallas: fallas,
              det: det.join(' · ')
            });
          }
        });
      });
      criticos.sort(function (a, b) { return b.fallas - a.fallas; });

      var porDia = {};
      visitas.forEach(function (v) {
        if (v.tipo === 'apertura_ruta' || v.estado !== 'realizado') return;
        var d = '';
        try { d = new Date(v.fecha).toISOString().slice(0, 10); } catch (e) { return; }
        if (!d) return;
        porDia[d] = (porDia[d] || 0) + 1;
      });
      var dias = Object.keys(porDia).sort().slice(-14);
      var maxDia = 1;
      dias.forEach(function (d) { if (porDia[d] > maxDia) maxDia = porDia[d]; });

      var estancados = [];
      var now = Date.now();
      lideres.forEach(function (l) {
        var ap = infoApertura(l.id);
        if (!ap.n) return;
        var r = resumenRuta(l);
        if (!r.pendientes) return;
        var last = 0;
        visitas.forEach(function (v) {
          if (String(v.liderId) !== String(l.id)) return;
          var ts = Date.parse(v.fecha || '') || 0;
          if (ts > last) last = ts;
        });
        var diasN = last ? Math.max(0, Math.round((now - last) / 86400000)) : 0;
        estancados.push({ nombre: l.nombre || '', pendientes: r.pendientes, dias: diasN, rutas: ap.n });
      });
      estancados.sort(function (a, b) { return b.dias - a.dias; });

      var selCoord = '<option value="">Todos los coordinadores</option>' +
        opt.coords.map(function (c) {
          return '<option value="' + c.replace(/"/g, '&quot;') + '"' + (filtroCoord === c ? ' selected' : '') + '>' + c + '</option>';
        }).join('');
      var selLoc = '<option value="">Todas las localidades</option>' +
        opt.locs.map(function (c) {
          return '<option value="' + c.replace(/"/g, '&quot;') + '"' + (filtroLoc === c ? ' selected' : '') + '>' + c + '</option>';
        }).join('');

      var rankRows = ranking.map(function (x, i) {
        return '<tr class="border-t border-slate-100">' +
          '<td class="py-1.5 pr-2 text-slate-400">' + (i + 1) + '</td>' +
          '<td class="py-1.5 pr-2">' + (x.l.nombre || '') + '</td>' +
          '<td class="py-1.5 pr-2 text-xs text-slate-500">' + (x.l.barrio || '—') + '</td>' +
          '<td class="py-1.5 text-right">' + x.r.visitados + '/' + x.r.total + '</td>' +
          '<td class="py-1.5 text-right font-semibold ' + (x.r.cumplimiento >= 80 ? 'text-emerald-700' : (x.r.cumplimiento ? 'text-amber-700' : 'text-rose-700')) + '">' + x.r.cumplimiento + '%</td>' +
          '<td class="py-1.5 text-right text-xs">' + x.ap.n + '/3</td></tr>';
      }).join('') || '<tr><td class="py-2 text-slate-400" colspan="6">Sin líderes</td></tr>';

      var critRows = criticos.slice(0, 30).map(function (c) {
        return '<tr class="border-t border-slate-100">' +
          '<td class="py-1.5 pr-2">' + c.nombre + '</td>' +
          '<td class="py-1.5 pr-2 text-xs">' + c.lider + '</td>' +
          '<td class="py-1.5 pr-2 text-xs">' + c.barrio + '</td>' +
          '<td class="py-1.5 text-right font-semibold text-rose-700">' + c.fallas + '</td>' +
          '<td class="py-1.5 text-xs text-slate-500">' + c.det + '</td></tr>';
      }).join('') || '<tr><td class="py-2 text-slate-400" colspan="5">No hay reincidentes aún (hace falta más de una ruta).</td></tr>';

      var barrasDias = dias.length ? dias.map(function (d) {
        var n = porDia[d];
        var h = Math.max(8, Math.round((n / maxDia) * 80));
        return '<div class="flex flex-col items-center justify-end gap-1 flex-1 min-w-[18px]">' +
          '<div class="w-full bg-indigo-500 rounded-t" style="height:' + h + 'px" title="' + d + ': ' + n + '"></div>' +
          '<span class="text-[9px] text-slate-400 rotate-0">' + d.slice(8) + '</span></div>';
      }).join('') : '<p class="text-xs text-slate-400">Aún no hay visitas marcadas como visitado.</p>';

      var estRows = estancados.slice(0, 15).map(function (e) {
        return '<tr class="border-t border-slate-100"><td class="py-1.5">' + e.nombre + '</td>' +
          '<td class="py-1.5 text-right text-amber-700">' + e.pendientes + '</td>' +
          '<td class="py-1.5 text-right">' + e.dias + ' d</td>' +
          '<td class="py-1.5 text-right text-xs">' + e.rutas + '/3</td></tr>';
      }).join('') || '<tr><td class="py-2 text-slate-400" colspan="4">Sin rutas abiertas con pendientes</td></tr>';

      return '<div class="flex flex-wrap gap-2">' +
        '<select id="seg-filtro-coord" class="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">' + selCoord + '</select>' +
        '<select id="seg-filtro-loc" class="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">' + selLoc + '</select>' +
        '</div>' +

        '<div class="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">' +
          '<p class="text-sm font-bold text-slate-800 mb-1">Ranking de líderes</p>' +
          '<p class="text-[11px] text-slate-400 mb-2">Desempeño de la ruta activa</p>' +
          '<table class="w-full text-sm"><thead><tr class="text-[11px] uppercase text-slate-400">' +
          '<th class="text-left font-medium">#</th><th class="text-left font-medium">Líder</th><th class="text-left font-medium">Barrio</th>' +
          '<th class="text-right font-medium">Visitas</th><th class="text-right font-medium">Desempeño</th><th class="text-right font-medium">Rutas</th></tr></thead><tbody>' + rankRows + '</tbody></table></div>' +

        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
          '<div class="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">' +
            '<p class="text-sm font-bold text-slate-800 mb-2">Por localidad</p>' +
            '<table class="w-full text-sm"><thead><tr class="text-[11px] uppercase text-slate-400">' +
            '<th class="text-left">Localidad</th><th class="text-right">Amigos</th><th class="text-right">Vis.</th><th class="text-right">Pend.</th><th class="text-right">Des.</th></tr></thead><tbody>' +
            rowsObj(porLoc, false) + '</tbody></table></div>' +
          '<div class="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">' +
            '<p class="text-sm font-bold text-slate-800 mb-2">Por barrio</p>' +
            '<table class="w-full text-sm"><thead><tr class="text-[11px] uppercase text-slate-400">' +
            '<th class="text-left">Barrio</th><th class="text-right">Amigos</th><th class="text-right">Vis.</th><th class="text-right">Pend.</th><th class="text-right">No est.</th><th class="text-right">Des.</th></tr></thead><tbody>' +
            rowsObj(porBarrio, true) + '</tbody></table></div>' +
        '</div>' +

        '<div class="bg-white rounded-2xl border border-slate-200 p-4">' +
          '<p class="text-sm font-bold text-slate-800 mb-1">Comparación de las 3 rutas</p>' +
          '<p class="text-[11px] text-slate-400 mb-3">Solo líderes que ya abrieron esa ruta</p>' +
          '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
            [0,1,2].map(function (i) {
              var x = rutasCmp[i];
              return '<div class="rounded-xl border border-slate-200 p-3">' +
                '<p class="text-xs font-semibold text-indigo-600">Ruta ' + (i + 1) + '</p>' +
                '<p class="text-2xl font-bold text-slate-800 mt-1">' + x.des + '%</p>' +
                '<p class="text-[11px] text-slate-500 mt-1">Visitados ' + x.visitados + ' · Pend. ' + x.pendientes + ' · No est. ' + x.noEstaba + '</p></div>';
            }).join('') +
          '</div></div>' +

        '<div class="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">' +
          '<p class="text-sm font-bold text-slate-800 mb-1">Reincidentes</p>' +
          '<p class="text-[11px] text-slate-400 mb-2">Pendiente o no estaba en 2 o 3 rutas</p>' +
          '<table class="w-full text-sm"><thead><tr class="text-[11px] uppercase text-slate-400">' +
          '<th class="text-left">Amigo</th><th class="text-left">Líder</th><th class="text-left">Barrio</th><th class="text-right">Fallas</th><th class="text-left">Detalle</th></tr></thead><tbody>' +
          critRows + '</tbody></table></div>' +

        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
          '<div class="bg-white rounded-2xl border border-slate-200 p-4">' +
            '<p class="text-sm font-bold text-slate-800 mb-1">Visitas por día</p>' +
            '<p class="text-[11px] text-slate-400 mb-3">Últimos 14 días con registro visitado</p>' +
            '<div class="flex items-end gap-1 h-28">' + barrasDias + '</div></div>' +
          '<div class="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">' +
            '<p class="text-sm font-bold text-slate-800 mb-1">Días sin movimiento</p>' +
            '<p class="text-[11px] text-slate-400 mb-2">Líderes con pendientes y última actividad</p>' +
            '<table class="w-full text-sm"><thead><tr class="text-[11px] uppercase text-slate-400">' +
            '<th class="text-left">Líder</th><th class="text-right">Pend.</th><th class="text-right">Días</th><th class="text-right">Rutas</th></tr></thead><tbody>' +
            estRows + '</tbody></table></div>' +
        '</div>';
    }

    function pintarTorta3d() {
      var canvas = document.getElementById('seg-torta');
      if (!canvas || !canvas.getContext) return;
      var t = totales();
      var segs = [
        { n: t.visitados, color: '#10b981', side: '#059669' },
        { n: t.pendientes, color: '#f59e0b', side: '#d97706' },
        { n: t.noEstaba, color: '#f43f5e', side: '#e11d48' },
        { n: t.noMilitante, color: '#94a3b8', side: '#64748b' }
      ];
      var total = segs.reduce(function (s, x) { return s + (x.n || 0); }, 0);
      var ctx = canvas.getContext('2d');
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2 + 4;
      var rx = 150, ry = 58, prof = 22;
      function slice(cx, cy, rx, ry, a0, a1, fill) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        if (ctx.ellipse) ctx.ellipse(cx, cy, rx, ry, 0, a0, a1, false);
        else {
          ctx.lineTo(cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry);
          ctx.lineTo(cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (!total) {
        for (var z = prof; z >= 0; z--) slice(cx, cy + z, rx, ry, 0, Math.PI * 2, z ? '#cbd5e1' : '#e2e8f0');
        ctx.fillStyle = '#64748b';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sin datos de ruta', cx, cy + ry + 36);
        return;
      }
      var ang = -Math.PI / 2;
      var parts = segs.filter(function (s) { return s.n > 0; }).map(function (s) {
        var span = (s.n / total) * Math.PI * 2;
        var p = { a0: ang, a1: ang + span, color: s.color, side: s.side, n: s.n };
        ang += span;
        return p;
      });
      for (var i = prof; i > 0; i--) {
        parts.forEach(function (p) { slice(cx, cy + i, rx, ry, p.a0, p.a1, p.side); });
      }
      parts.forEach(function (p) { slice(cx, cy, rx, ry, p.a0, p.a1, p.color); });
      ctx.textAlign = 'center';
      ctx.font = '12px sans-serif';
      parts.forEach(function (p) {
        var mid = (p.a0 + p.a1) / 2;
        var lx = cx + Math.cos(mid) * (rx * 0.55);
        var ly = cy + Math.sin(mid) * (ry * 0.55);
        ctx.fillStyle = '#0f172a';
        ctx.fillText(Math.round((p.n / total) * 100) + '%', lx, ly);
      });
    }

    function resumenRuta(lider) {
      var tot = (lider.amigos || []).length;
      var ok = 0;
      var no = 0;
      var nm = 0;
      (lider.amigos || []).forEach(function (a) {
        var v = visitaDe(a.id, lider.id);
        var est = (v && v.estado) || 'pendiente';
        if (est === 'realizado') ok++;
        else if (est === 'no_asistio') no++;
        else if (est === 'no_militante') nm++;
      });
      var pen = Math.max(0, tot - ok - no - nm);
      var base = Math.max(0, tot - nm);
      var cumplimiento = base ? Math.round((ok / base) * 100) : 0;
      return {
        total: tot,
        visitados: ok,
        noEstaba: no,
        noMilitante: nm,
        pendientes: pen,
        cumplimiento: cumplimiento
      };
    }

    async function load() {
      loadLocal();
      var sb = getSupabase();
      if (!sb) { render(); return; }
      try {
        var res = await sb.from('estructura_seguimiento').select('*').order('fecha', { ascending: false });
        if (res.error) throw res.error;
        visitas = (res.data || []).map(function (r) {
          return {
            id: r.id,
            personaId: r.persona_id || '',
            personaNombre: r.persona_nombre || '',
            personaCedula: r.persona_cedula || '',
            personaTipo: r.persona_tipo || '',
            liderId: r.lider_id || r.liderId || '',
            telefono: r.telefono || '',
            barrio: r.barrio || '',
            tipo: r.tipo || 'ruta_visita',
            nota: r.nota || '',
            fecha: r.fecha || r.created_at,
            estado: r.estado || 'pendiente',
            mensajeWaId: r.mensaje_wa_id || null,
            rutaNum: Number(r.ruta_num || r.rutaNum || 0) || 0,
            observacion: r.observacion || ''
          };
        });
        visitas.forEach(function (v) {
          if (v.tipo === 'apertura_ruta' && v.liderId) {
            var n = Number(v.rutaNum || 0);
            if (!aperturas[v.liderId] || n > (aperturas[v.liderId].n || 0)) {
              aperturas[v.liderId] = { n: n, activa: n };
            }
          }
        });
        saveLocal();
      } catch (e) {
        console.warn('[Seguimiento] Supabase:', e.message || e);
        loadLocal();
      }
      render();
    }

    async function saveRow(item, esNuevo) {
      saveLocal();
      var sb = getSupabase();
      if (!sb) return;
      var row = {
        id: item.id,
        persona_id: item.personaId || null,
        persona_nombre: item.personaNombre || null,
        persona_cedula: item.personaCedula || null,
        persona_tipo: item.personaTipo || 'amigo',
        telefono: item.telefono || null,
        barrio: item.barrio || null,
        tipo: item.tipo || 'ruta_visita',
        nota: item.nota || null,
        fecha: item.fecha || new Date().toISOString(),
        estado: item.estado || 'pendiente',
        mensaje_wa_id: item.mensajeWaId || null,
        ruta_num: item.rutaNum || null,
        observacion: item.observacion || null,
        lider_id: item.liderId || null
      };
      try {
        if (esNuevo) {
          var ins = await sb.from('estructura_seguimiento').insert([row]);
          if (ins.error) throw ins.error;
        } else {
          var up = await sb.from('estructura_seguimiento').update(row).eq('id', item.id);
          if (up.error) throw up.error;
        }
      } catch (e) {
        console.warn('[Seguimiento] guardar', e.message || e);
      }
    }

    async function marcarAmigo(lider, amigo, estado, observacion) {
      var actual = visitaDe(amigo.id, lider.id);
      var esNuevo = !actual;
      if (!actual) {
        actual = {
          id: uid(),
          fecha: new Date().toISOString(),
          liderId: lider.id,
          personaTipo: 'amigo',
          tipo: 'ruta_visita'
        };
        visitas.unshift(actual);
      }
      actual.personaId = amigo.id;
      actual.personaNombre = amigo.nombre || '';
      actual.personaCedula = amigo.cedula || '';
      actual.telefono = amigo.telefono || '';
      actual.barrio = amigo.barrio || '';
      actual.liderId = lider.id;
      actual.rutaNum = rutaActiva(lider.id) || 1;
      actual.estado = estado || actual.estado || 'pendiente';
      actual.tipo = 'ruta_visita';
      if (typeof observacion === 'string') actual.observacion = observacion.trim();
      actual.nota = actual.observacion
        ? actual.observacion
        : ('Ruta de ' + (lider.nombre || 'líder') + ' · ' + actual.estado);
      actual.fecha = new Date().toISOString();
      await saveRow(actual, esNuevo);
      render();
    }

    async function abrirVisita(liderId) {
      var lider = findLider(liderId);
      if (!lider) return;
      var info = infoApertura(liderId);
      if (info.n >= 3) {
        alert('Este líder ya usó las 3 rutas permitidas.');
        liderActivo = lider;
        vista = 'ruta';
        modoEdicion = false;
        render();
        return;
      }
      var n = info.n + 1;
      aperturas[liderId] = { n: n, activa: n };
      saveLocal();
      var row = {
        id: uid(),
        personaId: lider.id,
        personaNombre: lider.nombre || '',
        personaCedula: lider.cedula || '',
        personaTipo: 'lider',
        liderId: lider.id,
        telefono: lider.telefono || '',
        barrio: lider.barrio || '',
        tipo: 'apertura_ruta',
        rutaNum: n,
        estado: 'abierta',
        nota: 'Apertura de visita ' + n + '/3',
        fecha: new Date().toISOString()
      };
      visitas.unshift(row);
      await saveRow(row, true);
      liderActivo = lider;
      vista = 'ruta';
      modoEdicion = true;
      render();
    }

    function enviarWaAmigo(amigo) {
      var tel = String(amigo.telefono || '').replace(/\D/g, '');
      if (tel.length === 10) tel = '57' + tel;
      if (tel.length < 12) {
        alert('Este amigo no tiene teléfono');
        return;
      }
      var msg = 'Hola ' + (amigo.nombre || '') + ' 👋\n\nTe visito de parte de la estructura.\n\nCarlos Cueto Mejía';
      if (global.WhatsAppCola && typeof global.WhatsAppCola.encolar === 'function') {
        global.WhatsAppCola.encolar({ destino: tel, mensaje: msg, files: [] });
        alert('WhatsApp en cola para ' + tel);
        return;
      }
      window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(msg), '_blank');
    }

    function inyectarUI() {
      var main = document.querySelector('main');
      if (!main) return;
      var sec = document.getElementById('modulo-seguimiento');
      if (!sec) {
        sec = document.createElement('section');
        sec.id = 'modulo-seguimiento';
        sec.className = 'modulo-seccion fade-in';
        main.appendChild(sec);
      }
      if (!uiInyectada) {
        sec.innerHTML =
          '<header class="mb-4">' +
            '<h1 class="text-2xl font-bold text-slate-800">Seguimiento</h1>' +
            '<p class="text-sm text-slate-500">Líderes de Estructura y ruta de visita a sus amigos</p>' +
          '</header>' +
          '<div class="flex gap-2 mb-4" id="seg-tabs">' +
            '<button type="button" data-sec="lideres" class="px-3 py-2 rounded-xl text-sm font-semibold border">Líderes</button>' +
            '<button type="button" data-sec="panel" class="px-3 py-2 rounded-xl text-sm font-semibold border">Panel gráfico</button>' +
          '</div>' +
          '<div id="seg-contenido"></div>';
        sec.querySelectorAll('#seg-tabs [data-sec]').forEach(function (b) {
          b.onclick = function () {
            seccion = b.getAttribute('data-sec');
            vista = 'lideres';
            liderActivo = null;
            render();
          };
        });
        uiInyectada = true;
      }
    }

    function render() {
      inyectarUI();
      var box = document.getElementById('seg-contenido');
      if (!box) return;
      pintarTabs();
      if (vista === 'ruta' && liderActivo) renderRuta(box);
      else if (seccion === 'panel') renderPanel(box);
      else renderLideres(box);
    }

    function pintarTabs() {
      var tabs = document.querySelectorAll('#seg-tabs [data-sec]');
      tabs.forEach(function (b) {
        var on = b.getAttribute('data-sec') === (vista === 'ruta' ? 'lideres' : seccion);
        b.className = 'px-3 py-2 rounded-xl text-sm font-semibold border ' +
          (on ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200');
      });
    }

    function renderPanel(box) {
      box.innerHTML = panelGrafico();
      var sc = document.getElementById('seg-filtro-coord');
      var sl = document.getElementById('seg-filtro-loc');
      if (sc) sc.onchange = function () { filtroCoord = this.value; render(); };
      if (sl) sl.onchange = function () { filtroLoc = this.value; render(); };
    }

    function renderLideres(box) {
      var lideres = listaLideres();
      var q = String(qLider || '').trim().toLowerCase();
      if (q) {
        lideres = lideres.filter(function (l) {
          return (l.nombre + ' ' + l.cedula + ' ' + l.barrio + ' ' + l.coordinadorNombre).toLowerCase().indexOf(q) >= 0;
        });
      }
      var cards = lideres.map(function (l) {
        var r = resumenRuta(l);
        return '<article class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">' +
          '<div class="flex flex-wrap justify-between gap-3 items-start">' +
            '<div class="min-w-0">' +
              '<p class="font-semibold text-slate-800">' + (l.nombre || 'Líder') + '</p>' +
              '<p class="text-xs text-slate-500 mt-0.5">CC ' + (l.cedula || '—') +
                (l.telefono ? ' · ' + l.telefono : '') + '</p>' +
              '<p class="text-[11px] text-slate-500 mt-0.5">' +
                (l.barrio ? l.barrio : 'Sin barrio') +
                (l.coordinadorNombre ? ' · Coord. ' + l.coordinadorNombre : '') +
              '</p>' +
              '<p class="text-xs text-indigo-600 mt-2 font-medium">' + r.total + ' amigo(s) · ' +
                r.visitados + ' visitados · ' + r.pendientes + ' pendientes · ' + r.noMilitante + ' no militante</p>' +
              '<p class="text-xs mt-1 font-semibold ' + (r.cumplimiento >= 80 ? 'text-emerald-700' : (r.cumplimiento >= 50 ? 'text-amber-700' : 'text-rose-700')) +
                '">Desempeño ruta: ' + r.cumplimiento + '%</p>' +
              '<p class="text-[11px] text-slate-400 mt-1">Rutas abiertas: ' + infoApertura(l.id).n + ' / 3</p>' +
            '</div>' +
            '<div class="flex flex-col gap-2">' +
              '<button type="button" data-abrir="' + l.id + '" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg"' +
                (infoApertura(l.id).n >= 3 ? ' disabled style="opacity:.5"' : '') + '>' +
                '<i class="fas fa-door-open mr-1"></i> Abrir visita (' + infoApertura(l.id).n + '/3)</button>' +
              (infoApertura(l.id).n
                ? '<button type="button" data-ruta="' + l.id + '" class="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-700">Ver ruta ' + infoApertura(l.id).activa + '</button>'
                : '') +
            '</div>' +
          '</div></article>';
      }).join('');

      box.innerHTML =
        '<div class="mb-4">' +
          '<input id="seg-buscar-lider" value="' + String(qLider || '').replace(/"/g, '&quot;') +
            '" placeholder="Buscar líder, cédula, barrio o coordinador" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm">' +
        '</div>' +
        (lideres.length
          ? '<div class="space-y-3">' + cards + '</div>'
          : '<p class="text-center text-slate-400 py-12 text-sm">No hay líderes en Estructura. Agrégalos primero.</p>');

      var inp = document.getElementById('seg-buscar-lider');
      if (inp) {
        inp.oninput = function () {
          qLider = this.value;
          render();
          var n = document.getElementById('seg-buscar-lider');
          if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
        };
      }
      box.querySelectorAll('[data-ruta]').forEach(function (b) {
        b.onclick = function () {
          liderActivo = findLider(b.getAttribute('data-ruta'));
          vista = 'ruta';
          modoEdicion = false;
          render();
        };
      });
      box.querySelectorAll('[data-abrir]').forEach(function (b) {
        b.onclick = function () { abrirVisita(b.getAttribute('data-abrir')); };
      });
    }

    function renderRuta(box) {
      var lider = findLider(liderActivo && liderActivo.id);
      if (!lider) {
        vista = 'lideres';
        render();
        return;
      }
      liderActivo = lider;
      var amigosTodos = (lider.amigos || []).slice().sort(function (a, b) {
        return String(a.barrio || '').localeCompare(String(b.barrio || ''), 'es') ||
          String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
      });
      function estadoAmigo(a) {
        var v = visitaDe(a.id, lider.id);
        return (v && v.estado) || 'pendiente';
      }
      var amigos = amigosTodos.filter(function (a) {
        if (!filtroRuta || filtroRuta === 'todos') return true;
        return estadoAmigo(a) === filtroRuta;
      });
      var r = resumenRuta(lider);
      var filas = amigos.map(function (a, idx) {
        var v = visitaDe(a.id, lider.id);
        var est = (v && v.estado) || 'pendiente';
        var color = est === 'realizado' ? 'border-emerald-200 bg-emerald-50/50' :
          (est === 'no_asistio' ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white');
        return '<article class="rounded-xl border p-4 ' + color + '">' +
          '<div class="flex flex-wrap justify-between gap-3">' +
            '<div class="min-w-0">' +
              '<p class="text-[11px] text-slate-400">Parada ' + (idx + 1) + '</p>' +
              '<p class="font-semibold text-slate-800">' + (a.nombre || 'Amigo') + '</p>' +
              '<p class="text-xs text-slate-500 mt-0.5">CC ' + (a.cedula || '—') +
                (a.telefono ? ' · ' + a.telefono : '') + '</p>' +
              '<p class="text-[11px] text-slate-500 mt-0.5">' + (a.barrio || 'Sin barrio') +
                (a.direccion ? ' · ' + a.direccion : '') + '</p>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2 items-start">' +
              (modoEdicion
                ? ('<select data-est="' + a.id + '" class="text-xs px-2 py-2 border border-slate-200 rounded-lg bg-white">' +
                   '<option value="pendiente"' + (est === 'pendiente' ? ' selected' : '') + '>Pendiente</option>' +
                   '<option value="realizado"' + (est === 'realizado' ? ' selected' : '') + '>Visitado</option>' +
                   '<option value="no_asistio"' + (est === 'no_asistio' ? ' selected' : '') + '>No estaba</option>' +
                   '<option value="no_militante"' + (est === 'no_militante' ? ' selected' : '') + '>No militante</option>' +
                   '</select>' +
                   (a.telefono ? '<button type="button" data-wa="' + a.id + '" class="text-xs px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50">WhatsApp</button>' : ''))
                : ('<span class="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-700">' +
                   (est === 'realizado' ? 'Visitado' : est === 'no_asistio' ? 'No estaba' : est === 'no_militante' ? 'No militante' : 'Pendiente') +
                   '</span>')) +
            '</div>' +
          '</div>' +
          '<div class="mt-3">' +
            '<label class="block text-[11px] font-semibold text-slate-500 mb-1">Observación</label>' +
            (modoEdicion
              ? ('<textarea data-obs="' + a.id + '" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="Nota de la visita...">' +
                 ((v && (v.observacion || (v.nota && String(v.nota).indexOf('Ruta de') !== 0) ? v.nota : '')) || '').replace(/</g, '') +
                 '</textarea>' +
                 '<button type="button" data-obs-save="' + a.id + '" class="mt-2 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">Guardar observación</button>')
              : ('<p class="text-sm text-slate-600">' + (((v && (v.observacion || (v.nota && String(v.nota).indexOf('Ruta de') !== 0) ? v.nota : '')) || 'Sin observación').replace(/</g, '')) + '</p>')) +
          '</div></article>';
      }).join('');

      box.innerHTML =
        '<button type="button" id="seg-volver" class="text-sm text-indigo-600 mb-4">' +
          '<i class="fas fa-arrow-left mr-1"></i> Líderes</button>' +
        '<div class="bg-white rounded-xl border border-slate-200 p-4 mb-4">' +
          '<p class="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Ruta ' + (rutaActiva(lider.id) || 0) + ' de 3 · ' + (modoEdicion ? 'Edición' : 'Solo lectura') + '</p>' +
          '<p class="text-lg font-bold text-slate-800 mt-0.5">' + (lider.nombre || '') + '</p>' +
          '<p class="text-xs text-slate-500">CC ' + (lider.cedula || '—') +
            (lider.barrio ? ' · ' + lider.barrio : '') + '</p>' +
          '<p class="text-sm font-semibold text-indigo-700 mt-1">' + r.total + ' amigo' + (r.total === 1 ? '' : 's') + ' de este líder</p>' +
          '<p class="text-sm font-bold mt-2 ' + (r.cumplimiento >= 80 ? 'text-emerald-700' : (r.cumplimiento >= 50 ? 'text-amber-700' : 'text-rose-700')) +
            '">Desempeño: ' + r.cumplimiento + '% <span class="text-[11px] font-normal text-slate-400">según visitas realizadas</span></p>' +
          '<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-center">' +
            '<button type="button" data-filtro="todos" class="rounded-lg bg-indigo-50 p-2 border ' + (filtroRuta === 'todos' ? 'ring-2 ring-indigo-500' : 'border-transparent') + '"><p class="text-lg font-bold text-indigo-700">' + r.total + '</p><p class="text-[11px] text-indigo-700">Amigos</p></button>' +
            '<button type="button" data-filtro="pendiente" class="rounded-lg bg-amber-50 p-2 border ' + (filtroRuta === 'pendiente' ? 'ring-2 ring-amber-500' : 'border-transparent') + '"><p class="text-lg font-bold text-amber-700">' + r.pendientes + '</p><p class="text-[11px] text-amber-700">Pendientes</p></button>' +
            '<button type="button" data-filtro="realizado" class="rounded-lg bg-emerald-50 p-2 border ' + (filtroRuta === 'realizado' ? 'ring-2 ring-emerald-500' : 'border-transparent') + '"><p class="text-lg font-bold text-emerald-700">' + r.visitados + '</p><p class="text-[11px] text-emerald-700">Visitados</p></button>' +
            '<button type="button" data-filtro="no_asistio" class="rounded-lg bg-rose-50 p-2 border ' + (filtroRuta === 'no_asistio' ? 'ring-2 ring-rose-500' : 'border-transparent') + '"><p class="text-lg font-bold text-rose-700">' + r.noEstaba + '</p><p class="text-[11px] text-rose-700">No estaba</p></button>' +
            '<button type="button" data-filtro="no_militante" class="rounded-lg bg-slate-100 p-2 border ' + (filtroRuta === 'no_militante' ? 'ring-2 ring-slate-500' : 'border-transparent') + '"><p class="text-lg font-bold text-slate-700">' + r.noMilitante + '</p><p class="text-[11px] text-slate-600">No militante</p></button>' +
          '</div>' +
        '</div>' +
        (amigos.length
          ? '<div class="space-y-3">' + filas + '</div>'
          : '<p class="text-center text-slate-400 py-10 text-sm">' +
              (amigosTodos.length ? 'No hay amigos en esa condición.' : 'Este líder no tiene amigos en Estructura.') +
            '</p>');

      var back = document.getElementById('seg-volver');
      if (back) back.onclick = function () {
        vista = 'lideres';
        liderActivo = null;
        filtroRuta = 'todos';
        modoEdicion = false;
        render();
      };
      box.querySelectorAll('[data-filtro]').forEach(function (b) {
        b.onclick = function () {
          filtroRuta = b.getAttribute('data-filtro') || 'todos';
          render();
        };
      });
      box.querySelectorAll('[data-est]').forEach(function (sel) {
        sel.onchange = function () {
          var amigo = amigosTodos.find(function (a) { return a.id === sel.getAttribute('data-est'); });
          if (amigo) marcarAmigo(lider, amigo, sel.value);
        };
      });
      box.querySelectorAll('[data-wa]').forEach(function (b) {
        b.onclick = function () {
          var amigo = amigosTodos.find(function (a) { return a.id === b.getAttribute('data-wa'); });
          if (amigo) enviarWaAmigo(amigo);
        };
      });
      box.querySelectorAll('[data-obs-save]').forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute('data-obs-save');
          var amigo = amigosTodos.find(function (a) { return a.id === id; });
          var ta = box.querySelector('[data-obs="' + id + '"]');
          var sel = box.querySelector('[data-est="' + id + '"]');
          if (amigo) marcarAmigo(lider, amigo, (sel && sel.value) || 'pendiente', ta ? ta.value : '');
        };
      });
    }

    function init() {
      inyectarUI();
      load();
      if (!global.__segTimer) {
        global.__segTimer = setInterval(function () {
          var sec = document.getElementById('modulo-seguimiento');
          if (!sec || sec.style.display === 'none' || !sec.classList.contains('active')) return;
          if (sec.querySelector('textarea:focus, input:focus, select:focus')) return;
          load();
        }, 8000);
      }
    }

    function nuevoDesdePersona(p) {
      p = p || {};
      init();
      if (typeof cambiarModulo === 'function') cambiarModulo('seguimiento');
      if (p.tipo === 'lider' || p.personaTipo === 'lider') {
        liderActivo = findLider(p.id);
        vista = liderActivo ? 'ruta' : 'lideres';
      } else if (p.liderId) {
        liderActivo = findLider(p.liderId);
        vista = liderActivo ? 'ruta' : 'lideres';
      } else {
        vista = 'lideres';
      }
      setTimeout(render, 60);
    }

    return {
      nombre: 'Seguimiento',
      init: init,
      listar: function () { return visitas.slice(); },
      refrescarUI: render,
      nuevoDesdePersona: nuevoDesdePersona
    };
  }

  global.App = global.App || {};
  global.App.Seguimiento = { create: createSeguimiento };
  global.App.instance = global.App.instance || {};

  function boot() {
    if (!global.App.instance.seguimiento) {
      var inst = createSeguimiento();
      global.App.instance.seguimiento = inst;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { inst.init(); });
      } else {
        setTimeout(function () { inst.init(); }, 80);
      }
    }
  }
  boot();
})(typeof window !== 'undefined' ? window : globalThis);
