import { describe, it, expect, vi } from "vitest";
import { careRepository } from "../lib/careRepository";

// Hermetic: force the offline cache path so unit tests never touch the live
// Supabase project. Live DB round-trips are covered by Supabase CLI commands
// (`migration list`, `db push --dry-run`) and the CLI-synced config test.
vi.mock("../lib/supabase", () => ({ supabase: null, isSupabaseConfigured: false }));

// NOTE: vitest does not load NEXT_PUBLIC_SUPABASE_* env, so these tests
// exercise the offline cache path. Live DB round-trips are verified via
// `bunx supabase db push --dry-run`, `migration list`, and manual QA against
// the linked project (vcohbnicrieofpbrqdqf). The repository code paths for
// DB vs cache are identical shapes — DB mappers are covered by type-check
// against apps/web/lib/database.types.ts (generated via Supabase CLI).

describe("CareNavigator Clinical Repository", () => {
  it("retrieves Sarah Jenkins patient profile with MRN and accessibility data", async () => {
    const patient = await careRepository.getPatientProfile();
    expect(patient).toBeDefined();
    expect(patient.mrn).toBe("#MH-88291");
    expect(patient.firstName).toBe("Sarah");
    expect(patient.accessibilityMobility).toContain("Wheelchair");
    expect(patient.allergies.length).toBeGreaterThan(0);
  });

  it("reports offline connection probe when Supabase env is absent", async () => {
    const connected = await careRepository.probeConnection();
    expect(connected).toBe(false);
    expect(careRepository.isCloudConnected()).toBe(false);
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

  it("persists triage history and returns latest assessment first", async () => {
    await careRepository.submitTriageAssessment({
      symptoms: "Mild headache",
      bodyRegion: "Head / Neurological",
      painLevel: 3,
      urgency: "ROUTINE"
    });
    const history = await careRepository.getTriageAssessments();
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].createdAt).toBeDefined();

    const latest = await careRepository.getLatestTriageAssessment();
    expect(latest).toBeDefined();
    expect(latest?.id).toBe(history[0].id);
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

    const orders = await careRepository.getRefillOrders();
    expect(orders.some((o) => o.id === order.id)).toBe(true);
  });

  it("filters accessible clinics by verified accommodations", async () => {
    const allClinics = await careRepository.getPractitioners();
    expect(allClinics.length).toBeGreaterThanOrEqual(1);

    const wheelchairClinics = await careRepository.getPractitioners("", ["Wheelchair Step-Free"]);
    expect(wheelchairClinics.length).toBeGreaterThanOrEqual(1);
    wheelchairClinics.forEach((clinic) => {
      expect(clinic.accommodations).toContain("Wheelchair Step-Free");
    });

    // Combined specialty + accommodation filter (previously dropped on DB path)
    const orthoQuiet = await careRepository.getPractitioners("Orthopedic", ["Sensory Quiet Room"]);
    expect(orthoQuiet.length).toBeGreaterThanOrEqual(1);
    orthoQuiet.forEach((clinic) => {
      expect(clinic.specialty + clinic.name).toMatch(/Orthopedic|Vance|Al-Mansoor/i);
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

  it("retrieves patient vitals with readable timestamp", async () => {
    const vitals = await careRepository.getVitals();
    expect(vitals.bloodPressure).toBeDefined();
    expect(vitals.heartRate).toBeGreaterThan(0);
    expect(vitals.recordedAt).toBeDefined();
  });
});
