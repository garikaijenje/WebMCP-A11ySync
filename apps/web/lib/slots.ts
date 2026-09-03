import { format } from "date-fns";

export const SLOT_YEAR = 2026;
/** Facility-local baseline zone for stored slot strings. */
export const FACILITY_TZ = "ET";

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

export interface ParsedSlot {
  /** Original facility-local string, e.g. "Friday, Sep 18 at 10:30 AM" */
  raw: string;
  date: Date;
  dayKey: string;
  dayLabel: string;
  timeLabel: string;
  minutes: number;
}

/**
 * Parses practitioner availability strings ("Friday, Sep 18 at 10:30 AM")
 * into calendar-ready dates. Unparseable strings are skipped (never crash
 * the schedule view on dirty data).
 */
export function parseSlotString(raw: string, year: number = SLOT_YEAR): ParsedSlot | null {
  const parts = raw.split(" at ");
  if (parts.length !== 2) return null;
  const [datePart, timePart] = parts;
  const dateMatch = datePart.match(/([A-Za-z]+)\s+(\d{1,2})/);
  const timeMatch = timePart.trim().match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (!dateMatch || !timeMatch) return null;
  const month = MONTHS[dateMatch[1].toLowerCase()];
  if (month === undefined) return null;
  const day = Number.parseInt(dateMatch[2], 10);
  let hour = Number.parseInt(timeMatch[1], 10);
  const minute = Number.parseInt(timeMatch[2], 10);
  const meridiem = timeMatch[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const date = new Date(year, month, day, hour, minute);
  if (Number.isNaN(date.getTime())) return null;
  return {
    raw,
    date,
    dayKey: format(date, "yyyy-MM-dd"),
    dayLabel: format(date, "EEEE, MMMM d"),
    timeLabel: format(date, "h:mm a"),
    minutes: hour * 60 + minute
  };
}

export interface DaySchedule {
  dayKey: string;
  date: Date;
  dayLabel: string;
  slots: ParsedSlot[];
}

export function groupSlotsByDay(rawSlots: string[]): DaySchedule[] {
  const byDay = new Map<string, DaySchedule>();
  for (const raw of rawSlots) {
    const slot = parseSlotString(raw);
    if (!slot) continue;
    const existing = byDay.get(slot.dayKey);
    if (existing) {
      existing.slots.push(slot);
    } else {
      byDay.set(slot.dayKey, {
        dayKey: slot.dayKey,
        date: new Date(slot.date.getFullYear(), slot.date.getMonth(), slot.date.getDate()),
        dayLabel: slot.dayLabel,
        slots: [slot]
      });
    }
  }
  return [...byDay.values()]
    .map((d) => ({ ...d, slots: d.slots.sort((a, b) => a.minutes - b.minutes) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface TimezoneOption {
  value: string;
  label: string;
  /** Minutes to add to the facility-local (ET) time for display. */
  offsetMinutes: number;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "ET", label: "Eastern (ET) · facility time", offsetMinutes: 0 },
  { value: "CT", label: "Central (CT)", offsetMinutes: -60 },
  { value: "MT", label: "Mountain (MT)", offsetMinutes: -120 },
  { value: "PT", label: "Pacific (PT)", offsetMinutes: -180 },
  { value: "CAT", label: "Central Africa Time (CAT)", offsetMinutes: 360 }
];

/** Shift a facility-local time label for display in another zone. */
export function shiftTimeLabel(minutes: number, offsetMinutes: number): { label: string; dayShift: -1 | 0 | 1 } {
  let total = minutes + offsetMinutes;
  let dayShift: -1 | 0 | 1 = 0;
  if (total < 0) {
    total += 1440;
    dayShift = -1;
  } else if (total >= 1440) {
    total -= 1440;
    dayShift = 1;
  }
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { label: `${h12}:${String(m).padStart(2, "0")} ${suffix}`, dayShift };
}

/** Rebuild the canonical facility-local slot string for booking storage. */
export function formatFacilitySlot(date: Date, timeLabel: string): string {
  return `${format(date, "EEEE, MMM d")} at ${timeLabel}`;
}
