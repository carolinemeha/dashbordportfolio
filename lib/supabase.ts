import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis.'
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

/**
 * Client Supabase : création différée pour que le build Next/Vercel réussisse
 * même si les variables NEXT_PUBLIC_* ne sont présentes qu’au runtime.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const real = getSupabaseClient();
    const value = Reflect.get(real as object, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(real);
    }
    return value;
  },
});
