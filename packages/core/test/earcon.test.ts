import { describe, it, expect } from "vitest";
import { EarconSynthesizer, EarconType } from "../src/earcon";

describe("EarconSynthesizer Web Audio Engine", () => {
  it("initializes without throwing in test environment", () => {
    const synth = new EarconSynthesizer();
    expect(synth).toBeDefined();
  });

  it("handles play calls for all earcon types without errors", () => {
    const synth = new EarconSynthesizer();
    const earconTypes: EarconType[] = [
      "assertive",
      "polite",
      "tool",
      "persona",
      "safestop",
      "switch_step"
    ];

    earconTypes.forEach((type) => {
      expect(() => synth.play(type)).not.toThrow();
    });
  });

  it("unlockContext executes safely", () => {
    const synth = new EarconSynthesizer();
    expect(() => synth.unlockContext()).not.toThrow();
  });
});
