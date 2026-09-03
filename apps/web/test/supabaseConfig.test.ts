import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { isSupabaseConfigured } from "../lib/supabase";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../lib/supabaseConfig.generated";

// Verifies Supabase identity flows from the Supabase CLI codegen
// (`bun run supabase:sync`), never from .env files.
describe("Supabase CLI-sourced config", () => {
  it("resolves a configured client from the generated CLI module", () => {
    expect(SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(SUPABASE_PUBLISHABLE_KEY).toMatch(/^sb_publishable_[A-Za-z0-9_-]{20,}$/);
    expect(isSupabaseConfigured).toBe(true);
  });

  it("does not read process.env for Supabase credentials", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(resolve(here, "../lib/supabase.ts"), "utf-8");
    expect(src).not.toContain("process.env");
  });
});
