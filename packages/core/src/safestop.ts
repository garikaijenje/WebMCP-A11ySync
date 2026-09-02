/**
 * WebMCP-A11ySync: Accessible Safe-Stop & Cancellation Engine
 * Implements native HTML5 <dialog> modal with showModal() for focus trapping,
 * plain-language parameter verification, and native AbortSignal integration.
 */

import { SensoryAnnouncer } from "./announcer";

export interface SafeStopRequest<TParams = Record<string, unknown>> {
  toolName: string;
  toolDescription: string;
  params: TParams;
  signal?: AbortSignal;
  humanActionLabel?: string;
}

export interface SafeStopConfirmationResult {
  confirmed: boolean;
  reason?: string;
}

export class SafeStopController {
  private dialog: HTMLDialogElement | null = null;
  private announcer: SensoryAnnouncer;
  private isBrowser: boolean;
  private previousActiveElement: HTMLElement | null = null;

  constructor(announcer: SensoryAnnouncer) {
    this.announcer = announcer;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  }

  /**
   * Prompts the user with an accessible modal dialog and suspends the tool Promise
   */
  public async promptVerification<TParams = Record<string, unknown>>(
    request: SafeStopRequest<TParams>
  ): Promise<SafeStopConfirmationResult> {
    if (!this.isBrowser) {
      return { confirmed: true };
    }

    // Check if the request was already aborted
    if (request.signal?.aborted) {
      return { confirmed: false, reason: "Aborted before prompt" };
    }

    this.previousActiveElement = document.activeElement as HTMLElement | null;

    return new Promise<SafeStopConfirmationResult>((resolve) => {
      const dialog = this.ensureDialogElement();
      this.populateDialog(dialog, request);

      let isResolved = false;

      const finish = (confirmed: boolean, reason?: string) => {
        if (isResolved) return;
        isResolved = true;

        cleanupAbortListener();
        dialog.close();

        // Announce resolution
        if (confirmed) {
          this.announcer.announce("Action confirmed by user. Proceeding with execution.", "assertive");
        } else {
          this.announcer.announce("Action cancelled by user. WebMCP execution aborted.", "assertive");
        }

        // Restore focus
        if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
          this.previousActiveElement.focus();
        }

        resolve({ confirmed, reason });
      };

      // Handle external AbortSignal cancellation
      const onAbort = () => finish(false, "Aborted via signal");
      if (request.signal) {
        request.signal.addEventListener("abort", onAbort, { once: true });
      }
      const cleanupAbortListener = () => {
        request.signal?.removeEventListener("abort", onAbort);
      };

      // Native dialog cancel event (fires on Escape key)
      dialog.oncancel = (e) => {
        e.preventDefault(); // Control closing cleanly
        finish(false, "Dismissed via Escape key");
      };

      // Confirm button
      const confirmBtn = dialog.querySelector<HTMLButtonElement>("#a11ysync-safestop-confirm");
      if (confirmBtn) {
        confirmBtn.onclick = () => finish(true);
      }

      // Abort button
      const cancelBtn = dialog.querySelector<HTMLButtonElement>("#a11ysync-safestop-cancel");
      if (cancelBtn) {
        cancelBtn.onclick = () => finish(false, "User clicked Cancel");
      }

      // Open natively with showModal() (creates inert top-layer and traps focus)
      dialog.showModal();

      // Set focus to the confirm button for keyboard navigation
      confirmBtn?.focus();

      // Announce the Safe-Stop prompt aloud
      const plainMessage = `Verification Required: Agent wants to execute ${request.humanActionLabel || request.toolName}. Review parameters and press Space to Confirm or Escape to Cancel.`;
      this.announcer.announce(plainMessage, "assertive");
    });
  }

  private ensureDialogElement(): HTMLDialogElement {
    let dialog = document.getElementById("a11ysync-safestop-dialog") as HTMLDialogElement | null;
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "a11ysync-safestop-dialog";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-labelledby", "a11ysync-safestop-title");
      dialog.setAttribute("aria-describedby", "a11ysync-safestop-description");
      this.applyDialogStyles(dialog);
      document.body.appendChild(dialog);
    }
    this.dialog = dialog;
    return dialog;
  }

  private populateDialog<TParams>(dialog: HTMLDialogElement, request: SafeStopRequest<TParams>): void {
    const formattedParams = JSON.stringify(request.params, null, 2);
    const actionHeading = request.humanActionLabel || `Execute Tool: ${request.toolName}`;

    dialog.innerHTML = `
      <div style="padding: 24px; max-width: 520px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 28px;" aria-hidden="true">🛡️</span>
          <div>
            <h2 id="a11ysync-safestop-title" style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a;">
              Accessible Safe-Stop Verification
            </h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">
              WebMCP Agent Action Intercepted
            </p>
          </div>
        </div>

        <div id="a11ysync-safestop-description" style="margin-bottom: 20px;">
          <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155; line-height: 1.5;">
            An autonomous agent is requesting to execute:
            <strong style="color: #0284c7; display: block; margin-top: 4px;">${actionHeading}</strong>
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
            ${request.toolDescription}
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 12px;">
            <span style="font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">
              Submitted Parameters:
            </span>
            <pre style="margin: 8px 0 0 0; font-size: 12px; color: #1e293b; overflow-x: auto; background: #ffffff; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1;"><code>${formattedParams}</code></pre>
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
          <button
            id="a11ysync-safestop-cancel"
            type="button"
            style="padding: 10px 18px; border-radius: 6px; border: 1px solid #cbd5e1; background: #ffffff; color: #475569; font-size: 14px; font-weight: 600; cursor: pointer;"
          >
            Cancel (Esc)
          </button>
          <button
            id="a11ysync-safestop-confirm"
            type="button"
            style="padding: 10px 20px; border-radius: 6px; border: none; background: #0284c7; color: #ffffff; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);"
          >
            Confirm & Execute (Space/Enter)
          </button>
        </div>
      </div>
    `;
  }

  private applyDialogStyles(dialog: HTMLDialogElement): void {
    dialog.style.border = "none";
    dialog.style.borderRadius = "12px";
    dialog.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    dialog.style.padding = "0";
    dialog.style.maxWidth = "90vw";
    dialog.style.backgroundColor = "#ffffff";
  }

  public cleanup(): void {
    if (!this.isBrowser) return;
    if (this.dialog && this.dialog.parentNode) {
      if (this.dialog.open) this.dialog.close();
      this.dialog.parentNode.removeChild(this.dialog);
      this.dialog = null;
    }
  }
}
