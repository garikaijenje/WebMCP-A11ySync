/**
 * WebMCP-A11ySync: Core Runtime Engine
 * Central orchestrator connecting WebMCP tool registration, Trojan Horse ARIA synthesis,
 * sensory live-region announcements, Safe-Stop modal verification, and assistive palettes.
 */

import {
  A11ySyncOptions,
  A11ySyncTelemetryEvent,
  ToolDefinition,
  ATPersonaMode
} from "./types";
import { SensoryAnnouncer } from "./announcer";
import { SafeStopController } from "./safestop";
import { ToolExecutionInterceptor } from "./interceptor";
import { TrojanSynthesizer } from "./synthesizer";
import { AssistivePalette } from "./palette";
import { WebMCPBridge } from "./webmcp";
import { AgentSimulator } from "./simulator";

export class A11ySyncEngine {
  private static instance: A11ySyncEngine | null = null;
  private options: A11ySyncOptions;
  private announcer: SensoryAnnouncer;
  private safeStopController: SafeStopController;
  private interceptor: ToolExecutionInterceptor;
  private synthesizer: TrojanSynthesizer;
  private palette: AssistivePalette;
  private bridge: WebMCPBridge;
  private simulator: AgentSimulator;
  private telemetrySubscribers: Set<(event: A11ySyncTelemetryEvent) => void> = new Set();
  private mutationObserver: MutationObserver | null = null;
  private isBrowser: boolean;

  constructor(options: A11ySyncOptions = {}) {
    this.options = {
      autoAttach: true,
      speechEnabled: true,
      safeStopEnabled: true,
      ghostCursorEnabled: true,
      paletteEnabled: true,
      trojanSynthesizerEnabled: true,
      personaMode: "standard",
      ...options
    };

    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    // 1. Initialize Announcer (Live regions + SpeechSynthesis)
    this.announcer = new SensoryAnnouncer({
      speechEnabled: this.options.speechEnabled,
      speechVolume: this.options.speechVolume,
      speechRate: this.options.speechRate
    });

    // 2. Initialize Safe-Stop Controller
    this.safeStopController = new SafeStopController(this.announcer);

    // 3. Initialize Tool Interceptor
    this.interceptor = new ToolExecutionInterceptor(
      this.announcer,
      this.safeStopController,
      {
        ghostCursorEnabled: this.options.ghostCursorEnabled,
        safeStopEnabled: this.options.safeStopEnabled,
        onTelemetry: (event) => this.broadcastTelemetry(event)
      }
    );

    // 4. Initialize Trojan Synthesizer
    this.synthesizer = new TrojanSynthesizer(this.options.trojanSynthesizerEnabled);

    // 5. Initialize Assistive Command Palette
    this.palette = new AssistivePalette(this.announcer, this.options.paletteEnabled);

    // 6. Initialize WebMCP Bridge
    this.bridge = new WebMCPBridge({
      onRegister: (tool) => this.handleToolRegistered(tool),
      executionWrapper: (tool, params, ctx) => this.interceptor.executeTool(tool, params, ctx)
    });

    // 7. Initialize Agent Simulator
    this.simulator = new AgentSimulator(this.bridge);

    if (this.options.onTelemetry) {
      this.telemetrySubscribers.add(this.options.onTelemetry);
    }

    if (this.isBrowser) {
      this.initializeEngine();
    }
  }

  public static getInstance(options?: A11ySyncOptions): A11ySyncEngine {
    if (!A11ySyncEngine.instance) {
      A11ySyncEngine.instance = new A11ySyncEngine(options);
    }
    return A11ySyncEngine.instance;
  }

  private initializeEngine(): void {
    // Initial scan of declarative WebMCP forms
    this.synthesizer.scanDeclarativeForms();

    // Observe DOM mutations to synthesize newly inserted tools/forms
    if (typeof MutationObserver !== "undefined") {
      this.mutationObserver = new MutationObserver(() => {
        this.synthesizer.scanDeclarativeForms();
      });
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Set persona mode
    if (this.options.personaMode) {
      this.setPersonaMode(this.options.personaMode);
    }

    this.broadcastTelemetry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: "engine_initialized",
      summary: "WebMCP-A11ySync runtime engine active"
    });
  }

  private handleToolRegistered(tool: ToolDefinition): void {
    // 1. Synthesize accessibility tree attributes onto associated DOM elements
    if (this.options.trojanSynthesizerEnabled) {
      const records = this.synthesizer.synthesizeTool(tool);
      if (records.length > 0) {
        this.broadcastTelemetry({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: "dom_synthesized",
          toolName: tool.name,
          summary: `Synthesized accessibility semantics for ${records.length} DOM elements`,
          details: { count: records.length, toolName: tool.name }
        });
      }
    }

    // 2. Update palette tool roster
    this.palette.setTools(this.bridge.getTools(), (selectedTool) => {
      this.announcer.announce(`Selected ${selectedTool.name} from palette.`, "assertive");
    });

    this.broadcastTelemetry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: "tool_registered",
      toolName: tool.name,
      summary: `Registered WebMCP tool: ${tool.name}`
    });
  }

  // --- Public API Controls ---

  public getAnnouncer(): SensoryAnnouncer {
    return this.announcer;
  }

  public getSynthesizer(): TrojanSynthesizer {
    return this.synthesizer;
  }

  public getPalette(): AssistivePalette {
    return this.palette;
  }

  public getSimulator(): AgentSimulator {
    return this.simulator;
  }

  public getBridge(): WebMCPBridge {
    return this.bridge;
  }

  public getTools(): ToolDefinition[] {
    return this.bridge.getTools();
  }

  public setSpeechEnabled(enabled: boolean): void {
    this.announcer.setSpeechEnabled(enabled);
  }

  public isSpeechEnabled(): boolean {
    return this.announcer.isSpeechEnabled();
  }

  public setTrojanSynthesizerEnabled(enabled: boolean): void {
    this.synthesizer.setEnabled(enabled);
    if (enabled) {
      // Re-scan all registered tools and declarative forms
      this.bridge.getTools().forEach((tool) => this.synthesizer.synthesizeTool(tool));
      this.synthesizer.scanDeclarativeForms();
    }
  }

  public isTrojanSynthesizerEnabled(): boolean {
    return this.synthesizer.isSynthesizerEnabled();
  }

  public setPersonaMode(mode: ATPersonaMode): void {
    this.options.personaMode = mode;
    if (!this.isBrowser) return;

    // Apply persona-specific enhancements
    const root = document.documentElement;
    root.setAttribute("data-a11ysync-persona", mode);

    switch (mode) {
      case "screen-reader":
        this.announcer.setSpeechEnabled(true);
        this.announcer.announce("Screen reader mode active. Audio telemetry enabled.", "assertive");
        break;
      case "low-vision":
        this.announcer.announce("High-contrast and enhanced focus boundaries enabled.", "polite");
        break;
      case "single-switch":
        this.announcer.announce("Single-switch accessibility mode active. Spacebar navigation ready.", "polite");
        break;
      case "cognitive":
        this.announcer.announce("Cognitive focus mode active. Simplified sensory feedback enabled.", "polite");
        break;
      default:
        break;
    }

    this.broadcastTelemetry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: "persona_changed",
      summary: `Switched AT persona to ${mode}`,
      details: { mode }
    });
  }

  public onTelemetry(callback: (event: A11ySyncTelemetryEvent) => void): () => void {
    this.telemetrySubscribers.add(callback);
    return () => {
      this.telemetrySubscribers.delete(callback);
    };
  }

  private broadcastTelemetry(event: A11ySyncTelemetryEvent): void {
    for (const sub of this.telemetrySubscribers) {
      try {
        sub(event);
      } catch {
        // Ignore subscriber errors
      }
    }
  }

  public cleanup(): void {
    this.mutationObserver?.disconnect();
    this.announcer.cleanup();
    this.safeStopController.cleanup();
    this.palette.cleanup();
    this.synthesizer.revertAll();
  }
}
