import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite for the CareNavigator portal.
 * - Uses the shared Supabase project (seed: Sarah Jenkins #MH-88291).
 * - Write flows (triage, refill) clean up after themselves via e2e/helpers/db.
 * - Run: `bun run test:e2e` (starts `bun run dev` automatically).
 */
export default defineConfig({
  testDir: "./e2e",
  // Serial: specs share one seeded database and assert seed state
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4117",
    trace: "on-first-retry"
  },
  globalTeardown: "./e2e/global-teardown.ts",
  webServer: {
    command: "bun run dev --port 4117",
    url: "http://localhost:4117",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Silence Next telemetry in e2e runs
      NEXT_TELEMETRY_DISABLED: "1"
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
