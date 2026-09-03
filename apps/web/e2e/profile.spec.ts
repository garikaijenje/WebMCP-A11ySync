import { test, expect } from "@playwright/test";
import { getPatientAccommodations, restorePatientAccommodations } from "./helpers/db";

test.describe("accessibility profile", () => {
  test("saves coded accommodations to the chart, then restores", async ({ page }) => {
    try {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Care sections" }).first()
        .getByRole("button", { name: /accessibility/i }).click();
      await expect(page.getByRole("heading", { name: /accessibility profile/i })).toBeVisible();

      // Seed chart values are pre-checked
      await expect(page.getByLabel(/wheelchair step-free ramp/i)).toBeChecked({ timeout: 15_000 });

      // Change sensory: uncheck seed, check dimmed lighting, add Other line
      await page.getByLabel(/quiet waiting room/i).uncheck();
      await page.getByLabel(/dimmed \/ adjustable lighting/i).check();
      await page.getByLabel(/other sensory environment needs/i).fill("E2E probe scent-free");

      await page.getByRole("button", { name: /save changes to chart/i }).click();
      await expect(page.getByText("Chart updated")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole("button", { name: /chart is up to date/i })).toBeDisabled();

      // Persisted to Postgres, not just local state
      const stored = await getPatientAccommodations();
      expect(stored.accessibility_sensory).toContain("Dimmed / adjustable lighting");
      expect(stored.accessibility_sensory).toContain("E2E probe scent-free");
      expect(stored.accessibility_sensory).not.toContain("Quiet Waiting Room");
    } finally {
      await restorePatientAccommodations();
    }
  });
});
