// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect } from "vitest";
import { A11ySyncProvider, useA11ySync } from "../src/provider";
import { A11ySyncHUD } from "../src/HUD";
import { A11ySyncDrawer } from "../src/TelemetryDrawer";
import { getPlatformShortcut, isMacOS } from "../src/utils";

describe("A11ySync React Components & Utilities", () => {
  it("exports provider and hook as valid functions", () => {
    expect(typeof A11ySyncProvider).toBe("function");
    expect(typeof useA11ySync).toBe("function");
    expect(typeof A11ySyncHUD).toBe("function");
    expect(typeof A11ySyncDrawer).toBe("function");
  });

  it("calculates platform-aware keyboard shortcuts correctly", () => {
    const shortcutA = getPlatformShortcut("A");
    expect(["Option", "Alt"]).toContain(shortcutA.modifier);
    expect(["Alt + A", "Option + A"]).toContain(shortcutA.label);

    const shortcutD = getPlatformShortcut("D");
    expect(["Option", "Alt"]).toContain(shortcutD.modifier);
    expect(["Alt + D", "Option + D"]).toContain(shortcutD.label);
  });

  it("isMacOS returns a boolean", () => {
    expect(typeof isMacOS()).toBe("boolean");
  });
});
