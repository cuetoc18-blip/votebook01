import { serviceClient } from '../../lib/supabase.js';
import { requireUser } from '../../lib/session.js';

const BUCKETS = new Set(['judicial', 'whatsapp']);

export async function POST({ request }) {
  const s = requireUser(request);
  if (!s) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

  const form = await request.formData();
  const bucket = String(form.get('bucket') || 'judicial');
  const path = String(form.get('path') || '');
  const file = form.get('file');
  if (!BUCKETS.has(bucket) || !path || !file) {
    return new Response(JSON.stringify({ error: 'bucket, path y file requeridos' }), { status: 400 });
  }
  const sb = serviceClient();
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await sb.storage.from(bucket).upload(path, buf, {
    contentType: file.type || 'application/octet-stream',
    upsert: true
  });
  if (up.error) return new Response(JSON.stringify({ error: up.error.message }), { status: 400 });
  return new Response(JSON.stringify({ ok: true, path: up.data.path }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function GET({ request }) {
  const s = requireUser(request);
  if (!s) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  const url = new URL(request.url);
  const bucket = url.searchParams.get('bucket') || 'judicial';
  const path = url.searchParams.get('path') || '';
  if (!BUCKETS.has(bucket) || !path) {
    return new Response(JSON.stringify({ error: 'bucket y path requeridos' }), { status: 400 });
  }
  const sb = serviceClient();
  const signed = await sb.storage.from(bucket).createSignedUrl(path, 120);
  if (signed.error) return new Response(JSON.stringify({ error: signed.error.message }), { status: 400 });
  return new Response(JSON.stringify({ ok: true, url: signed.data.signedUrl }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
