"use client";

import { useEffect, useState } from "react";
import {
  getPlatformShortcut,
  SSR_SHORTCUT_FALLBACK,
  type PlatformShortcut
} from "./utils";

/**
 * Returns the platform shortcut label, SSR-safe: the first render (and all
 * server renders) use the stable fallback so hydration matches on every OS;
 * the client value applies after mount.
 */
export function usePlatformShortcut(key: "A" | "D"): PlatformShortcut {
  const [shortcut, setShortcut] = useState<PlatformShortcut>(SSR_SHORTCUT_FALLBACK[key]);
  useEffect(() => {
    setShortcut(getPlatformShortcut(key));
  }, [key]);
  return shortcut;
}
