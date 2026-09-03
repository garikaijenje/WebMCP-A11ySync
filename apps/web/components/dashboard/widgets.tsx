import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

export function PageHeading({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "sky",
  onClick
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  tone?: "sky" | "emerald" | "amber" | "rose" | "indigo";
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
  };
  const inner = (
    <>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-[13px] font-medium">{label}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </>
  );
  return (
    <Card className={cn(onClick && "cursor-pointer transition-shadow hover:shadow-md")}>
      <CardContent className="p-5">
        {onClick ? (
          <button onClick={onClick} className="block w-full text-left" aria-label={`${label}: ${value}. ${sub}`}>
            {inner}
          </button>
        ) : (
          inner
        )}
      </CardContent>
    </Card>
  );
}

export function StatSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <p className="max-w-sm text-[13px] text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ListEmptyIcon() {
  return <Inbox className="h-5 w-5" aria-hidden="true" />;
}
