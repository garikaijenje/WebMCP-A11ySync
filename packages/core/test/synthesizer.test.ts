// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { TrojanSynthesizer } from "../src/synthesizer";
import { ToolDefinition } from "../src/types";

describe("TrojanSynthesizer (Pillar 1: DOM Semantic Synthesis)", () => {
  let synthesizer: TrojanSynthesizer;

  beforeEach(() => {
    document.body.innerHTML = "";
    synthesizer = new TrojanSynthesizer(true);
  });

  it("synthesizes role='button', tabindex='0', and aria-label onto unlabelled legacy div elements", () => {
    const unlabelledDiv = document.createElement("div");
    unlabelledDiv.id = "refill-trigger";
    unlabelledDiv.className = "pill-btn";
    document.body.appendChild(unlabelledDiv);

    const tool: ToolDefinition = {
      name: "request_prescription_refill",
      description: "Submits an official pharmacy refill request for an active prescription",
      execute: async () => ({ status: "refilled" }),
      accessibility: {
        relatedElement: "#refill-trigger",
        humanActionLabel: "Refill Active Prescription"
      }
    };

    const records = synthesizer.synthesizeTool(tool);

    expect(records.length).toBe(1);
    expect(unlabelledDiv.getAttribute("role")).toBe("button");
    expect(unlabelledDiv.getAttribute("tabindex")).toBe("0");
    expect(unlabelledDiv.getAttribute("aria-label")).toBe("Refill Active Prescription");
    expect(unlabelledDiv.getAttribute("aria-description")).toContain("Submits an official pharmacy refill request");
    expect(unlabelledDiv.getAttribute("data-a11ysync-synthesized")).toBe("request_prescription_refill");
  });

  it("attaches Enter and Space keydown listeners to synthesized elements", () => {
    const divBtn = document.createElement("div");
    divBtn.id = "triage-btn";
    document.body.appendChild(divBtn);

    let clicked = false;
    divBtn.addEventListener("click", () => {
      clicked = true;
    });

    const tool: ToolDefinition = {
      name: "triage_specialist",
      description: "Triage symptoms",
      execute: async () => ({}),
      accessibility: {
        relatedElement: "#triage-btn"
      }
    };

    synthesizer.synthesizeTool(tool);

    // Dispatch Enter key
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    divBtn.dispatchEvent(enterEvent);
    expect(clicked).toBe(true);

    // Reset and dispatch Space key
    clicked = false;
    const spaceEvent = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    divBtn.dispatchEvent(spaceEvent);
    expect(clicked).toBe(true);
  });

  it("reverts synthesized attributes cleanly when disabled", () => {
    const div = document.createElement("div");
    div.id = "test-div";
    document.body.appendChild(div);

    synthesizer.synthesizeTool({
      name: "test_tool",
      description: "Testing revert",
      execute: async () => {},
      accessibility: { relatedElement: "#test-div" }
    });

    expect(div.getAttribute("role")).toBe("button");
    expect(div.getAttribute("tabindex")).toBe("0");

    synthesizer.setEnabled(false);

    expect(div.hasAttribute("role")).toBe(false);
    expect(div.hasAttribute("tabindex")).toBe(false);
    expect(div.hasAttribute("data-a11ysync-synthesized")).toBe(false);
  });
});
