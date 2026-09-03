import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisplaySettings } from "@/components/dashboard/DisplaySettings";

describe("DisplaySettings (readability for all user types)", () => {
  it("opens and scales text to extra large", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<DisplaySettings onThemeChange={onThemeChange} />);

    await user.click(screen.getByRole("button", { name: /display and readability settings/i }));
    expect(await screen.findByText("Display & readability")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /extra large/i }));
    expect(document.documentElement.style.fontSize).toBe("125%");
    expect(window.localStorage.getItem("carenav-text-size")).toBe("xl");
    document.documentElement.style.fontSize = "";
  });

  it("toggles high contrast and reduced motion", async () => {
    const user = userEvent.setup();
    render(<DisplaySettings onThemeChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /display and readability settings/i }));

    const contrast = await screen.findByRole("switch", { name: /high contrast/i });
    await user.click(contrast);
    expect(contrast).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.dataset.contrast).toBe("high");

    const motion = screen.getByRole("switch", { name: /reduce motion/i });
    await user.click(motion);
    expect(motion).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.dataset.motion).toBe("reduced");

    // reset for other tests
    await user.click(contrast);
    await user.click(motion);
  });

  it("reports theme changes for the toast layer", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<DisplaySettings onThemeChange={onThemeChange} />);
    await user.click(screen.getByRole("button", { name: /display and readability settings/i }));
    await user.click(await screen.findByRole("switch", { name: /dark mode/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(onThemeChange).toHaveBeenCalledWith(true);
    document.documentElement.classList.remove("dark");
  });
});
