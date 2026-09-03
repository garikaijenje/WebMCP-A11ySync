import { test, expect } from "@playwright/test";

test.describe("provider directory", () => {
  test("filters by specialty combobox and accommodation multi-select", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Care sections" }).first()
      .getByRole("button", { name: /providers/i }).click();
    await expect(page.getByRole("heading", { name: /accessible providers/i })).toBeVisible();

    // All three seed clinics visible initially
    await expect(page.getByText("Dr. Marcus Vance, MD")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Dr. Aris Thorne, MD")).toBeVisible();

    // Searchable specialty dropdown -> Pulmonology
    await page.getByRole("combobox", { name: "Specialty" }).click();
    await page.getByPlaceholder("Search specialties…").fill("Pulmo");
    await page.getByRole("option", { name: /pulmonology/i }).click();
    await page.getByRole("button", { name: /filter directory/i }).click();
    await expect(page.getByText("Dr. Aris Thorne, MD")).toBeVisible();
    await expect(page.getByText("Dr. Marcus Vance, MD")).not.toBeVisible();

    // Accommodation multi-select narrows further (seed pulmonology clinic has Sensory Quiet Room)
    await page.getByRole("combobox", { name: /required accommodations/i }).click();
    await page.getByPlaceholder("Search accommodations…").fill("Quiet");
    await page.getByRole("option", { name: /sensory quiet room/i }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /filter directory/i }).click();
    await expect(page.getByText("Dr. Aris Thorne, MD")).toBeVisible();
  });

  test("opens a booking dialog with summary and cancels (no write)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Care sections" }).first()
      .getByRole("button", { name: /providers/i }).click();
    await expect(page.getByText("Dr. Marcus Vance, MD")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /friday, sep 18 at 10:30 am/i }).click();
    // Radix names the dialog after its title (aria-labelledby wins over aria-label)
    await expect(page.getByRole("dialog", { name: /confirm consultation/i })).toBeVisible();
    await expect(page.getByText("Accommodations sent")).toBeVisible();
    await page.getByRole("button", { name: /^cancel$/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
