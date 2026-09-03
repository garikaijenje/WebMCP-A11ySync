// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { usePlatformShortcut } from "../src/usePlatformShortcut";
import { SSR_SHORTCUT_FALLBACK, getPlatformShortcut } from "../src/utils";

describe("platform shortcut hydration safety", () => {
  it("SSR fallback is the stable non-Mac label set", () => {
    expect(SSR_SHORTCUT_FALLBACK.A).toEqual({ modifier: "Alt", symbol: "Alt + A", label: "Alt + A" });
    expect(SSR_SHORTCUT_FALLBACK.D).toEqual({ modifier: "Alt", symbol: "Alt + D", label: "Alt + D" });
  });

  it("hook renders fallback first, then the platform value after mount", async () => {
    const seen: string[] = [];
    function Probe() {
      const s = usePlatformShortcut("A");
      seen.push(s.label);
      return null;
    }
    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);
    await act(async () => {
      root.render(<Probe />);
    });
    expect(seen[0]).toBe("Alt + A");
    expect(seen[seen.length - 1]).toBe(getPlatformShortcut("A").label);
    root.unmount();
    el.remove();
  });
});
