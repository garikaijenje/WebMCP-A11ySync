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

// Initial clinical seed data
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

// Local Reactive State Store
let statePatient = { ...initialPatient };
let statePractitioners = [...initialPractitioners];
let stateAppointments = [...initialAppointments];
let statePrescriptions = [...initialPrescriptions];
let stateRefillOrders: RefillOrder[] = [];
let stateTriageAssessments: TriageAssessment[] = [];

// ==============================================================================
// CareNavigator Repository API
// ==============================================================================

export const careRepository = {
  isCloudConnected: () => isSupabaseConfigured,

  // 1. Patient Profile & Accommodations
  async getPatientProfile(patientId: string = "pt-sarah-jenkins"): Promise<PatientProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          mrn: data.mrn,
          firstName: data.first_name,
          lastName: data.last_name,
          dob: data.dob,
          gender: data.gender,
          primaryDoctor: data.primary_doctor,
          insuranceProvider: data.insurance_provider,
          accessibilityMobility: data.accessibility_mobility,
          accessibilitySensory: data.accessibility_sensory,
          accessibilityCommunication: data.accessibility_communication,
          allergies: data.allergies || []
        };
      }
    }
    return statePatient;
  },

  async updateAccommodations(
    patientId: string,
    updates: { mobility?: string; sensory?: string; communication?: string }
  ): Promise<PatientProfile> {
    if (updates.mobility) statePatient.accessibilityMobility = updates.mobility;
    if (updates.sensory) statePatient.accessibilitySensory = updates.sensory;
    if (updates.communication) statePatient.accessibilityCommunication = updates.communication;

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("patients")
        .update({
          accessibility_mobility: statePatient.accessibilityMobility,
          accessibility_sensory: statePatient.accessibilitySensory,
          accessibility_communication: statePatient.accessibilityCommunication
        })
        .eq("id", patientId);
    }
    return { ...statePatient };
  },

  // 2. Appointments
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          patientId: item.patient_id,
          practitionerId: item.practitioner_id,
          doctorName: item.doctor_name,
          facilityName: item.facility_name,
          appointmentDate: item.appointment_date,
          timeSlot: item.time_slot,
          status: item.status,
          accommodationNotes: item.accommodation_notes,
          createdAt: item.created_at
        }));
      }
    }
    return [...stateAppointments];
  },

  async createAppointment(data: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...data,
      id: `appt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    stateAppointments = [newAppointment, ...stateAppointments];

    if (isSupabaseConfigured && supabase) {
      await supabase.from("appointments").insert({
        id: newAppointment.id,
        patient_id: newAppointment.patientId,
        practitioner_id: newAppointment.practitionerId,
        doctor_name: newAppointment.doctorName,
        facility_name: newAppointment.facilityName,
        appointment_date: newAppointment.appointmentDate,
        time_slot: newAppointment.timeSlot,
        status: newAppointment.status,
        accommodation_notes: newAppointment.accommodationNotes
      });
    }
    return newAppointment;
  },

  // 3. Prescriptions & Refill Orders
  async getPrescriptions(): Promise<Prescription[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .order("medication_name", { ascending: true });
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          patientId: item.patient_id,
          medicationName: item.medication_name,
          strength: item.strength,
          rxNumber: item.rx_number,
          refillsRemaining: item.refills_remaining,
          prescribedBy: item.prescribed_by,
          pharmacyName: item.pharmacy_name,
          copay: item.copay,
          status: item.status,
          lastFilled: item.last_filled
        }));
      }
    }
    return [...statePrescriptions];
  },

  async submitRefillOrder(orderData: {
    prescriptionId: string;
    medicationName: string;
    dosage: string;
    pharmacyId: string;
  }): Promise<RefillOrder> {
    const rx = statePrescriptions.find((p) => p.id === orderData.prescriptionId || p.medicationName.includes("Albuterol"));
    const newOrder: RefillOrder = {
      id: `ORD-${Date.now()}`,
      prescriptionId: rx?.id || "rx-albuterol",
      patientId: statePatient.id,
      medicationName: orderData.medicationName,
      dosage: orderData.dosage,
      pharmacyId: orderData.pharmacyId,
      pharmacyName: "Memorial Health Outpatient Pharmacy (Main Campus, Level 1)",
      status: "ready",
      readyTime: "Today at 3:30 PM",
      copay: rx?.copay || "$15.00",
      requestedAt: new Date().toISOString()
    };

    stateRefillOrders = [newOrder, ...stateRefillOrders];

    // Decrement refill count in state
    statePrescriptions = statePrescriptions.map((p) => {
      if (p.id === rx?.id) {
        return {
          ...p,
          refillsRemaining: Math.max(0, p.refillsRemaining - 1),
          status: "in_transit"
        };
      }
      return p;
    });

    if (isSupabaseConfigured && supabase) {
      await supabase.from("refill_orders").insert({
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
      });

      if (rx) {
        await supabase
          .from("prescriptions")
          .update({
            refills_remaining: Math.max(0, rx.refillsRemaining - 1),
            status: "in_transit"
          })
          .eq("id", rx.id);
      }
    }

    return newOrder;
  },

  // 4. Practitioners & Clinics Directory
  async getPractitioners(specialtyFilter?: string, accommodationFilter?: string[]): Promise<Practitioner[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("practitioners").select("*");
      if (specialtyFilter) {
        query = query.ilike("specialty", `%${specialtyFilter}%`);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          title: item.title,
          specialty: item.specialty,
          facilityName: item.facility_name,
          facilityAddress: item.facility_address,
          distance: item.distance,
          accommodations: item.accommodations,
          availableSlots: item.available_slots
        }));
      }
    }

    let results = [...statePractitioners];
    if (specialtyFilter) {
      results = results.filter((p) =>
        p.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()) ||
        p.name.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }
    if (accommodationFilter && accommodationFilter.length > 0) {
      results = results.filter((p) =>
        accommodationFilter.some((acc) =>
          p.accommodations.some((pAcc) => pAcc.toLowerCase().includes(acc.toLowerCase()))
        )
      );
    }
    return results;
  },

  // 5. Triage Assessments
  async submitTriageAssessment(data: {
    symptoms: string;
    bodyRegion: string;
    painLevel: number;
    urgency: "ROUTINE" | "URGENT" | "EMERGENCY";
  }): Promise<TriageAssessment> {
    const isUrgent = data.urgency === "URGENT" || data.painLevel >= 7;
    const specialty = data.bodyRegion.includes("Knee") || data.bodyRegion.includes("Musculoskeletal")
      ? "Orthopedic Physical Therapy & Sports Medicine"
      : "Internal Medicine & Specialty Care";

    const assessment: TriageAssessment = {
      id: `TRG-${Date.now()}`,
      patientId: statePatient.id,
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

    stateTriageAssessments = [assessment, ...stateTriageAssessments];

    if (isSupabaseConfigured && supabase) {
      await supabase.from("triage_assessments").insert({
        id: assessment.id,
        patient_id: assessment.patientId,
        symptoms: assessment.symptoms,
        body_region: assessment.bodyRegion,
        pain_level: assessment.painLevel,
        urgency: assessment.urgency,
        recommended_specialty: assessment.recommendedSpecialty,
        clinical_advice: assessment.clinicalAdvice,
        recommended_clinic: assessment.recommendedClinic
      });
    }

    return assessment;
  },

  // 6. Patient Vitals
  async getVitals(): Promise<PatientVitals> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("patient_vitals")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          patientId: data.patient_id,
          bloodPressure: data.blood_pressure,
          heartRate: data.heart_rate,
          oxygenSaturation: data.oxygen_saturation,
          respiratoryRate: data.respiratory_rate,
          recordedAt: new Date(data.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
    return initialVitals;
  }
};
