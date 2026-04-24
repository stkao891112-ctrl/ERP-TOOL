
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ebytyftmegyqlvywtfmd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EJjleGIZ-nkJOMGjrMQHlQ_flZHnuO3';

// Using a custom storage key and ensuring the client is a singleton
// that survives HMR re-evaluations.
const getSupabase = () => {
  if (typeof window !== 'undefined' && (window as any).supabaseClient) {
    return (window as any).supabaseClient;
  }

  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'erp-inventory-auth-token',
    },
  });

  if (typeof window !== 'undefined') {
    (window as any).supabaseClient = client;
  }

  return client;
};

export const sb = getSupabase();
