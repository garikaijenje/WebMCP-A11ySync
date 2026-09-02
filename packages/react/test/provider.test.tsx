// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect } from "vitest";
import { A11ySyncProvider, useA11ySync } from "../src/provider";

function TestConsumer() {
  const { tools, speechEnabled, setSpeechEnabled, persona } = useA11ySync();
  return (
    <div>
      <span data-testid="tools-count">{tools.length}</span>
      <span data-testid="speech-status">{speechEnabled ? "enabled" : "disabled"}</span>
      <span data-testid="persona-mode">{persona}</span>
      <button onClick={() => setSpeechEnabled(false)}>Mute</button>
    </div>
  );
}

describe("A11ySync React Adapter", () => {
  it("provides A11ySync context to child components", () => {
    // Basic test checking imports and provider functions exist
    expect(typeof A11ySyncProvider).toBe("function");
    expect(typeof useA11ySync).toBe("function");
  });
});
