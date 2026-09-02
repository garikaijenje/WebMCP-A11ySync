"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useA11ySync, getPlatformShortcut } from "@a11ysync/react";
import {
  careRepository,
  PatientProfile,
  Practitioner,
  Appointment,
  Prescription,
  RefillOrder,
  TriageAssessment,
  PatientVitals
} from "@/lib/careRepository";
import {
  Calendar,
  Clock,
  MapPin,
  Pill,
  Stethoscope,
  Shield,
  Heart,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Accessibility,
  Activity,
  ChevronRight,
  Database,
  RefreshCw,
  Sliders,
  Check
} from "lucide-react";

export default function CareNavigatorPage() {
  const { engine, trojanEnabled } = useA11ySync();
  const shortcutA = getPlatformShortcut("A");
  const shortcutD = getPlatformShortcut("D");

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Repository data states
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [refillOrders, setRefillOrders] = useState<RefillOrder[]>([]);
  const [isCloudActive, setIsCloudActive] = useState<boolean>(false);

  // Clinical triage intake states
  const [symptoms, setSymptoms] = useState<string>("Severe left knee pain and joint swelling after physical therapy session");
  const [bodyRegion, setBodyRegion] = useState<string>("Left Knee & Lower Extremity");
  const [triageUrgency, setTriageUrgency] = useState<"ROUTINE" | "URGENT" | "EMERGENCY">("URGENT");
  const [painLevel, setPainLevel] = useState<number>(7);
  const [latestAssessment, setLatestAssessment] = useState<TriageAssessment | null>(null);

  // Provider search filter states
  const [specialtyQuery, setSpecialtyQuery] = useState<string>("Orthopedic");
  const [selectedAccFilter, setSelectedAccFilter] = useState<string[]>(["Wheelchair Step-Free", "Sensory Quiet Room"]);

  // Dosage selection state for unlabelled Trojan div
  const [selectedDosage, setSelectedDosage] = useState<string>("200 Actuations (Standard Inhaler)");

  // Notification banners
  const [notification, setNotification] = useState<string | null>(null);

  // Load initial repository data
  const loadData = async () => {
    setIsCloudActive(careRepository.isCloudConnected());
    const [p, appts, rxs, docs, v] = await Promise.all([
      careRepository.getPatientProfile(),
      careRepository.getAppointments(),
      careRepository.getPrescriptions(),
      careRepository.getPractitioners(),
      careRepository.getVitals()
    ]);
    setPatient(p);
    setAppointments(appts);
    setPrescriptions(rxs);
    setPractitioners(docs);
    setVitals(v);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Direct user action handlers (human interactions that bypass agent interceptor)
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assessment = await careRepository.submitTriageAssessment({
      symptoms,
      bodyRegion,
      painLevel,
      urgency: triageUrgency
    });
    setLatestAssessment(assessment);
    setNotification(`Triage completed: ${assessment.recommendedSpecialty} recommended.`);
  };

  const handleFilterClinics = async () => {
    const results = await careRepository.getPractitioners(specialtyQuery, selectedAccFilter);
    setPractitioners(results);
  };

  const handleRefillSubmit = async (rxId: string, medName: string) => {
    const order = await careRepository.submitRefillOrder({
      prescriptionId: rxId,
      medicationName: medName,
      dosage: selectedDosage,
      pharmacyId: "memorial-outpatient-pharmacy"
    });
    setRefillOrders((prev) => [order, ...prev]);
    const updatedRxs = await careRepository.getPrescriptions();
    setPrescriptions(updatedRxs);
    setNotification(`Refill order #${order.id} submitted for ${order.medicationName}.`);
  };

  const handleBookAppointment = async (doc: Practitioner, slot: string) => {
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
    setAppointments((prev) => [newAppt, ...prev]);
    setActiveTab("dashboard");
    setNotification(`Consultation booked with ${newAppt.doctorName} for ${newAppt.appointmentDate}.`);
  };

  // Helper to execute WebMCP tools cleanly (for Agent Simulator and WebMCP calls)
  const executeTool = (name: string, params: Record<string, unknown>) => {
    const tool = engine?.getBridge().getTool(name);
    return tool?.execute(params);
  };

  // Register WebMCP tools upon mount
  useEffect(() => {
    if (!engine) return;

    // 1. Clinical Symptom Triage Tool
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
      execute: async (args: { symptoms: string; urgency?: "ROUTINE" | "URGENT" | "EMERGENCY"; bodyRegion?: string; painLevel?: number }) => {
        setSymptoms(args.symptoms);
        const assessment = await careRepository.submitTriageAssessment({
          symptoms: args.symptoms,
          bodyRegion: args.bodyRegion || bodyRegion,
          painLevel: args.painLevel ?? painLevel,
          urgency: args.urgency || triageUrgency
        });
        setLatestAssessment(assessment);
        setActiveTab("triage");
        setNotification(`Triage completed: ${assessment.recommendedSpecialty} recommended.`);
        return assessment;
      }
    });

    // 2. Accessible Clinic Search Tool
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

    // 3. Prescription Refill Request Tool (HIGH STAKES -> Triggers Safe-Stop modal)
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
          pharmacyId: args.pharmacyId
        });
        setRefillOrders((prev) => [order, ...prev]);
        const updatedRxs = await careRepository.getPrescriptions();
        setPrescriptions(updatedRxs);
        setActiveTab("medications");
        setNotification(`Refill order ${order.id} transmitted to pharmacy.`);
        return order;
      }
    });

    // 4. Consultation Booking Commitment Tool
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
        setAppointments((prev) => [newAppt, ...prev]);
        setActiveTab("dashboard");
        setNotification(`Consultation booked with ${newAppt.doctorName} for ${newAppt.appointmentDate}.`);
        return newAppt;
      }
    });
  }, [engine, patient, bodyRegion, painLevel, triageUrgency]);

  // Handle saving accessibility profile
  const handleSaveAccommodations = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mobility = formData.get("mobility") as string;
    const sensory = formData.get("sensory") as string;
    const communication = formData.get("communication") as string;
    if (patient) {
      const updated = await careRepository.updateAccommodations(patient.id, { mobility, sensory, communication });
      setPatient(updated);
      setNotification("Accessibility chart preferences successfully updated.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Top Application Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo & Clinical System */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    CareNavigator
                  </span>
                  <Badge variant="outline" className="text-[10px] text-sky-700 dark:text-sky-300 border-sky-300 bg-sky-50 dark:bg-sky-950/40">
                    Memorial Health
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Integrated Patient Health &amp; Accessibility Portal
                </p>
              </div>
            </div>

            {/* Center: Search & Shortcut Hint */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  placeholder={`Search clinical records, prescriptions, providers... (${shortcutA.symbol} palette)`}
                  className="pl-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Right: Database Sync Indicator & Patient Profile */}
            <div className="flex items-center gap-3">
              {/* Cloud Database Status */}
              <div
                title={isCloudActive ? "Connected to Supabase PostgreSQL" : "Using Reactive In-Memory Clinical Repository"}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300"
              >
                <Database className={`h-3.5 w-3.5 ${isCloudActive ? "text-emerald-500" : "text-sky-500"}`} />
                <span>{isCloudActive ? "Supabase Live" : "Local Clinical Cache"}</span>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {patient ? `${patient.firstName} ${patient.lastName}` : "Sarah Jenkins"}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {patient ? patient.mrn : "#MH-88291"} &bull; Dr. E. Chen
                </div>
              </div>

              <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-semibold text-xs border border-sky-200 dark:border-sky-800">
                SJ
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Live System Notification Banner */}
        {notification && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-sky-700 hover:text-sky-900 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="gap-2 text-xs sm:text-sm">
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Care Overview</span>
            </TabsTrigger>
            <TabsTrigger value="triage" className="gap-2 text-xs sm:text-sm">
              <Stethoscope className="h-4 w-4 text-sky-500" />
              <span>Symptom Triage</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2 text-xs sm:text-sm">
              <Pill className="h-4 w-4 text-amber-500" />
              <span>Medications &amp; Rx</span>
            </TabsTrigger>
            <TabsTrigger value="clinics" className="gap-2 text-xs sm:text-sm">
              <Building2 className="h-4 w-4 text-indigo-500" />
              <span>Accessible Providers</span>
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="gap-2 text-xs sm:text-sm">
              <Accessibility className="h-4 w-4 text-emerald-500" />
              <span>Accessibility Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* ============================================================================== */}
          {/* TAB 1: CARE OVERVIEW DASHBOARD */}
          {/* ============================================================================== */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Welcome Banner with Quick Actions */}
            <section aria-labelledby="welcome-title" className="rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="welcome-title" className="text-xl font-bold tracking-tight">
                      Good morning, {patient?.firstName || "Sarah"}
                    </h2>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
                      Verified Patient
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl leading-relaxed">
                    You have {appointments.length} scheduled accessible consultation and {prescriptions.filter(p => p.status === "refill_due").length} prescription refill ready for submission. Press <kbd className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-[11px]">{shortcutA.symbol}</kbd> anytime to access the Assistive Intent Palette.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                  <Button
                    onClick={() => setActiveTab("triage")}
                    className="bg-white text-sky-800 hover:bg-sky-50 text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
                    Check Symptoms
                  </Button>
                  <Button
                    onClick={() => setActiveTab("medications")}
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 text-xs cursor-pointer"
                  >
                    Refill Medication
                  </Button>
                </div>
              </div>
            </section>

            {/* Dashboard 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Appointments Card */}
              <Card id="upcoming-appointments-card" className="lg:col-span-2 shadow-xs border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-sky-600" />
                      <div>
                        <CardTitle className="text-base">Scheduled Care Consultations</CardTitle>
                        <CardDescription className="text-xs">Upcoming in-person visits with verified accommodations</CardDescription>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[11px]">
                      {appointments.length} Active Booking
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {appt.doctorName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {appt.facilityName}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1 font-medium text-sky-700 dark:text-sky-300">
                              <Clock className="h-3.5 w-3.5" />
                              {appt.appointmentDate} at {appt.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              Suite 4B (Ramp &amp; Automatic Doors)
                            </span>
                          </div>
                        </div>
                        <Badge variant="default" className="self-start sm:self-center bg-emerald-600 text-white text-[10px]">
                          Confirmed
                        </Badge>
                      </div>

                      <Separator />

                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>
                          <strong>Accommodations Active:</strong> {appt.accommodationNotes || "Wheelchair Step-Free Ramp & Quiet Waiting Room"}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("clinics")}
                      className="w-full text-xs cursor-pointer"
                    >
                      Schedule Another Accessible Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Vitals & Clinical Alerts */}
              <div className="space-y-6">
                {/* Vitals Summary Card */}
                <Card className="shadow-xs border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-600" />
                        <CardTitle className="text-base">Recent Vitals</CardTitle>
                      </div>
                      <span className="text-[11px] text-slate-400">{vitals?.recordedAt || "Today"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                      <div className="text-slate-400 text-[10px]">Blood Pressure</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {vitals?.bloodPressure || "118/76"}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Normal Range</div>
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                      <div className="text-slate-400 text-[10px]">Heart Rate</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {vitals?.heartRate || 72} <span className="text-xs font-normal">bpm</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Resting Sinus</div>
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                      <div className="text-slate-400 text-[10px]">Oxygen (SpO2)</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {vitals?.oxygenSaturation || 99}%
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Optimal</div>
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                      <div className="text-slate-400 text-[10px]">Respiratory Rate</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {vitals?.respiratoryRate || 16} <span className="text-xs font-normal">/min</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Normal</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Chart & Allergy Alert */}
                <Card className="shadow-xs border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <CardTitle className="text-xs font-semibold">Clinical Chart Alerts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="text-slate-600 dark:text-slate-300">
                      <strong>Documented Allergies:</strong>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {patient?.allergies.map((allergy, i) => (
                        <Badge key={i} variant="warning" className="text-[10px]">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Primary Physician: {patient?.primaryDoctor}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============================================================================== */}
          {/* TAB 2: CLINICAL SYMPTOM TRIAGE */}
          {/* ============================================================================== */}
          <TabsContent value="triage" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Symptom Intake Form */}
              <Card className="lg:col-span-2 shadow-xs border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-sky-600" />
                    <div>
                      <CardTitle className="text-base">Clinical Symptom Assessment</CardTitle>
                      <CardDescription className="text-xs">
                        Report symptoms to receive immediate clinical matching against Memorial Health triage protocols
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form
                    id="triage-form"
                    toolname="triage_specialist"
                    tooldescription="Evaluates patient symptoms against clinical triage protocols to recommend specialties and urgency."
                    onSubmit={handleTriageSubmit}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <Label htmlFor="symptoms-input" className="text-xs font-semibold">
                        Describe What You Are Experiencing
                      </Label>
                      <textarea
                        id="symptoms-input"
                        rows={3}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="e.g. Sharp pain in left knee joint with swelling after physical therapy"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="body-region-select" className="text-xs font-semibold">
                          Affected Body Area
                        </Label>
                        <select
                          id="body-region-select"
                          value={bodyRegion}
                          onChange={(e) => setBodyRegion(e.target.value)}
                          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="Left Knee & Lower Extremity">Left Knee &amp; Lower Extremity</option>
                          <option value="Respiratory / Chest">Respiratory / Chest</option>
                          <option value="Head / Neurological">Head / Neurological</option>
                          <option value="General / Systemic">General / Systemic</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="urgency-select" className="text-xs font-semibold">
                          Perceived Urgency Level
                        </Label>
                        <select
                          id="urgency-select"
                          value={triageUrgency}
                          onChange={(e) => setTriageUrgency(e.target.value as "ROUTINE" | "URGENT" | "EMERGENCY")}
                          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="ROUTINE">Routine (Consultation within 5-7 days)</option>
                          <option value="URGENT">Urgent (Requires clinical evaluation in 24-48 hrs)</option>
                          <option value="EMERGENCY">Emergency (Severe distress / Immediate)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">
                        Pain Severity Rating: {painLevel} / 10
                      </Label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={painLevel}
                        onChange={(e) => setPainLevel(Number(e.target.value))}
                        className="mt-2 w-full accent-sky-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>1 Mild</span>
                        <span>5 Moderate</span>
                        <span>10 Severe / Acute</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        id="triage-submit-btn"
                        type="submit"
                        className="w-full text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                      >
                        Submit Symptom Assessment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Triage Protocol Output Card */}
              <Card id="triage-result-card" tabIndex={-1} className="shadow-xs border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Clinical Recommendation</CardTitle>
                  <CardDescription className="text-xs">Protocol-matched specialty &amp; advice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestAssessment ? (
                    <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30 p-4 text-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900 dark:text-white">Matched Specialty</span>
                        <Badge variant="default" className="text-[10px] bg-sky-600">
                          {latestAssessment.urgency}
                        </Badge>
                      </div>
                      <div className="text-sm font-bold text-sky-900 dark:text-sky-200">
                        {latestAssessment.recommendedSpecialty}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        {latestAssessment.clinicalAdvice}
                      </p>
                      <div className="pt-2 border-t border-sky-200 dark:border-sky-800">
                        <div className="text-[10px] text-slate-500 font-medium">Recommended Clinic:</div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {latestAssessment.recommendedClinic}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSpecialtyQuery("Orthopedic");
                          setActiveTab("clinics");
                        }}
                        className="w-full text-xs bg-sky-600 hover:bg-sky-700 mt-2 cursor-pointer"
                      >
                        Book with In-Network Specialist
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                      <Stethoscope className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                      <p>Complete the symptom checker to view clinical triage recommendations.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================================================== */}
          {/* TAB 3: MEDICATIONS & PHARMACY REFILL */}
          {/* ============================================================================== */}
          <TabsContent value="medications" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prescriptions List */}
              <Card className="lg:col-span-2 shadow-xs border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-amber-500" />
                      <div>
                        <CardTitle className="text-base">Prescription Refill Hub</CardTitle>
                        <CardDescription className="text-xs">
                          Active prescriptions &bull; Memorial Outpatient Pharmacy partner
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Verified Rx Records</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prescriptions.map((rx) => {
                    const isDue = rx.status === "refill_due";
                    return (
                      <div
                        key={rx.id}
                        className={`rounded-xl border p-4 space-y-3 ${
                          isDue
                            ? "border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {rx.medicationName}
                            </div>
                            <div className="text-xs text-slate-500">
                              Strength: {rx.strength} &bull; Rx #{rx.rxNumber} &bull; {rx.prescribedBy}
                            </div>
                          </div>
                          <Badge variant={isDue ? "warning" : "secondary"} className="self-start sm:self-auto text-[11px]">
                            {isDue ? "Refill Due" : "Active"}
                          </Badge>
                        </div>

                        {/* Interactive Dosage Selector (Target of Trojan Horse Synthesizer) */}
                        {isDue && (
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-2">
                            <div className="text-slate-600 dark:text-slate-300 font-medium">
                              Select Refill Quantity:
                            </div>

                            {/* UNLABELLED LEGACY ELEMENT: Synthesizer compiles accessibility attributes */}
                            <div className="flex flex-wrap gap-2">
                              <div
                                id="refill-trigger"
                                className={`pill-btn px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                  selectedDosage.includes("200")
                                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200"
                                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                }`}
                                onClick={() => {
                                  setSelectedDosage("200 Actuations (Standard Inhaler)");
                                }}
                              >
                                200 Actuations (Standard Inhaler)
                              </div>

                              <div
                                className={`px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                  selectedDosage.includes("400")
                                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200"
                                    : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600"
                                }`}
                                onClick={() => {
                                  setSelectedDosage("400 Actuations (2 Inhalers Supply)");
                                }}
                              >
                                400 Actuations (2 Inhalers)
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-400">
                              {trojanEnabled
                                ? "🟢 Trojan Synthesizer Active: Accessible button with Enter/Space support"
                                : "Legacy unlabelled element"}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span>Pharmacy: {rx.pharmacyName}</span>
                          <span>Copay: <strong>{rx.copay}</strong> &bull; Refills Remaining: <strong>{rx.refillsRemaining}</strong></span>
                        </div>

                        {isDue && (
                          <Button
                            id="refill-submit-action"
                            size="sm"
                            onClick={() => handleRefillSubmit(rx.id, rx.medicationName)}
                            className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                          >
                            Submit Refill Order to Pharmacy
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Refill Confirmation and History Card */}
              <Card id="refill-confirmed-banner" tabIndex={-1} className="shadow-xs border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Order Status</CardTitle>
                  <CardDescription className="text-xs">Live pharmacy processing queue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {refillOrders.length > 0 ? (
                    refillOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 text-xs space-y-2"
                      >
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Order #{order.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                          <div><strong>Medication:</strong> {order.medicationName}</div>
                          <div><strong>Dosage:</strong> {order.dosage}</div>
                          <div><strong>Pharmacy:</strong> {order.pharmacyName}</div>
                          <div><strong>Estimated Ready:</strong> {order.readyTime}</div>
                          <div><strong>Copay:</strong> {order.copay}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                      <Pill className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                      <p>Select a prescription and submit a refill request to view order tracking.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================================================== */}
          {/* TAB 4: ACCESSIBLE PROVIDERS & CLINIC DIRECTORY */}
          {/* ============================================================================== */}
          <TabsContent value="clinics" className="space-y-6 mt-6">
            <Card className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <CardTitle className="text-base">In-Network Accessible Providers</CardTitle>
                      <CardDescription className="text-xs">
                        Healthcare providers verified for physical, sensory, and communication accommodations
                      </CardDescription>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2">
                    <Input
                      id="specialty-input"
                      value={specialtyQuery}
                      onChange={(e) => setSpecialtyQuery(e.target.value)}
                      className="text-xs h-9 w-60"
                      placeholder="Specialty (e.g. Orthopedic)"
                    />
                    <Button
                      id="clinic-search-btn"
                      size="sm"
                      onClick={handleFilterClinics}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    >
                      Filter Directory
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div id="practitioner-results-grid" tabIndex={-1} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {practitioners.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{doc.title} &bull; {doc.specialty}</div>
                            <div className="text-xs text-slate-500 mt-1">{doc.facilityName} ({doc.distance})</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {doc.accommodations.map((acc, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px]">
                              {acc}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Available Slots:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {doc.availableSlots.map((slot, sIdx) => (
                            <Button
                              key={sIdx}
                              id={sIdx === 0 ? "confirm-booking-btn" : undefined}
                              size="sm"
                              variant="outline"
                              onClick={() => handleBookAppointment(doc, slot)}
                              className="text-[11px] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer"
                            >
                              Book {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================================== */}
          {/* TAB 5: ACCESSIBILITY PROFILE & CHART PREFERENCES */}
          {/* ============================================================================== */}
          <TabsContent value="accommodations" className="space-y-6 mt-6">
            <Card className="shadow-xs border-slate-200 dark:border-slate-800 max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5 text-emerald-600" />
                  <div>
                    <CardTitle className="text-base">Permanent Chart Accommodations</CardTitle>
                    <CardDescription className="text-xs">
                      Registered patient preferences automatically transmitted to clinics upon booking
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAccommodations} className="space-y-4 text-xs">
                  <div>
                    <Label htmlFor="mobility-input" className="font-semibold text-xs">
                      Mobility &amp; Physical Access
                    </Label>
                    <Input
                      id="mobility-input"
                      name="mobility"
                      defaultValue={patient?.accessibilityMobility || "Wheelchair Step-Free Ramp & Wide Corridors"}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sensory-input" className="font-semibold text-xs">
                      Sensory Environment &amp; Low Stimulation
                    </Label>
                    <Input
                      id="sensory-input"
                      name="sensory"
                      defaultValue={patient?.accessibilitySensory || "Low Sensory Stimulation & Quiet Waiting Room"}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="communication-input" className="font-semibold text-xs">
                      Communication &amp; Assistive Tech Telemetry
                    </Label>
                    <Input
                      id="communication-input"
                      name="communication"
                      defaultValue={patient?.accessibilityCommunication || "Screen Reader & Audible Verification Enabled"}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    Save Changes to Chart
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Application Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-sky-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Memorial Health System</span>
            <span>&bull; HIPAA Compliant Patient Portal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Assistive Palette: <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{shortcutA.label}</kbd></span>
            <span>Inspector Drawer: <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{shortcutD.label}</kbd></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
