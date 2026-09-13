/**
 * Módulo de Mensajes - Conexión Híbrida (Electron + Web/Netlify)
 * Maneja la comunicación con el servidor WhatsApp vía Socket.io.
 */
(function () {
    // CONFIGURACIÓN: CAMBIA ESTO POR TU URL DE NGROK
    const CONFIG = {
        SERVER_URL: 'https://phoenix-vest-crystal.ngrok-free.dev', // <--- AQUÍ TU URL
        RECONNECT_INTERVAL: 5000
    };

    let socket = null;
    let isElectron = false;
    let isConnected = false;
    let waCola = [];
    let reconnectTimer = null;

    // Detectar entorno Electron
    try {
        if (typeof require !== 'undefined' && typeof window !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                isElectron = true;
                window.sender = ipcRenderer;
            } catch (e) { isElectron = false; }
        }
    } catch (e) { isElectron = false; }

    // INICIALIZACIÓN PÚBLICA
    window.initModuloMensajes = function () {
        console.info('[Mensajes] Iniciando módulo...');
        cargarCola();
        cargarListaPersonas();
        mostrarCola();
        configurarEventosUI();
        
        if (isElectron) {
            iniciarConexionElectron();
        } else {
            iniciarConexionWeb();
        }
        iniciarBandeja();
    };

    function iniciarConexionElectron() {
        actualizarEstadoUI('espera', '⏳ Esperando señal del Bot...');
        if (window.sender) {
            window.sender.on('status', handleStatusChange);
            window.sender.on('message-response', handleServerResponse);
            window.sender.on('qr-code', (qr) => {
                actualizarEstadoUI('qr', '📷 QR Generado');
                console.log('📷 QR Code:', qr);
            });
            window.sender.on('error', (err) => {
                logError('❌ Error del servidor: ' + err);
                actualizarEstadoUI('error', '❌ ' + err);
            });
        }
    }

    function iniciarConexionWeb() {
        console.log('🌐 Iniciando conexión Web a:', CONFIG.SERVER_URL);
        actualizarEstadoUI('espera', '⏳ Conectando al servidor...');

        if (typeof io === 'undefined') {
            actualizarEstadoUI('error', '❌ Librería Socket.io no encontrada');
            return;
        }

        socket = io(CONFIG.SERVER_URL, {
            extraHeaders: { 'ngrok-skip-browser-warning': 'skip' },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });

        socket.on('connect', () => {
            console.log('✅ Socket conectado:', socket.id);
            isConnected = true;
            socket.emit('get-status');
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket desconectado:', reason);
            isConnected = false;
            actualizarEstadoUI('desconectado', '🔌 Desconectado del servidor');
            iniciarReconexionAutomatizada();
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Error de conexión Socket:', err.message);
            actualizarEstadoUI('error', '❌ Error de conexión: ' + err.message);
        });

        socket.on('status', handleStatusChange);
        socket.on('qr-code', (qr) => {
            actualizarEstadoUI('qr', '📷 Escanea el QR');
            console.log('📷 QR:', qr);
        });
        socket.on('message-response', handleServerResponse);
        socket.on('error', (err) => logError('❌ Error del servidor: ' + err));
    }

    function handleStatusChange(status) {
        if (status === 'connected' || status === 'listo') {
            actualizarEstadoUI('listo', '✅ Bot de WhatsApp Listo');
            isConnected = true;
            procesarColaAutomatica();
        } else if (status === 'disconnected' || status === 'desconectado') {
            actualizarEstadoUI('desconectado', '❌ Bot Desconectado');
            isConnected = false;
        } else if (status === 'loading') {
            actualizarEstadoUI('espera', '⏳ Cargando Bot...');
        }
    }

    function handleServerResponse(response) {
        if (response.success) {
            logSuccess('✅ ' + response.message);
            if (waCola.length > 0) {
                waCola.shift();
                guardarCola();
                mostrarCola();
                if (isConnected) setTimeout(procesarColaAutomatica, 1000);
            }
        } else {
            logError('❌ ' + response.message);
            if (waCola.length > 0) {
                waCola.shift();
                guardarCola();
                mostrarCola();
            }
        }
    }

    function iniciarReconexionAutomatizada() {
        if (reconnectTimer) clearInterval(reconnectTimer);
        reconnectTimer = setInterval(() => {
            if (!isConnected && !isElectron && socket) {
                console.log('🔄 Intentando reconectar...');
                socket.connect();
            }
        }, CONFIG.RECONNECT_INTERVAL);
    }

    function enviarMensajeUI() {
        const toInput = document.getElementById('wa-to');
        const msgInput = document.getElementById('wa-msg');
        if (!toInput || !msgInput) { logError('⚠️ Campos no encontrados'); return; }

        const to = toInput.value.trim();
        const msg = msgInput.value.trim();
        if (!to || !msg) { logError('⚠️ Falta número o mensaje'); return; }

        if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
            window.WhatsAppCola.encolar({ destino: to, mensaje: msg }).then(function (r) {
                if (r && r.ok) logInfo('📥 Guardado en whatsapp_messages');
                else logWarn('Cola Supabase: ' + ((r && r.error) || 'falló'));
            });
        }
        if (isConnected) {
            logInfo('📤 Enviando a ' + to + '...');
            enviarAlServidorSeguro(to, msg);
        } else {
            logWarn('📥 Agregado a la cola local');
            agregarACola(to, msg);
        }
    }

    function enviarAlServidorSeguro(numero, mensaje) {
        if (isElectron && window.sender) {
            window.sender.send('send-message', { to: numero, message: mensaje });
        } else if (socket && socket.connected) {
            socket.emit('send-message', { to: numero, message: mensaje });
        } else {
            logError('❌ Socket no conectado');
        }
    }

    function procesarColaAutomatica() {
        if (waCola.length > 0 && isConnected) {
            const nextMsg = waCola[0];
            logInfo(`🚀 Procesando cola: Enviando a ${nextMsg.to}`);
            enviarAlServidorSeguro(nextMsg.to, nextMsg.message);
        }
    }

    function cargarCola() {
        const saved = localStorage.getItem('wa_cola');
        waCola = saved ? JSON.parse(saved) : [];
    }

    function guardarCola() {
        localStorage.setItem('wa_cola', JSON.stringify(waCola));
    }

    function agregarACola(to, msg) {
        waCola.push({
            id: Date.now(), to: to, message: msg,
            timestamp: new Date().toLocaleString()
        });
        guardarCola();
        mostrarCola();
    }

    function mostrarCola() {
        const container = document.getElementById('wa-cola');
        if (!container) return;

        if (waCola.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-xs italic">Sin mensajes en cola.</p>';
            return;
        }

        let html = '';
        waCola.forEach((item, index) => {
            html += `
                <div class="border-b border-slate-100 pb-2 mb-2 last:border-0">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-slate-700 text-sm">${item.to}</span>
                        <span class="text-xs text-slate-400">${item.timestamp}</span>
                    </div>
                    <div class="text-sm text-slate-600 truncate">${item.message}</div>
                    <button onclick="window.removerDeCola(${index})" class="text-xs text-rose-500 hover:text-rose-700 mt-1">Quitar</button>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    window.removerDeCola = function(index) {
        waCola.splice(index, 1);
        guardarCola();
        mostrarCola();
    };

    function reintentarCola() {
        if (waCola.length === 0) { logWarn('⚠️ La cola está vacía'); return; }
        if (isConnected) procesarColaAutomatica();
        else logWarn('⚠️ El bot no está conectado');
    }

    function configurarEventosUI() {
        const map = {
            'btn-wa-enviar': enviarMensajeUI,
            'btn-wa-reconectar': reconectarBot,
            'btn-wa-limpiar-log': limpiarLog,
            'btn-wa-reintentar-cola': reintentarCola,
            'btn-wa-plantilla-amigo': () => insertarPlantilla('amigo'),
            'btn-wa-plantilla-cita': () => insertarPlantilla('cita')
        };

        for (const [id, handler] of Object.entries(map)) {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', handler);
        }
    }

    function insertarPlantilla(tipo) {
        const textarea = document.getElementById('wa-msg');
        if (!textarea) return;
        if (tipo === 'amigo') textarea.value = 'Hola! 👋 Gracias por unirte a la estructura.';
        else if (tipo === 'cita') textarea.value = '📅 Recordatorio: Nos vemos el próximo domingo a las 10:00 AM.';
    }

    function reconectarBot() {
        if (isElectron) window.location.reload();
        else if (socket) { socket.disconnect(); socket.connect(); logInfo('🔄 Forzando reconexión...'); }
    }

    function actualizarEstadoUI(estado, texto) {
        const statusDiv = document.getElementById('wa-status');
        const statusDot = document.getElementById('wa-status-dot');
        const statusText = document.getElementById('wa-status-text');
        if (!statusDiv || !statusDot || !statusText) return;

        statusDiv.className = 'mb-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-3 transition-all duration-300';
        statusDot.className = 'inline-block w-2.5 h-2.5 rounded-full animate-pulse';

        if (estado === 'listo' || estado === 'connected') {
            statusDiv.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-900');
            statusDot.classList.add('bg-emerald-500');
        } else if (estado === 'qr') {
            statusDiv.classList.add('bg-amber-50', 'border-amber-200', 'text-amber-900');
            statusDot.classList.add('bg-amber-500');
        } else if (estado === 'espera' || estado === 'loading') {
            statusDiv.classList.add('bg-slate-50', 'border-slate-200', 'text-slate-900');
            statusDot.classList.add('bg-slate-500');
        } else if (estado === 'error') {
            statusDiv.classList.add('bg-rose-50', 'border-rose-200', 'text-rose-900');
            statusDot.classList.add('bg-rose-500');
        } else {
            statusDiv.classList.add('bg-blue-50', 'border-blue-200', 'text-blue-900');
            statusDot.classList.add('bg-blue-500');
        }
        statusText.innerText = texto;
    }

    function logInfo(msg) { agregarLog(msg, 'text-slate-600'); }
    function logSuccess(msg) { agregarLog(msg, 'text-emerald-600 font-medium'); }
    function logError(msg) { agregarLog(msg, 'text-rose-600 font-medium'); }
    function logWarn(msg) { agregarLog(msg, 'text-amber-600 font-medium'); }

    function agregarLog(msg, colorClass) {
        const logs = document.getElementById('wa-logs');
        if (!logs) return;
        const p = document.createElement('div');
        p.className = `py-1 border-b border-slate-50 last:border-0 ${colorClass || 'text-slate-600'} text-xs`;
        p.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logs.prepend(p);
    }

    function limpiarLog() {
        const logs = document.getElementById('wa-logs');
        if (logs) logs.innerHTML = '';
    }

    function cargarListaPersonas() {
        const datalist = document.getElementById('wa-personas-list');
        if (datalist) {
            const opciones = [
                { label: 'Líder Juan', value: '573001111111' },
                { label: 'Amiga María', value: '573002222222' },
                { label: 'Prueba Local', value: '573009999999' }
            ];
            datalist.innerHTML = opciones.map(op => `<option value="${op.value}">${op.label}</option>`).join('');
        }
    }


    function normalizarTel(tel) {
        let d = String(tel || '').replace(/\D/g, '');
        if (!d) return '';
        if (d.startsWith('57') && d.length >= 12) return d;
        if (d.startsWith('0')) d = d.slice(1);
        if (d.length === 10) return '57' + d;
        if (!d.startsWith('57')) return '57' + d;
        return d;
    }

    /**
     * API pública para otros módulos (Estructura, Alcaldía, etc.)
     * opts: { to|numero|telefono, message|mensaje|texto }
     */
    function enviarDesdeOtrosModulos(opts) {
        opts = opts || {};
        const rawTo = opts.to || opts.numero || opts.telefono || '';
        const message = opts.message || opts.mensaje || opts.texto || '';
        const to = normalizarTel(rawTo);

        if (!to || to.length < 12) {
            console.warn('[Mensajes] Teléfono inválido:', rawTo);
            return false;
        }
        if (!message || !String(message).trim()) {
            console.warn('[Mensajes] Mensaje vacío');
            return false;
        }

        // Asegurar UI inicializada
        try {
            if (typeof window.initModuloMensajes === 'function') {
                // no re-bind infinito: solo si no hay socket y no electron
                if (!socket && !isElectron) {
                    // soft init sin duplicar listeners excesivos
                }
            }
        } catch (e) {}

        if (isConnected) {
            logInfo('📤 (módulo externo) Enviando a ' + to + '...');
            enviarAlServidorSeguro(to, String(message));
            return true;
        }

        logWarn('📥 Bot no listo — mensaje a cola: ' + to);
        agregarACola(to, String(message));
        return true; // encolado cuenta como aceptado
    }

    var bandejaItems = [];
    var bandejaChatTel = '';
    var bandejaCanal = null;

    function sbClient() {
        return (window.SupabaseConfig && window.SupabaseConfig.client) || null;
    }

    function iniciarBandeja() {
        asegurarUiBandeja();
        cargarBandeja();
        escucharBandeja();
        var btn = document.getElementById('btn-wa-reply');
        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.onclick = responderBandeja;
        }
        var ref = document.getElementById('btn-wa-inbox-refresh');
        if (ref && !ref.dataset.bound) {
            ref.dataset.bound = '1';
            ref.onclick = cargarBandeja;
        }
    }

    function asegurarUiBandeja() {
        if (document.getElementById('wa-inbox')) return;
        var sec = document.getElementById('modulo-mensajes');
        if (!sec) return;
        var wrap = document.createElement('div');
        wrap.className = 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-6';
        wrap.innerHTML =
            '<div class="bg-white p-5 rounded-2xl border border-slate-200">' +
              '<div class="flex justify-between items-center mb-3">' +
                '<h2 class="text-lg font-semibold text-slate-700">Bandeja de entrada</h2>' +
                '<button type="button" id="btn-wa-inbox-refresh" class="text-xs px-3 py-1 rounded-md bg-slate-100">Actualizar</button>' +
              '</div>' +
              '<div id="wa-inbox" class="space-y-2 max-h-80 overflow-y-auto"></div>' +
            '</div>' +
            '<div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col">' +
              '<h2 class="text-lg font-semibold text-slate-700 mb-3">Conversación</h2>' +
              '<div id="wa-chat" class="flex-1 min-h-[180px] max-h-64 overflow-y-auto bg-slate-50 rounded-xl p-3 text-sm mb-3"></div>' +
              '<textarea id="wa-reply" rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mb-2" placeholder="Escribe la respuesta..."></textarea>' +
              '<button type="button" id="btn-wa-reply" class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">Responder por WhatsApp</button>' +
            '</div>';
        var header = sec.querySelector('header');
        if (header && header.parentNode) header.parentNode.insertBefore(wrap, header.nextSibling);
        else sec.insertBefore(wrap, sec.firstChild);
    }

    async function cargarBandeja() {
        var c = sbClient();
        bandejaItems = [];
        if (c) {
            try {
                var a = await c.from('asistencia').select('*').order('created_at', { ascending: false });
                if (!a.error) {
                    (a.data || []).forEach(function (r) {
                        bandejaItems.push({
                            id: r.id,
                            origen: 'asistencia',
                            telefono: r.telefono || r.destino || '',
                            mensaje: r.mensaje || r.descripcion || r.nota || '',
                            estado: r.estado || 'recibido',
                            fecha: r.created_at || r.fecha,
                            dir: 'in'
                        });
                    });
                }
            } catch (e) { console.warn('[Mensajes] asistencia', e); }
            try {
                var w = await c.from('whatsapp_messages').select('*').order('created_at', { ascending: false }).limit(80);
                if (!w.error) {
                    (w.data || []).forEach(function (r) {
                        bandejaItems.push({
                            id: r.id,
                            origen: 'whatsapp',
                            telefono: r.destino || '',
                            mensaje: r.mensaje || '',
                            estado: r.estado || '',
                            fecha: r.created_at || r.hora_envio,
                            dir: 'out'
                        });
                    });
                }
            } catch (e2) {}
        }
        renderBandeja();
    }

    function escucharBandeja() {
        var c = sbClient();
        if (!c || !c.channel) return;
        try { if (bandejaCanal) c.removeChannel(bandejaCanal); } catch (e) {}
        bandejaCanal = c.channel('mensajes-bandeja')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencia' }, cargarBandeja)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, cargarBandeja)
            .subscribe();
    }

    function normTelLocal(t) {
        return normalizarTel(t);
    }

    function gruposBandeja() {
        var map = {};
        bandejaItems.forEach(function (it) {
            var tel = normTelLocal(it.telefono) || it.telefono || 'sin-tel';
            if (!map[tel]) map[tel] = { tel: tel, items: [], ultimo: '', estado: '' };
            map[tel].items.push(it);
            if (!map[tel].ultimo || String(it.fecha || '') > String(map[tel].ultimo)) {
                map[tel].ultimo = it.fecha || '';
                if (it.dir === 'in') map[tel].preview = it.mensaje;
                map[tel].estado = it.estado || map[tel].estado;
            }
            if (it.dir === 'in' && !map[tel].preview) map[tel].preview = it.mensaje;
        });
        return Object.keys(map).map(function (k) { return map[k]; })
            .sort(function (a, b) { return String(b.ultimo).localeCompare(String(a.ultimo)); });
    }

    async function marcarRecibida(id, on) {
        var estado = on ? 'recibido' : 'pendiente';
        var c = sbClient();
        if (c) {
            try {
                await c.from('asistencia').update({ estado: estado }).eq('id', id);
            } catch (e) { console.warn('[Mensajes] recibido', e); }
        }
        var it = bandejaItems.find(function (x) { return String(x.id) === String(id); });
        if (it) it.estado = estado;
        renderBandeja();
    }

    function renderBandeja() {
        var box = document.getElementById('wa-inbox');
        if (!box) return;
        var incoming = bandejaItems.filter(function (it) { return it.origen === 'asistencia'; });
        if (!incoming.length) {
            box.innerHTML = '<p class="text-sm text-slate-400 text-center py-8">No hay mensajes recibidos.</p>';
            renderChat();
            return;
        }
        box.innerHTML = incoming.map(function (it) {
            var tel = normTelLocal(it.telefono) || it.telefono || '';
            var on = normTelLocal(bandejaChatTel) === tel;
            var rec = it.estado === 'recibido' || it.estado === 'recibida';
            var fecha = '';
            try { fecha = it.fecha ? new Date(it.fecha).toLocaleString('es-CO') : ''; } catch (e) {}
            return '<article class="rounded-xl border p-3 ' + (on ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white') + '">' +
                '<div class="flex items-center justify-between gap-2">' +
                  '<label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">' +
                    '<input type="checkbox" class="wa-chk-rec rounded border-slate-300 text-emerald-600" data-id="' + it.id + '" ' + (rec ? 'checked' : '') + '>' +
                    'Recibida</label>' +
                  '<button type="button" data-chat="' + tel + '" class="text-xs text-indigo-600">Ver</button>' +
                '</div>' +
                '<p class="text-sm font-semibold text-slate-800 mt-1">' + (tel || 'Sin teléfono') + '</p>' +
                '<p class="text-xs text-slate-600 mt-1 whitespace-pre-wrap">' + (it.mensaje || 'Sin mensaje') + '</p>' +
                '<p class="text-[11px] text-slate-400 mt-1">' + fecha + '</p>' +
              '</article>';
        }).join('');
        box.querySelectorAll('.wa-chk-rec').forEach(function (chk) {
            chk.onchange = function () { marcarRecibida(chk.getAttribute('data-id'), chk.checked); };
        });
        box.querySelectorAll('[data-chat]').forEach(function (b) {
            b.onclick = function () {
                bandejaChatTel = b.getAttribute('data-chat');
                var to = document.getElementById('wa-to');
                if (to) to.value = bandejaChatTel;
                renderBandeja();
            };
        });
        if (!bandejaChatTel && incoming[0]) bandejaChatTel = normTelLocal(incoming[0].telefono);
        renderChat();
    }

    function renderChat() {
        var chat = document.getElementById('wa-chat');
        if (!chat) return;
        if (!bandejaChatTel) {
            chat.innerHTML = '<p class="text-slate-400 text-xs">Elige un número de la bandeja.</p>';
            return;
        }
        var msgs = bandejaItems.filter(function (it) {
            return normTelLocal(it.telefono) === normTelLocal(bandejaChatTel);
        }).sort(function (a, b) {
            return new Date(a.fecha || 0) - new Date(b.fecha || 0);
        });
        if (!msgs.length) {
            chat.innerHTML = '<p class="text-slate-400 text-xs">Sin historial.</p>';
            return;
        }
        chat.innerHTML = msgs.map(function (m) {
            var mine = m.dir === 'out';
            var fecha = '';
            try { fecha = m.fecha ? new Date(m.fecha).toLocaleString('es-CO') : ''; } catch (e) {}
            return '<div class="mb-2 flex ' + (mine ? 'justify-end' : 'justify-start') + '">' +
                '<div class="max-w-[85%] rounded-xl px-3 py-2 text-sm ' +
                (mine ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800') + '">' +
                '<p class="whitespace-pre-wrap">' + (m.mensaje || '') + '</p>' +
                '<p class="text-[10px] mt-1 opacity-70">' + fecha + (m.estado ? ' · ' + m.estado : '') + '</p></div></div>';
        }).join('');
        chat.scrollTop = chat.scrollHeight;
    }

    async function responderBandeja() {
        var tel = normTelLocal(bandejaChatTel || ((document.getElementById('wa-to') || {}).value));
        var msg = ((document.getElementById('wa-reply') || {}).value || '').trim();
        if (!tel || tel.length < 12) { alert('Elige un chat con teléfono válido'); return; }
        if (!msg) { alert('Escribe la respuesta'); return; }
        if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
            await window.WhatsAppCola.encolar({ destino: tel, mensaje: msg, files: [] });
        } else {
            enviarDesdeOtrosModulos({ to: tel, message: msg });
        }
        var c = sbClient();
        if (c) {
            try {
                await c.from('asistencia').update({ estado: 'respondida' }).eq('telefono', tel);
                await c.from('asistencia').update({ estado: 'respondida' }).eq('telefono', tel.replace(/^57/, ''));
            } catch (e) {}
        }
        document.getElementById('wa-reply').value = '';
        logSuccess('Respuesta encolada a ' + tel);
        cargarBandeja();
    }

    // Exponer en window.App
    window.App = window.App || {};
    window.App.instance = window.App.instance || {};
    window.App.instance.mensajes = {
        enviar: enviarDesdeOtrosModulos,
        init: window.initModuloMensajes,
        estaConectado: function () { return !!isConnected; },
        agregarACola: function (to, msg) { agregarACola(normalizarTel(to), msg); }
    };
    // Compatibilidad directa
    window.enviarMensajeWhatsApp = enviarDesdeOtrosModulos;

    console.info('[Mensajes] API pública lista: App.instance.mensajes.enviar()');

})();