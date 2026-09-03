/**
 * WebMCP-A11ySync: The Bi-Directional Accessibility Runtime & Sensory Bridge for WebMCP
 *
 * Open-source client-side runtime engine and proposed W3C protocol extension
 * deterministically compiling WebMCP tool schemas into native Accessibility Tree semantics.
 */

import { A11ySyncOptions } from "./types";
import { A11ySyncEngine } from "./engine";

/**
 * Convenience initializer for activating the A11ySync runtime
 */
export function initA11ySync(options?: A11ySyncOptions): A11ySyncEngine {
  return A11ySyncEngine.getInstance(options);
}

export { A11ySyncEngine } from "./engine";
export { TrojanSynthesizer } from "./synthesizer";
export { SensoryAnnouncer } from "./announcer";
export { SafeStopController } from "./safestop";
export { AssistivePalette } from "./palette";
export { ToolExecutionInterceptor } from "./interceptor";
export { WebMCPBridge } from "./webmcp";
export { AgentSimulator } from "./simulator";
export { PersonaController } from "./persona";
export { EarconSynthesizer } from "./earcon";

export type {
  ToolDefinition,
  ToolAccessibilityMetadata,
  ToolInputSchema,
  ToolExecutionContext,
  ModelContext,
  ATPersonaMode,
  A11ySyncTelemetryEvent,
  A11ySyncOptions,
  SynthesizedElementRecord
} from "./types";

// Default export for drop-in browser usage
export default initA11ySync;
