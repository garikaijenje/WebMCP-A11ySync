/**
 * A11ySync Announcer: Sensory Live Region & Web Speech Engine
 * Coordinates WCAG aria-live polite and assertive alerts with audible speech telemetry and Web Audio earcons.
 */

import { EarconSynthesizer, EarconType } from "./earcon";

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
  private earconSynthesizer: EarconSynthesizer;
  private onAnnouncementListeners: Set<(message: string, urgency: "polite" | "assertive") => void> = new Set();

  constructor(options: AnnouncerOptions = {}) {
    this.speechEnabled = options.speechEnabled ?? true;
    this.speechVolume = options.speechVolume ?? 1;
    this.speechRate = options.speechRate ?? 1.05;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    this.earconSynthesizer = new EarconSynthesizer();

    if (this.isBrowser) {
      this.ensureLiveRegions();
      // Pre-warm voices on browsers where getVoices() loads asynchronously
      if (typeof window.speechSynthesis !== "undefined") {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        }
      }
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
   * Broadcasts an announcement to assistive technology, visual captions, earcons, and speech synthesis
   */
  public announce(message: string, urgency: "polite" | "assertive" = "assertive"): void {
    if (!this.isBrowser || !message) return;

    this.ensureLiveRegions();
    const targetRegion = urgency === "assertive" ? this.assertiveRegion : this.politeRegion;

    if (targetRegion) {
      // Clear and re-populate to ensure screen readers detect the mutation
      targetRegion.textContent = "";
      setTimeout(() => {
        if (targetRegion) {
          targetRegion.textContent = message;
        }
      }, 50);
    }

    // Broadcast to UI visual caption subscribers (for virtual screen reader captions)
    this.onAnnouncementListeners.forEach((listener) => {
      try {
        listener(message, urgency);
      } catch {
        // Suppress listener error
      }
    });

    // 1. Play Web Audio earcon chime
    if (this.speechEnabled) {
      this.earconSynthesizer.play(urgency === "assertive" ? "assertive" : "polite");
    }

    // 2. Audible speech telemetry
    if (this.speechEnabled && typeof window.speechSynthesis !== "undefined") {
      this.speakAudibly(message);
    }
  }

  public playEarcon(type: EarconType): void {
    this.earconSynthesizer.play(type);
  }

  public onAnnouncement(listener: (message: string, urgency: "polite" | "assertive") => void): () => void {
    this.onAnnouncementListeners.add(listener);
    return () => {
      this.onAnnouncementListeners.delete(listener);
    };
  }

  private speakTimeout: ReturnType<typeof setTimeout> | null = null;

  public testSound(): void {
    this.earconSynthesizer.unlockContext();
    this.earconSynthesizer.play("persona");
    if (typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined") {
      this.speakAudibly("A11ySync sound and speech telemetry operational.");
    }
  }

  private speakAudibly(message: string): void {
    try {
      if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") return;

      const synth = window.speechSynthesis;

      // Resume if engine paused
      if (synth.paused) {
        synth.resume();
      }

      const executeSpeak = () => {
        try {
          if (synth.paused) {
            synth.resume();
          }

          const utterance = new SpeechSynthesisUtterance(message);
          utterance.volume = 1.0;
          utterance.rate = this.speechRate || 1.0;
          utterance.pitch = 1.0;
          utterance.lang = "en-US";

          // Retain reference on window to defeat Chromium V8 garbage collection bug
          const win = window as unknown as { _a11ysync_utterances?: SpeechSynthesisUtterance[] };
          win._a11ysync_utterances = win._a11ysync_utterances || [];
          win._a11ysync_utterances.push(utterance);

          const cleanup = () => {
            if (win._a11ysync_utterances) {
              const idx = win._a11ysync_utterances.indexOf(utterance);
              if (idx !== -1) win._a11ysync_utterances.splice(idx, 1);
            }
          };
          utterance.onend = cleanup;
          utterance.onerror = (e) => {
            console.warn("[A11ySync] Speech error:", e);
            cleanup();
          };

          synth.speak(utterance);
        } catch (err) {
          console.warn("[A11ySync] Speech execution error:", err);
        }
      };

      // In Chrome: NEVER call cancel() immediately before speak() on the same tick!
      // If already speaking, cancel and delay 120ms to allow audio backend teardown
      if (synth.speaking) {
        synth.cancel();
        if (this.speakTimeout) clearTimeout(this.speakTimeout);
        this.speakTimeout = setTimeout(executeSpeak, 120);
      } else {
        executeSpeak();
      }
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
    this.onAnnouncementListeners.clear();
  }
}
