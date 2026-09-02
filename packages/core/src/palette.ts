/**
 * WebMCP-A11ySync: Assistive Intent Command Palette
 * Hotkey-accessible (Alt + A) spotlight dialog allowing screen reader, motor-impaired,
 * and cognitive users to discover and trigger WebMCP tools directly.
 */

import { ToolDefinition } from "./types";
import { SensoryAnnouncer } from "./announcer";

export class AssistivePalette {
  private dialog: HTMLDialogElement | null = null;
  private tools: ToolDefinition[] = [];
  private onSelectTool?: (tool: ToolDefinition) => void;
  private announcer: SensoryAnnouncer;
  private isBrowser: boolean;
  private isEnabled: boolean = true;
  private selectedIndex: number = 0;
  private keydownHandler?: (e: KeyboardEvent) => void;

  constructor(announcer: SensoryAnnouncer, isEnabled: boolean = true) {
    this.announcer = announcer;
    this.isEnabled = isEnabled;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (this.isBrowser && this.isEnabled) {
      this.bindKeyboardShortcut();
    }
  }

  public setTools(tools: ToolDefinition[], onSelect?: (tool: ToolDefinition) => void): void {
    this.tools = tools;
    this.onSelectTool = onSelect;
  }

  private bindKeyboardShortcut(): void {
    this.keydownHandler = (event: KeyboardEvent) => {
      // Shortcut: Alt + A (or Option + A)
      if (event.altKey && (event.key === "a" || event.key === "A" || event.code === "KeyA")) {
        event.preventDefault();
        this.toggle();
      }
    };
    window.addEventListener("keydown", this.keydownHandler);
  }

  public toggle(): void {
    if (!this.isBrowser || !this.isEnabled) return;
    const dialog = this.ensureDialogElement();

    if (dialog.open) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    if (!this.isBrowser) return;
    const dialog = this.ensureDialogElement();
    this.selectedIndex = 0;
    this.renderToolList();
    dialog.showModal();
    this.announcer.announce("Assistive Command Palette opened. Use arrow keys to navigate WebMCP tools, Enter to execute, Escape to close.", "assertive");
  }

  public close(): void {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
      this.announcer.announce("Assistive Command Palette closed.", "polite");
    }
  }

  private ensureDialogElement(): HTMLDialogElement {
    let dialog = document.getElementById("a11ysync-palette-dialog") as HTMLDialogElement | null;
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "a11ysync-palette-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-label", "Assistive WebMCP Command Palette");
      dialog.style.border = "none";
      dialog.style.borderRadius = "12px";
      dialog.style.padding = "0";
      dialog.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
      dialog.style.width = "540px";
      dialog.style.maxWidth = "90vw";
      dialog.style.background = "#ffffff";

      dialog.oncancel = (e) => {
        e.preventDefault();
        this.close();
      };

      document.body.appendChild(dialog);
    }
    this.dialog = dialog;
    return dialog;
  }

  private renderToolList(): void {
    if (!this.dialog) return;

    if (this.tools.length === 0) {
      this.dialog.innerHTML = `
        <div style="padding: 24px; font-family: system-ui, sans-serif; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">No WebMCP Tools Registered</h3>
          <p style="margin: 0; color: #64748b; font-size: 14px;">This page has not declared any agent-callable tools.</p>
        </div>
      `;
      return;
    }

    const itemsHtml = this.tools
      .map((tool, index) => {
        const isSelected = index === this.selectedIndex;
        const bg = isSelected ? "#f0f9ff" : "transparent";
        const border = isSelected ? "2px solid #0284c7" : "1px solid #f1f5f9";
        return `
          <li
            id="a11ysync-palette-item-${index}"
            role="option"
            aria-selected="${isSelected}"
            style="padding: 12px 16px; margin-bottom: 8px; border-radius: 8px; background: ${bg}; border: ${border}; cursor: pointer; list-style: none;"
          >
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 600; color: #0f172a; font-size: 15px;">
                ${tool.accessibility?.humanActionLabel || tool.name}
              </span>
              <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-weight: 500;">
                WebMCP Tool
              </span>
            </div>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; line-height: 1.4;">
              ${tool.description}
            </p>
          </li>
        `;
      })
      .join("");

    this.dialog.innerHTML = `
      <div style="padding: 20px; font-family: system-ui, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a;">Assistive Intent Palette</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Direct action surface for assistive technology (Alt + A)</p>
          </div>
          <button id="a11ysync-palette-close" type="button" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;" aria-label="Close Palette">
            ✕
          </button>
        </div>
        <ul id="a11ysync-palette-list" role="listbox" aria-label="Available WebMCP Actions" style="padding: 0; margin: 0; max-height: 360px; overflow-y: auto;">
          ${itemsHtml}
        </ul>
        <div style="margin-top: 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>↑/↓ to navigate</span>
          <span>Enter to execute</span>
          <span>Esc to close</span>
        </div>
      </div>
    `;

    // Event listeners
    const closeBtn = this.dialog.querySelector<HTMLButtonElement>("#a11ysync-palette-close");
    if (closeBtn) closeBtn.onclick = () => this.close();

    const items = this.dialog.querySelectorAll("li[role='option']");
    items.forEach((item, idx) => {
      item.addEventListener("click", () => {
        this.selectItem(idx);
      });
    });

    // Keyboard navigation inside the palette
    this.dialog.onkeydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.tools.length;
        this.renderToolList();
        this.announceSelectedTool();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.tools.length) % this.tools.length;
        this.renderToolList();
        this.announceSelectedTool();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.selectItem(this.selectedIndex);
      }
    };
  }

  private announceSelectedTool(): void {
    const selected = this.tools[this.selectedIndex];
    if (selected) {
      const label = selected.accessibility?.humanActionLabel || selected.name;
      this.announcer.announce(`${label}: ${selected.description}`, "polite");
    }
  }

  private selectItem(index: number): void {
    const chosen = this.tools[index];
    this.close();
    if (chosen && this.onSelectTool) {
      this.onSelectTool(chosen);
    }
  }

  public cleanup(): void {
    if (!this.isBrowser) return;
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
    }
    if (this.dialog?.parentNode) {
      this.dialog.parentNode.removeChild(this.dialog);
      this.dialog = null;
    }
  }
}
