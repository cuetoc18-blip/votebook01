import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, anonKey } from '../../lib/supabase.js';
import { requireUser } from '../../lib/session.js';

function dbClient(accessToken) {
  const url = supabaseUrl();
  const service = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (service) {
    return createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return createClient(url, anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: 'Bearer ' + accessToken } }
  });
}

export async function GET({ request }) {
  const s = requireUser(request);
  if (!s) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const sb = dbClient(s.access_token);
  try {
    const [c, l, aMay, aMin] = await Promise.all([
      sb.from('coordinadores').select('*'),
      sb.from('lideres').select('*'),
      sb.from('AMIGOS').select('*'),
      sb.from('amigos').select('*')
    ]);
    const coords = c.data || [];
    const lideres = l.data || [];
    const amigos = (aMay.data && aMay.data.length ? aMay.data : (aMin.data || []));
    if (c.error) throw c.error;
    if (l.error) throw l.error;
    return new Response(JSON.stringify({
      ok: true,
      coordinadores: coords,
      lideres: lideres,
      amigos: amigos
    }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || String(e) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
