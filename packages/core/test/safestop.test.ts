// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SafeStopController } from "../src/safestop";
import { SensoryAnnouncer } from "../src/announcer";

describe("SafeStopController (Pillar 3: Accessible Safe-Stop Human Verification)", () => {
  let announcer: SensoryAnnouncer;
  let controller: SafeStopController;

  beforeEach(() => {
    document.body.innerHTML = "";
    // HTMLDialogElement mock in happy-dom if needed
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
      };
      HTMLDialogElement.prototype.close = function () {
        this.open = false;
      };
    }
    announcer = new SensoryAnnouncer({ speechEnabled: false });
    controller = new SafeStopController(announcer);
  });

  afterEach(() => {
    controller.cleanup();
    announcer.cleanup();
  });

  it("creates dialog element with role='alertdialog' and accessible labels", () => {
    const promptPromise = controller.promptVerification({
      toolName: "request_prescription_refill",
      toolDescription: "Submits medication refill",
      params: { medication: "Albuterol", dosage: "90mcg" }
    });

    const dialog = document.getElementById("a11ysync-safestop-dialog") as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("alertdialog");
    expect(dialog.open).toBe(true);

    // Simulate clicking confirm
    const confirmBtn = dialog.querySelector("#a11ysync-safestop-confirm") as HTMLButtonElement;
    confirmBtn.click();

    return promptPromise.then((result) => {
      expect(result.confirmed).toBe(true);
      expect(dialog.open).toBe(false);
    });
  });

  it("handles user cancellation cleanly", () => {
    const promptPromise = controller.promptVerification({
      toolName: "request_prescription_refill",
      toolDescription: "Submits medication refill",
      params: { medication: "Albuterol" }
    });

    const dialog = document.getElementById("a11ysync-safestop-dialog") as HTMLDialogElement;
    const cancelBtn = dialog.querySelector("#a11ysync-safestop-cancel") as HTMLButtonElement;
    cancelBtn.click();

    return promptPromise.then((result) => {
      expect(result.confirmed).toBe(false);
    });
  });
});
