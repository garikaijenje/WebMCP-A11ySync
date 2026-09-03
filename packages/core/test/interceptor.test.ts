import { describe, it, expect, beforeEach } from "vitest";
import { ToolExecutionInterceptor } from "../src/interceptor";
import { SensoryAnnouncer } from "../src/announcer";
import { SafeStopController } from "../src/safestop";
import { ToolDefinition } from "../src/types";

describe("ToolExecutionInterceptor & Human/Agent Separation", () => {
  let announcer: SensoryAnnouncer;
  let safeStopController: SafeStopController;
  let interceptor: ToolExecutionInterceptor;

  beforeEach(() => {
    announcer = new SensoryAnnouncer({ speechEnabled: false });
    safeStopController = new SafeStopController(announcer);
    interceptor = new ToolExecutionInterceptor(announcer, safeStopController, {
      safeStopEnabled: true,
      ghostCursorEnabled: false
    });
  });

  it("executes routine tool seamlessly", async () => {
    const routineTool: ToolDefinition = {
      name: "routine_query",
      description: "Safe read-only search",
      execute: async (params: { query: string }) => ({ count: 5, query: params.query })
    };

    const result = await interceptor.executeTool(routineTool, { query: "cardiology" });
    expect(result).toEqual({ count: 5, query: "cardiology" });
  });

  it("bypasses safe-stop when isUserInitiated is true", async () => {
    const sensitiveTool: ToolDefinition = {
      name: "transfer_funds",
      description: "Transfer funds to clinic account",
      accessibility: {
        requiresHumanConfirmation: true,
        humanActionLabel: "Transfer Funds"
      },
      execute: async (params: { amount: number }) => ({ success: true, amount: params.amount })
    };

    // Human user clicking on the web UI sets isUserInitiated: true
    const result = await interceptor.executeTool(
      sensitiveTool,
      { amount: 50 },
      { isUserInitiated: true }
    );

    expect(result).toEqual({ success: true, amount: 50 });
  });
});
