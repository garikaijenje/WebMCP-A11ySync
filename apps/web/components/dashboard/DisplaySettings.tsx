"use client";

import * as React from "react";
import { Check, Contrast, Moon, Sun, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export type TextSize = "standard" | "large" | "xl";

const TEXT_SIZES: Array<{ value: TextSize; label: string; hint: string; scale: string }> = [
  { value: "standard", label: "Standard", hint: "100%", scale: "100%" },
  { value: "large", label: "Large", hint: "113%", scale: "112.5%" },
  { value: "xl", label: "Extra large", hint: "125%", scale: "125%" }
];

function read(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Display & readability settings for seniors, low-vision and
 * contrast-sensitive users: text scaling to 125%, high-contrast theme,
 * reduced motion, and light/dark mode. Persisted locally, applied to <html>
 * so every rem-based component (and OS text scaling) composes correctly.
 */
export function DisplaySettings({ onThemeChange }: { onThemeChange: (dark: boolean) => void }) {
  const [open, setOpen] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  const [textSize, setTextSize] = React.useState<TextSize>("standard");
  const [contrast, setContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Hydrate persisted prefs after mount (SSR renders defaults → no mismatch)
  React.useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const storedDark = read("carenav-theme", prefersDark ? "dark" : "light") === "dark";
    const storedSize = read("carenav-text-size", "standard");
    const storedContrast = read("carenav-contrast", "off") === "high";
    const storedMotion =
      read("carenav-motion", "full") === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const validSize: TextSize =
      storedSize === "large" || storedSize === "xl" ? storedSize : "standard";
    setDark(storedDark);
    setTextSize(validSize);
    setContrast(storedContrast);
    setReducedMotion(storedMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.fontSize = TEXT_SIZES.find((t) => t.value === textSize)?.scale ?? "100%";
    root.dataset.contrast = contrast ? "high" : "standard";
    root.dataset.motion = reducedMotion ? "reduced" : "full";
    try {
      window.localStorage.setItem("carenav-theme", dark ? "dark" : "light");
      window.localStorage.setItem("carenav-text-size", textSize);
      window.localStorage.setItem("carenav-contrast", contrast ? "high" : "off");
      window.localStorage.setItem("carenav-motion", reducedMotion ? "reduced" : "full");
    } catch {
      /* private mode — settings apply for this session only */
    }
    onThemeChange(dark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, textSize, contrast, reducedMotion]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Display and readability settings" aria-expanded={open}>
          <Type className="h-[18px] w-[18px]" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end" aria-label="Display and readability settings">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold">Display &amp; readability</div>
            <p className="text-xs text-muted-foreground">Larger text and stronger contrast stay on this device.</p>
          </div>

          <div className="space-y-1.5">
            <Label id="text-size-label">Text size</Label>
            <div role="group" aria-labelledby="text-size-label" className="grid grid-cols-3 gap-1.5">
              {TEXT_SIZES.map((t) => (
                <button
                  key={t.value}
                  aria-pressed={textSize === t.value}
                  onClick={() => setTextSize(t.value)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-center transition-colors",
                    textSize === t.value
                      ? "border-sky-500 bg-sky-500/10 font-semibold"
                      : "border-input hover:border-sky-300"
                  )}
                >
                  <span className={cn(t.value === "large" && "text-base", t.value === "xl" && "text-lg", "block")}>
                    Ag
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <ToggleRow
            icon={dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            title="Dark mode"
            description="Lower glare in dim rooms"
            active={dark}
            onToggle={() => setDark((v) => !v)}
          />
          <ToggleRow
            icon={<Contrast className="h-4 w-4" aria-hidden="true" />}
            title="High contrast"
            description="Stronger text and borders"
            active={contrast}
            onToggle={() => setContrast((v) => !v)}
          />
          <ToggleRow
            icon={<Check className="h-4 w-4" aria-hidden="true" />}
            title="Reduce motion"
            description="Minimise animations"
            active={reducedMotion}
            onToggle={() => setReducedMotion((v) => !v)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  active,
  onToggle
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 leading-tight">
        <div className="text-[13px] font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={active}
        aria-label={title}
        onClick={onToggle}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          active ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-600"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            active ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
