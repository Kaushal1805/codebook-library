import { createBrowserClient } from "@supabase/ssr";

/**
 * Checks if real Supabase environment variables are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    url &&
    key &&
    url !== "your-supabase-url" &&
    key !== "your-supabase-anon-key" &&
    !url.includes("placeholder")
  );
}

/**
 * Creates a browser-side Supabase client with safe fallback values
 * to prevent runtime crashes if local .env.local is not yet populated.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://placeholder.supabase.co";

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-anon-key";

  return createBrowserClient(url, key);
}
