/**
 * WebMCP Standard Bridge & Polyfill
 * Manages document.modelContext / navigator.modelContext proxying and fallback support.
 */

import { ToolDefinition, ModelContext } from "./types";

export type ToolRegistrationCallback = (tool: ToolDefinition) => void;
export type ToolExecutionWrapper = <TParams, TResult>(
  tool: ToolDefinition<TParams, TResult>,
  params: TParams,
  context?: { signal?: AbortSignal }
) => Promise<TResult>;

export class WebMCPBridge {
  private registeredTools: Map<string, ToolDefinition> = new Map();
  private onRegisterCallback?: ToolRegistrationCallback;
  private executionWrapper?: ToolExecutionWrapper;
  private isBrowser: boolean;

  constructor(options: {
    onRegister?: ToolRegistrationCallback;
    executionWrapper?: ToolExecutionWrapper;
  } = {}) {
    this.onRegisterCallback = options.onRegister;
    this.executionWrapper = options.executionWrapper;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (this.isBrowser) {
      this.attachBridge();
    }
  }

  /**
   * Connects to or polyfills document.modelContext and navigator.modelContext
   */
  public attachBridge(): void {
    if (!this.isBrowser) return;

    const existingContext = (document as unknown as { modelContext?: ModelContext }).modelContext;

    const proxyModelContext: ModelContext = {
      registerTool: async <TParams, TResult>(
        tool: ToolDefinition<TParams, TResult>,
        options?: { signal?: AbortSignal }
      ) => {
        // Wrap execution with A11ySync interceptor if provided
        const originalExecute = tool.execute;
        const wrappedTool: ToolDefinition<TParams, TResult> = {
          ...tool,
          execute: async (params: TParams, context) => {
            if (this.executionWrapper) {
              return this.executionWrapper(tool, params, context);
            }
            return originalExecute(params, context);
          }
        };

        this.registeredTools.set(tool.name, wrappedTool as ToolDefinition);

        // Notify registration (for Trojan Synthesizer & Command Palette)
        if (this.onRegisterCallback) {
          this.onRegisterCallback(wrappedTool as ToolDefinition);
        }

        // Call native registerTool if present
        if (existingContext && typeof existingContext.registerTool === "function") {
          return existingContext.registerTool(wrappedTool, options);
        }
      },
      unregisterTool: async (name: string) => {
        this.registeredTools.delete(name);
        if (existingContext && typeof existingContext.unregisterTool === "function") {
          return existingContext.unregisterTool(name);
        }
      },
      listTools: () => {
        return Array.from(this.registeredTools.values());
      }
    };

    // Attach to document.modelContext (current W3C WebML standard)
    try {
      Object.defineProperty(document, "modelContext", {
        value: proxyModelContext,
        writable: true,
        configurable: true
      });
    } catch {
      (document as unknown as { modelContext: ModelContext }).modelContext = proxyModelContext;
    }

    // Attach fallback to navigator.modelContext (legacy WebMCP draft)
    try {
      if (typeof navigator !== "undefined") {
        Object.defineProperty(navigator, "modelContext", {
          value: proxyModelContext,
          writable: true,
          configurable: true
        });
      }
    } catch {
      // Ignore if navigator is frozen
    }
  }

  public getTools(): ToolDefinition[] {
    return Array.from(this.registeredTools.values());
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.registeredTools.get(name);
  }
}
