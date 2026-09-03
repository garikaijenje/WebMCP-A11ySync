import {
  Accessibility,
  Building2,
  LayoutDashboard,
  Pill,
  Stethoscope,
  type LucideIcon
} from "lucide-react";

export type CareView = "dashboard" | "triage" | "medications" | "clinics" | "accommodations";

export interface NavItem {
  id: CareView;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    title: "Care Overview",
    description: "Appointments, vitals and refill status at a glance",
    icon: LayoutDashboard
  },
  {
    id: "triage",
    title: "Symptom Triage",
    description: "Clinical assessment matched to triage protocols",
    icon: Stethoscope
  },
  {
    id: "medications",
    title: "Medications",
    description: "Prescriptions and pharmacy refill orders",
    icon: Pill
  },
  {
    id: "clinics",
    title: "Providers",
    description: "Accessible in-network clinics and booking",
    icon: Building2
  },
  {
    id: "accommodations",
    title: "Accessibility",
    description: "Permanent chart accommodations",
    icon: Accessibility
  }
];

export const BODY_REGION_OPTIONS = [
  { value: "Left Knee & Lower Extremity", label: "Left Knee & Lower Extremity", hint: "Orthopedic" },
  { value: "Respiratory / Chest", label: "Respiratory / Chest", hint: "Pulmonology" },
  { value: "Head / Neurological", label: "Head / Neurological", hint: "Neurology" },
  { value: "General / Systemic", label: "General / Systemic", hint: "Internal medicine" }
];

export const URGENCY_OPTIONS = [
  { value: "ROUTINE", label: "Routine", hint: "Within 5–7 days" },
  { value: "URGENT", label: "Urgent", hint: "Within 24–48 hrs" },
  { value: "EMERGENCY", label: "Emergency", hint: "Immediate" }
] as const;

export const SPECIALTY_OPTIONS = [
  { value: "Orthopedic", label: "Orthopedic", hint: "Physical therapy" },
  { value: "Physical Medicine", label: "Physical Medicine", hint: "Rehabilitation" },
  { value: "Pulmonology", label: "Pulmonology", hint: "Asthma care" },
  { value: "Cardiology", label: "Cardiology", hint: "Heart care" },
  { value: "Neurology", label: "Neurology", hint: "Nervous system" },
  { value: "Dermatology", label: "Dermatology", hint: "Skin care" },
  { value: "Pediatrics", label: "Pediatrics", hint: "Children's care" }
];

export const ACCOMMODATION_OPTIONS = [
  { value: "Wheelchair Step-Free", label: "Wheelchair Step-Free", hint: "Ramps & wide corridors" },
  { value: "Sensory Quiet Room", label: "Sensory Quiet Room", hint: "Low stimulation" },
  { value: "Braille", label: "Braille & Tactile", hint: "Wayfinding" },
  { value: "ASL Interpreter", label: "ASL Interpreter", hint: "On-site signing" },
  { value: "Oxygen Equipment", label: "Oxygen Equipment", hint: "Respiratory ready" },
  { value: "Quiet Examination", label: "Quiet Examination", hint: "Suites" }
];

export const PHARMACY_OPTIONS = [
  {
    value: "memorial-outpatient-pharmacy",
    label: "Memorial Outpatient Pharmacy",
    hint: "Main Campus, Level 1"
  },
  { value: "cvs-4102", label: "CVS Pharmacy #4102", hint: "2.1 miles away" },
  { value: "westside-pharmacy", label: "Westside Clinic Pharmacy", hint: "Building C" }
];

export const PHARMACY_NAMES: Record<string, string> = {
  "memorial-outpatient-pharmacy": "Memorial Health Outpatient Pharmacy (Main Campus, Level 1)",
  "cvs-4102": "CVS Pharmacy #4102 (West End Blvd)",
  "westside-pharmacy": "Westside Clinic Pharmacy (Building C)"
};
