/**
 * WebMCP-A11ySync: Web Audio Earcon Synthesizer
 * Generates zero-dependency, low-latency auditory chimes for assistive telemetry.
 */

export type EarconType = "assertive" | "polite" | "tool" | "safestop" | "persona" | "switch_step";

export class EarconSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== "undefined";
    if (this.isBrowser) {
      // Auto-unlock AudioContext on first user interaction
      const unlock = () => {
        this.unlockContext();
        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("click", unlock, { passive: true });
      window.addEventListener("keydown", unlock, { passive: true });
    }
  }

  public unlockContext(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.isBrowser) return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        try {
          this.audioCtx = new AudioCtxClass();
        } catch {
          // Web Audio disabled or restricted
        }
      }
    }
    return this.audioCtx;
  }

  public play(type: EarconType): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case "safestop":
        case "assertive": {
          // Warning two-tone alert chime (D5 -> A5)
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }
        case "tool": {
          // Actuation blip
          osc.type = "triangle";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }
        case "persona": {
          // Harmonic ascending major chord (C5 -> E5 -> G5)
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.09);
          osc.frequency.setValueAtTime(783.99, now + 0.18);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }
        case "switch_step": {
          // Single switch click
          osc.type = "sine";
          osc.frequency.setValueAtTime(750, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
        case "polite":
        default: {
          // Gentle confirmation chime (A4 -> C#5)
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.12);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
          break;
        }
      }
    } catch {
      // Gracefully ignore audio errors in headless/restricted environments
    }
  }
}
