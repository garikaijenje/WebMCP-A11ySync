// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SensoryAnnouncer } from "../src/announcer";

describe("SensoryAnnouncer (Pillar 2: Live Region Telemetry)", () => {
  let announcer: SensoryAnnouncer;

  beforeEach(() => {
    document.body.innerHTML = "";
    announcer = new SensoryAnnouncer({ speechEnabled: false });
  });

  afterEach(() => {
    announcer.cleanup();
  });

  it("creates assertive and polite persistent ARIA live regions in the document", () => {
    announcer.ensureLiveRegions();

    const assertive = document.getElementById("a11ysync-live-assertive");
    const polite = document.getElementById("a11ysync-live-polite");

    expect(assertive).not.toBeNull();
    expect(assertive?.getAttribute("aria-live")).toBe("assertive");
    expect(assertive?.getAttribute("aria-atomic")).toBe("true");

    expect(polite).not.toBeNull();
    expect(polite?.getAttribute("aria-live")).toBe("polite");
    expect(polite?.getAttribute("aria-atomic")).toBe("true");
  });

  it("populates live regions upon announcement", async () => {
    announcer.announce("Agent is preparing to triage symptoms.", "assertive");

    // Wait for the announcement timeout
    await new Promise((resolve) => setTimeout(resolve, 60));

    const assertive = document.getElementById("a11ysync-live-assertive");
    expect(assertive?.textContent).toBe("Agent is preparing to triage symptoms.");
  });
});
