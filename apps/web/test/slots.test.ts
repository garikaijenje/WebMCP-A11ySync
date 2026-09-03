import { describe, it, expect } from "vitest";
import {
  formatFacilitySlot,
  groupSlotsByDay,
  parseSlotString,
  shiftTimeLabel
} from "../lib/slots";

describe("slot string engine", () => {
  it("parses practitioner availability strings", () => {
    const slot = parseSlotString("Friday, Sep 18 at 10:30 AM");
    expect(slot).not.toBeNull();
    expect(slot?.dayKey).toBe("2026-09-18");
    expect(slot?.dayLabel).toBe("Friday, September 18");
    expect(slot?.timeLabel).toBe("10:30 AM");
    expect(slot?.minutes).toBe(630);
  });

  it("handles noon, midnight and PM conversion", () => {
    expect(parseSlotString("Monday, Sep 21 at 12:00 PM")?.minutes).toBe(720);
    expect(parseSlotString("Monday, Sep 21 at 12:00 AM")?.minutes).toBe(0);
    expect(parseSlotString("Monday, Sep 21 at 2:15 PM")?.minutes).toBe(14 * 60 + 15);
  });

  it("returns null for dirty data instead of crashing", () => {
    expect(parseSlotString("sometime soon")).toBeNull();
    expect(parseSlotString("Friday, Foo 99 at 10:30 AM")).toBeNull();
    expect(parseSlotString("Friday, Sep 18")).toBeNull();
  });

  it("groups slots by day in chronological order", () => {
    const days = groupSlotsByDay([
      "Monday, Sep 21 at 2:15 PM",
      "Friday, Sep 18 at 2:00 PM",
      "Friday, Sep 18 at 10:30 AM",
      "garbage row"
    ]);
    expect(days.map((d) => d.dayKey)).toEqual(["2026-09-18", "2026-09-21"]);
    expect(days[0].slots.map((s) => s.timeLabel)).toEqual(["10:30 AM", "2:00 PM"]);
  });

  it("shifts display times across zones with day rollover", () => {
    expect(shiftTimeLabel(630, 360)).toEqual({ label: "4:30 PM", dayShift: 0 });
    expect(shiftTimeLabel(630, -360)).toEqual({ label: "4:30 AM", dayShift: 0 });
    expect(shiftTimeLabel(23 * 60, 360)).toEqual({ label: "5:00 AM", dayShift: 1 });
    expect(shiftTimeLabel(60, -180)).toEqual({ label: "10:00 PM", dayShift: -1 });
  });

  it("rebuilds the canonical facility slot string", () => {
    expect(formatFacilitySlot(new Date(2026, 8, 18), "10:30 AM")).toBe("Friday, Sep 18 at 10:30 AM");
  });
});
