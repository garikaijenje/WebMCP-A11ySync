import { test, expect } from "@playwright/test";

test.describe("portal smoke", () => {
  test("loads the dashboard with patient data and a clean console", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 20_000 });
    // Patient identity from Supabase (seed: Sarah Jenkins #MH-88291)
    await expect(page.getByText("Sarah Jenkins", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("#MH-88291", { exact: true }).first()).toBeVisible();
    // Live connection badge (proves DB reachability, not offline cache)
    await expect(page.getByText("Live", { exact: true }).first()).toBeVisible({ timeout: 20_000 });
    expect(errors).toEqual([]);
  });

  test("navigates through every care section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 20_000 });

    const sections: Array<[string, RegExp]> = [
      ["Symptom Triage", /symptom triage/i],
      ["Medications", /^medications$/i],
      ["Providers", /accessible providers/i],
      ["Accessibility", /accessibility profile/i],
      ["Care Overview", /good (morning|afternoon|evening)/i]
    ];
    for (const [nav, heading] of sections) {
      await page.getByRole("navigation", { name: "Care sections" }).first()
        .getByRole("button", { name: new RegExp(nav, "i") })
        .click();
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    }
  });
});
