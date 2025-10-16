// Client exports
export { supabase } from './client';
export { createServerClient } from './server';

// Hooks exports
export {
  useSupabaseQuery,
  useSupabaseInsert,
  useSupabaseUpdate,
  useSupabaseDelete,
  useAuth,
} from './hooks';
