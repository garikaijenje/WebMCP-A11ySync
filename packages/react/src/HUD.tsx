"use client";

import React from "react";
import { useA11ySync } from "./provider";

export const A11ySyncHUD: React.FC = () => {
  const { tools, speechEnabled, setSpeechEnabled, setIsDrawerOpen, telemetryLogs } = useA11ySync();

  const recentEvent = telemetryLogs[0];
  const isFlashing = recentEvent && (Date.now() - recentEvent.timestamp < 2000);

  return (
    <aside
      aria-label="WebMCP-A11ySync Ambient Runtime Status"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-sky-500/30 bg-slate-900/90 px-4 py-2 text-xs text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105"
      style={{
        boxShadow: isFlashing
          ? "0 0 20px 2px rgba(2, 132, 199, 0.6)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* Brand Icon & Status */}
      <div className="flex items-center gap-1.5 font-semibold text-sky-400">
        <span aria-hidden="true" className="text-sm">🛡️</span>
        <span>A11ySync</span>
      </div>

      <span className="text-slate-600">|</span>

      {/* Synced Tools Count */}
      <div className="flex items-center gap-1 text-emerald-400">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{tools.length} Tools Synced</span>
      </div>

      <span className="text-slate-600">|</span>

      {/* Audio Mute/Unmute Toggle */}
      <button
        type="button"
        onClick={() => setSpeechEnabled(!speechEnabled)}
        className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
        aria-label={speechEnabled ? "Mute screen reader speech synthesis" : "Unmute screen reader speech synthesis"}
      >
        <span aria-hidden="true">{speechEnabled ? "🎙️" : "🔇"}</span>
        <span>{speechEnabled ? "Audio ON" : "Muted"}</span>
      </button>

      <span className="text-slate-600">|</span>

      {/* Open Drawer Button */}
      <button
        type="button"
        onClick={() => setIsDrawerOpen((prev) => !prev)}
        className="rounded bg-sky-600 hover:bg-sky-500 px-2 py-0.5 font-medium text-white transition-colors cursor-pointer"
        aria-label="Inspect WebMCP-A11ySync Telemetry (Alt + D)"
      >
        Inspect (Alt+D)
      </button>
    </aside>
  );
};
