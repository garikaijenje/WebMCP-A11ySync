# WebMCP-A11ySync

> **The Bi-Directional Accessibility Runtime & Sensory Bridge for WebMCP**
>
> *"Compiling developer-authored WebMCP tool schemas deterministically into native Accessibility Tree semantics—bridging autonomous AI agents with assistive technology."*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-ef4444)](https://turbo.build/repo)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![WCAG 2.2](https://img.shields.io/badge/WCAG-2.2%20AAA%20Ready-emerald)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## Executive Summary

The **Web Model Context Protocol (WebMCP)** (incubated by Google, Microsoft, and the W3C Web Machine Learning Community Group) is the web's emerging open standard for agentic interaction. WebMCP introduces client-side JavaScript APIs (`document.modelContext.registerTool`) and declarative HTML attributes (`<form toolname="..." tooldescription="...">`), allowing AI assistants like ChatGPT and Chrome Gemini to discover and execute structured actions without fragile screen-scraping.

However, WebMCP introduces a critical dilemma:
1. **The "Two-Tier Web" Threat**: Developers are enthusiastically writing rich, typed JSON tool contracts for commercial AI agent traffic while continuing to neglect the visual and semantic DOM for the 1.3+ billion people with disabilities.
2. **The Sensory Desynchronization Gap**: When browser AI agents execute headless WebMCP tools, DOM state mutates, but assistive technology (AT) users (screen readers, braille displays, switch controls) receive **zero audible, focus-state, or tactile feedback**.
3. **The Unresolved W3C Standards Controversy**: As debated in **W3C Issue #91**, **Issue #65**, and **APA Tracking Issue #317**, accessibility leaders and spec authors have clashed over how to prevent deceptive "agent-only" shadow interfaces and guarantee human-in-the-loop verification.

**WebMCP-A11ySync** is an open-source, client-side runtime engine, UI adapter suite, and proposed W3C protocol extension that resolves these challenges.

---

## The 4 Core Pillars of WebMCP-A11ySync

```
                               WebMCP-A11ySync RUNTIME ARCHITECTURE
                               
    +---------------------------------------------------------------------------------------+
    |                                    WEBMCP LAYER                                       |
    |   Declarative HTML: <form toolname="..." tooldescription="...">                       |
    |   Imperative JS:    document.modelContext.registerTool({ name, description, ... })    |
    +---------------------------------------------------------------------------------------+
                                               |
                                               v
    +---------------------------------------------------------------------------------------+
    |                             WebMCP-A11ySync CORE ENGINE                               |
    |                                                                                       |
    |  [Pillar 1: Trojan Horse Synthesizer]      [Pillar 2: Sensory & Focus Interceptor]    |
    |  - Intercepts WebMCP tool metadata         - Intercepts tool execution lifecycle      |
    |  - Compiles schemas into ARIA / AOM        - Fires assertive aria-live announcements  |
    |  - Injects role="button", tabindex="0"     - Renders glowing visual ghost cursor      |
    |  - Binds Enter/Space keyboard listeners    - Moves keyboard focus synchronously       |
    |                                                                                       |
    |  [Pillar 3: Accessible Safe-Stop]          [Pillar 4: AT Intent Command Palette]      |
    |  - Traps focus via native <dialog>         - Surfaces tools directly to screen reader |
    |  - Plain-language parameter review         - Alt + A hotkey spotlight launcher        |
    |  - Space/Enter commit, Esc AbortSignal     - Single-switch step-through navigation    |
    +---------------------------------------------------------------------------------------+
                                               |
                  +----------------------------+----------------------------+
                  |                                                         |
                  v                                                         v
    +---------------------------+                             +---------------------------+
    |   ACCESSIBILITY TREE /    |                             |      VISUAL DOM & UI      |
    |   SCREEN READER (AOM)     |                             |   Ghost Cursor Highlights |
    |  - Synthesized ARIA Roles |                             |   High-contrast cards     |
    |  - Live Region Alerts     |                             |   In-place field updates  |
    |  - Trapped Modal Dialogs  |                             |   Human-in-the-loop modal |
    +---------------------------+                             +---------------------------+
```

### Pillar 1: The WebMCP-Exclusive "Trojan Horse" Synthesizer
Strictly on WebMCP-enabled websites, the engine intercepts developer-authored tool schemas and automatically projects missing accessibility attributes onto legacy, un-annotated DOM elements:
- Injects `role="button"` onto dead `<div>` and `<span>` elements.
- Injects `tabindex="0"` so keyboard-only and switch-access users can navigate to interactive triggers.
- Synthesizes accessible names (`aria-label`) and descriptions (`aria-description`) directly from verified tool descriptions.
- Binds `Enter` and `Space` keydown event handlers.

### Pillar 2: The Sensory & Focus Interceptor
When an autonomous agent invokes a WebMCP tool:
1. **Pre-Execution Alert**: Announces the agent's intent via dual-buffered `aria-live="assertive"` regions and optional Web Speech API audio synthesis.
2. **Visual Ghost Cursor**: Moves keyboard focus to the target element and highlights it with a high-contrast glowing outline (`.a11ysync-ghost-target`).
3. **Post-Execution State Verification**: Verifies the return payload, shifts focus to the confirmation container (`focusTargetOnComplete`), and announces the outcome.

### Pillar 3: Accessible Safe-Stop Engine (Human-in-the-Loop)
In high-stakes interactions (refilling prescriptions, committing financial transactions, modifying records), autonomous execution poses severe hazards. WebMCP-A11ySync introduces the **Safe-Stop Interceptor**:
- Suspends the WebMCP execution Promise.
- Opens an accessible modal dialog using native HTML5 `<dialog>` and `.showModal()`, natively setting outside content `inert`.
- Traps keyboard focus and presents parameters in plain language.
- Listens for `Space`/`Enter` to confirm or `Escape`/Cancel to trigger WebMCP's native `AbortSignal`, cleanly unwinding the transaction before any network commit.

### Pillar 4: The Assistive Intent Command Palette (`Alt + A`)
Exposes all registered WebMCP tools as a direct, keyboard-navigable action surface for screen reader users and motor-impaired single-switch users, allowing them to bypass dozens of nested DOM divs.

---

## Why This is Impossible Without WebMCP

| Alternative Approach | Fatal Bottleneck | WebMCP-A11ySync Advantage |
|---|---|---|
| **Backend MCP (Cloud-to-Cloud)** | Bypasses the browser DOM completely; screen reader receives zero audio telemetry or focus updates. | **Client-side execution** inside `document.modelContext` allows real-time DOM focus and speech synchronization. |
| **Generic AI Overlays (AccessiBe)** | Hallucinates labels via computer vision/OCR heuristics; legally hazardous. | Uses **first-party, developer-authored, typed WebMCP schemas** as certified ground truth. |
| **Pure ARIA / Static HTML** | ARIA is passive metadata; cannot execute parameterized multi-step actions or coordinate agents. | WebMCP provides typed, executable JavaScript tools that WebMCP-A11ySync bridges directly to ARIA. |

---

## Monorepo Architecture

This repository is organized as a high-performance **Turborepo** monorepo managed with **Bun**:

```
WebMCP-A11ySync/
├── apps/
│   └── web/                     # CareNavigator Next.js 15 showcase portal with shadcn UI
├── packages/
│   ├── core/                    # @a11ysync/core: Zero-dependency runtime (ESM, CJS, IIFE bundle)
│   ├── react/                   # @a11ysync/react: React context, hooks, HUD & Telemetry drawer
│   ├── config-typescript/       # Shared TypeScript configuration presets
│   └── config-eslint/           # Shared ESLint configuration presets
├── vitest.config.ts             # Monorepo test configuration
├── turbo.json                   # Turborepo task pipeline
└── package.json                 # Bun workspace configuration
```

---

## Quick Start & Installation

### Option 1: Standalone Script Tag (Zero Dependencies)

Include the standalone compiled bundle directly on any web page:

```html
<!-- Load WebMCP-A11ySync standalone runtime -->
<script src="https://unpkg.com/@a11ysync/core/dist/a11ysync.global.js"></script>
<script>
  // Initialize runtime
  A11ySync.initA11ySync({
    speechEnabled: true,
    safeStopEnabled: true
  });
</script>
```

### Option 2: Core Library (npm / bun)

```bash
bun add @a11ysync/core
# or: npm install @a11ysync/core
```

```typescript
import { initA11ySync } from "@a11ysync/core";

const engine = initA11ySync({
  speechEnabled: true,
  safeStopEnabled: true,
  ghostCursorEnabled: true,
  paletteEnabled: true
});

// Imperative WebMCP tool registration with A11y extension
document.modelContext.registerTool({
  name: "refill_prescription",
  description: "Submits medication refill request",
  accessibility: {
    relatedElement: "#refill-btn",
    requiresHumanConfirmation: true,
    humanActionLabel: "Refill Active Prescription"
  },
  execute: async (params) => {
    // Execution logic
  }
});
```

### Option 3: React & Next.js Integration

```bash
bun add @a11ysync/react @a11ysync/core
```

```tsx
import { A11ySyncProvider, A11ySyncHUD, A11ySyncDrawer } from "@a11ysync/react";

export default function App({ children }) {
  return (
    <A11ySyncProvider options={{ speechEnabled: true, safeStopEnabled: true }}>
      {children}
      {/* Ambient Floating Status Pill */}
      <A11ySyncHUD />
      {/* Telemetry & Inspection Drawer (Alt + D) */}
      <A11ySyncDrawer />
    </A11ySyncProvider>
  );
}
```

---

## The Showcase Application: "CareNavigator"

`apps/web` contains the reference implementation: **CareNavigator**—an accessible patient clinic triage, accommodation search, and prescription refill hub.

### Running CareNavigator Locally

```bash
# 1. Install dependencies across all packages
bun install

# 2. Build core packages and web application
bun run build

# 3. Start development server
bun run dev
```

Open [http://localhost:4117](http://localhost:4117) in your browser.

### Key Showcase Workflows:
1. **The Trojan Horse Diff**:
   - Tab through the dosage pills: notice that without A11ySync, unlabelled legacy `<div class="pill-btn">` elements are unreachable.
   - Toggle **A11ySync ON**: the compiler instantly synthesizes `role="button"`, `tabindex="0"`, accessible names, and keyboard handlers.
2. **One-Click Agent Evaluator**:
   - Open the inspector drawer (`Alt + D`).
   - Click `[▶ Test 3: Prescription Refill]`.
   - Watch the element highlight with the glowing **Ghost Cursor**, listen to the real-time audio announcement, and experience the **Accessible Safe-Stop Dialog** trapping focus until confirmed or cancelled with `Escape`.
3. **Assistive Command Palette**:
   - Press `Alt + A` (or `Option + A`) to open the spotlight command palette and trigger any WebMCP tool directly with arrow keys and Enter.

---

## Proposed W3C Protocol RFC Specification

WebMCP-A11ySync includes a formal proposal for the **W3C Web Machine Learning Community Group** and **APA Working Group**:

```typescript
interface ToolAccessibilityMetadata {
  /** CSS selector matching associated DOM node */
  relatedElement?: string;
  /** Custom audible announcements for assistive technology lifecycle */
  liveAnnouncements?: {
    onStart?: string;
    onSuccess?: string;
    onError?: string;
  };
  /** Requires Safe-Stop modal confirmation before execution */
  requiresHumanConfirmation?: boolean;
  /** Selector of the DOM element to receive focus upon completion */
  focusTargetOnComplete?: string;
  /** Automatically synthesizes missing role, tabindex, and aria-labels */
  synthesizeDomAttributes?: boolean;
  /** Plain language summary template for human review */
  humanActionLabel?: string;
}
```

---

## Verification & Testing

```bash
# Run unit + component tests across all packages (vitest)
bun run test

# Run TypeScript type-checking across monorepo
bun run type-check

# Run linting across all packages
bun run lint

# Build production bundles (ESM, CJS, standalone IIFE, Next.js)
bun run build
```

### CareNavigator web app test layers (`apps/web`)

| Layer | Location | Command | What it guards |
|---|---|---|---|
| Unit (repository) | `test/careRepository.test.ts` | `bun run test` | DB mappers, triage logic, filters — hermetically mocked, never touches live data |
| Component / UI | `test/ui/*.test.tsx` | `bun run test` | Every view, combobox, multi-select, sidebar, display settings (testing-library + happy-dom) |
| Anchor contract | `test/ui/anchors.test.ts` | `bun run test` | Fails fast if a redesign drops a WebMCP engine DOM anchor ID |
| E2E (Chromium) | `e2e/*.spec.ts` | `bun run test:e2e` | Full journeys against the seeded project: smoke + clean console, anchors in DOM, provider filter, booking dialog, calendar booking, triage submit, refill submit, coded profile save, display settings, design-system surfaces |

Supabase connection for the app and e2e comes from the CLI (`bun run supabase:sync`
reads the linked project's publishable key via `supabase projects api-keys` — no
`.env` files). Write specs (`triage`, `meds`) clean up in `finally`, and
`e2e/global-teardown.ts` sweeps `refill_orders` / `triage_assessments` and restores
the seed prescription, asserting pristine counts (`appointments: 1, prescriptions: 3,
refillOrders: 0, triage: 0`). First run needs `bunx playwright install chromium` and
`bunx supabase login`.

---

## License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 WebMCP-A11ySync Contributors.
