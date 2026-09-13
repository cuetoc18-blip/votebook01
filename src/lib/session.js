const COOKIE = 'vb_session';

export function readSession(request) {
  const raw = request.headers.get('cookie') || '';
  const part = raw.split(';').map((s) => s.trim()).find((s) => s.startsWith(COOKIE + '='));
  if (!part) return null;
  try {
    return JSON.parse(decodeURIComponent(part.slice(COOKIE.length + 1)));
  } catch (e) {
    return null;
  }
}

export function sessionCookie(payload, maxAge = 60 * 60 * 24 * 7) {
  const val = encodeURIComponent(JSON.stringify(payload));
  return `${COOKIE}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function requireUser(request) {
  const s = readSession(request);
  if (!s || !s.access_token || !s.user) return null;
  return s;
}
