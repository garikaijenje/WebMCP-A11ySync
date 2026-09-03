/**
 * Coded accessibility accommodation catalogs for the patient chart.
 *
 * Sources: ADA hospital intake practice (Inova Special Needs Assessment),
 * Disability Equity Collaborative EHR documentation guidance, and CORADA
 * access-needs interviews — mobility / sensory / communication / support.
 *
 * Stored values are the exact option labels joined with ", " (plus an
 * optional free-text "Other" line), so charts stay human-readable in
 * Postgres while the UI works from stable codes.
 */

export interface AccommodationOption {
  value: string;
  label: string;
  hint: string;
}

export const MOBILITY_OPTIONS: AccommodationOption[] = [
  { value: "mob-wheelchair-ramp", label: "Wheelchair Step-Free Ramp & Wide Corridors", hint: "Step-free routes" },
  { value: "mob-wheelchair-escort", label: "Wheelchair escort to clinic room", hint: "Staff escort" },
  { value: "mob-extra-wide", label: "Extra-wide wheelchair / bariatric seating", hint: "Wide equipment" },
  { value: "mob-walking-escort", label: "Walking escort from entrance", hint: "Staff escort" },
  { value: "mob-transfer", label: "Transfer assistance onto exam table", hint: "Staff assist" },
  { value: "mob-adjustable-table", label: "Height-adjustable exam table", hint: "Adjustable" },
  { value: "mob-scale", label: "Accessible weight scale", hint: "Wheel-on scale" },
  { value: "mob-service-animal", label: "Service animal accommodation", hint: "Animal welcome" },
  { value: "mob-parking", label: "Accessible parking near entrance", hint: "Close parking" },
  { value: "mob-auto-doors", label: "Automatic doors & step-free entrances", hint: "Entrances" }
];

export const SENSORY_OPTIONS: AccommodationOption[] = [
  { value: "sen-quiet-room", label: "Low Sensory Stimulation & Quiet Waiting Room", hint: "Quiet room" },
  { value: "sen-lighting", label: "Dimmed / adjustable lighting", hint: "Lighting" },
  { value: "sen-private-wait", label: "Private / low-noise waiting area", hint: "Low noise" },
  { value: "sen-visual-paging", label: "Visual paging alerts (no overhead calls)", hint: "Visual alerts" },
  { value: "sen-fragrance", label: "Fragrance-free room request", hint: "No scents" },
  { value: "sen-large-print", label: "Large-print forms & signage", hint: "Large print" },
  { value: "sen-braille", label: "Braille documents on request", hint: "Braille" },
  { value: "sen-magnifier", label: "Magnifying sheet available", hint: "Magnifier" }
];

export const COMMUNICATION_OPTIONS: AccommodationOption[] = [
  { value: "com-screen-reader", label: "Screen Reader & Audible Verification Enabled", hint: "Screen reader" },
  { value: "com-asl-live", label: "ASL interpreter (in-person)", hint: "In-person ASL" },
  { value: "com-asl-vri", label: "ASL interpreter (video remote — VRI)", hint: "Video ASL" },
  { value: "com-spoken-interpreter", label: "Spoken language interpreter", hint: "Needs language ↓" },
  { value: "com-pocktalker", label: "Assistive listening device / PocketTalker", hint: "Amplifier" },
  { value: "com-amplified-phone", label: "Hearing-aid compatible / amplified phone", hint: "Amplified" },
  { value: "com-cart", label: "Live captioning (CART) for visits", hint: "Captions" },
  { value: "com-lip-reading", label: "Lip reading — face me when speaking", hint: "Face-to-face" },
  { value: "com-notepad", label: "Notepad & pen for written exchange", hint: "Write it down" },
  { value: "com-point-cards", label: "Point-to-speak communication cards", hint: "Point cards" },
  { value: "com-written-summary", label: "Written visit summaries", hint: "Take-home notes" },
  { value: "com-plain-language", label: "Plain-language explanations", hint: "Plain words" }
];

export const SUPPORT_OPTIONS: AccommodationOption[] = [
  { value: "sup-person", label: "Support Person Welcome & Extra Time", hint: "Bring someone" },
  { value: "sup-extra-time", label: "Extra time for appointments", hint: "Longer slots" },
  { value: "sup-step-by-step", label: "Step-by-step explanations", hint: "One step at a time" },
  { value: "sup-quiet-wait", label: "Quiet room while waiting for clinician", hint: "Wait in quiet" },
  { value: "sup-first-last", label: "First / last slot of day (shorter waits)", hint: "Edge slots" },
  { value: "sup-reminders", label: "Phone / text reminders", hint: "Reminders" },
  { value: "sup-forms-help", label: "Help with forms & check-in", hint: "Front-desk help" }
];

export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English", hint: "Default" },
  { value: "Spanish", label: "Spanish", hint: "Español" },
  { value: "Mandarin", label: "Mandarin", hint: "中文" },
  { value: "Arabic", label: "Arabic", hint: "العربية" },
  { value: "French", label: "French", hint: "Français" },
  { value: "Portuguese", label: "Portuguese", hint: "Português" },
  { value: "Russian", label: "Russian", hint: "Русский" },
  { value: "Hindi", label: "Hindi", hint: "हिन्दी" },
  { value: "Vietnamese", label: "Vietnamese", hint: "Tiếng Việt" },
  { value: "American Sign Language", label: "American Sign Language", hint: "ASL" }
];

export const LANGUAGE_PREFIX = "Preferred language: ";

export interface ParsedAccommodations {
  selected: string[];
  other: string;
  language: string;
}

/**
 * Splits a stored chart string back into checkbox selections, the
 * "Preferred language" line, and any free-text remainder.
 */
export function parseStoredAccommodations(
  stored: string | null | undefined,
  options: AccommodationOption[]
): ParsedAccommodations {
  const labels = new Set(options.map((o) => o.label));
  const selected: string[] = [];
  const otherParts: string[] = [];
  let language = "English";
  for (const part of (stored ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    if (labels.has(part)) {
      selected.push(options.find((o) => o.label === part)!.value);
    } else if (part.startsWith(LANGUAGE_PREFIX)) {
      const lang = part.slice(LANGUAGE_PREFIX.length).trim();
      if (lang) language = lang;
    } else {
      otherParts.push(part);
    }
  }
  return { selected, other: otherParts.join(", "), language };
}

/** Joins checkbox selections + language + free text into a chart string. */
export function composeAccommodationString(
  selectedValues: string[],
  options: AccommodationOption[],
  other: string,
  language?: string
): string {
  const labels = selectedValues
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter((l): l is string => Boolean(l));
  if (language && language !== "English") labels.push(`${LANGUAGE_PREFIX}${language}`);
  const extra = other.trim();
  if (extra) labels.push(extra);
  return labels.join(", ");
}

/** Whole years since dob (YYYY-MM-DD); null when unparseable. */
export function computeAge(dob: string | null | undefined, now: Date = new Date()): number | null {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age < 0 ? null : age;
}
