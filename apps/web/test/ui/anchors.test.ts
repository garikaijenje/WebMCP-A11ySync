import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Broken-UI detector for the WebMCP bridge: the A11ySync engine binds tools to
 * DOM anchors by element ID. If a redesign drops one of these IDs, agent tools
 * silently lose their accessibility wiring. This contract test fails fast.
 */
const REQUIRED_ANCHORS = [
  { id: "triage-submit-btn", file: "TriageView.tsx" },
  { id: "triage-result-card", file: "TriageView.tsx" },
  { id: "triage-form", file: "TriageView.tsx" },
  { id: "refill-trigger", file: "MedicationsView.tsx" },
  { id: "refill-submit-action", file: "MedicationsView.tsx" },
  { id: "refill-confirmed-banner", file: "MedicationsView.tsx" },
  { id: "clinic-search-btn", file: "ProvidersView.tsx" },
  { id: "practitioner-results-grid", file: "ProvidersView.tsx" },
  { id: "confirm-booking-btn", file: "ProvidersView.tsx" },
  { id: "upcoming-appointments-card", file: "OverviewView.tsx" },
  { id: "main-content", file: "page.tsx" }
];

describe("WebMCP anchor contract", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const viewsDir = resolve(here, "../../components/views");
  const appDir = resolve(here, "../../app");

  it("keeps every engine anchor ID rendered by the views", () => {
    const sources = new Map<string, string>();
    for (const f of readdirSync(viewsDir)) {
      sources.set(f, readFileSync(join(viewsDir, f), "utf-8"));
    }
    sources.set("page.tsx", readFileSync(join(appDir, "page.tsx"), "utf-8"));

    for (const { id, file } of REQUIRED_ANCHORS) {
      const src = sources.get(file) ?? "";
      const hasId = src.includes(`id="${id}"`) || src.includes(`id={`);
      expect(
        hasId && (src.includes(`"${id}"`) || src.includes(`'${id}'`)),
        `anchor #${id} missing from ${file}`
      ).toBe(true);
    }
  });

  it("keeps toolname/tooldescription wiring on the triage form", () => {
    const src = readFileSync(join(viewsDir, "TriageView.tsx"), "utf-8");
    expect(src).toContain('toolname="triage_specialist"');
    expect(src).toContain("tooldescription=");
  });

  it("registers all four agent tools in the page shell", () => {
    const src = readFileSync(join(appDir, "page.tsx"), "utf-8");
    for (const tool of [
      "triage_specialist",
      "find_accessible_clinic",
      "request_prescription_refill",
      "confirm_appointment"
    ]) {
      expect(src).toContain(`name: "${tool}"`);
    }
  });
});
