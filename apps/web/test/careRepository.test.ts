import { describe, it, expect } from "vitest";
import { careRepository } from "../lib/careRepository";

describe("CareNavigator Clinical Repository", () => {
  it("retrieves Sarah Jenkins patient profile with MRN and accessibility data", async () => {
    const patient = await careRepository.getPatientProfile();
    expect(patient).toBeDefined();
    expect(patient.mrn).toBe("#MH-88291");
    expect(patient.firstName).toBe("Sarah");
    expect(patient.accessibilityMobility).toContain("Wheelchair");
    expect(patient.allergies.length).toBeGreaterThan(0);
  });

  it("computes clinical triage assessment with specialty recommendation", async () => {
    const assessment = await careRepository.submitTriageAssessment({
      symptoms: "Severe sharp pain in right knee joint following a fall, cannot bear weight.",
      bodyRegion: "Musculoskeletal",
      painLevel: 8,
      urgency: "URGENT"
    });

    expect(assessment).toBeDefined();
    expect(assessment.painLevel).toBe(8);
    expect(assessment.urgency).toBe("URGENT");
    expect(assessment.recommendedSpecialty).toContain("Orthopedic");
    expect(assessment.recommendedClinic).toBeDefined();
  });

  it("submits prescription refill orders and tracks refill queue", async () => {
    const order = await careRepository.submitRefillOrder({
      prescriptionId: "rx-albuterol",
      medicationName: "Albuterol Sulfate HFA Inhalation Aerosol",
      dosage: "200 Actuations (Standard Inhaler)",
      pharmacyId: "memorial-outpatient-pharmacy"
    });

    expect(order).toBeDefined();
    expect(order.medicationName).toContain("Albuterol");
    expect(["ready", "submitted"]).toContain(order.status);
    expect(order.copay).toBe("$15.00");
  });

  it("filters accessible clinics by verified accommodations", async () => {
    const allClinics = await careRepository.getPractitioners();
    expect(allClinics.length).toBeGreaterThanOrEqual(1);

    const wheelchairClinics = await careRepository.getPractitioners("", ["Wheelchair Step-Free"]);
    expect(wheelchairClinics.length).toBeGreaterThanOrEqual(1);
    wheelchairClinics.forEach((clinic) => {
      expect(clinic.accommodations).toContain("Wheelchair Step-Free");
    });
  });

  it("creates and retrieves patient appointments", async () => {
    const appt = await careRepository.createAppointment({
      patientId: "pt-sarah-jenkins",
      practitionerId: "oakwood-rehab",
      doctorName: "Dr. Marcus Vance, MD",
      facilityName: "Memorial Pavilion & Physical Rehabilitation",
      appointmentDate: "Friday, Sep 18, 2026",
      timeSlot: "10:30 AM",
      status: "confirmed",
      accommodationNotes: "Step-free wheelchair ramp, quiet room"
    });

    expect(appt).toBeDefined();
    expect(appt.doctorName).toBe("Dr. Marcus Vance, MD");
    expect(appt.status).toBe("confirmed");

    const appts = await careRepository.getAppointments();
    expect(appts.some((a) => a.id === appt.id)).toBe(true);
  });
});
