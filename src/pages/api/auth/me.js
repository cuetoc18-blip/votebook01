import { requireUser } from '../../../lib/session.js';
import { anonClient } from '../../../lib/supabase.js';

export async function GET({ request }) {
  const s = requireUser(request);
  if (!s) return new Response(JSON.stringify({ ok: false }), { status: 401 });
  try {
    const sb = anonClient();
    const { data } = await sb.auth.getUser(s.access_token);
    if (!data || !data.user) return new Response(JSON.stringify({ ok: false }), { status: 401 });
    return new Response(JSON.stringify({
      ok: true,
      user: { id: data.user.id, email: data.user.email }
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }
}
