import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client initialized with the Supabase Service Role key.
 * This bypasses Row Level Security (RLS) and must NEVER be exposed or used client-side.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY or SUPABASE_URL on server."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
