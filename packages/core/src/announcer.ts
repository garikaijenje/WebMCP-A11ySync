/**
 * A11ySync Announcer: Sensory Live Region & Web Speech Engine
 * Coordinates WCAG aria-live polite and assertive alerts with audible speech telemetry.
 */

export interface AnnouncerOptions {
  speechEnabled?: boolean;
  speechVolume?: number;
  speechRate?: number;
}

export class SensoryAnnouncer {
  private assertiveRegion: HTMLElement | null = null;
  private politeRegion: HTMLElement | null = null;
  private speechEnabled: boolean;
  private speechVolume: number;
  private speechRate: number;
  private isBrowser: boolean;

  constructor(options: AnnouncerOptions = {}) {
    this.speechEnabled = options.speechEnabled ?? true;
    this.speechVolume = options.speechVolume ?? 1;
    this.speechRate = options.speechRate ?? 1.1;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (this.isBrowser) {
      this.ensureLiveRegions();
    }
  }

  /**
   * Initializes or reclaims persistent ARIA live regions in the document
   */
  public ensureLiveRegions(): void {
    if (!this.isBrowser) return;

    let assertive = document.getElementById("a11ysync-live-assertive");
    if (!assertive) {
      assertive = document.createElement("div");
      assertive.id = "a11ysync-live-assertive";
      assertive.setAttribute("aria-live", "assertive");
      assertive.setAttribute("aria-atomic", "true");
      assertive.setAttribute("role", "status");
      this.applyScreenReaderStyles(assertive);
      document.body.appendChild(assertive);
    }
    this.assertiveRegion = assertive;

    let polite = document.getElementById("a11ysync-live-polite");
    if (!polite) {
      polite = document.createElement("div");
      polite.id = "a11ysync-live-polite";
      polite.setAttribute("aria-live", "polite");
      polite.setAttribute("aria-atomic", "true");
      polite.setAttribute("role", "status");
      this.applyScreenReaderStyles(polite);
      document.body.appendChild(polite);
    }
    this.politeRegion = polite;
  }

  private applyScreenReaderStyles(el: HTMLElement): void {
    el.style.position = "absolute";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.padding = "0";
    el.style.margin = "-1px";
    el.style.overflow = "hidden";
    el.style.clip = "rect(0, 0, 0, 0)";
    el.style.whiteSpace = "nowrap";
    el.style.border = "0";
  }

  /**
   * Broadcasts an announcement to assistive technology and optional speech synthesis
   */
  public announce(message: string, urgency: "polite" | "assertive" = "assertive"): void {
    if (!this.isBrowser || !message) return;

    this.ensureLiveRegions();
    const targetRegion = urgency === "assertive" ? this.assertiveRegion : this.politeRegion;

    if (targetRegion) {
      // Clear and re-populate to ensure screen readers fire the mutation
      targetRegion.textContent = "";
      setTimeout(() => {
        if (targetRegion) {
          targetRegion.textContent = message;
        }
      }, 50);
    }

    if (this.speechEnabled && typeof window.speechSynthesis !== "undefined") {
      this.speakAudibly(message);
    }
  }

  private speakAudibly(message: string): void {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = this.speechVolume;
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Gracefully ignore audio errors in restricted/headless contexts
    }
  }

  public setSpeechEnabled(enabled: boolean): void {
    this.speechEnabled = enabled;
    if (!enabled && this.isBrowser && typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  public cleanup(): void {
    if (!this.isBrowser) return;
    if (this.assertiveRegion?.parentNode) {
      this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
    }
    if (this.politeRegion?.parentNode) {
      this.politeRegion.parentNode.removeChild(this.politeRegion);
    }
    if (typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }
}
