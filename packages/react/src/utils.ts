/**
 * Platform and OS-aware assistive shortcut utilities
 */

export function isMacOS(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);
}

export interface PlatformShortcut {
  modifier: string;
  symbol: string;
  label: string;
}

export function getPlatformShortcut(key: "A" | "D"): PlatformShortcut {
  const mac = isMacOS();
  return {
    modifier: mac ? "Option" : "Alt",
    symbol: mac ? `⌥ + ${key}` : `Alt + ${key}`,
    label: mac ? `Option + ${key}` : `Alt + ${key}`
  };
}

/**
 * SSR-safe shortcut fallback: server and first client render agree on the
 * non-Mac label, so React hydration never mismatches across platforms.
 * Use inside components instead of calling getPlatformShortcut at render.
 */
export const SSR_SHORTCUT_FALLBACK: Record<"A" | "D", PlatformShortcut> = {
  A: { modifier: "Alt", symbol: "Alt + A", label: "Alt + A" },
  D: { modifier: "Alt", symbol: "Alt + D", label: "Alt + D" }
};
