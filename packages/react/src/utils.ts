/**
 * Platform and OS-aware assistive shortcut utilities
 */

export function isMacOS(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);
}

export function getPlatformShortcut(key: "A" | "D"): { modifier: string; symbol: string; label: string } {
  const mac = isMacOS();
  return {
    modifier: mac ? "Option" : "Alt",
    symbol: mac ? `⌥ + ${key}` : `Alt + ${key}`,
    label: mac ? `Option + ${key}` : `Alt + ${key}`
  };
}
