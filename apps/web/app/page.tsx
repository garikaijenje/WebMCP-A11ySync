"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useA11ySync, usePlatformShortcut } from "@a11ysync/react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OverviewView } from "@/components/views/OverviewView";
import { TriageView, type Urgency } from "@/components/views/TriageView";
import { MedicationsView } from "@/components/views/MedicationsView";
import { ProvidersView } from "@/components/views/ProvidersView";
import { ProfileView, type AccommodationValues } from "@/components/views/ProfileView";
import { PHARMACY_NAMES, type CareView } from "@/components/dashboard/nav";
import {
  careRepository,
  type PatientProfile,
  type Practitioner,
  type Appointment,
  type Prescription,
  type RefillOrder,
  type TriageAssessment,
  type PatientVitals
} from "@/lib/careRepository";

export default function CareNavigatorPage() {
  const { engine, trojanEnabled } = useA11ySync();
  // SSR-safe: stable fallback pre-hydration, platform value after mount
  const shortcutA = usePlatformShortcut("A");
  const shortcutD = usePlatformShortcut("D");

  const [activeTab, setActiveTab] = useState<CareView>("dashboard");

  // Repository data — every collection is sourced from Supabase Postgres
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [refillOrders, setRefillOrders] = useState<RefillOrder[]>([]);
  const [latestAssessment, setLatestAssessment] = useState<TriageAssessment | null>(null);
  const [isCloudActive, setIsCloudActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Triage intake state
  const [symptoms, setSymptoms] = useState<string>(
    "Severe left knee pain and joint swelling after physical therapy session"
  );
  const [bodyRegion, setBodyRegion] = useState<string>("Left Knee & Lower Extremity");
  const [triageUrgency, setTriageUrgency] = useState<Urgency>("URGENT");
  const [painLevel, setPainLevel] = useState<number>(7);
  const [triageSubmitting, setTriageSubmitting] = useState(false);

  // Provider search filters
  const [specialtyQuery, setSpecialtyQuery] = useState<string>("");
  const [selectedAccFilter, setSelectedAccFilter] = useState<string[]>([]);

  // Refill state
  const [selectedDosage, setSelectedDosage] = useState<string>("200 Actuations (Standard Inhaler)");
  const [pharmacyId, setPharmacyId] = useState<string>("memorial-outpatient-pharmacy");
  const [refillSubmittingId, setRefillSubmittingId] = useState<string | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const connected = await careRepository.probeConnection();
      setIsCloudActive(connected);
      const [p, appts, rxs, docs, v, orders, latestTriage] = await Promise.all([
        careRepository.getPatientProfile(),
        careRepository.getAppointments(),
        careRepository.getPrescriptions(),
        careRepository.getPractitioners(),
        careRepository.getVitals(),
        careRepository.getRefillOrders(),
        careRepository.getLatestTriageAssessment()
      ]);
      setPatient(p);
      setAppointments(appts);
      setPrescriptions(rxs);
      setPractitioners(docs);
      setVitals(v);
      setRefillOrders(orders);
      if (latestTriage) setLatestAssessment(latestTriage);
      if (!connected) {
        setLoadError(
          "Supabase is not reachable — showing offline clinical cache. Run `bun run supabase:sync` (Supabase CLI) and reload."
        );
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load clinical data from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriageSubmitting(true);
    try {
      const assessment = await careRepository.submitTriageAssessment({
        symptoms,
        bodyRegion,
        painLevel,
        urgency: triageUrgency
      });
      setLatestAssessment(assessment);
      toast.success("Triage completed", { description: `${assessment.recommendedSpecialty} recommended.` });
    } finally {
      setTriageSubmitting(false);
    }
  };

  const handleFilterClinics = async (specialty?: string, accommodations?: string[]) => {
    const results = await careRepository.getPractitioners(
      specialty ?? specialtyQuery,
      accommodations ?? selectedAccFilter
    );
    setPractitioners(results);
    if (results.length === 0) {
      toast.info("No matching clinics", { description: "Try broadening the filters." });
    }
  };

  const handleFindSpecialist = async () => {
    setSpecialtyQuery("Orthopedic");
    const results = await careRepository.getPractitioners("Orthopedic", selectedAccFilter);
    setPractitioners(results);
    setActiveTab("clinics");
  };

  const handleRefillSubmit = async (rxId: string, medName: string) => {
    setRefillSubmittingId(rxId);
    try {
      const order = await careRepository.submitRefillOrder({
        prescriptionId: rxId,
        medicationName: medName,
        dosage: selectedDosage,
        pharmacyId,
        pharmacyName: PHARMACY_NAMES[pharmacyId]
      });
      const [orders, updatedRxs] = await Promise.all([
        careRepository.getRefillOrders(),
        careRepository.getPrescriptions()
      ]);
      setRefillOrders(orders);
      setPrescriptions(updatedRxs);
      toast.success("Refill submitted", {
        description: `Order ${order.id} sent to ${order.pharmacyName}. Ready ${order.readyTime}.`
      });
    } finally {
      setRefillSubmittingId(null);
    }
  };

  const handleBookAppointment = async (doc: Practitioner, slot: string) => {
    setBookingBusy(true);
    try {
      const newAppt = await careRepository.createAppointment({
        patientId: patient?.id || "pt-sarah-jenkins",
        practitionerId: doc.id,
        doctorName: doc.name,
        facilityName: doc.facilityName,
        appointmentDate: slot.split(" at ")[0],
        timeSlot: slot.split(" at ")[1] || "10:30 AM",
        status: "confirmed",
        accommodationNotes: doc.accommodations.join(", ")
      });
      const appts = await careRepository.getAppointments();
      setAppointments(appts);
      setActiveTab("dashboard");
      toast.success("Consultation booked", {
        description: `${newAppt.doctorName} · ${newAppt.appointmentDate} at ${newAppt.timeSlot}.`
      });
    } finally {
      setBookingBusy(false);
    }
  };

  const handleSaveAccommodations = async (values: AccommodationValues) => {
    setSavingProfile(true);
    try {
      if (patient) {
        const updated = await careRepository.updateAccommodations(patient.id, values);
        setPatient(updated);
        toast.success("Chart updated", { description: "Accessibility preferences saved to your record." });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Register WebMCP tools (agent Bridge) — backed by the same DB repository
  useEffect(() => {
    if (!engine) return;

    window.document.modelContext?.registerTool({
      name: "triage_specialist",
      description: "Evaluates patient symptoms against clinical triage protocols to recommend specialties and urgency.",
      inputSchema: {
        type: "object",
        properties: {
          symptoms: { type: "string" },
          urgency: { type: "string", enum: ["ROUTINE", "URGENT", "EMERGENCY"] },
          bodyRegion: { type: "string" },
          painLevel: { type: "number" }
        },
        required: ["symptoms"]
      },
      accessibility: {
        relatedElement: "#triage-submit-btn",
        humanActionLabel: "Triage Symptoms and Match Clinical Specialist",
        liveAnnouncements: {
          onStart: "Clinical triage assessment initiated for reported symptoms...",
          onSuccess: "Triage evaluation completed: Recommended Orthopedic Physical Therapy with urgent priority."
        },
        focusTargetOnComplete: "#triage-result-card"
      },
      execute: async (args: { symptoms: string; urgency?: Urgency; bodyRegion?: string; painLevel?: number }) => {
        setSymptoms(args.symptoms);
        const assessment = await careRepository.submitTriageAssessment({
          symptoms: args.symptoms,
          bodyRegion: args.bodyRegion || bodyRegion,
          painLevel: args.painLevel ?? painLevel,
          urgency: args.urgency || triageUrgency
        });
        setLatestAssessment(assessment);
        setActiveTab("triage");
        toast.success("Agent triage completed", { description: assessment.recommendedSpecialty });
        return assessment;
      }
    });

    window.document.modelContext?.registerTool({
      name: "find_accessible_clinic",
      description: "Locates in-network healthcare facilities offering verified physical, sensory, or communication accommodations.",
      inputSchema: {
        type: "object",
        properties: {
          specialty: { type: "string" },
          accommodations: { type: "array", items: { type: "string" } }
        },
        required: ["specialty"]
      },
      accessibility: {
        relatedElement: "#clinic-search-btn",
        humanActionLabel: "Search Accessible In-Network Providers",
        liveAnnouncements: {
          onStart: "Searching directory for verified accessible healthcare providers...",
          onSuccess: "Located matching in-network clinics with step-free wheelchair access."
        },
        focusTargetOnComplete: "#practitioner-results-grid"
      },
      execute: async (args: { specialty: string; accommodations?: string[] }) => {
        setSpecialtyQuery(args.specialty);
        const results = await careRepository.getPractitioners(args.specialty, args.accommodations);
        setPractitioners(results);
        setActiveTab("clinics");
        return { matches: results };
      }
    });

    window.document.modelContext?.registerTool({
      name: "request_prescription_refill",
      description: "Submits a pharmacy refill request for an active prescription. High-stakes patient action requiring confirmation.",
      inputSchema: {
        type: "object",
        properties: {
          prescriptionId: { type: "string" },
          medicationName: { type: "string" },
          dosage: { type: "string" },
          pharmacyId: { type: "string" }
        },
        required: ["medicationName", "dosage", "pharmacyId"]
      },
      accessibility: {
        relatedElement: "#refill-trigger",
        requiresHumanConfirmation: true,
        humanActionLabel: "Refill Albuterol Sulfate Inhaler (90mcg)",
        liveAnnouncements: {
          onStart: "Submitting verified refill order to Memorial Outpatient Pharmacy...",
          onSuccess: "Refill confirmed: Ready for pickup today at 3:30 PM."
        },
        focusTargetOnComplete: "#refill-confirmed-banner"
      },
      execute: async (args: { prescriptionId?: string; medicationName: string; dosage: string; pharmacyId: string }) => {
        const order = await careRepository.submitRefillOrder({
          prescriptionId: args.prescriptionId || "rx-albuterol",
          medicationName: args.medicationName,
          dosage: args.dosage,
          pharmacyId: args.pharmacyId,
          pharmacyName: PHARMACY_NAMES[args.pharmacyId]
        });
        const [orders, updatedRxs] = await Promise.all([
          careRepository.getRefillOrders(),
          careRepository.getPrescriptions()
        ]);
        setRefillOrders(orders);
        setPrescriptions(updatedRxs);
        setActiveTab("medications");
        toast.success("Agent refill transmitted", { description: `Order ${order.id} sent to pharmacy.` });
        return order;
      }
    });

    window.document.modelContext?.registerTool({
      name: "confirm_appointment",
      description: "Books an accessible consultation time slot into the hospital scheduling system.",
      inputSchema: {
        type: "object",
        properties: {
          practitionerId: { type: "string" },
          doctorName: { type: "string" },
          facilityName: { type: "string" },
          appointmentDate: { type: "string" },
          timeSlot: { type: "string" },
          accommodationNotes: { type: "string" }
        },
        required: ["appointmentDate", "timeSlot"]
      },
      accessibility: {
        relatedElement: "#confirm-booking-btn",
        humanActionLabel: "Confirm Specialist Consultation Appointment",
        liveAnnouncements: {
          onStart: "Locking consultation slot in clinical scheduling database...",
          onSuccess: "Appointment confirmed with accessibility accommodations verified."
        },
        focusTargetOnComplete: "#upcoming-appointments-card"
      },
      execute: async (args: {
        practitionerId?: string;
        doctorName?: string;
        facilityName?: string;
        appointmentDate: string;
        timeSlot: string;
        accommodationNotes?: string;
      }) => {
        const newAppt = await careRepository.createAppointment({
          patientId: patient?.id || "pt-sarah-jenkins",
          practitionerId: args.practitionerId || "oakwood-rehab",
          doctorName: args.doctorName || "Dr. Marcus Vance, MD",
          facilityName: args.facilityName || "Memorial Pavilion & Physical Rehabilitation",
          appointmentDate: args.appointmentDate,
          timeSlot: args.timeSlot,
          status: "confirmed",
          accommodationNotes: args.accommodationNotes || "Step-Free Ramp, Wide Corridors, Quiet Waiting Room"
        });
        const appts = await careRepository.getAppointments();
        setAppointments(appts);
        setActiveTab("dashboard");
        toast.success("Agent booking confirmed", {
          description: `${newAppt.doctorName} · ${newAppt.appointmentDate}.`
        });
        return newAppt;
      }
    });

    return () => {
      window.document.modelContext?.unregisterTool?.("triage_specialist");
      window.document.modelContext?.unregisterTool?.("find_accessible_clinic");
      window.document.modelContext?.unregisterTool?.("request_prescription_refill");
      window.document.modelContext?.unregisterTool?.("confirm_appointment");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, patient, bodyRegion, painLevel, triageUrgency]);

  const refillDueCount = prescriptions.filter((p) => p.status === "refill_due").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        appointmentCount={appointments.length}
        refillDueCount={refillDueCount}
        isCloudActive={isCloudActive}
        trojanEnabled={trojanEnabled}
        shortcutA={shortcutA.symbol}
        shortcutD={shortcutD.symbol}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header
          activeTab={activeTab}
          onNavigate={setActiveTab}
          patient={patient}
          isCloudActive={isCloudActive}
          prescriptions={prescriptions}
          practitioners={practitioners}
        />

        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {loadError && !isLoading && (
            <div
              role="alert"
              className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[13px]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span>{loadError}</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </Button>
            </div>
          )}

          {activeTab === "dashboard" && (
            <OverviewView
              loading={isLoading}
              patient={patient}
              appointments={appointments}
              prescriptions={prescriptions}
              vitals={vitals}
              refillOrders={refillOrders}
              latestAssessment={latestAssessment}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "triage" && (
            <TriageView
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              bodyRegion={bodyRegion}
              setBodyRegion={setBodyRegion}
              urgency={triageUrgency}
              setUrgency={setTriageUrgency}
              painLevel={painLevel}
              setPainLevel={setPainLevel}
              latestAssessment={latestAssessment}
              submitting={triageSubmitting}
              onSubmit={handleTriageSubmit}
              onFindSpecialist={handleFindSpecialist}
            />
          )}

          {activeTab === "medications" && (
            <MedicationsView
              loading={isLoading}
              prescriptions={prescriptions}
              refillOrders={refillOrders}
              selectedDosage={selectedDosage}
              setSelectedDosage={setSelectedDosage}
              pharmacyId={pharmacyId}
              setPharmacyId={setPharmacyId}
              trojanEnabled={trojanEnabled}
              submittingId={refillSubmittingId}
              onRefill={handleRefillSubmit}
            />
          )}

          {activeTab === "clinics" && (
            <ProvidersView
              loading={isLoading}
              practitioners={practitioners}
              specialtyQuery={specialtyQuery}
              setSpecialtyQuery={setSpecialtyQuery}
              accFilter={selectedAccFilter}
              setAccFilter={setSelectedAccFilter}
              onFilter={() => handleFilterClinics()}
              booking={bookingBusy}
              onBook={handleBookAppointment}
            />
          )}

          {activeTab === "accommodations" && (
            <ProfileView
              loading={isLoading}
              patient={patient}
              snapshot={{
                nextVisit: appointments[0]
                  ? `${appointments[0].appointmentDate} at ${appointments[0].timeSlot}`
                  : undefined,
                activeRx: prescriptions.length,
                refillsDue: prescriptions.filter((p) => p.status === "refill_due").length,
                lastVitals: vitals
                  ? `${vitals.bloodPressure} · ${vitals.heartRate} bpm (${vitals.recordedAt})`
                  : undefined
              }}
              saving={savingProfile}
              onSave={handleSaveAccommodations}
            />
          )}
        </main>

        <footer className="border-t bg-white py-5 dark:bg-slate-900">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <span className="font-semibold text-foreground">Memorial Health System</span>
              <span>· HIPAA-compliant patient portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Assistive palette{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">{shortcutA.label}</kbd>
              </span>
              <span>
                Inspector{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">{shortcutD.label}</kbd>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
