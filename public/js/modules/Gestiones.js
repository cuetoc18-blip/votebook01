/**
 * Módulo Gestiones y Donaciones
 * © 2026 Carlos Cueto Mejía
 * Conexión a Supabase + UI auto-inyectada
 */
(function (global) {
  'use strict';

  function createGestiones() {
    let gestiones = [];
    const STORAGE_KEY = 'gestiones_local_v1';
    let uiInyectada = false;

    function getSupabase() {
      if (global.SupabaseConfig && global.SupabaseConfig.client) {
        return global.SupabaseConfig.client;
      }
      return null;
    }

    function personasEstructura() {
      try {
        var est = global.App && global.App.instance && global.App.instance.estructura;
        var lideres = [];
        var amigos = [];
        var d = (est && typeof est.getData === 'function') ? (est.getData() || {}) : {};
        var coords = d.coordinadores || [];
        coords.forEach(function (c) {
          (c.lideres || []).forEach(function (l) {
            lideres.push({
              id: l.id,
              nombre: l.nombre || '',
              cedula: l.cedula || '',
              barrio: l.barrio || '',
              telefono: l.telefono || '',
              rol: 'Líder'
            });
            (l.amigos || []).forEach(function (a) {
              amigos.push({
                id: a.id,
                nombre: a.nombre || '',
                cedula: a.cedula || '',
                barrio: a.barrio || '',
                telefono: a.telefono || '',
                rol: 'Amigo'
              });
            });
          });
        });
        return lideres.concat(amigos);
      } catch (e) {
        return [];
      }
    }

    function llenarSelectBeneficiario(selectedName) {
      var inp = document.getElementById('ges-beneficiario');
      var list = document.getElementById('ges-beneficiario-list');
      if (!inp) return;
      var personas = personasEstructura();
      if (list) {
        var html = '';
        personas.forEach(function (p) {
          var nom = p.nombre || p.name || '';
          if (!nom) return;
          var label = nom + (p.rol ? ' · ' + p.rol : '') + (p.cedula ? ' · ' + p.cedula : '');
          html += '<option value="' + nom.replace(/"/g, '&quot;') + '" label="' + label.replace(/"/g, '&quot;') + '">';
        });
        list.innerHTML = html;
      }
      if (selectedName) inp.value = selectedName;
      else inp.value = '';
    }

    function uid() {
      return 'GE-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    function loadFromLocal() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        gestiones = raw ? JSON.parse(raw) : [];
      } catch (e) {
        gestiones = [];
      }
    }

    function saveLocal() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gestiones));
      } catch (e) {}
    }

    async function load() {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('gestiones')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          gestiones = (data || []).map(function (r) {
            return {
              id: r.id,
              titulo: r.titulo || '',
              tipo: r.tipo || 'gestion',
              descripcion: r.descripcion || '',
              beneficiario: r.beneficiario || '',
              barrio: r.barrio || '',
              telefono: r.telefono || '',
              estado: r.estado || 'pendiente',
              valor: r.valor || null,
              fecha: r.fecha || r.created_at || null,
              notas: r.notas || ''
            };
          });
          saveLocal();
          console.log('[Gestiones] Cargado desde Supabase:', gestiones.length);
        } catch (e) {
          console.warn('[Gestiones] Supabase no disponible, local:', e.message || e);
          loadFromLocal();
        }
      } else {
        loadFromLocal();
      }
      render();
      actualizarStats();
    }

    async function saveToSupabase(item, esNuevo) {
      const supabase = getSupabase();
      if (!supabase) return;

      const row = {
        id: item.id,
        titulo: item.titulo,
        tipo: item.tipo,
        descripcion: item.descripcion,
        beneficiario: item.beneficiario,
        barrio: item.barrio,
        telefono: item.telefono,
        estado: item.estado,
        valor: item.valor,
        fecha: item.fecha,
        notas: item.notas
      };

      try {
        if (esNuevo) {
          const { error } = await supabase.from('gestiones').insert([row]);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('gestiones').update(row).eq('id', item.id);
          if (error) throw error;
        }
        console.log('[Gestiones] Guardado en Supabase:', item.id);
      } catch (err) {
        console.error('[Gestiones] Error guardando:', err.message);
      }
    }

    async function deleteFromSupabase(id) {
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        await supabase.from('gestiones').delete().eq('id', id);
      } catch (e) {
        console.error('[Gestiones] Error eliminando:', e.message);
      }
    }

    function listar(filtroEstado) {
      if (!filtroEstado) return gestiones.slice();
      return gestiones.filter(function (g) {
        return String(g.estado || '').toLowerCase() === String(filtroEstado).toLowerCase();
      });
    }

    function contadores() {
      var all = gestiones;
      var c = { total: all.length, pendiente: 0, lista: 0 };
      all.forEach(function (g) {
        var e = String(g.estado || 'pendiente').toLowerCase();
        if (e === 'lista' || e === 'cumplida' || e === 'completada') c.lista++;
        else c.pendiente++;
      });
      return c;
    }

    function actualizarStats() {
      var c = contadores();
      var elTotal = document.getElementById('ges-stat-total');
      var elPend = document.getElementById('ges-stat-pendiente');
      var elLista = document.getElementById('ges-stat-lista');
      if (elTotal) elTotal.textContent = c.total;
      if (elPend) elPend.textContent = c.pendiente;
      if (elLista) elLista.textContent = c.lista;
    }

    function abrirForm(editItem) {
      var form = document.getElementById('form-gestiones');
      if (!form) return;

      document.getElementById('ges-edit-id').value = editItem ? editItem.id : '';
      document.getElementById('ges-titulo').value = editItem ? (editItem.titulo || '') : '';
      document.getElementById('ges-tipo').value = editItem ? (editItem.tipo || 'gestion') : 'gestion';
      document.getElementById('ges-descripcion').value = editItem ? (editItem.descripcion || '') : '';
      llenarSelectBeneficiario(editItem ? (editItem.beneficiario || '') : '');
      var selB = document.getElementById('ges-beneficiario');
      if (selB) {
        function aplicarPersona() {
          var nom = (selB.value || '').trim();
          var p = personasEstructura().find(function (x) {
            return String(x.nombre || x.name || '').trim() === nom;
          });
          if (p) {
            if (p.barrio) document.getElementById('ges-barrio').value = p.barrio;
            if (p.telefono) document.getElementById('ges-telefono').value = p.telefono;
          }
        }
        selB.onchange = aplicarPersona;
        selB.onblur = aplicarPersona;
      }
      document.getElementById('ges-barrio').value = editItem ? (editItem.barrio || '') : '';
      document.getElementById('ges-telefono').value = editItem ? (editItem.telefono || '') : '';
      document.getElementById('ges-estado').value = editItem ? (editItem.estado || 'pendiente') : 'pendiente';
      document.getElementById('ges-valor').value = editItem && editItem.valor != null ? editItem.valor : '';
      document.getElementById('ges-notas').value = editItem ? (editItem.notas || '') : '';

      document.getElementById('form-gestiones-titulo').textContent = editItem ? 'Editar Gestión' : 'Nueva Gestión / Donación';
      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function cerrarForm() {
      var form = document.getElementById('form-gestiones');
      if (form) form.classList.add('hidden');
    }

    function guardar() {
      var editId = document.getElementById('ges-edit-id').value;
      var titulo = (document.getElementById('ges-titulo').value || '').trim();
      var tipo = document.getElementById('ges-tipo').value || 'gestion';
      var descripcion = (document.getElementById('ges-descripcion').value || '').trim();
      var beneficiario = (document.getElementById('ges-beneficiario').value || '').trim();
      var barrio = (document.getElementById('ges-barrio').value || '').trim();
      var telefono = (document.getElementById('ges-telefono').value || '').trim();
      var estado = document.getElementById('ges-estado').value || 'pendiente';
      var valorRaw = (document.getElementById('ges-valor').value || '').trim();
      var valor = valorRaw ? Number(valorRaw) : null;
      var notas = (document.getElementById('ges-notas').value || '').trim();

      if (!titulo) {
        alert('El título es obligatorio');
        return;
      }

      var esNuevo = !editId;
      var item;

      if (esNuevo) {
        item = {
          id: uid(),
          titulo: titulo,
          tipo: tipo,
          descripcion: descripcion,
          beneficiario: beneficiario,
          barrio: barrio,
          telefono: telefono,
          estado: estado,
          valor: valor,
          fecha: new Date().toISOString(),
          notas: notas
        };
        gestiones.unshift(item);
      } else {
        var idx = gestiones.findIndex(function (g) { return g.id === editId; });
        if (idx === -1) return;
        item = gestiones[idx];
        item.titulo = titulo;
        item.tipo = tipo;
        item.descripcion = descripcion;
        item.beneficiario = beneficiario;
        item.barrio = barrio;
        item.telefono = telefono;
        item.estado = estado;
        item.valor = valor;
        item.notas = notas;
      }

      saveLocal();
      saveToSupabase(item, esNuevo);
      cerrarForm();
      render();
      actualizarStats();
    }

    function eliminar(id) {
      if (!confirm('¿Eliminar esta gestión?')) return;
      gestiones = gestiones.filter(function (g) { return g.id !== id; });
      saveLocal();
      deleteFromSupabase(id);
      render();
      actualizarStats();
    }

    function cambiarEstado(id, nuevoEstado) {
      var item = gestiones.find(function (g) { return g.id === id; });
      if (!item) return;
      item.estado = nuevoEstado;
      saveLocal();
      saveToSupabase(item, false);
      render();
      actualizarStats();
    }

    function render() {
      var container = document.getElementById('lista-gestiones');
      if (!container) return;

      if (!gestiones.length) {
        container.innerHTML = '<div class="text-center py-14 text-slate-400 bg-white rounded-2xl border border-slate-200"><div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center"><i class="fas fa-hand-holding-heart text-2xl text-amber-300"></i></div><p class="font-medium text-slate-600">No hay gestiones registradas</p><p class="text-sm mt-1">Crea la primera con el botón de arriba</p></div>';
        return;
      }

      var html = '';
      gestiones.forEach(function (g) {
        var estadoClass = 'bg-amber-100 text-amber-800';
        var e = (g.estado || '').toLowerCase();
        if (e === 'lista' || e === 'cumplida' || e === 'completada') estadoClass = 'bg-emerald-100 text-emerald-800';
        if (e === 'en_curso' || e === 'proceso') estadoClass = 'bg-blue-100 text-blue-800';
        if (e === 'cancelada') estadoClass = 'bg-rose-100 text-rose-800';

        var tipoIcon = g.tipo === 'donacion' ? 'fa-gift text-pink-500' : 'fa-tasks text-indigo-500';

        html += '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow"><div class="flex flex-wrap justify-between items-start gap-3"><div class="min-w-0 flex-1"><div class="flex items-center gap-2 mb-1"><i class="fas ' + tipoIcon + '"></i><p class="font-semibold text-slate-800 truncate">' + (g.titulo || '') + '</p></div><p class="text-xs text-slate-500 mb-2">' + (g.descripcion || 'Sin descripción') + '</p><div class="flex flex-wrap gap-2 text-[11px] text-slate-500">' + (g.beneficiario ? '<span><i class="fas fa-user mr-1"></i>' + g.beneficiario + '</span>' : '') + (g.barrio ? '<span><i class="fas fa-home mr-1"></i>' + g.barrio + '</span>' : '') + (g.telefono ? '<span><i class="fas fa-phone mr-1"></i>' + g.telefono + '</span>' : '') + (g.valor != null ? '<span class="font-medium text-emerald-600"><i class="fas fa-dollar-sign mr-1"></i>' + Number(g.valor).toLocaleString() + '</span>' : '') + '</div></div><div class="flex flex-col items-end gap-2 shrink-0"><span class="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ' + estadoClass + '">' + (g.estado || 'pendiente').replace(/_/g, ' ') + '</span><div class="flex gap-1"><button type="button" onclick="window.App.instance.gestiones.cambiarEstado(\'' + g.id + '\',\'lista\')" class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center" title="Marcar como lista"><i class="fas fa-check text-xs pointer-events-none"></i></button><button type="button" onclick="window.App.instance.gestiones.editar(\'' + g.id + '\')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center" title="Editar"><i class="fas fa-pen text-xs pointer-events-none"></i></button><button type="button" onclick="window.App.instance.gestiones.eliminar(\'' + g.id + '\')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center" title="Eliminar"><i class="fas fa-trash text-xs pointer-events-none"></i></button></div></div></div></div>';
      });
      container.innerHTML = html;
    }

    function inyectarUI() {
      if (uiInyectada) return;
      if (!document.body) return;

      var tabsContainer = document.querySelector('.flex.space-x-2.py-2');
      if (tabsContainer && !document.getElementById('tab-gestiones')) {
        var btn = document.createElement('button');
        btn.id = 'tab-gestiones';
        btn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all';
        btn.innerHTML = '<i class="fas fa-hand-holding-heart mr-2"></i>Gestiones';
        btn.onclick = function () {
          if (typeof cambiarModulo === 'function') cambiarModulo('gestiones');
          if (window.App && window.App.instance && window.App.instance.gestiones) {
            window.App.instance.gestiones.init();
          }
        };
        tabsContainer.appendChild(btn);
      }

      var main = document.querySelector('main');
      if (main && !document.getElementById('modulo-gestiones')) {
        var section = document.createElement('section');
        section.id = 'modulo-gestiones';
        section.className = 'modulo-seccion fade-in';
        section.style.display = 'none';
        section.innerHTML = '<header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"><div><h1 class="text-2xl font-bold text-slate-800">Gestiones y Donaciones</h1><p class="text-slate-500 text-sm mt-0.5">Seguimiento de ayudas, trámites y donaciones</p></div><button id="btn-nueva-gestion" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-2"><i class="fas fa-plus"></i> Nueva Gestión</button></header><div class="grid grid-cols-3 gap-3 mb-6"><div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-slate-800" id="ges-stat-total">0</p><p class="text-xs text-slate-500 mt-1">Total</p></div><div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-amber-600" id="ges-stat-pendiente">0</p><p class="text-xs text-slate-500 mt-1">Pendientes</p></div><div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-emerald-600" id="ges-stat-lista">0</p><p class="text-xs text-slate-500 mt-1">Cumplidas</p></div></div><div id="form-gestiones" class="hidden mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div class="px-5 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex justify-between items-center"><h3 id="form-gestiones-titulo" class="font-bold text-base">Nueva Gestión</h3><button type="button" id="btn-cerrar-form-gestiones" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg">&times;</button></div><div class="p-5 space-y-4"><input type="hidden" id="ges-edit-id" value=""><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1.5">Título *</label><input type="text" id="ges-titulo" placeholder="Ej: Ayuda de mercados, Gestión de cita médica..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"></div><div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Tipo</label><select id="ges-tipo" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"><option value="gestion">Gestión / Trámite</option><option value="donacion">Donación</option><option value="ayuda">Ayuda social</option><option value="otro">Otro</option></select></div><div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Estado</label><select id="ges-estado" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"><option value="pendiente">Pendiente</option><option value="en_curso">En curso</option><option value="lista">Lista / Cumplida</option><option value="cancelada">Cancelada</option></select></div><div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Beneficiario (Líder o Amigo)</label><input type="text" id="ges-beneficiario" list="ges-beneficiario-list" placeholder="Escribe para buscar líder o amigo..." autocomplete="off" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"><datalist id="ges-beneficiario-list"></datalist></div><div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Barrio</label><input type="text" id="ges-barrio" placeholder="Barrio" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"></div><div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label><input type="text" id="ges-telefono" placeholder="3001234567" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"></div><div><label class="block text-xs font-semibold text-slate-600 mb-1.5">Valor ($)</label><input type="number" id="ges-valor" placeholder="0" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"></div><div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1.5">Descripción</label><textarea id="ges-descripcion" rows="2" placeholder="Detalles de la gestión o donación..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"></textarea></div><div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1.5">Notas</label><textarea id="ges-notas" rows="2" placeholder="Observaciones internas..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"></textarea></div></div><div class="flex gap-3 pt-2"><button type="button" id="btn-cancelar-gestion" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition text-sm">Cancelar</button><button type="button" id="btn-guardar-gestion" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"><i class="fas fa-save"></i> Guardar</button></div></div></div><div id="lista-gestiones" class="space-y-3"><div class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando gestiones...</p></div></div>';
        main.appendChild(section);

        document.getElementById('btn-nueva-gestion').onclick = function () { abrirForm(null); };
        document.getElementById('btn-guardar-gestion').onclick = guardar;
        document.getElementById('btn-cancelar-gestion').onclick = cerrarForm;
        document.getElementById('btn-cerrar-form-gestiones').onclick = cerrarForm;
      }

      uiInyectada = true;
      console.log('[Gestiones] UI inyectada');
    }

    return {
      init: function () {
        inyectarUI();
        load();
        if (!getSupabase()) {
          window.addEventListener('supabase-ready', function onReady() {
            window.removeEventListener('supabase-ready', onReady);
            load();
          }, { once: true });
        }
      },
      listar: listar,
      contadores: contadores,
      editar: function (id) {
        var item = gestiones.find(function (g) { return g.id === id; });
        if (item) abrirForm(item);
      },
      eliminar: eliminar,
      cambiarEstado: cambiarEstado,
      abrirNuevo: function () { abrirForm(null); }
    };
  }

  global.App = global.App || {};
  global.App.Gestiones = { create: createGestiones };

  function bootstrap() {
    global.App.instance = global.App.instance || {};
    if (!global.App.instance.gestiones) {
      var inst = createGestiones();
      global.App.instance.gestiones = inst;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { inst.init(); });
      } else {
        setTimeout(function () { inst.init(); }, 100);
      }
    }
  }
  bootstrap();

})(typeof window !== 'undefined' ? window : globalThis);
