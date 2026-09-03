import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabaseConfig.generated";

// Connection identity is sourced from the Supabase CLI via
// `bun run supabase:sync` (generated module above), which reads the linked
// project's publishable key with `supabase projects api-keys`.
// No .env files are read here.
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  SUPABASE_URL.startsWith("http") &&
  SUPABASE_PUBLISHABLE_KEY.length > 10
);

// Browser client for Client Components (public portal, anon key, RLS-enforced).
// Generated Database type keeps every query type-safe; regenerate via:
//   bunx supabase gen types typescript --linked --schema public > apps/web/lib/database.types.ts
function createBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  } catch (err) {
    // Non-browser runtimes without WebSocket (e.g. Node-based unit tests)
    // cannot instantiate realtime; repository falls back to offline cache.
    console.warn("[supabase] client init failed, using offline cache:", err instanceof Error ? err.message : err);
    return null;
  }
}

export const supabase: SupabaseClient<Database> | null = createBrowserClient();
