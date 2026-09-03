import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../../lib/supabaseConfig.generated";

/**
 * E2E database helper. Uses the same CLI-synced config as the app
 * (no .env).
 *
 * Write specs must leave the database pristine. These tables hold no seed
 * rows (pristine counts are 0), so cleanup sweeps them entirely and restores
 * the seed prescription mutated by the refill flow. Specs clean up in
 * `finally`; global-teardown sweeps again in case a worker dies mid-write.
 */
export const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function cleanupE2EWrites() {
  const triage = await db.from("triage_assessments").delete().neq("id", "__none__");
  if (triage.error) throw new Error(`triage cleanup failed: ${triage.error.message}`);
  const orders = await db.from("refill_orders").delete().neq("id", "__none__");
  if (orders.error) throw new Error(`orders cleanup failed: ${orders.error.message}`);
  // Restore the seed prescription mutated by the refill flow
  const rx = await db
    .from("prescriptions")
    .update({ refills_remaining: 1, status: "refill_due" })
    .eq("id", "rx-albuterol");
  if (rx.error) throw new Error(`rx restore failed: ${rx.error.message}`);
}

export async function seedCounts() {
  const [appts, rxs, orders, triage] = await Promise.all([
    db.from("appointments").select("id", { count: "exact", head: true }),
    db.from("prescriptions").select("id", { count: "exact", head: true }),
    db.from("refill_orders").select("id", { count: "exact", head: true }),
    db.from("triage_assessments").select("id", { count: "exact", head: true })
  ]);
  return {
    appointments: appts.count ?? -1,
    prescriptions: rxs.count ?? -1,
    refillOrders: orders.count ?? -1,
    triage: triage.count ?? -1
  };
}
