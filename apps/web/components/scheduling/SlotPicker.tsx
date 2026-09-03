"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarClock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/dashboard/widgets";
import {
  FACILITY_TZ,
  TIMEZONE_OPTIONS,
  formatFacilitySlot,
  groupSlotsByDay,
  shiftTimeLabel
} from "@/lib/slots";
import type { Practitioner } from "@/lib/careRepository";

export interface SlotSelection {
  /** Canonical facility-local slot string for booking storage. */
  slot: string;
  /** Human summary, e.g. "Friday, Sep 18 at 10:30 AM ET (4:30 PM CAT)". */
  displayLabel: string;
  timezone: string;
}

interface SlotPickerProps {
  practitioner: Practitioner;
  onSelect: (selection: SlotSelection) => void;
}

/**
 * Calendly-style availability picker: month calendar with highlighted open
 * days, per-day time buttons, timezone-aware display, and a gated Continue.
 * Times are stored facility-local (ET); other zones only relabel display.
 */
function SlotPicker({ practitioner, onSelect }: SlotPickerProps) {
  const days = React.useMemo(() => groupSlotsByDay(practitioner.availableSlots), [practitioner]);
  const availableDates = React.useMemo(() => days.map((d) => d.date), [days]);

  const [month, setMonth] = React.useState<Date>(() => days[0]?.date ?? new Date());
  const [dayKey, setDayKey] = React.useState<string | null>(() => days[0]?.dayKey ?? null);
  const [timeLabel, setTimeLabel] = React.useState<string | null>(null);
  const [timezone, setTimezone] = React.useState<string>(FACILITY_TZ);

  const activeDay = days.find((d) => d.dayKey === dayKey) ?? null;
  const tz = TIMEZONE_OPTIONS.find((t) => t.value === timezone) ?? TIMEZONE_OPTIONS[0];

  const pickDay = (date: Date | undefined) => {
    if (!date) return;
    const key = format(date, "yyyy-MM-dd");
    if (!days.some((d) => d.dayKey === key)) return;
    setDayKey(key);
    setTimeLabel(null);
  };

  const goToday = () => setMonth(new Date());

  const selection: SlotSelection | null =
    activeDay && timeLabel
      ? (() => {
          const facilitySlot = formatFacilitySlot(activeDay.date, timeLabel);
          const shifted =
            tz.offsetMinutes === 0
              ? null
              : shiftTimeLabel(
                  activeDay.slots.find((s) => s.timeLabel === timeLabel)?.minutes ?? 0,
                  tz.offsetMinutes
                );
          return {
            slot: facilitySlot,
            displayLabel:
              shifted && shifted.label !== timeLabel
                ? `${activeDay.dayLabel} at ${timeLabel} ET (${shifted.label} ${timezone}${shifted.dayShift !== 0 ? (shifted.dayShift > 0 ? ", next day" : ", prev day") : ""})`
                : `${activeDay.dayLabel} at ${timeLabel} ET`,
            timezone
          };
        })()
      : null;

  if (days.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No open slots published"
        description={`${practitioner.name} has not published availability yet. Try another provider or check back soon.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        {/* Month calendar */}
        <div className="rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-end px-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToday}>
              Today
            </Button>
          </div>
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={activeDay?.date}
            onSelect={pickDay}
            labels={{ labelDay: (day) => format(day, "EEEE, MMMM do, yyyy") }}
            modifiers={{ available: availableDates }}
            modifiersClassNames={{
              available: "bg-sky-100 text-sky-800 font-bold hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-200"
            }}
            disabled={(date) => !availableDates.some((d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))}
          />
          <p className="px-1 pt-1 text-[11px] text-muted-foreground">
            Highlighted days have verified open slots with your accommodations.
          </p>
        </div>

        {/* Day schedule */}
        <div className="flex flex-col rounded-xl border p-3">
          <div className="pb-2 text-sm font-semibold" aria-live="polite">
            {activeDay ? activeDay.dayLabel : "Pick a day"}
          </div>
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-0.5" role="group" aria-label="Available times">
            {activeDay ? (
              activeDay.slots.map((slot) => {
                const shifted = shiftTimeLabel(slot.minutes, tz.offsetMinutes);
                const active = timeLabel === slot.timeLabel;
                return (
                  <button
                    key={slot.timeLabel}
                    aria-pressed={active}
                    onClick={() => setTimeLabel(slot.timeLabel)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                        : "border-input bg-background hover:border-sky-400 hover:bg-sky-500/5"
                    )}
                  >
                    {shifted.label}
                    {tz.offsetMinutes !== 0 && shifted.label !== slot.timeLabel && (
                      <span className={cn("block text-[11px] font-normal", active ? "text-sky-100" : "text-muted-foreground")}>
                        {slot.timeLabel} ET{shifted.dayShift !== 0 ? (shifted.dayShift > 0 ? " · next day" : " · prev day") : ""}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Select a highlighted day to see times.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timezone + continue */}
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <Label htmlFor="slot-timezone">Display timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="slot-timezone" className="w-64">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Bookings are stored in facility-local time (ET).
          </p>
        </div>
        <Button size="lg" disabled={!selection} onClick={() => selection && onSelect(selection)}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export { SlotPicker };
