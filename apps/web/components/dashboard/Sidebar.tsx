"use client";

import { Database, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NAV_ITEMS, type CareView } from "@/components/dashboard/nav";

interface SidebarProps {
  activeTab: CareView;
  onNavigate: (tab: CareView) => void;
  appointmentCount: number;
  refillDueCount: number;
  isCloudActive: boolean;
  trojanEnabled: boolean;
  shortcutA: string;
  shortcutD: string;
}

export function Sidebar({
  activeTab,
  onNavigate,
  appointmentCount,
  refillDueCount,
  isCloudActive,
  trojanEnabled,
  shortcutA,
  shortcutD
}: SidebarProps) {
  return (
    <aside
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-white dark:bg-slate-900 lg:flex"
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-sm">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight">CareNavigator</div>
          <div className="text-[11px] text-muted-foreground">Memorial Health System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Care sections">
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Patient portal
        </p>
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          const badge =
            item.id === "dashboard" && appointmentCount > 0
              ? appointmentCount
              : item.id === "medications" && refillDueCount > 0
                ? refillDueCount
                : null;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <item.icon
                className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-sky-600")}
                aria-hidden="true"
              />
              <span className="truncate">{item.title}</span>
              {badge !== null && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                    active ? "bg-white/25 text-white" : "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="space-y-2 border-t p-3 text-xs">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <Database
            className={cn("h-4 w-4 shrink-0", isCloudActive ? "text-emerald-500" : "text-amber-500")}
            aria-hidden="true"
          />
          <div className="leading-tight">
            <div className="font-semibold">{isCloudActive ? "Supabase Live" : "Offline cache"}</div>
            <div className="text-[11px] text-muted-foreground">
              {isCloudActive ? "Postgres connected" : "Waiting for database"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <Zap
            className={cn("h-4 w-4 shrink-0", trojanEnabled ? "text-emerald-500" : "text-slate-400")}
            aria-hidden="true"
          />
          <div className="leading-tight">
            <div className="font-semibold">A11ySync {trojanEnabled ? "On" : "Off"}</div>
            <div className="text-[11px] text-muted-foreground">
              Palette <kbd className="rounded bg-slate-200 px-1 font-mono dark:bg-slate-700">{shortcutA}</kbd>
              {" · "}Inspector{" "}
              <kbd className="rounded bg-slate-200 px-1 font-mono dark:bg-slate-700">{shortcutD}</kbd>
            </div>
          </div>
        </div>
        <div className="px-1 pt-1">
          <Badge variant="outline" className="text-[10px]">
            HIPAA-compliant portal
          </Badge>
        </div>
      </div>
    </aside>
  );
}
