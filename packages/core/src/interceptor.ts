/**
 * WebMCP-A11ySync: Sensory & State Synchronization Interceptor
 * Intercepts WebMCP tool invocations to provide synchronous aria-live alerts,
 * high-contrast visual ghost cursor targeting, and focus synchronization.
 */

import { ToolDefinition, ToolExecutionContext, A11ySyncTelemetryEvent } from "./types";
import { SensoryAnnouncer } from "./announcer";
import { SafeStopController } from "./safestop";

export class ToolExecutionInterceptor {
  private announcer: SensoryAnnouncer;
  private safeStopController: SafeStopController;
  private isBrowser: boolean;
  private ghostCursorEnabled: boolean = true;
  private safeStopEnabled: boolean = true;
  private onTelemetry?: (event: A11ySyncTelemetryEvent) => void;
  private activeGhostElement: HTMLElement | null = null;

  constructor(
    announcer: SensoryAnnouncer,
    safeStopController: SafeStopController,
    options: {
      ghostCursorEnabled?: boolean;
      safeStopEnabled?: boolean;
      onTelemetry?: (event: A11ySyncTelemetryEvent) => void;
    } = {}
  ) {
    this.announcer = announcer;
    this.safeStopController = safeStopController;
    this.ghostCursorEnabled = options.ghostCursorEnabled ?? true;
    this.safeStopEnabled = options.safeStopEnabled ?? true;
    this.onTelemetry = options.onTelemetry;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (this.isBrowser) {
      this.injectGhostStyles();
    }
  }

  /**
   * Executes a tool with full sensory and accessibility lifecycle synchronization
   */
  public async executeTool<TParams = Record<string, unknown>, TResult = unknown>(
    tool: ToolDefinition<TParams, TResult>,
    params: TParams,
    context?: ToolExecutionContext
  ): Promise<TResult> {
    const actionLabel = tool.accessibility?.humanActionLabel || tool.description || tool.name;

    const isUserInitiated = context?.isUserInitiated === true;

    // 1. Pre-Execution Telemetry & Announcement (Only for autonomous agent invocations)
    if (!isUserInitiated) {
      this.emitTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: "tool_invoked",
        toolName: tool.name,
        summary: `Agent invoked tool: ${tool.name}`,
        details: { params }
      });

      const startMessage =
        tool.accessibility?.liveAnnouncements?.onStart ||
        `Agent is preparing to: ${actionLabel}`;
      this.announcer.announce(startMessage, "assertive");

      // 2. Visual Ghost Cursor & Focus Snap
      const targetElement = this.resolveTargetElement(tool);
      if (targetElement && this.ghostCursorEnabled) {
        this.highlightGhostTarget(targetElement, tool.name);
      }
    }

    // 3. Accessible Safe-Stop Human-in-the-Loop Gate (Only for agent tool invocations)
    const requiresConfirmation =
      !isUserInitiated &&
      this.safeStopEnabled &&
      (tool.accessibility?.requiresHumanConfirmation || this.isSensitiveTool(tool.name));

    if (requiresConfirmation) {
      this.emitTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: "safestop_prompted",
        toolName: tool.name,
        summary: `Safe-Stop verification required for ${tool.name}`,
        details: { params }
      });

      const verification = await this.safeStopController.promptVerification({
        toolName: tool.name,
        toolDescription: tool.description,
        params,
        signal: context?.signal,
        humanActionLabel: tool.accessibility?.humanActionLabel
      });

      if (!verification.confirmed) {
        this.clearGhostTarget();
        this.emitTelemetry({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: "safestop_aborted",
          toolName: tool.name,
          summary: `Safe-Stop aborted by human for ${tool.name}`,
          details: { reason: verification.reason }
        });
        throw new Error(`WebMCP Action "${tool.name}" was cancelled by the user.`);
      }

      this.emitTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: "safestop_confirmed",
        toolName: tool.name,
        summary: `Safe-Stop confirmed by human for ${tool.name}`
      });
    }

    // 4. Invoke the developer's underlying execution callback
    try {
      const result = await tool.execute(params, context);

      // 5. Post-Execution Success Synchronization
      const successMessage =
        tool.accessibility?.liveAnnouncements?.onSuccess ||
        `Successfully completed: ${actionLabel}`;
      this.announcer.announce(successMessage, "assertive");

      // Manage Focus on Completion
      if (tool.accessibility?.focusTargetOnComplete && this.isBrowser) {
        const focusTarget = document.querySelector<HTMLElement>(tool.accessibility.focusTargetOnComplete);
        if (focusTarget) {
          focusTarget.focus();
        }
      }

      this.emitTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: "tool_completed",
        toolName: tool.name,
        summary: `Tool ${tool.name} executed successfully`,
        details: { result }
      });

      return result;
    } catch (error) {
      const errorMessage =
        tool.accessibility?.liveAnnouncements?.onError ||
        `Action failed: ${actionLabel}. ${(error as Error).message || ""}`;
      this.announcer.announce(errorMessage, "assertive");

      this.emitTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: "tool_failed",
        toolName: tool.name,
        summary: `Tool ${tool.name} failed during execution`,
        details: { error: String(error) }
      });

      throw error;
    } finally {
      // Clean up ghost cursor highlight after a brief visual grace period
      setTimeout(() => {
        this.clearGhostTarget();
      }, 1200);
    }
  }

  private isSensitiveTool(name: string): boolean {
    const sensitiveKeywords = ["refill", "prescribe", "book", "confirm", "payment", "delete", "transfer", "submit_claim"];
    return sensitiveKeywords.some((keyword) => name.toLowerCase().includes(keyword));
  }

  private resolveTargetElement(tool: ToolDefinition<any, any>): HTMLElement | null {
    if (!this.isBrowser) return null;

    if (tool.accessibility?.relatedElement) {
      try {
        const el = document.querySelector<HTMLElement>(tool.accessibility.relatedElement);
        if (el) return el;
      } catch {
        // Ignore invalid selectors
      }
    }

    return (
      document.getElementById(tool.name) ||
      document.querySelector<HTMLElement>(`[data-webmcp-tool="${tool.name}"]`)
    );
  }

  private highlightGhostTarget(element: HTMLElement, toolName: string): void {
    this.clearGhostTarget();
    this.activeGhostElement = element;

    element.classList.add("a11ysync-ghost-target");
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus({ preventScroll: true });

    this.emitTelemetry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: "ghost_focus",
      toolName,
      summary: `Ghost cursor snapped focus to DOM element for ${toolName}`
    });
  }

  private clearGhostTarget(): void {
    if (this.activeGhostElement) {
      this.activeGhostElement.classList.remove("a11ysync-ghost-target");
      this.activeGhostElement = null;
    }
  }

  private injectGhostStyles(): void {
    if (!this.isBrowser) return;
    if (document.getElementById("a11ysync-ghost-styles")) return;

    const style = document.createElement("style");
    style.id = "a11ysync-ghost-styles";
    style.textContent = `
      .a11ysync-ghost-target {
        outline: 3px solid #0284c7 !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 0 6px rgba(2, 132, 199, 0.3) !important;
        transition: outline 0.2s ease, box-shadow 0.2s ease !important;
        animation: a11ysync-pulse 1.5s infinite alternate !important;
      }
      @keyframes a11ysync-pulse {
        0% { box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.2); }
        100% { box-shadow: 0 0 0 8px rgba(2, 132, 199, 0.5); }
      }
      @media (prefers-reduced-motion: reduce) {
        .a11ysync-ghost-target {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private emitTelemetry(event: A11ySyncTelemetryEvent): void {
    if (this.onTelemetry) {
      this.onTelemetry(event);
    }
  }
}
