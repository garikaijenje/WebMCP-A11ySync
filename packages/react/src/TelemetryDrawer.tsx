"use client";

import React, { useState } from "react";
import { useA11ySync } from "./provider";
import { ATPersonaMode } from "@a11ysync/core";
import { getPlatformShortcut } from "./utils";

export const A11ySyncDrawer: React.FC = () => {
  const shortcut = getPlatformShortcut("D");
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    tools,
    telemetryLogs,
    trojanEnabled,
    setTrojanEnabled,
    speechEnabled,
    setSpeechEnabled,
    persona,
    setPersona,
    simulator,
    engine
  } = useA11ySync();

  const [activeTab, setActiveTab] = useState<"simulator" | "telemetry" | "trojan" | "personas">("simulator");
  const [simulationStatus, setSimulationStatus] = useState<string>("");

  if (!isDrawerOpen) return null;

  const handleSimulate = async (actionName: string, actionFn: () => Promise<unknown>) => {
    try {
      setSimulationStatus(`Running ${actionName}...`);
      await actionFn();
      setSimulationStatus(`Completed ${actionName}`);
    } catch (err) {
      setSimulationStatus(`Action cancelled or failed: ${(err as Error).message}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11ysync-drawer-title"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 animate-in slide-in-from-right duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🛡️</span>
          <div>
            <h2 id="a11ysync-drawer-title" className="text-base font-bold text-white">
               A11ySync Runtime Inspector
            </h2>
            <p className="text-xs text-slate-400">WebMCP Accessibility Bridge ({shortcut.label})</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Inspector Drawer"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "simulator" ? "border-sky-500 text-sky-400 font-semibold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Agent Simulator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("trojan")}
          className={`px-3 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "trojan" ? "border-sky-500 text-sky-400 font-semibold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Trojan Diff
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          className={`px-3 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "telemetry" ? "border-sky-500 text-sky-400 font-semibold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Live Telemetry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("personas")}
          className={`px-3 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "personas" ? "border-sky-500 text-sky-400 font-semibold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Personas
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
        {/* Tab 1: Agent Simulator */}
        {activeTab === "simulator" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-sky-400">One-Click Agent Evaluator</h3>
              <p className="text-xs text-slate-400 mt-1">
                Execute full WebMCP agent scenarios locally to test visual ghost cursors, audible speech, focus snap, and the Safe-Stop modal.
              </p>
            </div>

            {simulationStatus && (
              <div className="rounded-lg bg-sky-950/60 border border-sky-800/60 p-3 text-xs text-sky-200">
                {simulationStatus}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => simulator && handleSimulate("Triage Symptoms", () => simulator.simulateTriage())}
                className="w-full text-left rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-sky-500 transition-all cursor-pointer"
              >
                <div className="font-semibold text-white text-xs flex items-center justify-between">
                  <span>▶ Test 1: Triage Patient Symptoms</span>
                  <span className="text-[10px] text-sky-400">Standard</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Invokes triage_specialist tool, matches knee pain to Orthopedics, announces results.
                </p>
              </button>

              <button
                type="button"
                onClick={() => simulator && handleSimulate("Find Clinic", () => simulator.simulateFindClinic())}
                className="w-full text-left rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-sky-500 transition-all cursor-pointer"
              >
                <div className="font-semibold text-white text-xs flex items-center justify-between">
                  <span>▶ Test 2: Find Accessible Clinic</span>
                  <span className="text-[10px] text-sky-400">Accommodations</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Searches facilities with wheelchair access, sensory quiet rooms, and braille signage.
                </p>
              </button>

              <button
                type="button"
                onClick={() => simulator && handleSimulate("Prescription Refill", () => simulator.simulateRefill())}
                className="w-full text-left rounded-lg border border-amber-900/50 bg-amber-950/20 p-3 hover:border-amber-500 transition-all cursor-pointer"
              >
                <div className="font-semibold text-amber-300 text-xs flex items-center justify-between">
                  <span>⚠️ Test 3: Prescription Refill (Triggers Safe-Stop)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">High Stakes</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Suspends tool execution and opens native accessible dialog for Space/Enter confirm or Esc abort.
                </p>
              </button>

              <button
                type="button"
                onClick={() => simulator && handleSimulate("Confirm Booking", () => simulator.simulateConfirmBooking())}
                className="w-full text-left rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-sky-500 transition-all cursor-pointer"
              >
                <div className="font-semibold text-white text-xs flex items-center justify-between">
                  <span>▶ Test 4: Confirm Appointment Booking</span>
                  <span className="text-[10px] text-sky-400">Commit</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Locks clinical slot and moves focus to the confirmation banner.
                </p>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => engine?.getPalette().open()}
                className="w-full rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 text-xs transition-colors cursor-pointer"
              >
                Open Assistive Command Palette ({getPlatformShortcut("A").label})
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Trojan Diff Engine */}
        {activeTab === "trojan" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">The Trojan Horse Compiler</h3>
              <p className="text-xs text-slate-400 mt-1">
                Toggle A11ySync to hear and feel the difference between neglected legacy HTML and compiled ARIA semantics.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div>
                <div className="font-semibold text-white text-xs">A11ySync Compiler State</div>
                <div className="text-[11px] text-slate-400">
                  {trojanEnabled ? "Compiling WebMCP schemas into ARIA" : "Disabled (Raw Legacy HTML)"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrojanEnabled(!trojanEnabled)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  trojanEnabled
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-rose-600 text-white hover:bg-rose-500"
                }`}
              >
                {trojanEnabled ? "🟢 Synthesizer ON" : "🔴 Synthesizer OFF"}
              </button>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2 text-xs">
              <div className="font-semibold text-slate-300">What the Trojan Horse Patches:</div>
              <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                <li>Injects <code className="text-sky-300">role="button"</code> on dead unsemantic divs</li>
                <li>Injects <code className="text-sky-300">tabindex="0"</code> so Tab navigation works</li>
                <li>Extracts <code className="text-sky-300">aria-label</code> from tool descriptions</li>
                <li>Binds <code className="text-sky-300">Enter & Space</code> keydown listeners</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Live Telemetry */}
        {activeTab === "telemetry" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-sky-400">Sensory Telemetry Stream</h3>
              <button
                type="button"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                {speechEnabled ? "🎙️ Speech ON" : "🔇 Speech Muted"}
              </button>
            </div>

            {/* Direct Sound Test Bar */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-sky-800/60 bg-sky-950/30">
              <div className="text-xs">
                <span className="font-semibold text-sky-300">Auditory Earcons & Speech</span>
                <p className="text-[10px] text-slate-400">Plays Web Audio synthesizer chimes & spoken alerts</p>
              </div>
              <button
                type="button"
                onClick={() => engine?.testSound()}
                className="px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow"
              >
                🔊 Test Sound
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {telemetryLogs.map((log) => (
                <div key={log.id} className="rounded border border-slate-800/80 bg-slate-900/70 p-2 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-sky-400">{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 text-slate-200 text-[11px]">{log.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Multi-Modal Personas */}
        {activeTab === "personas" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-purple-400">Simulate Assistive Technology Personas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Experience how WebMCP-A11ySync adapts for different user disability requirements with live styling and behavior shifts.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: "standard",
                  name: "Standard User",
                  desc: "Default balanced UI with full agent actuation.",
                  tag: "Default"
                },
                {
                  id: "screen-reader",
                  name: "Screen Reader / Audio User",
                  desc: "Speaks all tool actions aloud in real time using screen reader voice and earcons.",
                  tag: "Spoken Audio"
                },
                {
                  id: "single-switch",
                  name: "Single-Switch / Motor Impaired",
                  desc: "Spacebar sequential element scanning with pulsing green highlight.",
                  tag: "Spacebar Scanner"
                },
                {
                  id: "low-vision",
                  name: "Low-Vision User",
                  desc: "High-contrast yellow focus rings, 110% text scaling, and thick borders.",
                  tag: "High Contrast"
                },
                {
                  id: "cognitive",
                  name: "Cognitive Load Ease",
                  desc: "Zero animations, reduced sensory clutter, and task-focused legibility.",
                  tag: "Calm & Focused"
                }
              ].map((p) => {
                const isSelected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id as ATPersonaMode)}
                    className={`w-full text-left rounded-lg p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-purple-500 bg-purple-950/40 text-white shadow-lg shadow-purple-950/50 ring-1 ring-purple-500"
                        : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-white">{p.name}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {p.tag}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-900/60 p-4 text-[11px] text-slate-500 flex justify-between items-center">
        <span>WebMCP W3C Incubated Standard</span>
        <span>CareNavigator v0.1</span>
      </div>
    </div>
  );
};
