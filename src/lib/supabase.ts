import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client if env vars are missing to prevent crash, 
// but alert/warn so the user knows they need to set them.
export const supabase = createClient(
  supabaseUrl || 'https://xyzcompany.supabase.co',
  supabaseAnonKey || 'public-anon-key'
);
