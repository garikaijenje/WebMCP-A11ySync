import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PersonaController } from "../src/persona";
import { SensoryAnnouncer } from "../src/announcer";

describe("PersonaController Multi-Modal Adaptations", () => {
  let announcer: SensoryAnnouncer;
  let controller: PersonaController;

  beforeEach(() => {
    announcer = new SensoryAnnouncer({ speechEnabled: false });
    controller = new PersonaController(announcer);
  });

  afterEach(() => {
    controller.cleanup();
  });

  it("defaults to standard persona mode", () => {
    expect(controller.getMode()).toBe("standard");
  });

  it("applies low-vision high-contrast attributes", () => {
    controller.setMode("low-vision");
    expect(controller.getMode()).toBe("low-vision");
    expect(document.documentElement.getAttribute("data-a11ysync-persona")).toBe("low-vision");
    expect(document.body.getAttribute("data-a11ysync-persona")).toBe("low-vision");
    expect(document.getElementById("a11ysync-persona-banner")).not.toBeNull();
  });

  it("applies screen-reader mode with audible speech telemetry and no visual captions", () => {
    controller.setMode("screen-reader");
    expect(controller.getMode()).toBe("screen-reader");
    expect(document.documentElement.getAttribute("data-a11ysync-persona")).toBe("screen-reader");
    expect(announcer.isSpeechEnabled()).toBe(true);
    expect(document.getElementById("a11ysync-screen-reader-caption")).toBeNull();
  });

  it("applies single-switch scanning mode with keyboard scanning active", () => {
    controller.setMode("single-switch");
    expect(controller.getMode()).toBe("single-switch");
    expect(document.documentElement.getAttribute("data-a11ysync-persona")).toBe("single-switch");
  });

  it("applies cognitive calm mode and disables animations", () => {
    controller.setMode("cognitive");
    expect(controller.getMode()).toBe("cognitive");
    expect(document.documentElement.getAttribute("data-a11ysync-persona")).toBe("cognitive");
  });

  it("restores standard persona cleanly", () => {
    controller.setMode("low-vision");
    controller.setMode("standard");
    expect(controller.getMode()).toBe("standard");
    expect(document.getElementById("a11ysync-persona-banner")).toBeNull();
  });
});
