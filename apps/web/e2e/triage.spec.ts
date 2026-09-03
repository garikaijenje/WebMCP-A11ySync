import { test, expect } from "@playwright/test";
import { cleanupE2EWrites } from "./helpers/db";

test.describe("symptom triage", () => {
  test("submits an assessment and shows the recommendation, then cleans up", async ({ page }) => {
    try {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Care sections" }).first()
        .getByRole("button", { name: /symptom triage/i }).click();
      await expect(page.getByRole("heading", { name: /symptom triage/i })).toBeVisible();

      await page.getByLabel("What are you experiencing?").fill(
        "E2E verification probe: dull ache behind the left knee after walking"
      );

      // Searchable body-area dropdown
      await page.getByRole("combobox", { name: "Affected body area" }).click();
      await page.getByPlaceholder("Search body areas…").fill("knee");
      await page.getByRole("option", { name: /left knee/i }).click();

      // Urgency select (radix)
      await page.getByRole("combobox", { name: "Perceived urgency" }).click();
      await page.getByRole("option", { name: /routine/i }).click();

      await page.getByRole("button", { name: "Submit symptom assessment", exact: true }).click();

      // Recommendation card appears with matched specialty (exact: toast echoes the same text)
      await expect(
        page.getByText("Orthopedic Physical Therapy & Sports Medicine", { exact: true })
      ).toBeVisible({ timeout: 15_000 });
      await expect(page.locator("#triage-result-card").getByText("ROUTINE")).toBeVisible();
    } finally {
      await cleanupE2EWrites();
    }
  });
});
