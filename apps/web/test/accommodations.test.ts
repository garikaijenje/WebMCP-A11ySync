import { describe, it, expect } from "vitest";
import {
  COMMUNICATION_OPTIONS,
  MOBILITY_OPTIONS,
  SUPPORT_OPTIONS,
  composeAccommodationString,
  computeAge,
  parseStoredAccommodations
} from "../components/dashboard/accommodations";

describe("accommodation catalogs", () => {
  it("round-trips seed chart strings through parse + compose", () => {
    const mobility = parseStoredAccommodations(
      "Wheelchair Step-Free Ramp & Wide Corridors",
      MOBILITY_OPTIONS
    );
    expect(mobility.selected).toEqual(["mob-wheelchair-ramp"]);
    expect(mobility.other).toBe("");
    expect(
      composeAccommodationString(mobility.selected, MOBILITY_OPTIONS, mobility.other)
    ).toBe("Wheelchair Step-Free Ramp & Wide Corridors");
  });

  it("splits unknown text into the Other field and keeps language", () => {
    const parsed = parseStoredAccommodations(
      "Screen Reader & Audible Verification Enabled, Preferred language: Spanish, Extra help please",
      COMMUNICATION_OPTIONS
    );
    expect(parsed.selected).toEqual(["com-screen-reader"]);
    expect(parsed.language).toBe("Spanish");
    expect(parsed.other).toBe("Extra help please");
    expect(
      composeAccommodationString(parsed.selected, COMMUNICATION_OPTIONS, parsed.other, parsed.language)
    ).toBe(
      "Screen Reader & Audible Verification Enabled, Preferred language: Spanish, Extra help please"
    );
  });

  it("omits the language line for English", () => {
    expect(composeAccommodationString(["sup-person"], SUPPORT_OPTIONS, "", "English")).toBe(
      "Support Person Welcome & Extra Time"
    );
  });

  it("computes whole-year ages from DOB", () => {
    expect(computeAge("1984-11-14", new Date("2026-09-03T12:00:00Z"))).toBe(41);
    expect(computeAge("1984-11-14", new Date("2026-11-14T12:00:00Z"))).toBe(42);
    expect(computeAge("not-a-date")).toBeNull();
    expect(computeAge("")).toBeNull();
  });
});
