import { createClient } from '@supabase/supabase-js';

// In Next.js, NEXT_PUBLIC_* variables are available on both client and server
// They are injected at build time for client-side code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  const error = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
    'Please create a .env.local file in apps/frontend with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url';
  console.error(error);
  throw new Error(error);
}

if (!supabaseAnonKey) {
  const error = 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
    'Please create a .env.local file in apps/frontend with:\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key';
  console.error(error);
  throw new Error(error);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

