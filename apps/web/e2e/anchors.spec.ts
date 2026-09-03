import { test, expect } from "@playwright/test";

/**
 * Broken-UI detector: every WebMCP engine anchor must exist in the DOM.
 * If a redesign drops one of these IDs, agent tools lose their
 * accessibility wiring — this spec fails fast.
 */
const SECTIONS: Array<{ nav: RegExp; ids: string[] }> = [
  { nav: /symptom triage/i, ids: ["#triage-form", "#triage-submit-btn", "#triage-result-card"] },
  { nav: /^medications/i, ids: ["#refill-trigger", "#refill-submit-action", "#refill-confirmed-banner"] },
  { nav: /providers/i, ids: ["#clinic-search-btn", "#practitioner-results-grid", "#confirm-booking-btn"] },
  { nav: /care overview/i, ids: ["#upcoming-appointments-card"] }
];

test("all WebMCP engine anchors are attached", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
  ).toBeVisible({ timeout: 20_000 });

  await expect(page.locator("#main-content")).toBeAttached();

  const nav = page.getByRole("navigation", { name: "Care sections" }).first();
  for (const { nav: name, ids } of SECTIONS) {
    await nav.getByRole("button", { name }).click();
    for (const id of ids) {
      await expect(page.locator(id).first(), `anchor ${id} attached`).toBeAttached({ timeout: 10_000 });
    }
  }
});
