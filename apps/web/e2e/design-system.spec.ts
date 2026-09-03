import { test, expect, type Page } from "@playwright/test";

const SKY_600 = "rgb(2, 132, 199)"; // primary blue: buttons + active sidebar items

/** Alpha channel of an element's computed background (1 = fully opaque). */
async function bgAlpha(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return -1;
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/rgba?\(([^)]+)\)/);
    if (!m) return -1;
    const parts = m[1].split(",").map((s) => s.trim());
    return parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
  }, selector);
}

async function gotoTriage(page: Page) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Care sections" }).first()
    .getByRole("button", { name: /symptom triage/i }).click();
  await expect(page.getByRole("heading", { name: /symptom triage/i })).toBeVisible();
}

test.describe("design system surfaces", () => {
  test("combobox popover is opaque and primary actions use the brand blue", async ({ page }) => {
    await gotoTriage(page);

    // Active sidebar item keeps the primary blue (poll: the 150ms
    // bg transition can sample mid-flight right after navigation)
    await expect.poll(async () =>
      page.evaluate(() => {
        const el = document.querySelector('aside [aria-current="page"]');
        return el ? getComputedStyle(el).backgroundColor : "none";
      })
    ).toBe(SKY_600);

    // Primary submit button keeps the primary blue
    await expect(page.locator("#triage-submit-btn")).toHaveCSS("background-color", SKY_600);

    // Open dropdown: popover surface must be fully opaque (no see-through)
    await page.getByRole("combobox", { name: "Affected body area" }).click();
    const popoverBg = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search body areas…"]');
      const surface = input?.closest("[data-state]") as HTMLElement | null;
      return surface ? getComputedStyle(surface).backgroundColor : "none";
    });
    expect(popoverBg).not.toBe("none");
    const alpha = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search body areas…"]');
      const surface = input?.closest("[data-state]") as HTMLElement | null;
      if (!surface) return -1;
      const m = getComputedStyle(surface).backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (!m) return -1;
      const parts = m[1].split(",").map((s) => s.trim());
      return parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
    });
    expect(alpha).toBe(1);
    await expect(page.getByRole("option", { name: /left knee/i })).toBeVisible();
    expect(await bgAlpha(page, "#triage-submit-btn")).toBe(1);
  });

  test("select listbox and booking dialog are opaque", async ({ page }) => {
    await gotoTriage(page);
    await page.getByRole("combobox", { name: "Perceived urgency" }).click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    expect(await bgAlpha(page, '[role="listbox"]')).toBe(1);
    await page.keyboard.press("Escape");

    await page.getByRole("navigation", { name: "Care sections" }).first()
      .getByRole("button", { name: /providers/i }).click();
    await expect(page.getByText("Dr. Marcus Vance, MD")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /friday, sep 18 at 10:30 am/i }).click();
    const dialog = page.getByRole("dialog", { name: /confirm consultation/i });
    await expect(dialog).toBeVisible();
    const dialogBg = await dialog.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(dialogBg).not.toBe("rgba(0, 0, 0, 0)");
    await page.getByRole("button", { name: /^cancel$/i }).click();
  });

  test("surfaces stay opaque in dark mode", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("carenav-theme", "dark");
    });
    await gotoTriage(page);
    await expect.poll(async () =>
      page.evaluate(() => document.documentElement.classList.contains("dark"))
    ).toBe(true);
    await page.getByRole("combobox", { name: "Affected body area" }).click();
    const alpha = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search body areas…"]');
      const surface = input?.closest("[data-state]") as HTMLElement | null;
      if (!surface) return -1;
      const m = getComputedStyle(surface).backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (!m) return -1;
      const parts = m[1].split(",").map((s) => s.trim());
      return parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
    });
    expect(alpha).toBe(1);
  });
});
