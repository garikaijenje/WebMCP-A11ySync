import { cleanupE2EWrites, seedCounts } from "./helpers/db";

/** Final sweep: guarantee a pristine database even if a worker died mid-write. */
export default async function globalTeardown() {
  await cleanupE2EWrites();
  const counts = await seedCounts();
  console.log(`[e2e teardown] pristine counts: ${JSON.stringify(counts)}`);
  if (counts.refillOrders !== 0 || counts.triage !== 0) {
    throw new Error(`database not pristine after e2e: ${JSON.stringify(counts)}`);
  }
}
