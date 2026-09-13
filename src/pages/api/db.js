import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, anonKey } from '../../lib/supabase.js';
import { requireUser } from '../../lib/session.js';
import { allowedTable } from '../../lib/tables.js';

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

export async function POST({ request }) {
  const s = requireUser(request);
  if (!s) {
    return new Response(JSON.stringify({ data: null, error: { message: 'No autorizado' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let q = {};
  try { q = await request.json(); } catch (e) {
    return new Response(JSON.stringify({ data: null, error: { message: 'JSON inválido' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!allowedTable(q.table)) {
    return new Response(JSON.stringify({ data: null, error: { message: 'Tabla no permitida: ' + q.table } }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const sb = dbClient(s.access_token);
  const op = q.op || 'select';

  try {
    if (op === 'select') {
      let query = sb.from(q.table).select(q.cols || '*');
      (q.filters || []).forEach((f) => {
        if (f.t === 'eq') query = query.eq(f.k, f.v);
        if (f.t === 'in') query = query.in(f.k, f.v);
        if (f.t === 'neq') query = query.neq(f.k, f.v);
      });
      if (q.order && q.order.k) query = query.order(q.order.k, { ascending: q.order.ascending !== false });
      if (q.limit) query = query.limit(q.limit);
      const { data, error } = await query;
      if (error) throw error;
      return json({ data: data || [], error: null });
    }

    if (op === 'insert') {
      const { data, error } = await sb.from(q.table).insert(q.payload).select();
      if (error) throw error;
      return json({ data, error: null });
    }

    if (op === 'update') {
      let u = sb.from(q.table).update(q.payload);
      (q.filters || []).forEach((f) => {
        if (f.t === 'eq') u = u.eq(f.k, f.v);
        if (f.t === 'in') u = u.in(f.k, f.v);
      });
      const { data, error } = await u.select();
      if (error) throw error;
      return json({ data, error: null });
    }

    if (op === 'upsert') {
      const { data, error } = await sb.from(q.table).upsert(q.payload, q.upsert || {}).select();
      if (error) throw error;
      return json({ data, error: null });
    }

    if (op === 'delete') {
      let d = sb.from(q.table).delete();
      (q.filters || []).forEach((f) => {
        if (f.t === 'eq') d = d.eq(f.k, f.v);
        if (f.t === 'in') d = d.in(f.k, f.v);
      });
      const { data, error } = await d.select();
      if (error) throw error;
      return json({ data, error: null });
    }

    return json({ data: null, error: { message: 'Operación no permitida' } }, 400);
  } catch (err) {
    return json({ data: null, error: { message: err.message || String(err) } }, 400);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
