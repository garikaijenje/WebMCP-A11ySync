import { supabase, isSupabaseConfigured } from "./supabase";

export interface PatientProfile {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  primaryDoctor: string;
  insuranceProvider: string;
  accessibilityMobility: string;
  accessibilitySensory: string;
  accessibilityCommunication: string;
  allergies: string[];
}

export interface Practitioner {
  id: string;
  name: string;
  title: string;
  specialty: string;
  facilityName: string;
  facilityAddress: string;
  distance: string;
  accommodations: string[];
  availableSlots: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  doctorName: string;
  facilityName: string;
  appointmentDate: string;
  timeSlot: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  accommodationNotes?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicationName: string;
  strength: string;
  rxNumber: string;
  refillsRemaining: number;
  prescribedBy: string;
  pharmacyName: string;
  copay: string;
  status: "refill_due" | "active" | "in_transit";
  lastFilled: string;
}

export interface RefillOrder {
  id: string;
  prescriptionId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  pharmacyId: string;
  pharmacyName: string;
  status: "submitted" | "processing" | "ready";
  readyTime: string;
  copay: string;
  requestedAt: string;
}

export interface TriageAssessment {
  id: string;
  patientId: string;
  symptoms: string;
  bodyRegion: string;
  painLevel: number;
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY";
  recommendedSpecialty: string;
  clinicalAdvice: string;
  recommendedClinic: string;
  createdAt: string;
}

export interface PatientVitals {
  id: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  recordedAt: string;
}

export const DEFAULT_PATIENT_ID = "pt-sarah-jenkins";

// Initial clinical seed data (offline cache — mirrors supabase/migrations seed).
// Primary source of truth is Supabase Postgres; this cache is only used when
// Supabase is unconfigured or a query fails.
const initialPatient: PatientProfile = {
  id: "pt-sarah-jenkins",
  mrn: "#MH-88291",
  firstName: "Sarah",
  lastName: "Jenkins",
  dob: "1984-11-14",
  gender: "Female",
  primaryDoctor: "Dr. Elena Chen, MD (Internal Medicine)",
  insuranceProvider: "BlueCross BlueShield PPO (#BC-994120)",
  accessibilityMobility: "Wheelchair Step-Free Ramp & Wide Corridors",
  accessibilitySensory: "Low Sensory Stimulation & Quiet Waiting Room",
  accessibilityCommunication: "Screen Reader & Audible Verification Enabled",
  allergies: ["Penicillin (Severe Anaphylaxis)", "Latex (Mild Contact Dermatitis)"]
};

const initialPractitioners: Practitioner[] = [
  {
    id: "oakwood-rehab",
    name: "Dr. Marcus Vance, MD",
    title: "Board Certified Orthopedic Specialist",
    specialty: "Orthopedic Physical Therapy",
    facilityName: "Memorial Pavilion & Physical Rehabilitation",
    facilityAddress: "1200 Healthcare Way, Suite 4B, Metro",
    distance: "0.8 miles away",
    accommodations: ["Wheelchair Step-Free", "Sensory Quiet Room", "ASL Interpreter on site", "Braille Signage"],
    availableSlots: ["Friday, Sep 18 at 10:30 AM", "Friday, Sep 18 at 2:00 PM", "Monday, Sep 21 at 9:00 AM"]
  },
  {
    id: "westside-wellness",
    name: "Dr. Sarah Al-Mansoor, MD",
    title: "Chief of Physical Medicine",
    specialty: "Physical Medicine & Rehabilitation",
    facilityName: "Westside Orthopedic & Joint Wellness Center",
    facilityAddress: "840 West End Blvd, Building C",
    distance: "2.4 miles away",
    accommodations: ["Wheelchair Step-Free", "Braille & Tactile Wayfinding", "Quiet Examination Suites"],
    availableSlots: ["Monday, Sep 21 at 2:15 PM", "Tuesday, Sep 22 at 11:00 AM"]
  },
  {
    id: "memorial-pulmonary",
    name: "Dr. Aris Thorne, MD",
    title: "Pulmonologist & Respiratory Specialist",
    specialty: "Pulmonology & Asthma Care",
    facilityName: "Memorial Respiratory Care Center",
    facilityAddress: "1200 Healthcare Way, Suite 2A, Metro",
    distance: "0.8 miles away",
    accommodations: ["Wheelchair Step-Free", "Oxygen Equipment Ready", "Sensory Quiet Room"],
    availableSlots: ["Thursday, Sep 24 at 1:30 PM", "Friday, Sep 25 at 10:00 AM"]
  }
];

const initialAppointments: Appointment[] = [
  {
    id: "appt-init-01",
    patientId: "pt-sarah-jenkins",
    practitionerId: "oakwood-rehab",
    doctorName: "Dr. Marcus Vance, MD",
    facilityName: "Memorial Pavilion & Physical Rehabilitation",
    appointmentDate: "Friday, Sep 18, 2026",
    timeSlot: "10:30 AM",
    status: "confirmed",
    accommodationNotes: "Wheelchair Step-Free Ramp, 36\" Examination Table, Quiet Waiting Room",
    createdAt: new Date().toISOString()
  }
];

const initialPrescriptions: Prescription[] = [
  {
    id: "rx-albuterol",
    patientId: "pt-sarah-jenkins",
    medicationName: "Albuterol Sulfate HFA Inhalation Aerosol",
    strength: "90 mcg/actuation (200 Inhalations)",
    rxNumber: "RX-99210-4A",
    refillsRemaining: 1,
    prescribedBy: "Dr. Elena Chen, MD",
    pharmacyName: "Memorial Health Outpatient Pharmacy",
    copay: "$15.00",
    status: "refill_due",
    lastFilled: "2026-08-01"
  },
  {
    id: "rx-prednisone",
    patientId: "pt-sarah-jenkins",
    medicationName: "Prednisone Oral Tablets",
    strength: "20 mg (30-day oral taper)",
    rxNumber: "RX-88410-2B",
    refillsRemaining: 2,
    prescribedBy: "Dr. Elena Chen, MD",
    pharmacyName: "Memorial Health Outpatient Pharmacy",
    copay: "$8.00",
    status: "active",
    lastFilled: "2026-08-15"
  },
  {
    id: "rx-lisinopril",
    patientId: "pt-sarah-jenkins",
    medicationName: "Lisinopril Oral Tablets",
    strength: "10 mg (90-day maintenance)",
    rxNumber: "RX-77192-1C",
    refillsRemaining: 3,
    prescribedBy: "Dr. Elena Chen, MD",
    pharmacyName: "CVS Pharmacy #4102",
    copay: "$10.00",
    status: "active",
    lastFilled: "2026-07-10"
  }
];

const initialVitals: PatientVitals = {
  id: "vitals-latest",
  patientId: "pt-sarah-jenkins",
  bloodPressure: "118/76 mmHg",
  heartRate: 72,
  oxygenSaturation: 99,
  respiratoryRate: 16,
  recordedAt: "Today at 8:45 AM"
};

// Local offline cache (fallback only — DB is authoritative when configured)
let statePatient = { ...initialPatient };
let statePractitioners = [...initialPractitioners];
let stateAppointments = [...initialAppointments];
let statePrescriptions = [...initialPrescriptions];
let stateRefillOrders: RefillOrder[] = [];
let stateTriageAssessments: TriageAssessment[] = [];

// Supabase PostgREST rows are untyped JSON; Database types in database.types.ts
// keep queries type-safe at the call site, mappers normalize to app models.
type DbRow = Record<string, any>;

function mapPatient(row: DbRow): PatientProfile {
  return {
    id: row.id,
    mrn: row.mrn,
    firstName: row.first_name,
    lastName: row.last_name,
    dob: row.dob,
    gender: row.gender ?? "",
    primaryDoctor: row.primary_doctor,
    insuranceProvider: row.insurance_provider,
    accessibilityMobility: row.accessibility_mobility ?? "",
    accessibilitySensory: row.accessibility_sensory ?? "",
    accessibilityCommunication: row.accessibility_communication ?? "",
    allergies: row.allergies ?? []
  };
}

function mapPractitioner(row: DbRow): Practitioner {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    specialty: row.specialty,
    facilityName: row.facility_name,
    facilityAddress: row.facility_address,
    distance: row.distance,
    accommodations: row.accommodations ?? [],
    availableSlots: row.available_slots ?? []
  };
}

function mapAppointment(row: DbRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    practitionerId: row.practitioner_id ?? "",
    doctorName: row.doctor_name,
    facilityName: row.facility_name,
    appointmentDate: row.appointment_date,
    timeSlot: row.time_slot,
    status: row.status,
    accommodationNotes: row.accommodation_notes ?? undefined,
    createdAt: row.created_at
  };
}

function mapPrescription(row: DbRow): Prescription {
  return {
    id: row.id,
    patientId: row.patient_id,
    medicationName: row.medication_name,
    strength: row.strength,
    rxNumber: row.rx_number,
    refillsRemaining: row.refills_remaining ?? 0,
    prescribedBy: row.prescribed_by,
    pharmacyName: row.pharmacy_name,
    copay: row.copay,
    status: row.status,
    lastFilled: row.last_filled ?? ""
  };
}

function mapRefillOrder(row: DbRow): RefillOrder {
  return {
    id: row.id,
    prescriptionId: row.prescription_id,
    patientId: row.patient_id,
    medicationName: row.medication_name,
    dosage: row.dosage,
    pharmacyId: row.pharmacy_id,
    pharmacyName: row.pharmacy_name,
    status: row.status,
    readyTime: row.ready_time,
    copay: row.copay,
    requestedAt: row.requested_at
  };
}

function mapTriage(row: DbRow): TriageAssessment {
  return {
    id: row.id,
    patientId: row.patient_id,
    symptoms: row.symptoms,
    bodyRegion: row.body_region ?? "",
    painLevel: row.pain_level,
    urgency: row.urgency,
    recommendedSpecialty: row.recommended_specialty,
    clinicalAdvice: row.clinical_advice,
    recommendedClinic: row.recommended_clinic,
    createdAt: row.created_at
  };
}

function mapVitals(row: DbRow): PatientVitals {
  const recorded = row.recorded_at ? new Date(row.recorded_at) : new Date();
  const now = new Date();
  const sameDay = recorded.toDateString() === now.toDateString();
  const time = recorded.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return {
    id: row.id,
    patientId: row.patient_id,
    bloodPressure: row.blood_pressure,
    heartRate: row.heart_rate,
    oxygenSaturation: row.oxygen_saturation,
    respiratoryRate: row.respiratory_rate,
    recordedAt: sameDay ? `Today at ${time}` : recorded.toLocaleString()
  };
}

function matchesAccommodations(p: Practitioner, filters?: string[]): boolean {
  if (!filters || filters.length === 0) return true;
  return filters.some((acc) =>
    p.accommodations.some((pAcc) => pAcc.toLowerCase().includes(acc.toLowerCase()))
  );
}

function db(): typeof supabase {
  return isSupabaseConfigured ? supabase : null;
}

// ==============================================================================
// CareNavigator Repository API — Supabase Postgres is the source of truth.
// Local state is an offline fallback cache only.
// ==============================================================================
export const careRepository = {
  isCloudConnected: () => isSupabaseConfigured,

  /** Lightweight connectivity probe (env configured AND DB reachable). */
  async probeConnection(): Promise<boolean> {
    const client = db();
    if (!client) return false;
    const { error } = await client.from("patients").select("id").limit(1);
    return !error;
  },

  // 1. Patient Profile & Accommodations
  async getPatientProfile(patientId: string = DEFAULT_PATIENT_ID): Promise<PatientProfile> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();
      if (!error && data) {
        const mapped = mapPatient(data);
        statePatient = { ...mapped };
        return mapped;
      }
      console.warn("[careRepository] getPatientProfile DB miss, using cache:", error?.message);
    }
    return { ...statePatient };
  },

  async updateAccommodations(
    patientId: string,
    updates: { mobility?: string; sensory?: string; communication?: string }
  ): Promise<PatientProfile> {
    const next = { ...statePatient };
    if (updates.mobility) next.accessibilityMobility = updates.mobility;
    if (updates.sensory) next.accessibilitySensory = updates.sensory;
    if (updates.communication) next.accessibilityCommunication = updates.communication;

    const client = db();
    if (client) {
      const { error } = await client
        .from("patients")
        .update({
          accessibility_mobility: next.accessibilityMobility,
          accessibility_sensory: next.accessibilitySensory,
          accessibility_communication: next.accessibilityCommunication
        })
        .eq("id", patientId);
      if (error) {
        console.warn("[careRepository] updateAccommodations DB error:", error.message);
      } else {
        // Re-read authoritative row from DB
        return this.getPatientProfile(patientId);
      }
    }
    statePatient = next;
    return { ...statePatient };
  },

  // 2. Appointments (DB-backed)
  async getAppointments(patientId: string = DEFAULT_PATIENT_ID): Promise<Appointment[]> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const mapped = data.map(mapAppointment);
        stateAppointments = [...mapped];
        return mapped;
      }
      console.warn("[careRepository] getAppointments DB miss, using cache:", error?.message);
    }
    return [...stateAppointments];
  },

  async createAppointment(data: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    const id = `appt-${Date.now()}`;
    const client = db();
    if (client) {
      const { data: row, error } = await client
        .from("appointments")
        .insert({
          id,
          patient_id: data.patientId,
          practitioner_id: data.practitionerId || null,
          doctor_name: data.doctorName,
          facility_name: data.facilityName,
          appointment_date: data.appointmentDate,
          time_slot: data.timeSlot,
          status: data.status,
          accommodation_notes: data.accommodationNotes ?? null
        })
        .select()
        .single();
      if (!error && row) {
        const mapped = mapAppointment(row);
        stateAppointments = [mapped, ...stateAppointments];
        return mapped;
      }
      console.warn("[careRepository] createAppointment DB error:", error?.message);
    }
    const fallback: Appointment = { ...data, id, createdAt: new Date().toISOString() };
    stateAppointments = [fallback, ...stateAppointments];
    return fallback;
  },

  // 3. Prescriptions & Refill Orders (DB-backed)
  async getPrescriptions(patientId: string = DEFAULT_PATIENT_ID): Promise<Prescription[]> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId)
        .order("medication_name", { ascending: true });
      if (!error && data) {
        const mapped = data.map(mapPrescription);
        statePrescriptions = [...mapped];
        return mapped;
      }
      console.warn("[careRepository] getPrescriptions DB miss, using cache:", error?.message);
    }
    return [...statePrescriptions];
  },

  async getPrescriptionById(prescriptionId: string): Promise<Prescription | null> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("prescriptions")
        .select("*")
        .eq("id", prescriptionId)
        .single();
      if (!error && data) return mapPrescription(data);
    }
    return statePrescriptions.find((p) => p.id === prescriptionId) ?? null;
  },

  async getRefillOrders(patientId: string = DEFAULT_PATIENT_ID): Promise<RefillOrder[]> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("refill_orders")
        .select("*")
        .eq("patient_id", patientId)
        .order("requested_at", { ascending: false });
      if (!error && data) {
        const mapped = data.map(mapRefillOrder);
        stateRefillOrders = [...mapped];
        return mapped;
      }
      console.warn("[careRepository] getRefillOrders DB miss, using cache:", error?.message);
    }
    return [...stateRefillOrders];
  },

  async submitRefillOrder(orderData: {
    prescriptionId: string;
    medicationName: string;
    dosage: string;
    pharmacyId: string;
    pharmacyName?: string;
  }): Promise<RefillOrder> {
    // Resolve authoritative prescription row from DB (not stale local cache)
    const rx =
      (await this.getPrescriptionById(orderData.prescriptionId)) ??
      (await this.getPrescriptions()).find((p) => p.medicationName.includes("Albuterol"));

    const id = `ORD-${Date.now()}`;
    const newOrder: RefillOrder = {
      id,
      prescriptionId: rx?.id || orderData.prescriptionId || "rx-albuterol",
      patientId: rx?.patientId || DEFAULT_PATIENT_ID,
      medicationName: orderData.medicationName,
      dosage: orderData.dosage,
      pharmacyId: orderData.pharmacyId,
      pharmacyName:
        orderData.pharmacyName || "Memorial Health Outpatient Pharmacy (Main Campus, Level 1)",
      status: "ready",
      readyTime: "Today at 3:30 PM",
      copay: rx?.copay || "$15.00",
      requestedAt: new Date().toISOString()
    };

    const client = db();
    if (client) {
      const { data: row, error } = await client
        .from("refill_orders")
        .insert({
          id: newOrder.id,
          prescription_id: newOrder.prescriptionId,
          patient_id: newOrder.patientId,
          medication_name: newOrder.medicationName,
          dosage: newOrder.dosage,
          pharmacy_id: newOrder.pharmacyId,
          pharmacy_name: newOrder.pharmacyName,
          status: newOrder.status,
          ready_time: newOrder.readyTime,
          copay: newOrder.copay
        })
        .select()
        .single();
      if (error) {
        console.warn("[careRepository] submitRefillOrder insert error:", error.message);
      } else if (row) {
        const mapped = mapRefillOrder(row);
        stateRefillOrders = [mapped, ...stateRefillOrders];
        // Decrement refill count authoritatively in DB
        if (rx) {
          const nextCount = Math.max(0, rx.refillsRemaining - 1);
          const { error: rxError } = await client
            .from("prescriptions")
            .update({ refills_remaining: nextCount, status: "in_transit" })
            .eq("id", rx.id);
          if (rxError) console.warn("[careRepository] refill rx update error:", rxError.message);
          // Refresh prescription cache from DB
          await this.getPrescriptions(newOrder.patientId);
        }
        return mapped;
      }
    }

    // Offline fallback
    stateRefillOrders = [newOrder, ...stateRefillOrders];
    statePrescriptions = statePrescriptions.map((p) =>
      p.id === rx?.id
        ? { ...p, refillsRemaining: Math.max(0, p.refillsRemaining - 1), status: "in_transit" as const }
        : p
    );
    return newOrder;
  },

  // 4. Practitioners & Clinics Directory (DB-backed, filters applied on DB rows)
  async getPractitioners(specialtyFilter?: string, accommodationFilter?: string[]): Promise<Practitioner[]> {
    const client = db();
    if (client) {
      let query = client.from("practitioners").select("*");
      const specialty = (specialtyFilter || "").trim();
      if (specialty) {
        query = query.ilike("specialty", `%${specialty}%`);
      }
      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map(mapPractitioner);
        statePractitioners = [...mapped];
        // Accommodation arrays are filtered client-side over DB rows so the
        // directory stays DB-sourced while supporting multi-tag matching.
        // PostgREST `overlaps` would also work; JS keeps UX matching identical
        // to the offline cache path.
        const filtered = mapped.filter((p) => matchesAccommodations(p, accommodationFilter));
        // If a specialty ilike missed by name (e.g. doctor name search),
        // fall back to name match over the same DB rows.
        if (specialty && filtered.length === 0) {
          return mapped.filter(
            (p) =>
              p.name.toLowerCase().includes(specialty.toLowerCase()) &&
              matchesAccommodations(p, accommodationFilter)
          );
        }
        return filtered;
      }
      console.warn("[careRepository] getPractitioners DB miss, using cache:", error?.message);
    }

    let results = [...statePractitioners];
    const specialty = (specialtyFilter || "").trim();
    if (specialty) {
      results = results.filter(
        (p) =>
          p.specialty.toLowerCase().includes(specialty.toLowerCase()) ||
          p.name.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    results = results.filter((p) => matchesAccommodations(p, accommodationFilter));
    return results;
  },

  // 5. Triage Assessments (DB-backed)
  async getTriageAssessments(patientId: string = DEFAULT_PATIENT_ID): Promise<TriageAssessment[]> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("triage_assessments")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const mapped = data.map(mapTriage);
        stateTriageAssessments = [...mapped];
        return mapped;
      }
      console.warn("[careRepository] getTriageAssessments DB miss, using cache:", error?.message);
    }
    return [...stateTriageAssessments];
  },

  async getLatestTriageAssessment(patientId: string = DEFAULT_PATIENT_ID): Promise<TriageAssessment | null> {
    const all = await this.getTriageAssessments(patientId);
    return all[0] ?? null;
  },

  async submitTriageAssessment(data: {
    symptoms: string;
    bodyRegion: string;
    painLevel: number;
    urgency: "ROUTINE" | "URGENT" | "EMERGENCY";
  }): Promise<TriageAssessment> {
    const isUrgent = data.urgency === "URGENT" || data.painLevel >= 7;
    const specialty =
      data.bodyRegion.includes("Knee") || data.bodyRegion.includes("Musculoskeletal")
        ? "Orthopedic Physical Therapy & Sports Medicine"
        : "Internal Medicine & Specialty Care";

    const id = `TRG-${Date.now()}`;
    const patientId = statePatient.id || DEFAULT_PATIENT_ID;
    const client = db();
    if (client) {
      const { data: row, error } = await client
        .from("triage_assessments")
        .insert({
          id,
          patient_id: patientId,
          symptoms: data.symptoms,
          body_region: data.bodyRegion,
          pain_level: data.painLevel,
          urgency: data.urgency,
          recommended_specialty: specialty,
          clinical_advice: isUrgent
            ? "Clinical protocol recommends in-person physical evaluation within 24–48 hours due to reported acute joint swelling and pain rating."
            : "Standard routine consultation recommended within 5 business days. Apply cold compress and elevate affected limb.",
          recommended_clinic: "Memorial Pavilion & Physical Rehabilitation (Suite 4B)"
        })
        .select()
        .single();
      if (!error && row) {
        const mapped = mapTriage(row);
        stateTriageAssessments = [mapped, ...stateTriageAssessments];
        return mapped;
      }
      console.warn("[careRepository] submitTriageAssessment DB error:", error?.message);
    }

    const fallback: TriageAssessment = {
      id,
      patientId,
      symptoms: data.symptoms,
      bodyRegion: data.bodyRegion,
      painLevel: data.painLevel,
      urgency: data.urgency,
      recommendedSpecialty: specialty,
      clinicalAdvice: isUrgent
        ? "Clinical protocol recommends in-person physical evaluation within 24–48 hours due to reported acute joint swelling and pain rating."
        : "Standard routine consultation recommended within 5 business days. Apply cold compress and elevate affected limb.",
      recommendedClinic: "Memorial Pavilion & Physical Rehabilitation (Suite 4B)",
      createdAt: new Date().toISOString()
    };
    stateTriageAssessments = [fallback, ...stateTriageAssessments];
    return fallback;
  },

  // 6. Patient Vitals (DB-backed)
  async getVitals(patientId: string = DEFAULT_PATIENT_ID): Promise<PatientVitals> {
    const client = db();
    if (client) {
      const { data, error } = await client
        .from("patient_vitals")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        return mapVitals(data);
      }
      console.warn("[careRepository] getVitals DB miss, using cache:", error?.message);
    }
    return { ...initialVitals };
  }
};
