import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://reexnczsgegrfwsmfaum.supabase.co';
const DEFAULT_ANON = 'sb_publishable_sZT-FuEkBzti2QBXE2Z-Sw_QLOay6l3';

export function supabaseUrl() {
  return process.env.SUPABASE_URL || DEFAULT_URL;
}

export function anonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_ANON
  );
}

export function serviceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    anonKey()
  );
}

export function anonClient() {
  return createClient(supabaseUrl(), anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export function serviceClient() {
  return createClient(supabaseUrl(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
