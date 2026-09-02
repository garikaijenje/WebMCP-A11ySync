/**
 * WebMCP Specification and WebMCP-A11ySync Core Types
 */

/**
 * Proposed W3C RFC Extension: ToolAccessibilityMetadata
 * Enables deterministic bidirectional synchronization between WebMCP tool schemas
 * and the browser's Accessibility Tree (AOM / ARIA).
 */
export interface ToolAccessibilityMetadata {
  /** CSS selector or query matching the associated DOM element (e.g., '#refill-btn') */
  relatedElement?: string;
  /** Custom audible announcements for assistive technology lifecycle */
  liveAnnouncements?: {
    onStart?: string;
    onSuccess?: string;
    onError?: string;
  };
  /** If true, suspends tool execution until confirmed in the Accessible Safe-Stop modal */
  requiresHumanConfirmation?: boolean;
  /** CSS selector of the DOM element that should receive keyboard focus upon completion */
  focusTargetOnComplete?: string;
  /** Whether to automatically synthesize missing role, tabindex, and aria-labels on related DOM elements */
  synthesizeDomAttributes?: boolean;
  /** Human-readable plain language summary template for safe-stop verification */
  humanActionLabel?: string;
}

/**
 * Standard WebMCP JSON Schema definition for tool inputs
 */
export interface ToolInputSchema {
  type: "object";
  properties?: Record<string, {
    type: string;
    description?: string;
    enum?: string[];
    default?: unknown;
    format?: string;
    items?: {
      type: string;
      enum?: string[];
      description?: string;
    };
  }>;
  required?: string[];
}

/**
 * Execution context passed to WebMCP tool callbacks
 */
export interface ToolExecutionContext {
  signal?: AbortSignal;
  agentId?: string;
  isUserInitiated?: boolean;
}

/**
 * Standard WebMCP Tool Definition with A11ySync W3C extension
 */
export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  inputSchema?: ToolInputSchema;
  execute: (params: TParams, context?: ToolExecutionContext) => Promise<TResult> | TResult;
  /** Proposed W3C A11y extension */
  accessibility?: ToolAccessibilityMetadata;
  /** Read-only hint for safe actions */
  readOnlyHint?: boolean;
  /** Exposed to specific agents/origins */
  exposedTo?: string[];
}

/**
 * WebMCP Model Context standard interface
 */
export interface ModelContext {
  registerTool: <TParams = Record<string, unknown>, TResult = unknown>(
    tool: ToolDefinition<TParams, TResult>,
    options?: { signal?: AbortSignal }
  ) => Promise<void> | void;
  unregisterTool?: (name: string) => Promise<void> | void;
  listTools?: () => Promise<ToolDefinition[]> | ToolDefinition[];
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}

/**
 * Assistive Technology simulated persona modes
 */
export type ATPersonaMode =
  | "standard"
  | "screen-reader"
  | "single-switch"
  | "low-vision"
  | "cognitive";

/**
 * Telemetry event emitted by the A11ySync runtime
 */
export interface A11ySyncTelemetryEvent {
  id: string;
  timestamp: number;
  type:
    | "engine_initialized"
    | "tool_registered"
    | "tool_invoked"
    | "tool_completed"
    | "tool_failed"
    | "dom_synthesized"
    | "sensory_alert"
    | "ghost_focus"
    | "safestop_prompted"
    | "safestop_confirmed"
    | "safestop_aborted"
    | "persona_changed";
  toolName?: string;
  summary: string;
  details?: Record<string, unknown>;
}

/**
 * Configuration options for initializing A11ySync
 */
export interface A11ySyncOptions {
  /** Automatically intercept document.modelContext (default: true) */
  autoAttach?: boolean;
  /** Enable Web Speech API voice announcements (default: true) */
  speechEnabled?: boolean;
  /** Speech volume between 0 and 1 (default: 1) */
  speechVolume?: number;
  /** Speech rate between 0.5 and 2 (default: 1.1) */
  speechRate?: number;
  /** Enable Accessible Safe-Stop dialog for sensitive tools (default: true) */
  safeStopEnabled?: boolean;
  /** Enable glowing ghost cursor & focus tracking (default: true) */
  ghostCursorEnabled?: boolean;
  /** Enable Assistive Command Palette with Alt+A (default: true) */
  paletteEnabled?: boolean;
  /** Enable Trojan Horse DOM attribute synthesizer (default: true) */
  trojanSynthesizerEnabled?: boolean;
  /** Active assistive technology persona mode */
  personaMode?: ATPersonaMode;
  /** Telemetry callback for live monitoring */
  onTelemetry?: (event: A11ySyncTelemetryEvent) => void;
}

/**
 * Result of attribute synthesis on a DOM element
 */
export interface SynthesizedElementRecord {
  element: HTMLElement;
  toolName: string;
  addedRole: boolean;
  addedTabIndex: boolean;
  addedAriaLabel: boolean;
  addedAriaDescription: boolean;
  addedKeyboardListener: boolean;
  originalAttributes: {
    role?: string | null;
    tabIndex?: number;
    ariaLabel?: string | null;
    ariaDescription?: string | null;
  };
}
