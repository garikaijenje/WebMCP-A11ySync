/**
 * WebMCP-A11ySync: Trojan Horse DOM Synthesizer
 * Deterministically compiles developer-authored WebMCP tool schemas into native
 * Accessibility Tree semantics (ARIA roles, accessible names, tabindex, and keyboard handlers).
 */

import { ToolDefinition, SynthesizedElementRecord } from "./types";

export class TrojanSynthesizer {
  private records: Map<HTMLElement, SynthesizedElementRecord> = new Map();
  private isBrowser: boolean;
  private isEnabled: boolean = true;

  constructor(enabled: boolean = true) {
    this.isEnabled = enabled;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  }

  /**
   * Synthesizes accessibility attributes onto elements associated with a WebMCP tool
   */
  public synthesizeTool(tool: ToolDefinition): SynthesizedElementRecord[] {
    if (!this.isBrowser || !this.isEnabled) return [];

    const elements = this.findTargetElements(tool);
    const newRecords: SynthesizedElementRecord[] = [];

    for (const element of elements) {
      if (this.records.has(element)) {
        continue;
      }

      const originalRole = element.getAttribute("role");
      const originalTabIndex = element.tabIndex;
      const originalAriaLabel = element.getAttribute("aria-label");
      const originalAriaDescription = element.getAttribute("aria-description");

      let addedRole = false;
      let addedTabIndex = false;
      let addedAriaLabel = false;
      let addedAriaDescription = false;
      let addedKeyboardListener = false;

      // 1. Synthesize focusability (tabindex="0")
      const isNaturallyFocusable =
        element instanceof HTMLButtonElement ||
        element instanceof HTMLAnchorElement ||
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement;

      if (!isNaturallyFocusable && !element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "0");
        addedTabIndex = true;
      }

      // 2. Synthesize ARIA Role
      if (!originalRole && !isNaturallyFocusable) {
        element.setAttribute("role", "button");
        addedRole = true;
      }

      // 3. Synthesize Accessible Name (aria-label) from WebMCP description
      const hasTextContent = element.textContent?.trim().length;
      if (!originalAriaLabel && !hasTextContent) {
        const synthesizedName = tool.accessibility?.humanActionLabel || tool.description || tool.name;
        element.setAttribute("aria-label", synthesizedName);
        addedAriaLabel = true;
      }

      // 4. Synthesize Extended Accessible Description
      if (tool.description && !originalAriaDescription) {
        element.setAttribute("aria-description", `WebMCP Action: ${tool.description}`);
        addedAriaDescription = true;
      }

      // 5. Inject Enter & Space Keyboard Navigation Handlers
      if (!isNaturallyFocusable) {
        const keyHandler = (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            element.click();
          }
        };
        element.addEventListener("keydown", keyHandler);
        addedKeyboardListener = true;
      }

      // 6. Mark with A11ySync semantic metadata badge
      element.setAttribute("data-a11ysync-synthesized", tool.name);

      const record: SynthesizedElementRecord = {
        element,
        toolName: tool.name,
        addedRole,
        addedTabIndex,
        addedAriaLabel,
        addedAriaDescription,
        addedKeyboardListener,
        originalAttributes: {
          role: originalRole,
          tabIndex: originalTabIndex,
          ariaLabel: originalAriaLabel,
          ariaDescription: originalAriaDescription
        }
      };

      this.records.set(element, record);
      newRecords.push(record);
    }

    return newRecords;
  }

  /**
   * Scans declarative HTML forms ([toolname] or [tool-name]) and synthesizes semantics
   */
  public scanDeclarativeForms(): SynthesizedElementRecord[] {
    if (!this.isBrowser || !this.isEnabled) return [];

    const forms = document.querySelectorAll<HTMLFormElement>(
      "form[toolname], form[tool-name], [data-webmcp-tool]"
    );
    const results: SynthesizedElementRecord[] = [];

    forms.forEach((form) => {
      const toolName =
        form.getAttribute("toolname") ||
        form.getAttribute("tool-name") ||
        form.getAttribute("data-webmcp-tool") ||
        "unnamed_form_tool";

      const toolDescription =
        form.getAttribute("tooldescription") ||
        form.getAttribute("tool-description") ||
        form.getAttribute("data-webmcp-description") ||
        `Action: ${toolName}`;

      const syntheticTool: ToolDefinition = {
        name: toolName,
        description: toolDescription,
        execute: async () => ({ status: "submitted" }),
        accessibility: {
          relatedElement: form.id ? `#${form.id}` : undefined,
          synthesizeDomAttributes: true
        }
      };

      // Synthesize the form container
      const synthesized = this.synthesizeTool(syntheticTool);
      results.push(...synthesized);

      // Synthesize unlabelled submit triggers inside the form
      const unlabelledButtons = form.querySelectorAll<HTMLElement>(
        "div.btn, div.button, span.btn, div[class*='button'], div[class*='btn']"
      );
      unlabelledButtons.forEach((btn) => {
        const btnSynthesized = this.synthesizeTool({
          name: `${toolName}_submit`,
          description: `Submit ${toolDescription}`,
          execute: async () => {},
          accessibility: {
            humanActionLabel: `Submit ${toolDescription}`
          }
        });
        results.push(...btnSynthesized);
      });
    });

    return results;
  }

  /**
   * Resolves target DOM elements corresponding to a tool definition
   */
  private findTargetElements(tool: ToolDefinition): HTMLElement[] {
    const targets: HTMLElement[] = [];

    // Check specific relatedElement selector
    if (tool.accessibility?.relatedElement) {
      try {
        const found = document.querySelectorAll<HTMLElement>(tool.accessibility.relatedElement);
        found.forEach((el) => targets.push(el));
      } catch {
        // Invalid selector, ignore
      }
    }

    // Check matching element by ID or data attribute
    const idEl = document.getElementById(tool.name);
    if (idEl && !targets.includes(idEl)) {
      targets.push(idEl);
    }

    const dataEls = document.querySelectorAll<HTMLElement>(
      `[data-webmcp-tool="${tool.name}"], [data-tool-target="${tool.name}"]`
    );
    dataEls.forEach((el) => {
      if (!targets.includes(el)) targets.push(el);
    });

    return targets;
  }

  /**
   * Returns all synthesized element records
   */
  public getRecords(): SynthesizedElementRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Toggles the synthesizer on or off. When turned off, removes synthesized attributes
   * to demonstrate the accessibility delta to judges.
   */
  public setEnabled(enabled: boolean): void {
    if (this.isEnabled === enabled) return;
    this.isEnabled = enabled;

    if (!enabled) {
      this.revertAll();
    }
  }

  public isSynthesizerEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Reverts all synthesized attributes back to the element's original state
   */
  public revertAll(): void {
    for (const [element, record] of this.records.entries()) {
      if (record.addedRole) {
        if (record.originalAttributes.role) {
          element.setAttribute("role", record.originalAttributes.role);
        } else {
          element.removeAttribute("role");
        }
      }
      if (record.addedTabIndex) {
        element.removeAttribute("tabindex");
      }
      if (record.addedAriaLabel) {
        if (record.originalAttributes.ariaLabel) {
          element.setAttribute("aria-label", record.originalAttributes.ariaLabel);
        } else {
          element.removeAttribute("aria-label");
        }
      }
      if (record.addedAriaDescription) {
        if (record.originalAttributes.ariaDescription) {
          element.setAttribute("aria-description", record.originalAttributes.ariaDescription);
        } else {
          element.removeAttribute("aria-description");
        }
      }
      element.removeAttribute("data-a11ysync-synthesized");
    }
    this.records.clear();
  }
}
