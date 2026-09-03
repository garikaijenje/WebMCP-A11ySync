import { test, expect } from "@playwright/test";

test.describe("display & readability settings", () => {
  test("scales text, enables high contrast and reduced motion", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: /display and readability settings/i }).click();
    await expect(page.getByText("Display & readability")).toBeVisible();

    // Extra-large text scales the root font size
    await page.getByRole("button", { name: /extra large/i }).click();
    await expect.poll(async () =>
      page.evaluate(() => document.documentElement.style.fontSize)
    ).toBe("125%");

    // High contrast + reduced motion set data attributes for CSS
    await page.getByRole("switch", { name: /high contrast/i }).click();
    await expect.poll(async () =>
      page.evaluate(() => document.documentElement.dataset.contrast)
    ).toBe("high");
    await page.getByRole("switch", { name: /reduce motion/i }).click();
    await expect.poll(async () =>
      page.evaluate(() => document.documentElement.dataset.motion)
    ).toBe("reduced");

    // Preferences persist locally
    const stored = await page.evaluate(() => ({
      size: window.localStorage.getItem("carenav-text-size"),
      contrast: window.localStorage.getItem("carenav-contrast"),
      motion: window.localStorage.getItem("carenav-motion")
    }));
    expect(stored).toEqual({ size: "xl", contrast: "high", motion: "reduced" });
  });
});
