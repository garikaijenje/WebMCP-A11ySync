import { describe, it, expect, beforeEach } from "vitest";
import { WebMCPBridge } from "../src/webmcp";
import { ToolDefinition } from "../src/types";

describe("WebMCPBridge & Duplicate Tool Recovery", () => {
  let bridge: WebMCPBridge;

  beforeEach(() => {
    bridge = new WebMCPBridge();
  });

  it("registers and lists WebMCP tools", async () => {
    const testTool: ToolDefinition = {
      name: "test_tool_1",
      description: "Test description",
      execute: async () => ({ status: "ok" })
    };

    await (document as any).modelContext.registerTool(testTool);
    const tools = (document as any).modelContext.listTools();

    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((t: ToolDefinition) => t.name === "test_tool_1")).toBe(true);
  });

  it("handles duplicate tool registrations gracefully without throwing InvalidStateError", async () => {
    const duplicateTool: ToolDefinition = {
      name: "dup_tool",
      description: "Duplicate tool description",
      execute: async () => "result"
    };

    // First registration
    await (document as any).modelContext.registerTool(duplicateTool);

    // Second registration of identical name (simulating React StrictMode / Fast Refresh)
    await expect(
      (document as any).modelContext.registerTool(duplicateTool)
    ).resolves.not.toThrow();

    const tools = (document as any).modelContext.listTools();
    const matches = tools.filter((t: ToolDefinition) => t.name === "dup_tool");
    expect(matches.length).toBe(1);
  });

  it("unregisters tools cleanly", async () => {
    const unregTool: ToolDefinition = {
      name: "to_remove",
      description: "Will be removed",
      execute: async () => {}
    };

    await (document as any).modelContext.registerTool(unregTool);
    expect((document as any).modelContext.listTools().some((t: ToolDefinition) => t.name === "to_remove")).toBe(true);

    await (document as any).modelContext.unregisterTool("to_remove");
    expect((document as any).modelContext.listTools().some((t: ToolDefinition) => t.name === "to_remove")).toBe(false);
  });
});
