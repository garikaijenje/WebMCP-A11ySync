import { test, expect } from "@playwright/test";
import { cleanupE2EWrites } from "./helpers/db";

test.describe("medication refill", () => {
  test("submits a refill order end-to-end, then cleans up", async ({ page }) => {
    try {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Care sections" }).first()
        .getByRole("button", { name: /^medications/i }).click();
      await expect(page.getByRole("heading", { name: /^medications$/i })).toBeVisible();

      // Refill-due card from Supabase seed
      await expect(page.getByText("Albuterol Sulfate HFA Inhalation Aerosol")).toBeVisible({
        timeout: 15_000
      });

      // Dosage pill + searchable pharmacy dropdown
      await page.getByText("400 Actuations (2 Inhalers Supply)").click();
      await page.getByRole("combobox", { name: "Fulfillment pharmacy" }).click();
      await page.getByPlaceholder("Search pharmacies…").fill("cvs");
      await page.getByRole("option", { name: /cvs pharmacy/i }).click();

      await page.getByRole("button", { name: /submit refill order/i }).click();

      // Success toast + order appears in history table
      await expect(page.getByText("Refill submitted")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("Refill history")).toBeVisible();
      await expect(page.getByRole("cell", { name: /cvs pharmacy #4102/i })).toBeVisible();
    } finally {
      await cleanupE2EWrites();
    }
  });
});
