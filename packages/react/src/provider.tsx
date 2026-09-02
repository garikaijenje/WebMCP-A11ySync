"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  initA11ySync,
  A11ySyncEngine,
  ToolDefinition,
  A11ySyncTelemetryEvent,
  ATPersonaMode,
  A11ySyncOptions,
  AgentSimulator
} from "@a11ysync/core";

export interface A11ySyncContextValue {
  engine: A11ySyncEngine | null;
  tools: ToolDefinition[];
  telemetryLogs: A11ySyncTelemetryEvent[];
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  trojanEnabled: boolean;
  setTrojanEnabled: (enabled: boolean) => void;
  persona: ATPersonaMode;
  setPersona: (mode: ATPersonaMode) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  simulator: AgentSimulator | null;
}

const A11ySyncContext = createContext<A11ySyncContextValue | null>(null);

export interface A11ySyncProviderProps {
  children: React.ReactNode;
  options?: A11ySyncOptions;
}

export const A11ySyncProvider: React.FC<A11ySyncProviderProps> = ({ children, options }) => {
  const [engine, setEngine] = useState<A11ySyncEngine | null>(null);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<A11ySyncTelemetryEvent[]>([]);
  const [speechEnabled, setSpeechEnabledState] = useState<boolean>(options?.speechEnabled ?? true);
  const [trojanEnabled, setTrojanEnabledState] = useState<boolean>(options?.trojanSynthesizerEnabled ?? true);
  const [persona, setPersonaState] = useState<ATPersonaMode>(options?.personaMode ?? "standard");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const instance = initA11ySync({
      ...options,
      onTelemetry: (event) => {
        setTelemetryLogs((prev) => [event, ...prev].slice(0, 50));
        options?.onTelemetry?.(event);
      }
    });

    setEngine(instance);
    setTools(instance.getTools());

    // Update tools list on registrations
    const unsubscribe = instance.onTelemetry((event) => {
      if (event.type === "tool_registered") {
        setTools(instance.getTools());
      }
    });

    // Global keyboard shortcut for drawer (Alt + D on Windows/Linux, Option + D on macOS)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.altKey &&
        (e.key === "d" || e.key === "D" || e.key === "∂" || e.code === "KeyD")
      ) {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const setSpeechEnabled = (enabled: boolean) => {
    engine?.setSpeechEnabled(enabled);
    setSpeechEnabledState(enabled);
  };

  const setTrojanEnabled = (enabled: boolean) => {
    engine?.setTrojanSynthesizerEnabled(enabled);
    setTrojanEnabledState(enabled);
  };

  const setPersona = (mode: ATPersonaMode) => {
    engine?.setPersonaMode(mode);
    setPersonaState(mode);
  };

  const simulator = useMemo(() => engine ? engine.getSimulator() : null, [engine]);

  const value = useMemo<A11ySyncContextValue>(
    () => ({
      engine,
      tools,
      telemetryLogs,
      speechEnabled,
      setSpeechEnabled,
      trojanEnabled,
      setTrojanEnabled,
      persona,
      setPersona,
      isDrawerOpen,
      setIsDrawerOpen,
      simulator
    }),
    [engine, tools, telemetryLogs, speechEnabled, trojanEnabled, persona, isDrawerOpen, simulator]
  );

  return <A11ySyncContext.Provider value={value}>{children}</A11ySyncContext.Provider>;
};

export function useA11ySync(): A11ySyncContextValue {
  const context = useContext(A11ySyncContext);
  if (!context) {
    throw new Error("useA11ySync must be used within an <A11ySyncProvider>");
  }
  return context;
}
