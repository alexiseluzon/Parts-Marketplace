import { createClient } from "@supabase/supabase-js";

// Publishable key is safe to expose client-side; access is governed by
// RLS policies on the database, not by keeping this key secret.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
