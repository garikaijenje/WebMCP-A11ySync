"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useA11ySync } from "@a11ysync/react";
import { Stethoscope, MapPin, Pill, CalendarCheck, ShieldCheck, User, Sparkles, Volume2, AlertCircle } from "lucide-react";

export default function CareNavigatorPage() {
  const { engine, trojanEnabled, setTrojanEnabled, setIsDrawerOpen } = useA11ySync();

  // State for triage card
  const [symptoms, setSymptoms] = useState<string>("Severe left knee pain and swelling after physical therapy");
  const [triageUrgency, setTriageUrgency] = useState<string>("urgent");
  const [triageResult, setTriageResult] = useState<string | null>(null);

  // State for clinic search
  const [specialty, setSpecialty] = useState<string>("Orthopedic Physical Therapy");
  const [clinicResult, setClinicResult] = useState<string | null>(null);

  // State for prescription refill
  const [refillStatus, setRefillStatus] = useState<string | null>(null);

  // State for appointment booking
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const executeTool = (name: string, params: Record<string, unknown>) => {
    const tool = engine?.getBridge().getTool(name);
    return tool?.execute(params);
  };

  // Register WebMCP tools upon mount
  useEffect(() => {
    if (!engine) return;

    // 1. Register Triage Specialist Tool
    window.document.modelContext?.registerTool({
      name: "triage_specialist",
      description: "Matches reported medical symptoms to clinical specialty and urgency level.",
      inputSchema: {
        type: "object",
        properties: {
          symptoms: { type: "string", description: "Patient reported symptoms" },
          urgency: { type: "string", enum: ["routine", "urgent", "emergency"] }
        },
        required: ["symptoms"]
      },
      accessibility: {
        relatedElement: "#triage-submit-btn",
        humanActionLabel: "Triage Symptoms and Match Specialist",
        liveAnnouncements: {
          onStart: "Agent is triaging patient symptoms with hospital clinical protocols...",
          onSuccess: "Triage complete: Patient matched with Orthopedic Physical Therapy (Urgent)."
        },
        focusTargetOnComplete: "#triage-result-banner"
      },
      execute: async ({ symptoms: sym, urgency: urg }: { symptoms: string; urgency?: string }) => {
        setSymptoms(sym);
        if (urg) setTriageUrgency(urg);
        const result = `Matched Specialty: Orthopedic Physical Therapy | Urgency: ${urg?.toUpperCase() || "URGENT"} | Recommended Clinic: Memorial Accessible Health Center`;
        setTriageResult(result);
        return { matchedSpecialty: "Orthopedic Physical Therapy", urgency: urg || "urgent", recommendedClinicId: "oakwood-rehab" };
      }
    });

    // 2. Register Accessible Clinic & Accommodation Search Tool
    window.document.modelContext?.registerTool({
      name: "find_accessible_clinic",
      description: "Locates in-network healthcare facilities offering specific physical, sensory, or communication accommodations.",
      inputSchema: {
        type: "object",
        properties: {
          specialty: { type: "string", description: "Medical specialty required" },
          accommodations: {
            type: "array",
            items: {
              type: "string",
              enum: ["wheelchair-step-free", "asl-interpreter", "sensory-quiet-room", "braille-signage"]
            },
            description: "Accessibility accommodations required"
          },
          insuranceNetwork: { type: "string" }
        },
        required: ["specialty"]
      },
      accessibility: {
        relatedElement: "#clinic-search-btn",
        humanActionLabel: "Search In-Network Accessible Clinics",
        liveAnnouncements: {
          onStart: "Agent is searching hospital directory for verified accessible providers...",
          onSuccess: "Found 2 in-network clinics with step-free wheelchair access and quiet rooms."
        },
        focusTargetOnComplete: "#clinic-result-banner"
      },
      execute: async ({ specialty: spec }: { specialty: string }) => {
        setSpecialty(spec);
        const res = `Verified Providers: Memorial Health Pavilion (0.8 mi, Wheelchair Step-Free, ASL Interpreter on-site) and Oakwood Rehab Center (2.1 mi, Sensory-Quiet Rooms).`;
        setClinicResult(res);
        return {
          matches: [
            { name: "Memorial Health Pavilion", distance: "0.8 miles", accommodations: ["wheelchair-step-free", "asl-interpreter"] },
            { name: "Oakwood Rehab Center", distance: "2.1 miles", accommodations: ["sensory-quiet-room", "wheelchair-step-free"] }
          ]
        };
      }
    });

    // 3. Register Prescription Refill (HIGH STAKES -> Triggers Safe-Stop Modal)
    window.document.modelContext?.registerTool({
      name: "request_prescription_refill",
      description: "Submits an official pharmacy refill request for an active prescription.",
      inputSchema: {
        type: "object",
        properties: {
          medicationName: { type: "string" },
          dosage: { type: "string" },
          pharmacyId: { type: "string" }
        },
        required: ["medicationName", "dosage", "pharmacyId"]
      },
      accessibility: {
        relatedElement: "#refill-trigger",
        requiresHumanConfirmation: true,
        humanActionLabel: "Refill Albuterol Inhaler (90mcg)",
        liveAnnouncements: {
          onStart: "Agent is preparing prescription refill request for Albuterol Inhaler...",
          onSuccess: "Prescription refill submitted to Memorial Outpatient Pharmacy. Ready in 2 hours."
        },
        focusTargetOnComplete: "#refill-status-banner"
      },
      execute: async ({ medicationName, dosage }: { medicationName: string; dosage: string }) => {
        const status = `Refill Request Approved! Rx: ${medicationName} (${dosage}) sent to Memorial Outpatient Pharmacy. Copay: $15.00. Ready by 3:00 PM.`;
        setRefillStatus(status);
        return { status: "submitted", confirmationNumber: "RX-99210-4A" };
      }
    });

    // 4. Register Appointment Booking Commitment Tool
    window.document.modelContext?.registerTool({
      name: "confirm_appointment",
      description: "Books the verified consultation time slot into the hospital scheduling system.",
      inputSchema: {
        type: "object",
        properties: {
          clinicId: { type: "string" },
          date: { type: "string" },
          timeSlot: { type: "string" },
          accommodationNotes: { type: "string" }
        },
        required: ["clinicId", "date", "timeSlot"]
      },
      accessibility: {
        relatedElement: "#confirm-booking-btn",
        humanActionLabel: "Confirm Consultation Booking",
        liveAnnouncements: {
          onStart: "Agent is locking consultation slot in hospital clinical scheduler...",
          onSuccess: "Appointment confirmed for Friday, Sep 18 at 10:30 AM with accessibility accommodations."
        },
        focusTargetOnComplete: "#booking-status-banner"
      },
      execute: async ({ date, timeSlot, accommodationNotes }: { date: string; timeSlot: string; accommodationNotes?: string }) => {
        const msg = `Confirmed Consultation on ${date} at ${timeSlot}. Accommodations registered: ${accommodationNotes || "Standard"}.`;
        setBookingStatus(msg);
        return { bookingId: "BK-54812", status: "confirmed" };
      }
    });
  }, [engine]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner: Patient Portal Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  CareNavigator
                </h1>
                <Badge variant="outline" className="text-[10px] text-sky-700 dark:text-sky-300 border-sky-300 bg-sky-50 dark:bg-sky-950/40">
                  Memorial Health System
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accessible Clinical Triage & Prescription Hub
              </p>
            </div>
          </div>

          {/* Patient Details & Status */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 px-3 py-1.5">
              <User className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</span>
                <span className="text-slate-400 dark:text-slate-500 ml-1.5">ID: #MH-88291</span>
              </div>
            </div>

            <Badge variant="success" className="hidden sm:inline-flex items-center gap-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              WebMCP Agent-Ready
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>Inspector (Alt+D)</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Trojan Horse Explainer Callout */}
        <section aria-labelledby="curb-cut-title" className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-600/10 text-sky-700 dark:text-sky-300">
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="curb-cut-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  The Bi-Directional Accessibility Runtime: Trojan Horse Compilation
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Notice the dosage selection element below. It was authored as an unlabelled legacy <code className="text-sky-700 dark:text-sky-300 font-mono text-[11px]">&lt;div class=&quot;pill-btn&quot;&gt;</code>.
                  With A11ySync active, the WebMCP tool schema compiler automatically synthesizes <code className="text-sky-700 dark:text-sky-300 font-mono text-[11px]">role=&quot;button&quot;</code>, <code className="text-sky-700 dark:text-sky-300 font-mono text-[11px]">tabindex=&quot;0&quot;</code>, accessible names, and Enter/Space keyboard handlers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant={trojanEnabled ? "default" : "destructive"}
                size="sm"
                onClick={() => setTrojanEnabled(!trojanEnabled)}
                className="text-xs font-semibold whitespace-nowrap"
              >
                {trojanEnabled ? "🟢 A11ySync Trojan: ON" : "🔴 A11ySync Trojan: OFF"}
              </Button>
            </div>
          </div>
        </section>

        {/* Clinical Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Clinical Symptom Triage (Declarative + Imperative WebMCP) */}
          <Card id="triage-card" className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
                    <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base">1. Clinical Symptom Triage</CardTitle>
                    <CardDescription className="text-xs">Matches patient symptoms to specialists</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  tool: triage_specialist
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Declarative WebMCP Form Markup */}
              <form
                id="triage-form"
                toolname="triage_specialist"
                tooldescription="Matches reported medical symptoms to clinical specialty and urgency level."
                onSubmit={(e) => {
                  e.preventDefault();
                  executeTool("triage_specialist", {
                    symptoms,
                    urgency: triageUrgency
                  });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <Label htmlFor="symptoms-input" className="text-xs">Reported Symptoms</Label>
                  <Input
                    id="symptoms-input"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="mt-1 text-xs"
                    placeholder="Describe symptoms (e.g. knee swelling, acute headache)"
                  />
                </div>

                <div>
                  <Label htmlFor="urgency-select" className="text-xs">Perceived Urgency</Label>
                  <select
                    id="urgency-select"
                    value={triageUrgency}
                    onChange={(e) => setTriageUrgency(e.target.value)}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="routine">Routine Checkup</option>
                    <option value="urgent">Urgent Consultation</option>
                    <option value="emergency">Immediate Emergency</option>
                  </select>
                </div>

                <Button
                  id="triage-submit-btn"
                  type="submit"
                  size="sm"
                  className="w-full mt-2 text-xs"
                >
                  Run Symptom Triage Tool
                </Button>
              </form>

              {triageResult && (
                <div
                  id="triage-result-banner"
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="p-3 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/40 text-xs text-sky-900 dark:text-sky-200"
                >
                  <strong className="block font-semibold">Triage Result:</strong>
                  <span>{triageResult}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              Imperative API &amp; Declarative &lt;form toolname&gt; enabled
            </CardFooter>
          </Card>

          {/* Card 2: Accessible Clinic Search */}
          <Card id="clinic-card" className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base">2. Accessible Accommodations Search</CardTitle>
                    <CardDescription className="text-xs">Locates clinics with verified physical &amp; sensory access</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  tool: find_accessible_clinic
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <Label htmlFor="specialty-input" className="text-xs">Required Clinical Specialty</Label>
                  <Input
                    id="specialty-input"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-medium text-slate-700 dark:text-slate-300">Required Accommodations</legend>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                      <span>Wheelchair Step-Free</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                      <span>Sensory Quiet Room</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-sky-600" />
                      <span>ASL Interpreter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-sky-600" />
                      <span>Braille Signage</span>
                    </label>
                  </div>
                </fieldset>

                <Button
                  id="clinic-search-btn"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    executeTool("find_accessible_clinic", { specialty });
                  }}
                  className="w-full text-xs"
                >
                  Locate Accessible Providers
                </Button>
              </div>

              {clinicResult && (
                <div
                  id="clinic-result-banner"
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="p-3 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs text-indigo-900 dark:text-indigo-200"
                >
                  <strong className="block font-semibold">Matched Facilities:</strong>
                  <span>{clinicResult}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              Schema.org MedicalFacility accommodation filter active
            </CardFooter>
          </Card>

          {/* Card 3: Prescription Refill Hub (HIGH STAKES -> SAFE-STOP DEMO) */}
          <Card id="refill-card" className="border-amber-200 dark:border-amber-900/40 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Pill className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      3. Active Prescription Refill Hub
                      <Badge variant="warning" className="text-[10px]">Safe-Stop Guarded</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">High-stakes action requiring human confirmation</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  tool: request_prescription_refill
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Albuterol Sulfate Inhalation Aerosol</span>
                  <Badge variant="outline">Active Rx</Badge>
                </div>
                <div className="text-slate-500">Dosage: 90 mcg/actuation | Refills Remaining: 2</div>

                {/* THE UNLABELLED LEGACY DIV: Target for Trojan Synthesizer! */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 block mb-1">Select Refill Quantity:</span>
                  <div
                    id="refill-trigger"
                    className="pill-btn inline-block px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-medium text-xs cursor-pointer hover:border-sky-500 transition-all"
                    onClick={() => {
                      executeTool("request_prescription_refill", {
                        medicationName: "Albuterol Inhaler (90mcg)",
                        dosage: "200 Actuations (Standard Inhaler)",
                        pharmacyId: "memorial-outpatient-pharmacy"
                      });
                    }}
                  >
                    200 Doses (Standard Refill)
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    {trojanEnabled
                      ? "🟢 Trojan Synthesizer Active: Synthesized role='button', tabindex='0', and aria-label"
                      : "🔴 Trojan Off: Unlabelled dead <div> element without keyboard support"}
                  </span>
                </div>
              </div>

              {refillStatus && (
                <div
                  id="refill-status-banner"
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200"
                >
                  <strong className="block font-semibold">Refill Confirmed:</strong>
                  <span>{refillStatus}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              Guaranteed Human-in-the-Loop Safe-Stop modal with AbortSignal
            </CardFooter>
          </Card>

          {/* Card 4: Verified Appointment Commitment */}
          <Card id="booking-card" className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base">4. Consultation Booking Commitment</CardTitle>
                    <CardDescription className="text-xs">Books verified accessible time slots into hospital schedule</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  tool: confirm_appointment
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Oakwood Rehab Center — Suite 4B</div>
                  <div className="text-slate-500">Selected Date: Friday, September 18, 2026</div>
                  <div className="text-slate-500">Slot: 10:30 AM – 11:30 AM (Wheelchair Step-Free)</div>
                </div>

                <Button
                  id="confirm-booking-btn"
                  size="sm"
                  onClick={() => {
                    executeTool("confirm_appointment", {
                      clinicId: "oakwood-rehab",
                      date: "2026-09-18",
                      timeSlot: "10:30 AM",
                      accommodationNotes: "Step-free ramp and quiet room requested"
                    });
                  }}
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm &amp; Book Time Slot
                </Button>
              </div>

              {bookingStatus && (
                <div
                  id="booking-status-banner"
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200"
                >
                  <strong className="block font-semibold">Booking Status:</strong>
                  <span>{bookingStatus}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              Automated focus shift to confirmation banner on completion
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>WebMCP-A11ySync Runtime &bull; CareNavigator Patient Portal</span>
          <span>Open Source W3C WebML &amp; APA Protocol RFC Proposal</span>
        </div>
      </footer>
    </div>
  );
}
