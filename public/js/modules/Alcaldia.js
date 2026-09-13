/**
 * Módulo Alcaldía — Gestión de Gestiones Judiciales
 * © 2026 Carlos Cueto Mejía
 *
 * Auto-inyecta su pestaña y sección en el panel existente
 * sin necesidad de modificar index.html.
 */
(function (global) {
    'use strict';

    function createAlcaldia(deps) {
        deps = deps || {};

        let derechos = [];
        const STORAGE_KEY = 'alcaldia_derechos_local';
        let uiInyectada = false;

        function getSupabaseClient() {
            if (global.SupabaseConfig && global.SupabaseConfig.client) {
                return global.SupabaseConfig.client;
            }
            return null;
        }

        const BUCKET_JUDICIAL = 'judicial';

        function limpiarCedula(doc) {
            var cc = String(doc || '').replace(/\D/g, '');
            return cc || 'sincedula';
        }

        function extensionArchivo(name, type) {
            var n = String(name || '').toLowerCase();
            var ty = String(type || '').toLowerCase();
            if (n.endsWith('.pdf') || ty.indexOf('pdf') >= 0) return 'pdf';
            if (n.endsWith('.png') || ty === 'image/png') return 'png';
            if (n.endsWith('.webp') || ty === 'image/webp') return 'webp';
            if (n.endsWith('.gif') || ty === 'image/gif') return 'gif';
            return 'jpg';
        }

        async function urlDePath(path) {
            var supabase = getSupabaseClient();
            if (!supabase || !supabase.storage) return '';
            var pub = supabase.storage.from(BUCKET_JUDICIAL).getPublicUrl(path);
            var url = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : '';
            try {
                var signed = await supabase.storage.from(BUCKET_JUDICIAL).createSignedUrl(path, 60 * 60 * 24 * 30);
                if (signed && signed.data && signed.data.signedUrl) url = signed.data.signedUrl;
            } catch (e) {}
            return url;
        }

        async function subirArchivoJudicial(file, procesoId, cedula, sufijo) {
            var supabase = getSupabaseClient();
            if (!supabase || !supabase.storage) {
                console.warn('[GestionesJudiciales] Storage no disponible');
                return null;
            }
            var ext = extensionArchivo(file && file.name, file && file.type);
            var id = String(procesoId || 'sinid').replace(/[^\w\-]+/g, '_');
            var orig = String((file && file.name) || ('archivo.' + ext)).replace(/[^\w.\-]+/g, '_');
            var extra = sufijo ? (String(sufijo).replace(/[^a-zA-Z0-9_-]/g, '') + '_') : '';
            var filename = extra + Date.now() + '_' + orig;
            if (filename.indexOf('.') < 0) filename += '.' + ext;
            var path = id + '/' + filename;
            var contentType = (file && file.type) || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg');
            var res = await supabase.storage.from(BUCKET_JUDICIAL).upload(path, file, {
                upsert: true,
                contentType: contentType,
                cacheControl: '3600'
            });
            if (res.error) {
                console.warn('[GestionesJudiciales] Storage', path, res.error.message);
                return null;
            }
            var url = await urlDePath(path);
            console.log('[GestionesJudiciales] Storage judicial/', path);
            return {
                name: file.name || filename,
                type: contentType,
                path: path,
                url: url,
                bucket: BUCKET_JUDICIAL,
                paths: [path]
            };
        }

        // Mapeo app <-> Supabase (snake_case)
        function toDbRow(dp) {
            return {
                id: dp.id,
                tipo_proceso: dp.tipoProceso || dp.tipo_proceso || 'derecho_peticion',
                titular: dp.titular || null,
                documento: dp.documento || null,
                correo: dp.correo || null,
                telefono: dp.telefono || null,
                ciudad: dp.ciudad || null,
                direccion: dp.direccion || null,
                entidad: dp.entidad || null,
                concepto: dp.concepto || null,
                descripcion: dp.descripcion || null,
                estado: dp.estado || 'borrador',
                cumplimiento: dp.cumplimiento || 'pendiente',
                numero_radicado: dp.numeroRadicado || dp.numero_radicado || null,
                fecha_creacion: dp.fechaCreacion || dp.fecha_creacion || new Date().toISOString(),
                seguimiento: dp.seguimiento || [],
                archivos: dp.archivos || []
            };
        }

        function fromDbRow(row) {
            if (!row) return null;
            return {
                id: row.id,
                tipoProceso: row.tipo_proceso || row.tipoProceso || 'derecho_peticion',
                titular: row.titular || '',
                documento: row.documento || '',
                correo: row.correo || '',
                telefono: row.telefono || '',
                ciudad: row.ciudad || '',
                direccion: row.direccion || '',
                entidad: row.entidad || '',
                concepto: row.concepto || '',
                descripcion: row.descripcion || '',
                estado: row.estado || 'borrador',
                cumplimiento: row.cumplimiento || 'pendiente',
                numeroRadicado: row.numero_radicado || row.numeroRadicado || '',
                fechaCreacion: row.fecha_creacion || row.fechaCreacion || row.created_at || new Date().toISOString(),
                seguimiento: row.seguimiento || [],
                archivos: row.archivos || []
            };
        }

        async function guardarEnSupabase(dp, modo) {
            const supabase = getSupabaseClient();
            if (!supabase) {
                console.warn('[GestionesJudiciales] Supabase no listo — solo LocalStorage');
                return false;
            }
            const row = toDbRow(dp);
            try {
                if (modo === 'insert') {
                    const { data, error } = await supabase.from('derechos_peticion').insert([row]).select();
                    if (error) throw error;
                    console.log('[GestionesJudiciales] ✅ Insertado en derechos_peticion:', row.id);
                    return true;
                }
                if (modo === 'update') {
                    const { error } = await supabase.from('derechos_peticion').update(row).eq('id', row.id);
                    if (error) throw error;
                    console.log('[GestionesJudiciales] ✅ Actualizado en derechos_peticion:', row.id);
                    return true;
                }
                if (modo === 'delete') {
                    const { error } = await supabase.from('derechos_peticion').delete().eq('id', row.id);
                    if (error) throw error;
                    console.log('[GestionesJudiciales] ✅ Eliminado de derechos_peticion:', row.id);
                    return true;
                }
            } catch (e) {
                console.error('[GestionesJudiciales] ❌ Error Supabase derechos_peticion:', e.message || e);
                console.error('[GestionesJudiciales] Detalle:', e);
                console.error('[GestionesJudiciales] Fila enviada:', JSON.stringify(row, null, 2).slice(0, 800));
                return false;
            }
            return false;
        }

        function uidSeg() {
            return 'AS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }

        function filaSegAEntrada(r) {
            var entrada = {
                id: r.id,
                fecha: r.fecha ? new Date(r.fecha).toLocaleString() : new Date().toLocaleString(),
                estado: r.estado || '',
                nota: r.nota || ''
            };
            if (r.numero_radicado) entrada.numeroRadicado = r.numero_radicado;
            if (r.foto_path || r.foto_url) {
                entrada.foto = {
                    name: r.foto_nombre || 'evidencia.jpg',
                    path: r.foto_path || '',
                    url: r.foto_url || '',
                    bucket: 'judicial'
                };
            }
            return entrada;
        }

        async function fusionarSeguimientosTabla(supabase) {
            if (!supabase) return;
            try {
                var res = await supabase.from('alcaldia_seguimiento').select('*').order('fecha', { ascending: false });
                if (res.error) throw res.error;
                var porProc = {};
                (res.data || []).forEach(function (r) {
                    var pid = r.proceso_id;
                    if (!porProc[pid]) porProc[pid] = [];
                    porProc[pid].push(filaSegAEntrada(r));
                });
                derechos.forEach(function (dp) {
                    if (porProc[dp.id] && porProc[dp.id].length) {
                        dp.seguimiento = porProc[dp.id];
                    }
                });
                console.log('[GestionesJudiciales] Seguimientos tabla:', (res.data || []).length);
            } catch (e) {
                console.warn('[GestionesJudiciales] Tabla alcaldia_seguimiento:', e.message || e);
            }
        }

        async function guardarSeguimientoTabla(procesoId, entrada) {
            var supabase = getSupabaseClient();
            if (!supabase) return;
            var row = {
                id: entrada.id || uidSeg(),
                proceso_id: procesoId,
                nota: entrada.nota || null,
                estado: entrada.estado || null,
                numero_radicado: entrada.numeroRadicado || null,
                foto_nombre: (entrada.foto && entrada.foto.name) || null,
                foto_path: (entrada.foto && entrada.foto.path) || null,
                foto_url: (entrada.foto && entrada.foto.url) || null,
                fecha: new Date().toISOString()
            };
            entrada.id = row.id;
            try {
                var ins = await supabase.from('alcaldia_seguimiento').insert([row]);
                if (ins.error) throw ins.error;
                console.log('[GestionesJudiciales] seguimiento → alcaldia_seguimiento', row.id, row.foto_path || '');
            } catch (e) {
                console.error('[GestionesJudiciales] No se guardó seguimiento en tabla:', e.message || e);
            }
        }

        function cargarDatos() {
            const supabase = getSupabaseClient();
            if (supabase) {
                cargarDesdeSupabase(supabase);
            } else {
                cargarDesdeLocalStorage();
            }
        }

        function cargarDesdeLocalStorage() {
            try {
                const saved = global.localStorage.getItem(STORAGE_KEY);
                derechos = saved ? JSON.parse(saved) : [];
            } catch (e) {
                derechos = [];
                console.warn('[GestionesJudiciales] Error leyendo LocalStorage:', e);
            }
            renderListaDerechos();
        }

        async function cargarDesdeSupabase(supabase) {
            const container = global.document.getElementById('lista-procesos');
            if (container) {
                container.innerHTML = '<div class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin text-3xl mb-3"></i><p>Cargando...</p></div>';
            }

            try {
                let res = await supabase
                    .from('derechos_peticion')
                    .select('*')
                    .order('fecha_creacion', { ascending: false });

                // fallback si la columna fecha_creacion no existe
                if (res.error && String(res.error.message || '').includes('fecha_creacion')) {
                    res = await supabase.from('derechos_peticion').select('*').order('created_at', { ascending: false });
                }
                if (res.error && String(res.error.message || '').includes('created_at')) {
                    res = await supabase.from('derechos_peticion').select('*');
                }

                if (res.error) throw res.error;
                derechos = (res.data || []).map(fromDbRow);
                console.log('[GestionesJudiciales] ✅ Cargados', derechos.length, 'procesos desde derechos_peticion');
                await fusionarSeguimientosTabla(supabase);
                try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify(derechos)); } catch (e) {}
            } catch (error) {
                console.error('[GestionesJudiciales] Error cargando de Supabase:', error.message || error);
                cargarDesdeLocalStorage();
            } finally {
                renderListaDerechos();
            }
        }

        function generarId() {
            return 'DP-' + Date.now();
        }

        // Días hábiles (lun-vie). No excluye festivos nacionales.
        function addBusinessDays(startDate, days) {
            const d = new Date(startDate);
            let added = 0;
            while (added < days) {
                d.setDate(d.getDate() + 1);
                const day = d.getDay();
                if (day !== 0 && day !== 6) added++;
            }
            return d;
        }

        function plazoPorTipo(tipoProceso) {
            const t = String(tipoProceso || '').toLowerCase();
            if (t.includes('tutela')) return 10;
            if (t.includes('desacato')) return 2;
            if (t.includes('cumplimiento')) return 20;
            // derecho de petición y resto por defecto
            if (t.includes('peticion') || t === 'derecho_peticion' || t.includes('queja')) return 15;
            return 15;
        }

        function calcularPlazo(dp) {
            const dias = plazoPorTipo(dp.tipoProceso);
            const inicio = dp.fechaCreacion || dp.created_at || new Date().toISOString();
            const fechaLimite = addBusinessDays(new Date(inicio), dias);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const limite = new Date(fechaLimite);
            limite.setHours(0, 0, 0, 0);
            const diffMs = limite - hoy;
            const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const vencido = diasRestantes < 0 && !['cumplido', 'archivado'].includes(String(dp.estado || '').toLowerCase());
            const proximo = !vencido && diasRestantes <= 3 && !['cumplido', 'archivado'].includes(String(dp.estado || '').toLowerCase());
            return {
                diasHabiles: dias,
                fechaLimite: fechaLimite,
                fechaLimiteStr: fechaLimite.toLocaleDateString('es-CO'),
                diasRestantes: diasRestantes,
                vencido: vencido,
                proximo: proximo
            };
        }

        function etiquetaTipo(tipo) {
            const map = {
                derecho_peticion: 'Derecho de Petición',
                tutela: 'Tutela',
                desacato: 'Desacato',
                cumplimiento: 'Acción de Cumplimiento',
                popular: 'Acción Popular',
                grupo: 'Acción de Grupo',
                queja: 'Queja / Reclamo',
                recurso: 'Recurso / Apelación',
                otro: 'Otro'
            };
            return map[tipo] || tipo || 'Proceso';
        }

        function analisisProcesos() {
            const total = derechos.length;
            const porEstado = { borrador: 0, radicado: 0, en_curso: 0, cumplido: 0, retrasado: 0 };
            let vencidos = 0, proximos = 0, aTiempo = 0;
            derechos.forEach(dp => {
                const e = dp.estado || 'borrador';
                if (porEstado[e] !== undefined) porEstado[e]++;
                else porEstado[e] = (porEstado[e] || 0) + 1;
                const p = calcularPlazo(dp);
                if (e === 'cumplido') aTiempo++;
                else if (p.vencido) vencidos++;
                else if (p.proximo) proximos++;
                else aTiempo++;
            });
            return { total, porEstado, vencidos, proximos, aTiempo };
        }



        function agregarDerecho(dato) {
            const nuevoDerecho = {
                id: generarId(),
                tipoProceso: dato.tipoProceso || 'derecho_peticion',
                titular: dato.titular || 'Sin Nombre',
                documento: dato.documento || 'CC',
                correo: dato.correo || 'correo@ejemplo.com',
                telefono: dato.telefono || '573000000000',
                ciudad: dato.ciudad || '',
                direccion: dato.direccion || '',
                entidad: dato.entidad || 'Señor Alcalde Municipal',
                concepto: dato.concepto || 'Concepto',
                descripcion: dato.descripcion || '',
                archivos: dato.archivos || [],
                estado: 'borrador',
                cumplimiento: 'pendiente',
                fechaCreacion: new Date().toISOString(),
                seguimiento: [{
                    fecha: new Date().toLocaleString(),
                    estado: 'borrador',
                    nota: 'Proceso creado — PDF de radicación generado'
                }]
            };

            derechos.unshift(nuevoDerecho);
            guardarLocal();
            renderListaDerechos();

            guardarEnSupabase(nuevoDerecho, 'insert');

            // Generar PDF automáticamente
            setTimeout(function () {
                generarPDF(nuevoDerecho.id);
            }, 150);

            return nuevoDerecho;
        }

        function actualizarDerecho(id, dato) {
            const index = derechos.findIndex(function (d) { return d.id === id; });
            if (index === -1) return null;
            const actual = derechos[index];
            actual.tipoProceso = dato.tipoProceso || actual.tipoProceso;
            actual.titular = dato.titular || actual.titular;
            actual.documento = dato.documento || actual.documento;
            actual.telefono = dato.telefono || actual.telefono;
            actual.correo = dato.correo || actual.correo;
            actual.ciudad = dato.ciudad || actual.ciudad;
            actual.direccion = dato.direccion || actual.direccion;
            actual.entidad = dato.entidad || actual.entidad;
            actual.concepto = dato.concepto || actual.concepto;
            actual.descripcion = dato.descripcion || actual.descripcion;
            guardarLocal();
            renderListaDerechos();
            guardarEnSupabase(actual, 'update');
            return actual;
        }

        function guardarLocal() {
            try {
                global.localStorage.setItem(STORAGE_KEY, JSON.stringify(derechos));
            } catch (e) {
                console.warn('[GestionesJudiciales] Error guardando LocalStorage:', e);
            }
        }

        function cambiarEstado(id, nuevoEstado) {
            const index = derechos.findIndex(d => d.id === id);
            if (index === -1) return;

            derechos[index].estado = nuevoEstado;

            derechos[index].seguimiento = derechos[index].seguimiento || [];
            derechos[index].seguimiento.unshift({
                fecha: new Date().toLocaleDateString(),
                estado: nuevoEstado,
                nota: `Cambio a: ${nuevoEstado}`
            });

            guardarLocal();
            renderListaDerechos();

            guardarEnSupabase(derechos[index], 'update');
        }

        function eliminarDerecho(id) {
            if (!confirm('¿Eliminar este proceso?')) return;
            derechos = derechos.filter(d => d.id !== id);
            guardarLocal();
            renderListaDerechos();

            guardarEnSupabase({ id: id }, 'delete');
        }

        async function agregarNotaSeguimiento(id, nota, opciones) {
            opciones = opciones || {};
            const index = derechos.findIndex(d => d.id === id);
            if (index === -1) return;
            const texto = (nota || '').trim();
            const nuevoEstado = (opciones.nuevoEstado || '').trim();
            let foto = opciones.foto || null;
            const archivosExtra = opciones.archivos || [];
            const numRadicado = (opciones.numeroRadicado || '').trim();

            if (!texto && !nuevoEstado && !foto && !numRadicado && !(archivosExtra && archivosExtra.length)) {
                alert('Escribe una nota, elige un estado, agrega el radicado o adjunta una foto');
                return;
            }

            if (foto && foto.file) {
                const subida = await subirArchivoJudicial(
                    foto.file,
                    derechos[index].id,
                    derechos[index].documento,
                    Date.now()
                );
                if (subida) {
                    foto = {
                        name: subida.name,
                        type: subida.type,
                        path: subida.path,
                        url: subida.url,
                        paths: subida.paths
                    };
                } else if (foto.dataUrl) {
                    console.warn('[GestionesJudiciales] Storage falló, se guarda vista local');
                } else {
                    alert('No se pudo subir la foto a Storage. Revisa el bucket judicial.');
                    return;
                }
            }

            if (nuevoEstado) {
                derechos[index].estado = nuevoEstado;
            }

            if (numRadicado) {
                derechos[index].numeroRadicado = numRadicado;
            }

            const estadoActual = derechos[index].estado || 'borrador';
            let notaFinal = texto;
            if (!notaFinal) {
                if (numRadicado) notaFinal = 'Radicado: ' + numRadicado;
                else if (nuevoEstado) notaFinal = 'Cambio de estado a: ' + nuevoEstado;
                else notaFinal = 'Seguimiento con evidencia fotográfica';
            } else if (numRadicado && !texto.includes(numRadicado)) {
                notaFinal = texto + ' | Radicado oficial: ' + numRadicado;
            }

            const entrada = {
                fecha: new Date().toLocaleString(),
                estado: estadoActual,
                nota: notaFinal
            };
            if (foto && (foto.url || foto.path || foto.dataUrl)) {
                entrada.foto = {
                    name: foto.name || 'evidencia.jpg',
                    type: foto.type || 'image/jpeg',
                    path: foto.path || '',
                    url: foto.url || '',
                    paths: foto.paths || [],
                    dataUrl: foto.dataUrl || ''
                };
            }
            if (numRadicado) {
                entrada.numeroRadicado = numRadicado;
            }

            derechos[index].seguimiento = derechos[index].seguimiento || [];
            derechos[index].seguimiento.unshift(entrada);
            guardarLocal();
            renderListaDerechos();

            guardarEnSupabase(derechos[index], 'update');
            guardarSeguimientoTabla(derechos[index].id, entrada);

            if (archivosExtra.length) {
                for (let xi = 0; xi < archivosExtra.length; xi++) {
                    const ax = archivosExtra[xi];
                    if (!ax || !ax.file) continue;
                    const up = await subirArchivoJudicial(ax.file, derechos[index].id, derechos[index].documento, 'anexo');
                    if (!up) continue;
                    const extraEnt = {
                        fecha: new Date().toLocaleString(),
                        estado: estadoActual,
                        nota: 'Anexo: ' + (up.name || 'archivo'),
                        foto: { name: up.name, type: up.type, path: up.path, url: up.url, bucket: 'judicial' }
                    };
                    derechos[index].seguimiento.unshift(extraEnt);
                    guardarSeguimientoTabla(derechos[index].id, extraEnt);
                }
                guardarLocal();
                guardarEnSupabase(derechos[index], 'update');
            }

            if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
                var telSeg = normalizarTelefonoCO(derechos[index].telefono);
                if (telSeg && telSeg.length >= 12) {
                    var msgWa = notaFinal || 'Seguimiento proceso ' + derechos[index].id;
                    var filesWa = [];
                    if (fileInput && fileInput.files && fileInput.files.length) {
                        for (var fi = 0; fi < fileInput.files.length; fi++) filesWa.push(fileInput.files[fi]);
                    }
                    window.WhatsAppCola.encolar({
                        destino: telSeg,
                        mensaje: msgWa || 'Adjunto',
                        files: filesWa
                    });
                }
            }

            const modalBody = document.getElementById('dp-seg-body');
            if (modalBody && modalBody.dataset.id === id) {
                verSeguimiento(id);
            }
        }

        function verSeguimiento(id) {
            const dp = derechos.find(d => d.id === id);
            if (!dp) return;

            let modal = document.getElementById('dp-seg-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dp-seg-modal';
                modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4';
                modal.innerHTML = `
                    <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200/80">
                        <div class="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                    <i class="fas fa-route text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-base leading-tight">Seguimiento</h3>
                                    <p class="text-[11px] text-indigo-100 opacity-90">Historial y evidencias del derecho</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button type="button" id="dp-seg-compartir" class="text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg font-medium transition border border-white/20">
                                    <i class="fab fa-whatsapp mr-1"></i> WhatsApp
                                </button>
                                <button type="button" id="dp-seg-cerrar" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none transition">&times;</button>
                            </div>
                        </div>

                        <div id="dp-seg-body" class="p-5 overflow-y-auto flex-1 text-sm bg-slate-50/50"></div>

                        <div class="px-5 py-4 border-t border-slate-200 bg-white space-y-3.5 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.06)]">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        <i class="fas fa-flag mr-1 text-indigo-500"></i> Estado
                                    </label>
                                    <select id="dp-seg-estado" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition">
                                        <option value="">— Mantener actual —</option>
                                        <option value="borrador">Borrador</option>
                                        <option value="radicado">Radicado</option>
                                        <option value="en_curso">En Curso</option>
                                        <option value="cumplido">Cumplido</option>
                                        <option value="retrasado">Retrasado</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        <i class="fas fa-stamp mr-1 text-blue-500"></i> Nº Radicado / Oficio
                                    </label>
                                    <input type="text" id="dp-seg-num-radicado" placeholder="Ej: 2026-RAD-004582"
                                           class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    <i class="fas fa-comment-alt mr-1 text-slate-400"></i> Nota / observación
                                </label>
                                <textarea id="dp-seg-nota" rows="2" placeholder="Ej: Se radicó en ventanilla, entregaron este número..."
                                          class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition resize-none"></textarea>
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    <i class="fas fa-paperclip mr-1 text-emerald-500"></i> Foto o archivo (PDF, imagen, Word)
                                </label>
                                <input type="file" id="dp-seg-foto" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" multiple
                                       class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold hover:file:bg-emerald-100 file:transition">
                            </div>
                            <button type="button" id="dp-seg-agregar"
                                    class="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-3 rounded-xl transition shadow-sm shadow-indigo-200 flex items-center justify-center gap-2">
                                <i class="fas fa-save"></i> Guardar seguimiento
                            </button>
                        </div>
                    </div>`;
                document.body.appendChild(modal);
                modal.querySelector('#dp-seg-cerrar').addEventListener('click', () => { modal.style.display = 'none'; });
                modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

                modal.querySelector('#dp-seg-agregar').addEventListener('click', async () => {
                    const body = document.getElementById('dp-seg-body');
                    const ta = document.getElementById('dp-seg-nota');
                    const sel = document.getElementById('dp-seg-estado');
                    const numRadInput = document.getElementById('dp-seg-num-radicado');
                    const fileInput = document.getElementById('dp-seg-foto');
                    if (!body || !ta) return;

                    let foto = null;
                    const extras = [];
                    if (fileInput && fileInput.files && fileInput.files.length) {
                        const maxBytes = 8 * 1024 * 1024;
                        for (let i = 0; i < fileInput.files.length; i++) {
                            const file = fileInput.files[i];
                            if (file.size > maxBytes) {
                                alert('El archivo ' + file.name + ' supera 8 MB y se omitió.');
                                continue;
                            }
                            const item = { name: file.name, type: file.type || 'application/octet-stream', file: file };
                            if (!foto) foto = item;
                            else extras.push(item);
                        }
                    }

                    agregarNotaSeguimiento(body.dataset.id, ta.value, {
                        nuevoEstado: sel ? sel.value : '',
                        numeroRadicado: numRadInput ? numRadInput.value : '',
                        foto: foto,
                        archivos: extras
                    });
                    ta.value = '';
                    if (sel) sel.value = '';
                    if (numRadInput) numRadInput.value = '';
                    if (fileInput) fileInput.value = '';
                });

                modal.querySelector('#dp-seg-compartir').addEventListener('click', () => {
                    const body = document.getElementById('dp-seg-body');
                    if (body && body.dataset.id) {
                        compartirSeguimiento(body.dataset.id);
                    }
                });
            }

            const body = document.getElementById('dp-seg-body');
            body.dataset.id = id;

            const selEstado = document.getElementById('dp-seg-estado');
            if (selEstado) selEstado.value = '';

            const numRadInput = document.getElementById('dp-seg-num-radicado');
            if (numRadInput) numRadInput.value = dp.numeroRadicado || '';

            const estadoColor = (est) => {
                const e = (est || '').toLowerCase();
                if (e === 'borrador') return 'bg-amber-100 text-amber-800 border-amber-200';
                if (e === 'radicado') return 'bg-blue-100 text-blue-800 border-blue-200';
                if (e === 'en_curso') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                if (e === 'cumplido') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (e === 'retrasado') return 'bg-rose-100 text-rose-800 border-rose-200';
                return 'bg-slate-100 text-slate-700 border-slate-200';
            };

            const historial = (dp.seguimiento && dp.seguimiento.length)
                ? dp.seguimiento.map(s => {
                    const srcFoto = (s.foto && (s.foto.url || s.foto.dataUrl)) || '';
                    const esImg = srcFoto && String((s.foto && s.foto.type) || s.foto && s.foto.name || '').match(/image|jpg|jpeg|png|webp|gif/i);
                    const fotoHtml = (s.foto && (srcFoto || s.foto.path))
                        ? (esImg
                            ? `<div class="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                   <img src="${srcFoto}" alt="${s.foto.name || 'archivo'}" class="w-full max-h-52 object-contain" />
                                   <p class="text-[10px] text-slate-400 px-2 py-1 truncate">judicial/${s.foto.path || s.foto.name}</p>
                               </div>`
                            : `<a href="${srcFoto || '#'}" target="_blank" class="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                                   <i class="fas fa-paperclip"></i> ${s.foto.name || s.foto.path || 'Archivo'}
                               </a>`)
                        : '';
                    const radHtml = s.numeroRadicado
                        ? `<div class="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                               <i class="fas fa-stamp"></i> ${s.numeroRadicado}
                           </div>`
                        : '';
                    return `
                    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow mb-3">
                        <div class="flex justify-between items-start gap-2 mb-2">
                            <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${estadoColor(s.estado)}">
                                ${(s.estado || '').replace(/_/g, ' ')}
                            </span>
                            <span class="text-[11px] text-slate-400 whitespace-nowrap"><i class="far fa-clock mr-1"></i>${s.fecha || ''}</span>
                        </div>
                        <p class="text-slate-700 text-sm leading-relaxed">${s.nota || ''}</p>
                        ${radHtml}
                        ${fotoHtml}
                    </div>`;
                }).join('')
                : `<div class="text-center py-10 text-slate-400">
                       <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
                           <i class="fas fa-history text-2xl text-slate-300"></i>
                       </div>
                       <p class="text-sm font-medium">Sin notas de seguimiento aún</p>
                       <p class="text-xs mt-1">Agrega el primer registro abajo</p>
                   </div>`;

            const estadoActualClass = estadoColor(dp.estado);
            const radicadoBadge = dp.numeroRadicado
                ? `<div class="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
                       <i class="fas fa-stamp text-blue-500"></i>
                       <span>Radicado: <span class="font-mono tracking-wide">${dp.numeroRadicado}</span></span>
                   </div>`
                : '';

            const plazoSeg = calcularPlazo(dp);
            let plazoSegHtml = '';
            if ((dp.estado || '') !== 'cumplido') {
                if (plazoSeg.vencido) {
                    plazoSegHtml = `<div class="mt-3 text-sm font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5"><i class="fas fa-exclamation-triangle mr-1"></i> Plazo VENCIDO · Límite ${plazoSeg.fechaLimiteStr} (${plazoSeg.diasHabiles} días hábiles según tipo)</div>`;
                } else {
                    plazoSegHtml = `<div class="mt-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"><i class="fas fa-hourglass-half mr-1 text-indigo-500"></i> Tiempo de respuesta: <strong>${plazoSeg.diasHabiles} días hábiles</strong> · Vence <strong>${plazoSeg.fechaLimiteStr}</strong> (${plazoSeg.diasRestantes} día(s) restantes)</div>`;
                }
            } else {
                plazoSegHtml = `<div class="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5"><i class="fas fa-check mr-1"></i> Proceso cumplido (plazo de ${plazoSeg.diasHabiles} días hábiles)</div>`;
            }

            body.innerHTML = `
                <div class="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
                    <p class="text-[11px] text-slate-400 font-mono mb-1">${dp.id} · ${etiquetaTipo(dp.tipoProceso)}</p>
                    <p class="font-bold text-slate-800 text-base leading-snug mb-1">${dp.concepto}</p>
                    <p class="text-slate-500 text-xs mb-3"><i class="fas fa-user mr-1 opacity-60"></i>${dp.titular}</p>
                    <span class="inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border ${estadoActualClass}">
                        ${(dp.estado || 'borrador').replace(/_/g, ' ')}
                    </span>
                    ${radicadoBadge}
                    ${plazoSegHtml}
                </div>
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-0.5">Historial</p>
                <div class="space-y-0">${historial}</div>`;
            modal.style.display = 'flex';
        }

        function compartirSeguimiento(id) {
            const dp = derechos.find(d => d.id === id);
            if (!dp) return;

            const lineas = [
                `📋 *Seguimiento — Proceso Judicial*`,
                `ID: ${dp.id}`,
                `Asunto: ${dp.concepto || ''}`,
                `Titular: ${dp.titular || ''}`,
                `Estado actual: ${(dp.estado || 'borrador').replace(/_/g, ' ')}`,
                dp.numeroRadicado ? `Radicado: ${dp.numeroRadicado}` : null,
                ``,
                `*Historial:*`
            ].filter(Boolean);

            (dp.seguimiento || []).forEach((s, i) => {
                lineas.push(`${i + 1}. [${s.fecha || ''}] ${(s.estado || '').replace(/_/g, ' ')}`);
                if (s.nota) lineas.push(`   ${s.nota}`);
                if (s.foto && s.foto.path) lineas.push(`   📎 judicial/${s.foto.path}`);
                else if (s.foto) lineas.push(`   📎 Archivo adjunto`);
            });

            const texto = lineas.join('\n');
            const tel = normalizarTelefonoCO(dp.telefono);
            if (tel.length < 12) {
                alert('Este proceso no tiene un teléfono válido para WhatsApp.');
                return;
            }
            archivosComoFiles(dp).then(function (files) {
                var inp = document.getElementById('dp-seg-foto');
                if (inp && inp.files && inp.files.length) {
                    for (var i = 0; i < inp.files.length; i++) files.push(inp.files[i]);
                }
                if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
                    return window.WhatsAppCola.encolar({
                        destino: tel,
                        mensaje: texto || 'Adjunto',
                        files: files
                    });
                }
                return { ok: false };
            }).then(function (r) {
                if (r && r.ok) {
                    var n = (r.paths && r.paths.length) || 0;
                    alert('WhatsApp en cola para ' + tel + (n ? (' con ' + n + ' archivo(s)') : ''));
                } else {
                    abrirWhatsAppConTexto(texto, dp.telefono);
                }
            }).catch(function (e) {
                alert('No se pudo encolar WhatsApp: ' + ((e && e.message) || e));
            });
        }

        async function archivosComoFiles(dp) {
            const files = [];
            const sb = getSupabaseClient();
            const paths = recolectarPathsArchivos(dp);
            if (!sb || !sb.storage) return files;
            for (let i = 0; i < paths.length; i++) {
                const path = paths[i];
                try {
                    const dl = await sb.storage.from('judicial').download(path);
                    if (dl.error || !dl.data) continue;
                    const nombre = path.split('/').pop() || ('anexo_' + (i + 1));
                    files.push(new File([dl.data], nombre, {
                        type: dl.data.type || 'application/octet-stream'
                    }));
                } catch (e) {
                    console.warn('[GestionesJudiciales] archivo WA', path, e);
                }
            }
            return files;
        }

        function recolectarPathsArchivos(dp) {
            const out = [];
            const seen = {};
            function add(p) {
                p = String(p || '').replace(/^judicial\//, '').trim();
                if (!p || seen[p]) return;
                seen[p] = true;
                out.push(p);
            }
            (dp.archivos || []).forEach(function (a) {
                if (a && a.path) add(a.path);
                (a && a.paths || []).forEach(add);
            });
            (dp.seguimiento || []).forEach(function (s) {
                if (s && s.foto && s.foto.path) add(s.foto.path);
                if (s && s.archivo_path) add(s.archivo_path);
                if (s && s.archivoPath) add(s.archivoPath);
            });
            return out;
        }

        function copiarOWhatsApp(texto, telefono) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(texto).then(() => {
                    alert('✅ Seguimiento copiado al portapapeles.\nPuedes pegarlo donde quieras o enviarlo por WhatsApp.');
                }).catch(() => {
                    abrirWhatsAppConTexto(texto, telefono);
                });
            } else {
                abrirWhatsAppConTexto(texto, telefono);
            }
        }

        function abrirWhatsAppConTexto(texto, telefono) {
            const num = (telefono || '').replace(/\D/g, '');
            const url = num
                ? `https://wa.me/${num}?text=${encodeURIComponent(texto)}`
                : `https://wa.me/?text=${encodeURIComponent(texto)}`;
            window.open(url, '_blank');
        }

        function generarPDF(id) {
            const dp = derechos.find(d => d.id === id);
            if (!dp) return;

            const fechaObj = dp.fechaCreacion ? new Date(dp.fechaCreacion) : new Date();
            const fechaLarga = fechaObj.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            const ciudad = dp.ciudad || '________________';
            const entidad = dp.entidad || 'Señor Alcalde Municipal';
            const direccion = dp.direccion || '________________';
            const cuerpo = (dp.descripcion || 'Sin descripción').replace(/\n/g, '<br>');

            const archivos = Array.isArray(dp.archivos) ? dp.archivos : [];
            let anexosHtml = '';
            let imagenesHtml = '';
            if (archivos.length === 0) {
                anexosHtml = '<p style="margin:0;color:#64748b;font-size:13px;">Ninguno.</p>';
            } else {
                const items = archivos.map((a, i) => {
                    const nombre = a.name || ('Anexo ' + (i + 1));
                    const tipo = a.type || '';
                    const extra = a.omitido ? ' (omitido por tamaño; solo referencia)' : (a.dataUrl ? '' : ' (sin vista previa)');
                    return `<li style="margin:4px 0;">${i + 1}. ${nombre}${tipo ? ' — ' + tipo : ''}${extra}</li>`;
                }).join('');
                anexosHtml = `<ol style="margin:6px 0 0 18px;padding:0;font-size:13px;">${items}</ol>`;
                imagenesHtml = archivos.filter(a => (a.url || a.dataUrl) && String(a.type || '').indexOf('image/') === 0).map((a, i) =>
                    `<div style="margin:12px 0;page-break-inside:avoid;">
                       <p style="font-size:12px;color:#64748b;margin:0 0 6px;">Anexo fotográfico: ${a.name || ('Imagen ' + (i + 1))}</p>
                       <img src="${a.url || a.dataUrl}" alt="${a.name || ''}" style="max-width:100%;max-height:420px;border:1px solid #e2e8f0;border-radius:4px;" />
                     </div>`
                ).join('');
            }

            const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Proceso Judicial ${dp.id}</title>
<style>
  body{font-family:"Times New Roman",Times,serif;color:#111;max-width:700px;margin:28px auto;padding:0 20px;line-height:1.55;font-size:14px;text-align:justify}
  .no-print{font-family:system-ui,sans-serif;margin-bottom:18px;text-align:left}
  .lugar-fecha{text-align:right;margin-bottom:28px}
  .destinatario{margin-bottom:22px;text-align:left}
  .asunto{margin:18px 0;text-align:justify}
  .cuerpo{text-align:justify;margin:16px 0}
  .firma{margin-top:48px;text-align:left}
  .linea-firma{border-top:1px solid #111;width:240px;margin-top:48px;padding-top:6px;text-align:left}
  .ref{font-size:11px;color:#555;margin-top:36px;border-top:1px solid #ccc;padding-top:8px}
  h2.sec{font-size:14px;margin:22px 0 8px;font-family:"Times New Roman",Times,serif;text-align:center;letter-spacing:.04em}
  @media print{body{margin:12mm} .no-print{display:none!important}}
</style></head><body>
  <div class="no-print">
    <button onclick="window.print()" style="background:#4f46e5;color:#fff;border:0;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600">Imprimir / Guardar PDF</button>
    <button onclick="window.close()" style="margin-left:8px;background:#e2e8f0;border:0;padding:8px 16px;border-radius:8px;cursor:pointer">Cerrar</button>
    <span style="margin-left:12px;font-size:12px;color:#64748b">Radicado interno: ${dp.id}</span>
  </div>

  <p class="lugar-fecha">${ciudad}, ${fechaLarga}</p>

  <div class="destinatario">
    <p style="margin:0 0 2px"><strong>${entidad}</strong></p>
    <p style="margin:0">E. S. D.</p>
  </div>

  <p class="asunto"><strong>Asunto:</strong> Proceso Judicial — ${dp.concepto || ''}</p>
  <p><strong>Referencia interna:</strong> ${dp.id}</p>

  <div class="cuerpo">
    <p>Yo, <strong>${dp.titular}</strong>, identificado(a) con documento de identidad
    <strong>${dp.documento || '________________'}</strong>, con domicilio en
    <strong>${direccion}</strong>, correo electrónico <strong>${dp.correo || '________________'}</strong>
    y teléfono <strong>${dp.telefono || '________________'}</strong>, me dirijo respetuosamente a usted
    en ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la Constitución
    Política de Colombia y en la Ley 1755 de 2015, para solicitar lo siguiente:</p>

    <h2 class="sec">HECHOS Y FUNDAMENTOS</h2>
    <p>${cuerpo}</p>

    <h2 class="sec">PETICIÓN</h2>
    <p>Con base en lo anterior, comedidamente solicito se dé trámite a la presente petición
    relacionada con: <strong>${dp.concepto || ''}</strong>, y se me notifique la respuesta
    dentro de los términos legales.</p>

    <h2 class="sec">NOTIFICACIONES</h2>
    <p>Manifiesto que puedo ser notificado a través de:</p>
    <p><strong>Dirección:</strong> ${direccion}<br>
    <strong>Correo electrónico:</strong> ${dp.correo || '________________'}<br>
    <strong>Teléfono:</strong> ${dp.telefono || '________________'}</p>

    <h2 class="sec">ANEXOS</h2>
    ${anexosHtml}
  </div>

  ${imagenesHtml}

  <div class="firma">
    <p>Atentamente,</p>
    <div class="linea-firma">
      <strong>${dp.titular}</strong><br>
      C.C. / Doc. ${dp.documento || '________________'}<br>
      Tel: ${dp.telefono || '—'} · ${dp.correo || '—'}
    </div>
  </div>
</body></html>`;

            const win = window.open('', '_blank', 'width=820,height=720');
            if (!win) {
                alert('Permite ventanas emergentes para generar el PDF');
                return;
            }
            win.document.write(html);
            win.document.close();
        }

        function renderListaDerechos() {
            const container = global.document.getElementById('lista-procesos');
            if (!container) {
                return;
            }

            // Actualizar contadores del inicio si existen
            actualizarContadoresInicio();

            if (derechos.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
                        <i class="fas fa-folder-open text-4xl mb-3"></i>
                        <p class="font-medium">No hay procesos registrados.</p>
                        <p class="text-sm mt-1">Haz clic en "Nuevo Proceso" para comenzar.</p>
                    </div>`;
                return;
            }

            let html = '';
            derechos.forEach(dp => {
                let estadoClass = 'bg-slate-100 text-slate-700';
                let estadoTexto = dp.estado || 'Borrador';

                if (dp.estado === 'borrador') { estadoClass = 'bg-amber-100 text-amber-800'; estadoTexto = 'Borrador'; }
                else if (dp.estado === 'radicado') { estadoClass = 'bg-blue-100 text-blue-800'; estadoTexto = 'Radicado'; }
                else if (dp.estado === 'en_curso') { estadoClass = 'bg-indigo-100 text-indigo-800'; estadoTexto = 'En Curso'; }
                else if (dp.estado === 'cumplido') { estadoClass = 'bg-emerald-100 text-emerald-800'; estadoTexto = 'Cumplido'; }
                else if (dp.estado === 'retrasado') { estadoClass = 'bg-rose-100 text-rose-800'; estadoTexto = 'Retrasado'; }

                const btns = `
                    <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                        ${dp.estado === 'borrador' ?
                            `<button onclick="window.App.instance.alcaldia.cambiarEstado('${dp.id}', 'radicado')" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition">RADICAR</button>` : ''}

                        ${dp.estado === 'radicado' ?
                            `<button onclick="window.App.instance.alcaldia.cambiarEstado('${dp.id}', 'en_curso')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition">MARCAR EN CURSO</button>` : ''}

                        ${dp.estado === 'en_curso' ?
                            `<button onclick="window.App.instance.alcaldia.cambiarEstado('${dp.id}', 'cumplido')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition">MARCAR CUMPLIDO</button>` : ''}

                        <button onclick="window.App.instance.alcaldia.editar('${dp.id}')" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-lg text-xs font-medium transition border border-indigo-200">
                            <i class="fas fa-pen mr-1"></i> Editar
                        </button>
                        <button onclick="window.App.instance.alcaldia.verSeguimiento('${dp.id}')" class="bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-2 rounded-lg text-xs font-medium transition border border-sky-200">
                            <i class="fas fa-route mr-1"></i> Seguimiento${(dp.seguimiento && dp.seguimiento.length) ? ' (' + dp.seguimiento.length + ')' : ''}
                        </button>

                        <button onclick="window.App.instance.alcaldia.enviarWhatsApp('${dp.id}')" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg text-xs font-medium transition border border-emerald-200">
                            <i class="fab fa-whatsapp mr-1"></i> WhatsApp
                        </button>

                        <button onclick="window.App.instance.alcaldia.generarPDF('${dp.id}')" class="bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg text-xs font-medium transition border border-slate-200">
                            <i class="fas fa-file-pdf mr-1"></i> PDF
                        </button>

                        <button onclick="window.App.instance.alcaldia.eliminar('${dp.id}')" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-2 rounded-lg text-xs font-medium transition border border-rose-200">
                            <i class="fas fa-trash mr-1"></i>
                        </button>
                    </div>
                `;

                const ultSeg = (dp.seguimiento && dp.seguimiento[0])
                    ? `<p class="text-xs text-slate-400 mt-2"><i class="fas fa-clock mr-1"></i> Último: ${dp.seguimiento[0].nota} · ${dp.seguimiento[0].fecha}</p>`
                    : '';
                const nAnexos = (dp.archivos && dp.archivos.length) ? dp.archivos.length : 0;
                const anexosBadge = nAnexos
                    ? `<span class="text-xs text-slate-500 ml-2"><i class="fas fa-paperclip mr-1"></i>${nAnexos} anexo(s)</span>`
                    : '';

                const radicadoLine = dp.numeroRadicado
                    ? `<p class="text-sm text-blue-700 font-medium mb-2"><i class="fas fa-stamp mr-1"></i> Radicado: <span class="font-mono">${dp.numeroRadicado}</span></p>`
                    : '';

                const tipoKey = dp.tipoProceso || 'derecho_peticion';
                const tipoLabel = etiquetaTipo(tipoKey);
                const tipoBadge = `<span class="bg-violet-100 text-violet-800 px-2.5 py-1 rounded-md text-xs font-bold">${tipoLabel}</span>`;
                const plazo = calcularPlazo(dp);
                let plazoHtml = '';
                if ((dp.estado || '') !== 'cumplido') {
                  if (plazo.vencido) {
                    plazoHtml = `<p class="text-xs text-rose-700 font-semibold mt-1"><i class="fas fa-exclamation-circle mr-1"></i>VENCIDO · Límite ${plazo.fechaLimiteStr} (${plazo.diasHabiles} días hábiles)</p>`;
                  } else if (plazo.proximo) {
                    plazoHtml = `<p class="text-xs text-amber-700 font-semibold mt-1"><i class="fas fa-clock mr-1"></i>Por vencer: ${plazo.diasRestantes} día(s) · Límite ${plazo.fechaLimiteStr}</p>`;
                  } else {
                    plazoHtml = `<p class="text-xs text-slate-500 mt-1"><i class="far fa-calendar-check mr-1"></i>Plazo: ${plazo.diasHabiles} días hábiles · Vence ${plazo.fechaLimiteStr} (${plazo.diasRestantes}d)</p>`;
                  }
                }

                html += `
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex flex-wrap gap-1.5 items-center">
                                ${tipoBadge}
                                <span class="${estadoClass} px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">${estadoTexto}</span>
                                ${anexosBadge}
                            </div>
                            <span class="text-xs text-slate-400 font-mono">${dp.id}</span>
                        </div>

                        <h3 class="font-bold text-slate-800 text-lg mb-1">${dp.concepto}</h3>
                        <p class="text-sm text-slate-500 mb-2"><i class="fas fa-user mr-1"></i> ${dp.titular} | <i class="fas fa-id-card mr-1"></i> ${dp.documento}</p>
                        ${radicadoLine}
                        ${plazoHtml}

                        <p class="text-sm text-slate-600 line-clamp-2 mb-1 bg-slate-50 p-2 rounded">${dp.descripcion}</p>
                        ${ultSeg}

                        ${btns}
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function actualizarContadoresInicio() {
            // Si el módulo inicio tiene contadores genéricos, los actualizamos con datos de derechos
            const totalEl = document.getElementById('inicio-total-personas');
            // No tocamos los de personas; solo mostramos en consola o futuro
        }

        function normalizarTelefonoCO(tel) {
            let digitos = String(tel || '').replace(/\D/g, '');
            if (!digitos) return '';
            if (digitos.startsWith('57') && digitos.length >= 12) return digitos;
            if (digitos.startsWith('0')) digitos = digitos.slice(1);
            if (digitos.length === 10) return '57' + digitos;
            if (!digitos.startsWith('57')) return '57' + digitos;
            return digitos;
        }

        async function enviarWhatsApp(id) {
            const dp = derechos.find(d => d.id === id);
            if (!dp) return;

            const telefono = normalizarTelefonoCO(dp.telefono);
            if (!telefono || telefono.length < 12) {
                console.warn('[GestionesJudiciales] Teléfono inválido, no se encola WA');
                return;
            }

            const tipo = etiquetaTipo(dp.tipoProceso);
            const mensaje = [
                '📄 *' + tipo.toUpperCase() + '*',
                '',
                '*Asunto:* ' + (dp.concepto || ''),
                '*Titular:* ' + (dp.titular || ''),
                '*Documento:* ' + (dp.documento || ''),
                '*ID:* ' + (dp.id || ''),
                dp.numeroRadicado ? ('*Radicado:* ' + dp.numeroRadicado) : null,
                '',
                (dp.descripcion || '').slice(0, 800),
                '',
                '_GestorApp · Edil Norte-Centro Histórico_'
            ].filter(function (x) { return x !== null; }).join('\n');

            if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
                const files = await archivosComoFiles(dp);
                const r = await window.WhatsAppCola.encolar({ destino: telefono, mensaje: mensaje || 'Adjunto', files: files });
                console.log('[GestionesJudiciales] WA supabase', r && r.ok ? 'OK' : (r && r.error));
                return;
            }
            try {
                if (window.App && window.App.instance && window.App.instance.mensajes && typeof window.App.instance.mensajes.enviar === 'function') {
                    window.App.instance.mensajes.enviar({ to: telefono, message: mensaje });
                }
            } catch (e) {}
        }

        // =====================================================
        //  UI AUTO-INYECCIÓN (sin tocar index.html)
        // =====================================================

        function inyectarUI() {
            if (uiInyectada) return;
            if (!document.body) return;

            // 1. Insertar pestaña en la barra de módulos
            const tabsContainer = document.querySelector('.flex.space-x-2.py-2');
            if (tabsContainer && !document.getElementById('tab-gestiones-judiciales')) {
                const btn = document.createElement('button');
                btn.id = 'tab-gestiones-judiciales';
                btn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all';
                btn.innerHTML = '<i class="fas fa-balance-scale mr-2"></i>Gestiones Judiciales';
                btn.onclick = function () {
                    if (typeof cambiarModulo === 'function') {
                        cambiarModulo('gestiones-judiciales');
                    }
                    // Asegurar que los datos estén cargados
                    if (typeof window.App !== 'undefined' && window.App.instance && window.App.instance.alcaldia) {
                        window.App.instance.alcaldia.init();
                    }
                };
                tabsContainer.appendChild(btn);
            }

            // 2. Insertar sección completa en <main>
            const main = document.querySelector('main');
            if (main && !document.getElementById('modulo-gestiones-judiciales')) {
                const section = document.createElement('section');
                section.id = 'modulo-gestiones-judiciales';
                section.className = 'modulo-seccion fade-in';
                section.style.display = 'none';
                section.innerHTML = `
                    <header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 class="text-2xl font-bold text-slate-800">Gestiones Judiciales</h1>
                            <p class="text-slate-500 text-sm mt-0.5">Procesos judiciales, tutelas, procesos y seguimiento</p>
                        </div>
                        <button id="btn-nuevo-proceso" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-2">
                            <i class="fas fa-plus"></i> Nuevo Proceso
                        </button>
                    </header>

                    <!-- Resumen y análisis de plazos -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" id="gj-stats">
                        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                            <p class="text-2xl font-bold text-slate-800" id="stat-total">0</p>
                            <p class="text-xs text-slate-500 mt-1">Total</p>
                        </div>
                        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                            <p class="text-2xl font-bold text-amber-600" id="stat-borrador">0</p>
                            <p class="text-xs text-slate-500 mt-1">Borradores</p>
                        </div>
                        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                            <p class="text-2xl font-bold text-blue-600" id="stat-radicado">0</p>
                            <p class="text-xs text-slate-500 mt-1">Radicados</p>
                        </div>
                        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                            <p class="text-2xl font-bold text-emerald-600" id="stat-cumplido">0</p>
                            <p class="text-xs text-slate-500 mt-1">Cumplidos</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><i class="fas fa-exclamation-triangle"></i></div>
                            <div>
                                <p class="text-xl font-bold text-rose-700" id="stat-vencidos">0</p>
                                <p class="text-xs text-rose-600">Vencidos (fuera de plazo)</p>
                            </div>
                        </div>
                        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><i class="fas fa-clock"></i></div>
                            <div>
                                <p class="text-xl font-bold text-amber-700" id="stat-proximos">0</p>
                                <p class="text-xs text-amber-600">Por vencer (≤ 3 días)</p>
                            </div>
                        </div>
                        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><i class="fas fa-check-circle"></i></div>
                            <div>
                                <p class="text-xl font-bold text-emerald-700" id="stat-atiempo">0</p>
                                <p class="text-xs text-emerald-600">A tiempo / cumplidos</p>
                            </div>
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-400 mb-4">Plazos legales (días hábiles): Derecho de Petición 15 · Tutela 10 · Desacato 2</p>

                    <!-- Lista -->
                    <div id="lista-procesos" class="space-y-4">
                        <div class="text-center py-10 text-slate-400">
                            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                            <p>Cargando derechos...</p>
                        </div>
                    </div>
                `;
                main.appendChild(section);

                // Botón nueva petición
                const btnNuevo = document.getElementById('btn-nuevo-proceso');
                if (btnNuevo) {
                    btnNuevo.addEventListener('click', abrirModalNuevoDerecho);
                }
            }

            // 3. Modal de creación (se crea una sola vez)
            if (!document.getElementById('dp-nuevo-modal')) {
                const modal = document.createElement('div');
                modal.id = 'dp-nuevo-modal';
                modal.className = 'fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4';
                modal.style.display = 'none';
                modal.innerHTML = `
                    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[94vh] overflow-hidden flex flex-col border border-slate-200">
                        <div class="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                    <i class="fas fa-balance-scale text-lg"></i>
                                </div>
                                <div>
                                    <h3 id="dp-nuevo-titulo" class="font-bold text-base">Nuevo Proceso</h3>
                                    <p id="dp-nuevo-sub" class="text-[11px] text-indigo-100 opacity-90">Completa los datos del proceso</p>
                                </div>
                            </div>
                            <button type="button" id="dp-nuevo-cerrar" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none transition">&times;</button>
                        </div>

                        <div class="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/40">
                            <input type="hidden" id="dp-edit-id" value="">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de proceso *</label>
                                <select id="dp-tipo-proceso" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="derecho_peticion">Derecho de Petición</option>
                                    <option value="tutela">Acción de Tutela</option>
                                    <option value="desacato">Desacato</option>
                                    <option value="cumplimiento">Acción de Cumplimiento</option>
                                    <option value="popular">Acción Popular</option>
                                    <option value="grupo">Acción de Grupo</option>
                                    <option value="queja">Queja / Reclamo</option>
                                    <option value="recurso">Recurso / Apelación</option>
                                    <option value="otro">Otro proceso</option>
                                </select>
                            </div>
                            <div id="dp-tipo-otro-wrap" class="hidden">
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Especificar tipo de proceso</label>
                                <input type="text" id="dp-tipo-otro" placeholder="Ej: Medida cautelar, incidente..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Plantillas listas</label>
                                <button type="button" id="dp-plantilla-rui" class="w-full text-left px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-sm text-indigo-800 font-medium transition">
                                    <i class="fas fa-file-alt mr-2"></i> Derecho de Petición RUI (DNP / Ventanilla Social)
                                </button>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Titular *</label>
                                    <input type="text" id="dp-titular" placeholder="Nombre completo" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Documento *</label>
                                    <input type="text" id="dp-documento" placeholder="CC 1234567890" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono *</label>
                                    <input type="text" id="dp-telefono" placeholder="3001234567 o 573001234567" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Correo</label>
                                    <input type="email" id="dp-correo" placeholder="correo@ejemplo.com" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Ciudad</label>
                                    <input type="text" id="dp-ciudad" placeholder="Barranquilla" value="Barranquilla" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Dirección</label>
                                    <input type="text" id="dp-direccion" placeholder="Barrio / dirección" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Entidad destinataria</label>
                                <input type="text" id="dp-entidad" value="Señor Alcalde Municipal" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Asunto / Concepto *</label>
                                <input type="text" id="dp-concepto" placeholder="Ej: Solicitud de arreglo de vía pública" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Hechos, pretensiones y fundamentos *</label>
                                <textarea id="dp-descripcion" rows="5" placeholder="Describe los hechos, fundamentos y lo que se solicita..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white resize-none"></textarea>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                                    <i class="fas fa-paperclip mr-1 text-slate-400"></i> Anexos (imágenes, máx. 800 KB c/u)
                                </label>
                                <input type="file" id="dp-archivos" accept="image/*,.pdf" multiple
                                       class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100 file:transition">
                                <p class="text-[11px] text-slate-400 mt-1">Las imágenes se incrustarán en el PDF. PDFs solo se listan.</p>
                            </div>
                        </div>

                        <div class="px-5 py-4 border-t border-slate-200 bg-white flex gap-3">
                            <button type="button" id="dp-nuevo-cancelar" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition text-sm">
                                Cancelar
                            </button>
                            <button type="button" id="dp-nuevo-guardar" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2">
                                <i class="fas fa-save"></i> Crear proceso y generar PDF
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Cerrar modal
                const cerrar = () => { modal.style.display = 'none'; };
                modal.querySelector('#dp-nuevo-cerrar').addEventListener('click', cerrar);
                modal.querySelector('#dp-nuevo-cancelar').addEventListener('click', cerrar);
                modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });

                const tipoSel = modal.querySelector('#dp-tipo-proceso');
                const tipoOtroWrap = modal.querySelector('#dp-tipo-otro-wrap');
                if (tipoSel && tipoOtroWrap) {
                    tipoSel.addEventListener('change', function () {
                        if (this.value === 'otro') tipoOtroWrap.classList.remove('hidden');
                        else tipoOtroWrap.classList.add('hidden');
                    });
                }
                const btnRui = modal.querySelector('#dp-plantilla-rui');
                if (btnRui) {
                    btnRui.addEventListener('click', function () { aplicarPlantillaRUI(); });
                }

                // Guardar
                modal.querySelector('#dp-nuevo-guardar').addEventListener('click', async () => {
                    let tipoProceso = (document.getElementById('dp-tipo-proceso').value || 'derecho_peticion').trim();
                    if (tipoProceso === 'otro') {
                        const otro = (document.getElementById('dp-tipo-otro').value || '').trim();
                        if (!otro) {
                            alert('Especifica el tipo de proceso');
                            return;
                        }
                        tipoProceso = otro;
                    }
                    const titular = (document.getElementById('dp-titular').value || '').trim();
                    const documento = (document.getElementById('dp-documento').value || '').trim();
                    const telefono = (document.getElementById('dp-telefono').value || '').trim();
                    const correo = (document.getElementById('dp-correo').value || '').trim();
                    const ciudad = (document.getElementById('dp-ciudad').value || '').trim();
                    const direccion = (document.getElementById('dp-direccion').value || '').trim();
                    const entidad = (document.getElementById('dp-entidad').value || '').trim();
                    const concepto = (document.getElementById('dp-concepto').value || '').trim();
                    const descripcion = (document.getElementById('dp-descripcion').value || '').trim();

                    if (!titular || !documento || !telefono || !concepto || !descripcion) {
                        alert('Completa los campos obligatorios: Titular, Documento, Teléfono, Asunto y Hechos.');
                        return;
                    }

                    const fileInput = document.getElementById('dp-archivos');
                    const archivosPendientes = [];
                    if (fileInput && fileInput.files && fileInput.files.length) {
                        const maxBytes = 8 * 1024 * 1024;
                        for (let i = 0; i < fileInput.files.length; i++) {
                            const file = fileInput.files[i];
                            if (file.size > maxBytes) {
                                alert('El archivo ' + file.name + ' supera 8 MB y se omitió.');
                                continue;
                            }
                            archivosPendientes.push(file);
                        }
                    }

                    const editId = (document.getElementById('dp-edit-id').value || '').trim();
                    let proceso = null;
                    if (editId) {
                        proceso = actualizarDerecho(editId, {
                            tipoProceso,
                            titular,
                            documento,
                            telefono,
                            correo: correo || 'sin-correo@ejemplo.com',
                            ciudad: ciudad || 'Barranquilla',
                            direccion,
                            entidad: entidad || 'Señor Alcalde Municipal',
                            concepto,
                            descripcion
                        });
                        if (!proceso) {
                            alert('No se encontró el proceso para editar.');
                            return;
                        }
                    } else {
                        proceso = agregarDerecho({
                            tipoProceso,
                            titular,
                            documento,
                            telefono,
                            correo: correo || 'sin-correo@ejemplo.com',
                            ciudad: ciudad || 'Barranquilla',
                            direccion,
                            entidad: entidad || 'Señor Alcalde Municipal',
                            concepto,
                            descripcion,
                            archivos: []
                        });
                    }

                    if (archivosPendientes.length && proceso) {
                        const subidos = proceso.archivos ? proceso.archivos.slice() : [];
                        for (let i = 0; i < archivosPendientes.length; i++) {
                            const up = await subirArchivoJudicial(
                                archivosPendientes[i],
                                proceso.id,
                                documento,
                                String(subidos.length + i + 1)
                            );
                            if (up) subidos.push(up);
                        }
                        proceso.archivos = subidos;
                        guardarLocal();
                        guardarEnSupabase(proceso, 'update');
                        renderListaDerechos();
                    }

                    // Limpiar form
                    if (document.getElementById('dp-edit-id')) document.getElementById('dp-edit-id').value = '';
                    document.getElementById('dp-titular').value = '';
                    document.getElementById('dp-documento').value = '';
                    document.getElementById('dp-telefono').value = '';
                    document.getElementById('dp-correo').value = '';
                    document.getElementById('dp-direccion').value = '';
                    document.getElementById('dp-concepto').value = '';
                    document.getElementById('dp-descripcion').value = '';
                    if (fileInput) fileInput.value = '';

                    modal.style.display = 'none';

                    // Actualizar stats
                    actualizarStats();

                    // Feedback
                    setTimeout(() => {
                        if (editId) alert('✅ Proceso actualizado: ' + proceso.id);
                        else alert('✅ Proceso creado: ' + proceso.id + '\nSe abrió el PDF para impresión/radicación.');
                    }, 300);
                });
            }

            uiInyectada = true;
            console.log('[GestionesJudiciales] UI inyectada correctamente en el panel.');
        }


        function aplicarPlantillaRUI() {
            const titular = (document.getElementById('dp-titular') || {}).value || '[Nombre completo]';
            const documento = (document.getElementById('dp-documento') || {}).value || '[número]';
            const telefono = (document.getElementById('dp-telefono') || {}).value || '[número]';
            const correo = (document.getElementById('dp-correo') || {}).value || '[correo]';
            const direccion = (document.getElementById('dp-direccion') || {}).value || '[dirección completa]';
            const ciudad = (document.getElementById('dp-ciudad') || {}).value || 'Barranquilla';

            document.getElementById('dp-tipo-proceso').value = 'derecho_peticion';
            document.getElementById('dp-entidad').value = 'Departamento Nacional de Planeación – DNP / Registro Universal de Ingresos (RUI) / Ventanilla Social · servicioalciudadano@dnp.gov.co';
            document.getElementById('dp-concepto').value = 'Derecho de Petición – Solicitud de revisión, aclaración y corrección de la clasificación en el Registro Universal de Ingresos (RUI) por incremento injustificado de categoría social';

            const hechos = `HECHOS

1. Que consulté mi clasificación en el Registro Universal de Ingresos (RUI) a través de la plataforma Ventanilla Social del DNP y resulté ubicado(a) en el grupo [A/B/C/D] subgrupo [ejemplo: B4 / C7 / D3].

2. Que esta clasificación representa un aumento de categoría social respecto a mi anterior clasificación en el Sisbén, lo cual genera un incremento en mi carga económica al afectar o restringir el acceso a subsidios, transferencias y programas sociales (Renta Ciudadana, Colombia Mayor, régimen subsidiado de salud, ayudas de la Alcaldía, etc.).

3. Que la información utilizada por el sistema para asignarme dicha categoría no refleja mi situación económica real ni la de mi hogar. [Explicar aquí: desempleo, ingresos bajos, personas a cargo, enfermedades, vivienda en condiciones precarias, etc.].

4. Que el cambio de categoría me causa un perjuicio concreto al aumentar mi vulnerabilidad económica, sin que se me haya dado la oportunidad de aportar o corregir los datos antes de la clasificación definitiva.

FUNDAMENTOS DE DERECHO

• Artículo 23 de la Constitución Política (Derecho de Petición).
• Ley 1755 de 2015 (regulación del derecho de petición).
• Ley 2294 de 2023 y normas que regulan el Registro Universal de Ingresos – RUI.
• Principios de buena fe, debido proceso administrativo, veracidad de la información y focalización correcta de los recursos públicos.

PETICIÓN

1. Se revise y actualice mi clasificación en el Registro Universal de Ingresos (RUI), verificando la exactitud de los datos cruzados y permitiendo la corrección de aquellos que no corresponden a mi realidad económica actual.

2. Se restablezca o mantenga mi acceso a los programas y subsidios sociales que correspondan a mi verdadera condición de vulnerabilidad o pobreza, evitando el incremento injustificado de mi carga económica.

3. Se me informe de manera clara, completa y motivada sobre los criterios, fuentes de información y datos específicos utilizados para asignarme la categoría actual.

4. Se me notifique la respuesta dentro del término legal de quince (15) días hábiles, conforme a la Ley 1755 de 2015.

ANEXOS

• Copia de la cédula de ciudadanía.
• Captura de pantalla o certificado de la consulta del RUI.
• [Otros: recibos de servicios, certificados de ingresos, declaración juramentada, etc.].

Datos del peticionario:
${titular} · C.C. ${documento}
Dirección: ${direccion}, ${ciudad} – Atlántico
Teléfono: ${telefono} · Correo: ${correo}`;

            document.getElementById('dp-descripcion').value = hechos;
            alert('✅ Plantilla RUI cargada. Completa los campos entre [corchetes] y los datos del titular.');
        }


        function setModalModo(editando) {
            const tit = document.getElementById('dp-nuevo-titulo');
            const sub = document.getElementById('dp-nuevo-sub');
            const btn = document.getElementById('dp-nuevo-guardar');
            if (tit) tit.textContent = editando ? 'Editar proceso' : 'Nuevo Proceso';
            if (sub) sub.textContent = editando ? 'Actualiza los datos y guarda' : 'Completa los datos del proceso';
            if (btn) btn.innerHTML = editando
                ? '<i class="fas fa-save"></i> Guardar cambios'
                : '<i class="fas fa-save"></i> Crear proceso y generar PDF';
        }

        function limpiarFormularioProceso() {
            const ids = ['dp-edit-id','dp-titular','dp-documento','dp-telefono','dp-correo','dp-direccion','dp-concepto','dp-descripcion','dp-tipo-otro'];
            ids.forEach(function (id) {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const ciudad = document.getElementById('dp-ciudad');
            if (ciudad && !ciudad.value) ciudad.value = 'Barranquilla';
            const tipo = document.getElementById('dp-tipo-proceso');
            if (tipo) tipo.value = 'derecho_peticion';
            const wrap = document.getElementById('dp-tipo-otro-wrap');
            if (wrap) wrap.classList.add('hidden');
            const files = document.getElementById('dp-archivos');
            if (files) files.value = '';
        }

        function abrirModalNuevoDerecho() {
            const modal = document.getElementById('dp-nuevo-modal');
            if (!modal) return;
            limpiarFormularioProceso();
            setModalModo(false);
            modal.style.display = 'flex';
            setTimeout(function () {
                const el = document.getElementById('dp-titular');
                if (el) el.focus();
            }, 100);
        }

        function abrirModalEditar(id) {
            const dp = derechos.find(function (d) { return d.id === id; });
            if (!dp) return;
            const modal = document.getElementById('dp-nuevo-modal');
            if (!modal) return;
            setModalModo(true);
            document.getElementById('dp-edit-id').value = dp.id;
            const tipos = ['derecho_peticion','tutela','desacato','cumplimiento','popular','grupo','queja','recurso','otro'];
            const tipoSel = document.getElementById('dp-tipo-proceso');
            const wrap = document.getElementById('dp-tipo-otro-wrap');
            if (tipoSel) {
                if (tipos.indexOf(dp.tipoProceso) >= 0 && dp.tipoProceso !== 'otro') {
                    tipoSel.value = dp.tipoProceso;
                    if (wrap) wrap.classList.add('hidden');
                } else {
                    tipoSel.value = 'otro';
                    if (wrap) wrap.classList.remove('hidden');
                    const otro = document.getElementById('dp-tipo-otro');
                    if (otro) otro.value = dp.tipoProceso || '';
                }
            }
            const setv = function (id, v) {
                const el = document.getElementById(id);
                if (el) el.value = v || '';
            };
            setv('dp-titular', dp.titular);
            setv('dp-documento', dp.documento);
            setv('dp-telefono', dp.telefono);
            setv('dp-correo', dp.correo);
            setv('dp-ciudad', dp.ciudad || 'Barranquilla');
            setv('dp-direccion', dp.direccion);
            setv('dp-entidad', dp.entidad);
            setv('dp-concepto', dp.concepto);
            setv('dp-descripcion', dp.descripcion);
            modal.style.display = 'flex';
        }

        function actualizarStats() {
            const a = analisisProcesos();
            const elTotal = document.getElementById('stat-total');
            const elBorrador = document.getElementById('stat-borrador');
            const elRadicado = document.getElementById('stat-radicado');
            const elCumplido = document.getElementById('stat-cumplido');
            const elVen = document.getElementById('stat-vencidos');
            const elProx = document.getElementById('stat-proximos');
            const elAt = document.getElementById('stat-atiempo');

            if (elTotal) elTotal.textContent = a.total;
            if (elBorrador) elBorrador.textContent = a.porEstado.borrador || 0;
            if (elRadicado) elRadicado.textContent = a.porEstado.radicado || 0;
            if (elCumplido) elCumplido.textContent = a.porEstado.cumplido || 0;
            if (elVen) elVen.textContent = a.vencidos;
            if (elProx) elProx.textContent = a.proximos;
            if (elAt) elAt.textContent = a.aTiempo;
        }

        // Sobreescribir render para también actualizar stats
        const originalRender = renderListaDerechos;
        renderListaDerechos = function () {
            originalRender();
            actualizarStats();
        };

        // API PÚBLICA
        return {
            init: function () {
                inyectarUI();
                cargarDatos();
                if (!getSupabaseClient()) {
                    window.addEventListener('supabase-ready', function onReady() {
                        window.removeEventListener('supabase-ready', onReady);
                        console.log('[GestionesJudiciales] Supabase listo → recargando...');
                        cargarDatos();
                    }, { once: true });
                }
            },
            cambiarEstado: cambiarEstado,
            eliminar: eliminarDerecho,
            enviarWhatsApp: enviarWhatsApp,
            agregarDerecho: agregarDerecho,
            generarPDF: generarPDF,
            verSeguimiento: verSeguimiento,
            agregarNotaSeguimiento: agregarNotaSeguimiento,
            abrirNuevo: abrirModalNuevoDerecho,
            editar: abrirModalEditar
        };
    }

    // =====================================================
    //  AUTO-BOOTSTRAP: crea instancia y se enlaza solo
    // =====================================================
    function bootstrapAlcaldia() {
        global.App = global.App || {};
        global.App.instance = global.App.instance || {};

        if (!global.App.instance.alcaldia) {
            const instancia = createAlcaldia();
            global.App.instance.alcaldia = instancia;
            global.App.Alcaldia = { create: createAlcaldia };

            // Inyectar UI lo antes posible
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    instancia.init();
                });
            } else {
                // DOM ya listo
                setTimeout(() => instancia.init(), 50);
            }
        }
    }

    // Ejecutar bootstrap
    bootstrapAlcaldia();

})(typeof window !== 'undefined' ? window : globalThis);
