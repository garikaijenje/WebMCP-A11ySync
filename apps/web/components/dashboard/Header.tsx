"use client";

import * as React from "react";
import { ChevronRight, Pill, Search, Stethoscope } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { NAV_ITEMS, type CareView } from "@/components/dashboard/nav";
import { DisplaySettings } from "@/components/dashboard/DisplaySettings";
import type { PatientProfile, Practitioner, Prescription } from "@/lib/careRepository";

interface HeaderProps {
  activeTab: CareView;
  onNavigate: (tab: CareView) => void;
  patient: PatientProfile | null;
  isCloudActive: boolean;
  prescriptions: Prescription[];
  practitioners: Practitioner[];
}

export function Header({
  activeTab,
  onNavigate,
  patient,
  isCloudActive,
  prescriptions,
  practitioners
}: HeaderProps) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  // DisplaySettings owns theme/text/contrast/motion prefs and reports the
  // theme back for the sonner Toaster. Defaults render first (SSR-safe).
  const [dark, setDark] = React.useState(false);

  // Global ⌘K / Ctrl+K palette
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const view = NAV_ITEMS.find((n) => n.id === activeTab);

  const go = (tab: CareView) => {
    onNavigate(tab);
    setPaletteOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 text-xs font-bold text-white">
              CN
            </div>
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
            <span className="truncate font-medium text-muted-foreground">Memorial Health</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate font-semibold" aria-current="page">
              {view?.title ?? "Care Overview"}
            </span>
          </nav>

          <div className="flex-1" />

          {/* Command trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            className="hidden w-56 justify-start gap-2 text-muted-foreground md:flex"
            aria-label="Search records and actions (Command K)"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left text-[13px]">Search records…</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPaletteOpen(true)}
            className="md:hidden"
            aria-label="Search records and actions"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Connection */}
          <div
            title={isCloudActive ? "Connected to Supabase Postgres" : "Using offline clinical cache"}
            className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                  isCloudActive ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  isCloudActive ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </span>
            {isCloudActive ? "Live" : "Offline"}
          </div>

          {/* Display & readability (theme, text size, contrast, motion) */}
          <DisplaySettings onThemeChange={setDark} />

          {/* Patient */}
          <div className="flex items-center gap-2.5 border-l pl-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-[13px] font-semibold">
                {patient ? `${patient.firstName} ${patient.lastName}` : "Sarah Jenkins"}
              </div>
              <div className="text-[11px] text-muted-foreground">{patient?.mrn ?? "#MH-88291"}</div>
            </div>
            <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : "Sarah Jenkins"} size="sm" />
          </div>
        </div>

        {/* Mobile nav */}
        <nav aria-label="Care sections" className="border-t px-3 py-2 lg:hidden">
          <div className="flex gap-1.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={activeTab === item.id ? "page" : undefined}
                className={cn(
                  "flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium",
                  activeTab === item.id
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.title}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Global command palette */}
      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]" aria-label="Search and quick actions">
          <DialogHeader className="sr-only">
            <DialogTitle>Search records and actions</DialogTitle>
            <DialogDescription>Jump to a care section or a clinical record.</DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search sections, prescriptions, providers…" />
            <CommandList>
              <CommandEmpty>No matches found.</CommandEmpty>
              <CommandGroup heading="Sections">
                {NAV_ITEMS.map((item) => (
                  <CommandItem key={item.id} value={item.title} onSelect={() => go(item.id)}>
                    <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Prescriptions">
                {prescriptions.map((rx) => (
                  <CommandItem
                    key={rx.id}
                    value={rx.medicationName}
                    onSelect={() => go("medications")}
                  >
                    <Pill className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{rx.medicationName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{rx.status.replace("_", " ")}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Providers">
                {practitioners.slice(0, 6).map((doc) => (
                  <CommandItem key={doc.id} value={`${doc.name} ${doc.specialty}`} onSelect={() => go("clinics")}>
                    <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{doc.name}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">{doc.specialty}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <Toaster theme={dark ? "dark" : "light"} position="top-right" richColors closeButton />
    </>
  );
}
