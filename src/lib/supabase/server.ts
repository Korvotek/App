import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Cliente Supabase para uso em Server Components e Server Actions
 * Use este cliente apenas em componentes do servidor
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL e Anon Key devem estar definidos nas variáveis de ambiente');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
