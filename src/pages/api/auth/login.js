import { anonClient } from '../../../lib/supabase.js';
import { sessionCookie } from '../../../lib/session.js';

export async function POST({ request }) {
  try {
    let body = {};
    try { body = await request.json(); } catch (e) {}
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Completa correo y contraseña' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const sb = anonClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return new Response(JSON.stringify({
        ok: false,
        error: (error && error.message) || 'Credenciales inválidas'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const payload = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email }
    };
    return new Response(JSON.stringify({ ok: true, user: payload.user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionCookie(payload)
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'Error de servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
