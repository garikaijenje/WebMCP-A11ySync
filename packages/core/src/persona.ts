/**
 * WebMCP-A11ySync: Multi-Modal Assistive Persona Controller
 * Dynamically applies assistive technology adaptations, visual styling overlays,
 * live screen reader captioning, and single-switch sequential scanning.
 */

import { ATPersonaMode } from "./types";
import { SensoryAnnouncer } from "./announcer";

export class PersonaController {
  private announcer: SensoryAnnouncer;
  private currentMode: ATPersonaMode = "standard";
  private isBrowser: boolean;
  private switchIndex: number = -1;
  private switchListener?: (e: KeyboardEvent) => void;
  private personaBadge: HTMLElement | null = null;
  private switchHelperBanner: HTMLElement | null = null;

  constructor(announcer: SensoryAnnouncer) {
    this.announcer = announcer;
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (this.isBrowser) {
      this.ensureStyles();
    }
  }

  public getMode(): ATPersonaMode {
    return this.currentMode;
  }

  public setMode(mode: ATPersonaMode): void {
    this.currentMode = mode;
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.setAttribute("data-a11ysync-persona", mode);
    document.body.setAttribute("data-a11ysync-persona", mode);

    // Clean up previous mode specific listeners / banners
    this.cleanupCurrentMode();

    switch (mode) {
      case "screen-reader":
        this.announcer.setSpeechEnabled(true);
        this.showPersonaBadge("Screen Reader Persona", "Audible Speech Telemetry & Voice Active", "indigo");
        this.announcer.playEarcon("persona");
        this.announcer.announce("Screen reader audio mode active. Real-time audible speech telemetry enabled.", "assertive");
        break;

      case "low-vision":
        this.showPersonaBadge("Low-Vision Persona", "High-Contrast Yellow Focus Rings & 115% Text Magnification", "amber");
        this.announcer.playEarcon("persona");
        this.announcer.announce("High-contrast and enhanced focus boundaries enabled.", "polite");
        break;

      case "single-switch":
        this.showPersonaBadge("Single-Switch Motor Assist", "Press SPACE to Scan Interactive Elements, ENTER to Activate", "emerald");
        this.setupSingleSwitchScanner();
        this.announcer.playEarcon("persona");
        this.announcer.announce("Single-switch scanning mode active. Press Space to cycle interactive elements.", "polite");
        break;

      case "cognitive":
        this.showPersonaBadge("Cognitive Focus Mode", "Animations Silenced & Distraction-Free High-Legibility Layout", "purple");
        this.announcer.playEarcon("persona");
        this.announcer.announce("Cognitive focus mode active. Visual distractions and animations silenced.", "polite");
        break;

      case "standard":
      default:
        this.hidePersonaBadge();
        this.announcer.playEarcon("polite");
        this.announcer.announce("Standard user mode restored.", "polite");
        break;
    }
  }

  private cleanupCurrentMode(): void {
    // Remove switch keyboard listener
    if (this.switchListener) {
      window.removeEventListener("keydown", this.switchListener);
      this.switchListener = undefined;
    }
    // Remove switch scanner outline
    document.querySelectorAll(".a11ysync-switch-active").forEach((el) => {
      el.classList.remove("a11ysync-switch-active");
    });
    this.switchIndex = -1;
  }

  private setupSingleSwitchScanner(): void {
    this.switchIndex = -1;

    this.switchListener = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "searchbox")
      ) {
        return;
      }

      // Space key acts as switch step
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        const actionableElements = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [role="button"], [tabindex="0"], #refill-trigger'
          )
        ).filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
        });

        if (actionableElements.length === 0) return;

        // Clear previous highlight
        document.querySelectorAll(".a11ysync-switch-active").forEach((el) => {
          el.classList.remove("a11ysync-switch-active");
        });

        this.switchIndex = (this.switchIndex + 1) % actionableElements.length;
        const currentElement = actionableElements[this.switchIndex];

        currentElement.classList.add("a11ysync-switch-active");
        currentElement.focus();
        currentElement.scrollIntoView({ behavior: "smooth", block: "center" });

        this.announcer.playEarcon("switch_step");
      }
    };

    window.addEventListener("keydown", this.switchListener);
  }

  private showPersonaBadge(title: string, subtitle: string, color: "indigo" | "amber" | "emerald" | "purple"): void {
    let badge = document.getElementById("a11ysync-persona-banner");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "a11ysync-persona-banner";
      document.body.appendChild(badge);
    }

    const colorClasses = {
      indigo: "bg-indigo-950/90 border-indigo-500 text-indigo-100",
      amber: "bg-amber-950/90 border-amber-400 text-amber-100",
      emerald: "bg-emerald-950/90 border-emerald-500 text-emerald-100",
      purple: "bg-purple-950/90 border-purple-500 text-purple-100"
    }[color];

    badge.className = `fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-full border shadow-xl backdrop-blur-md transition-all text-xs ${colorClasses}`;
    badge.innerHTML = `
      <span style="font-size: 14px;" aria-hidden="true">🛡️</span>
      <div>
        <strong style="font-weight: 700;">${title}</strong>
        <span style="opacity: 0.8; margin-left: 6px;">${subtitle}</span>
      </div>
      <button
        id="a11ysync-reset-persona-btn"
        type="button"
        style="margin-left: 8px; background: rgba(255,255,255,0.15); border: none; padding: 2px 8px; border-radius: 9999px; color: #fff; font-size: 10px; cursor: pointer;"
      >
        Reset Standard
      </button>
    `;

    const resetBtn = badge.querySelector<HTMLButtonElement>("#a11ysync-reset-persona-btn");
    if (resetBtn) {
      resetBtn.onclick = () => this.setMode("standard");
    }

    this.personaBadge = badge;
  }

  private hidePersonaBadge(): void {
    if (this.personaBadge?.parentNode) {
      this.personaBadge.parentNode.removeChild(this.personaBadge);
      this.personaBadge = null;
    }
  }

  private ensureStyles(): void {
    let style = document.getElementById("a11ysync-persona-styles");
    if (!style) {
      style = document.createElement("style");
      style.id = "a11ysync-persona-styles";
      style.textContent = `
        /* ========================================================================== */
        /* Multi-Modal Persona 1: Low-Vision High-Contrast & Magnification */
        /* ========================================================================== */
        [data-a11ysync-persona="low-vision"] {
          font-size: 110% !important;
          line-height: 1.6 !important;
        }

        [data-a11ysync-persona="low-vision"] button,
        [data-a11ysync-persona="low-vision"] a,
        [data-a11ysync-persona="low-vision"] input,
        [data-a11ysync-persona="low-vision"] select,
        [data-a11ysync-persona="low-vision"] [role="button"],
        [data-a11ysync-persona="low-vision"] [tabindex="0"] {
          border-width: 2px !important;
          font-weight: 700 !important;
        }

        [data-a11ysync-persona="low-vision"] *:focus-visible,
        [data-a11ysync-persona="low-vision"] button:focus-visible,
        [data-a11ysync-persona="low-vision"] input:focus-visible,
        [data-a11ysync-persona="low-vision"] [role="button"]:focus-visible,
        [data-a11ysync-persona="low-vision"] [tabindex="0"]:focus-visible {
          outline: 4px solid #facc15 !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.95), 0 0 20px #facc15 !important;
        }

        /* ========================================================================== */
        /* Multi-Modal Persona 2: Single-Switch Motor Scanning */
        /* ========================================================================== */
        .a11ysync-switch-active {
          outline: 4px solid #22c55e !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.9), 0 0 25px rgba(34, 197, 94, 0.8) !important;
          animation: a11ysync-switch-pulse 1s infinite alternate !important;
        }

        @keyframes a11ysync-switch-pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.03); }
        }

        /* ========================================================================== */
        /* Multi-Modal Persona 3: Cognitive Focus (Silenced Distractions) */
        /* ========================================================================== */
        [data-a11ysync-persona="cognitive"] * {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }

        [data-a11ysync-persona="cognitive"] body {
          letter-spacing: 0.025em !important;
          line-height: 1.75 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  public cleanup(): void {
    this.cleanupCurrentMode();
    this.hidePersonaBadge();
  }
}
