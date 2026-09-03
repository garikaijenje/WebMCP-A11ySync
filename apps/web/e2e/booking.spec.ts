import { test, expect } from "@playwright/test";
import { cleanupE2EWrites } from "./helpers/db";

test.describe("calendar booking", () => {
  test("books an appointment via the Calendly-style picker, then cleans up", async ({ page }) => {
    try {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Care sections" }).first()
        .getByRole("button", { name: /providers/i }).click();
      await expect(page.getByText("Dr. Marcus Vance, MD")).toBeVisible({ timeout: 15_000 });

      // Open the availability calendar for the first provider
      await page.getByRole("button", { name: /open calendar for dr. marcus vance/i }).click();
      await expect(page.getByRole("dialog", { name: /select date and time/i })).toBeVisible();
      await expect(page.getByText("September 2026")).toBeVisible();

      // Pick Sep 18 -> 10:30 AM -> Continue
      await page.getByRole("gridcell", { name: "18", exact: true }).click();
      await page.getByRole("button", { name: "10:30 AM", exact: true }).click();
      await page.getByRole("button", { name: /^continue$/i }).click();

      // Booking confirmation shows the chosen slot, then commits
      await expect(page.getByRole("dialog", { name: /confirm consultation/i })).toBeVisible();
      await expect(page.getByText("Friday, September 18 at 10:30 AM ET")).toBeVisible();
      await page.getByRole("button", { name: /confirm booking/i }).click();

      await expect(page.getByText("Consultation booked")).toBeVisible({ timeout: 15_000 });
      // Lands back on the dashboard with the new booking listed
      await expect(page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })).toBeVisible();
    } finally {
      await cleanupE2EWrites();
    }
  });
});
