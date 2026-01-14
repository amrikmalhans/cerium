import { createClient, SupabaseClient } from '@supabase/supabase-js';

// In Next.js, NEXT_PUBLIC_* variables are available on both client and server
// They are injected at build time for client-side code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// During build time, env vars might not be available, so we create a client with placeholder values
// At runtime, if the values are still missing, operations will fail gracefully
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

export { supabase };

