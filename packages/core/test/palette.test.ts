import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AssistivePalette } from "../src/palette";
import { SensoryAnnouncer } from "../src/announcer";
import { ToolDefinition } from "../src/types";

describe("AssistivePalette Hotkey & Tool Search", () => {
  let announcer: SensoryAnnouncer;
  let palette: AssistivePalette;

  beforeEach(() => {
    announcer = new SensoryAnnouncer({ speechEnabled: false });
    palette = new AssistivePalette(announcer, true);
  });

  afterEach(() => {
    palette.cleanup();
  });

  it("initializes palette closed", () => {
    expect(palette.isOpen()).toBe(false);
  });

  it("opens and closes palette correctly", () => {
    palette.open();
    expect(palette.isOpen()).toBe(true);
    expect(document.getElementById("a11ysync-palette-dialog")).not.toBeNull();

    palette.close();
    expect(palette.isOpen()).toBe(false);
  });

  it("populates tools into the palette dialog", () => {
    const tools: ToolDefinition[] = [
      { name: "tool_alpha", description: "Alpha description", execute: () => {} },
      { name: "tool_beta", description: "Beta description", execute: () => {} }
    ];

    palette.setTools(tools);
    palette.open();

    const dialog = document.getElementById("a11ysync-palette-dialog");
    expect(dialog?.textContent).toContain("tool_alpha");
    expect(dialog?.textContent).toContain("tool_beta");
  });
});
