/**
 * Cliente del API Votebook. El navegador NO habla con Supabase.
 */
(function (global) {
  'use strict';

  async function req(url, opts) {
    opts = opts || {};
    var res = await fetch(url, {
      method: opts.method || 'GET',
      credentials: 'include',
      headers: opts.body instanceof FormData ? undefined : { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: opts.body instanceof FormData ? opts.body : (opts.body ? JSON.stringify(opts.body) : undefined)
    });
    var data = null;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) {
      var err = new Error((data && data.error && (data.error.message || data.error)) || res.statusText);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function from(table) {
    var q = { table: table, op: 'select', cols: '*', filters: [] };
    function run() {
      return req('/api/db', { method: 'POST', body: q }).then(function (r) {
        return { data: r.data || [], error: r.error || null };
      }).catch(function (e) {
        return { data: null, error: { message: e.message } };
      });
    }
    var api = {
      select: function (cols) { q.op = 'select'; q.cols = cols || '*'; return api; },
      insert: function (rows) { q.op = 'insert'; q.payload = rows; return api; },
      update: function (row) { q.op = 'update'; q.payload = row; return api; },
      upsert: function (row, opts) { q.op = 'upsert'; q.payload = row; q.upsert = opts || {}; return api; },
      delete: function () { q.op = 'delete'; return api; },
      eq: function (k, v) { q.filters.push({ t: 'eq', k: k, v: v }); return api; },
      in: function (k, v) { q.filters.push({ t: 'in', k: k, v: v }); return api; },
      neq: function (k, v) { q.filters.push({ t: 'neq', k: k, v: v }); return api; },
      order: function (k, o) { q.order = { k: k, ascending: !(o && o.ascending === false) }; return api; },
      limit: function (n) { q.limit = n; return api; },
      then: function (ok, bad) { return run().then(ok, bad); }
    };
    return api;
  }

  var client = {
    from: from,
    auth: {
      getSession: async function () {
        try {
          var me = await req('/api/auth/me');
          if (!me.ok) return { data: { session: null } };
          return { data: { session: { user: me.user } } };
        } catch (e) {
          return { data: { session: null } };
        }
      },
      signInWithPassword: async function (creds) {
        try {
          var r = await req('/api/auth/login', { method: 'POST', body: creds });
          return { data: { user: r.user, session: { user: r.user } }, error: null };
        } catch (e) {
          return { data: { user: null, session: null }, error: { message: e.message } };
        }
      },
      signOut: async function () {
        try { await req('/api/auth/logout', { method: 'POST', body: {} }); } catch (e) {}
        return { error: null };
      },
      getUser: async function () {
        try {
          var me = await req('/api/auth/me');
          return { data: { user: me.user }, error: me.ok ? null : { message: 'no session' } };
        } catch (e) {
          return { data: { user: null }, error: { message: e.message } };
        }
      }
    },
    storage: {
      from: function (bucket) {
        return {
          upload: async function (path, file) {
            var fd = new FormData();
            fd.append('bucket', bucket);
            fd.append('path', path);
            fd.append('file', file);
            try {
              var r = await req('/api/storage', { method: 'POST', body: fd });
              return { data: { path: r.path }, error: null };
            } catch (e) {
              return { data: null, error: { message: e.message } };
            }
          },
          createSignedUrl: async function (path) {
            try {
              var r = await req('/api/storage?bucket=' + encodeURIComponent(bucket) + '&path=' + encodeURIComponent(path));
              return { data: { signedUrl: r.url }, error: null };
            } catch (e) {
              return { data: null, error: { message: e.message } };
            }
          }
        };
      }
    },
    channel: function () {
      return { on: function () { return this; }, subscribe: function () { return this; } };
    },
    removeChannel: function () {}
  };

  global.SupabaseConfig = { url: '/api', key: '', client: client };
  global.AppAPI = { req: req, from: from };
  try { global.dispatchEvent(new Event('supabase-ready')); } catch (e) {}
  console.log('[Votebook] API lista (sin key de Supabase en el navegador)');
})(typeof window !== 'undefined' ? window : globalThis);
