import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getClient() {
  if (_client) return _client;

  const url = import.meta.env?.VITE_SUPABASE_URL ?? '';
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '';

  if (!url || !key) {
    return null;
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

export const isReady = () => Boolean(getClient());
