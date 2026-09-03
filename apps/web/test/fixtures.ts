import type {
  Appointment,
  PatientProfile,
  PatientVitals,
  Practitioner,
  Prescription,
  RefillOrder,
  TriageAssessment
} from "@/lib/careRepository";

export const fixturePatient: PatientProfile = {
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

export const fixtureAppointments: Appointment[] = [
  {
    id: "appt-init-01",
    patientId: "pt-sarah-jenkins",
    practitionerId: "oakwood-rehab",
    doctorName: "Dr. Marcus Vance, MD",
    facilityName: "Memorial Pavilion & Physical Rehabilitation",
    appointmentDate: "Friday, Sep 18, 2026",
    timeSlot: "10:30 AM",
    status: "confirmed",
    accommodationNotes: "Wheelchair Step-Free Ramp, Quiet Waiting Room",
    createdAt: "2026-09-02T23:42:52Z"
  }
];

export const fixturePrescriptions: Prescription[] = [
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

export const fixturePractitioners: Practitioner[] = [
  {
    id: "oakwood-rehab",
    name: "Dr. Marcus Vance, MD",
    title: "Board Certified Orthopedic Specialist",
    specialty: "Orthopedic Physical Therapy",
    facilityName: "Memorial Pavilion & Physical Rehabilitation",
    facilityAddress: "1200 Healthcare Way, Suite 4B, Metro",
    distance: "0.8 miles away",
    accommodations: ["Wheelchair Step-Free", "Sensory Quiet Room"],
    availableSlots: ["Friday, Sep 18 at 10:30 AM", "Friday, Sep 18 at 2:00 PM", "Monday, Sep 21 at 9:00 AM"]
  }
];

export const fixtureVitals: PatientVitals = {
  id: "vitals-latest",
  patientId: "pt-sarah-jenkins",
  bloodPressure: "118/76 mmHg",
  heartRate: 72,
  oxygenSaturation: 99,
  respiratoryRate: 16,
  recordedAt: "Today at 8:45 AM"
};

export const fixtureOrders: RefillOrder[] = [
  {
    id: "ORD-1",
    prescriptionId: "rx-albuterol",
    patientId: "pt-sarah-jenkins",
    medicationName: "Albuterol Sulfate HFA Inhalation Aerosol",
    dosage: "200 Actuations (Standard Inhaler)",
    pharmacyId: "memorial-outpatient-pharmacy",
    pharmacyName: "Memorial Health Outpatient Pharmacy (Main Campus, Level 1)",
    status: "ready",
    readyTime: "Today at 3:30 PM",
    copay: "$15.00",
    requestedAt: "2026-09-03T00:25:11Z"
  }
];

export const fixtureAssessment: TriageAssessment = {
  id: "TRG-1",
  patientId: "pt-sarah-jenkins",
  symptoms: "Knee pain",
  bodyRegion: "Left Knee & Lower Extremity",
  painLevel: 7,
  urgency: "URGENT",
  recommendedSpecialty: "Orthopedic Physical Therapy & Sports Medicine",
  clinicalAdvice: "In-person evaluation within 24–48 hours.",
  recommendedClinic: "Memorial Pavilion & Physical Rehabilitation (Suite 4B)",
  createdAt: "2026-09-03T00:25:11Z"
};
