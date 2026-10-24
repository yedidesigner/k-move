import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: import.meta.env["VITE_SUPABASE_URL"] as string | undefined,
  publishableKey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined,
};

export const REQUIRED_KEYS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

export function missingConfigKeys() {
  return REQUIRED_KEYS.filter((key) =>
    key === "VITE_SUPABASE_URL" ? !supabaseConfig.url : !supabaseConfig.publishableKey,
  );
}

export const isSupabaseConfigured = () => missingConfigKeys().length === 0;

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (typeof window === "undefined") throw new Error("Supabase is browser-only");
  if (!isSupabaseConfigured()) throw new Error("supabase/not-configured");
  if (!client) {
    client = createClient(supabaseConfig.url!, supabaseConfig.publishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
