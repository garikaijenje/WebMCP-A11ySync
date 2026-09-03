"use client";

import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  MapPin,
  Pill,
  Stethoscope
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState, PageHeading, StatCard, StatSkeleton } from "@/components/dashboard/widgets";
import type { CareView } from "@/components/dashboard/nav";
import type {
  Appointment,
  PatientProfile,
  PatientVitals,
  Prescription,
  RefillOrder,
  TriageAssessment
} from "@/lib/careRepository";

interface OverviewViewProps {
  loading: boolean;
  patient: PatientProfile | null;
  appointments: Appointment[];
  prescriptions: Prescription[];
  vitals: PatientVitals | null;
  refillOrders: RefillOrder[];
  latestAssessment: TriageAssessment | null;
  onNavigate: (tab: CareView) => void;
}

export function OverviewView({
  loading,
  patient,
  appointments,
  prescriptions,
  vitals,
  refillOrders,
  latestAssessment,
  onNavigate
}: OverviewViewProps) {
  const refillsDue = prescriptions.filter((p) => p.status === "refill_due");
  const nextAppt = appointments[0];

  return (
    <div className="space-y-6">
      <PageHeading
        title={`Good ${daypart()}, ${patient?.firstName ?? "Sarah"}`}
        description="Your upcoming care, medications and recent vitals — all synced live from Memorial Health records."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => onNavigate("triage")}>
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              Check symptoms
            </Button>
            <Button size="sm" onClick={() => onNavigate("medications")}>
              <Pill className="h-4 w-4" aria-hidden="true" />
              Refill medication
            </Button>
          </>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={CalendarCheck}
              label="Upcoming visits"
              value={String(appointments.length)}
              sub={nextAppt ? `${nextAppt.appointmentDate}` : "No visits scheduled"}
              tone="sky"
              onClick={() => onNavigate("clinics")}
            />
            <StatCard
              icon={Pill}
              label="Refills due"
              value={String(refillsDue.length)}
              sub={refillsDue[0]?.medicationName.split(" ").slice(0, 2).join(" ") ?? "All caught up"}
              tone={refillsDue.length > 0 ? "amber" : "emerald"}
              onClick={() => onNavigate("medications")}
            />
            <StatCard
              icon={HeartPulse}
              label="Blood pressure"
              value={vitals?.bloodPressure.split(" ")[0] ?? "—"}
              sub={`Checked ${vitals?.recordedAt ?? "recently"} · Normal range`}
              tone="rose"
            />
            <StatCard
              icon={Activity}
              label="Triage status"
              value={latestAssessment ? latestAssessment.urgency : "—"}
              sub={latestAssessment ? latestAssessment.recommendedSpecialty.split("&")[0].trim() : "No assessment yet"}
              tone="indigo"
              onClick={() => onNavigate("triage")}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <Card id="upcoming-appointments-card" tabIndex={-1} className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Scheduled consultations</CardTitle>
              <CardDescription>Upcoming visits with verified accommodations</CardDescription>
            </div>
            <Badge variant="success">{appointments.length} active</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No upcoming visits"
                description="Book an accessible consultation with an in-network specialist."
                action={
                  <Button size="sm" onClick={() => onNavigate("clinics")}>
                    Find providers <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                }
              />
            ) : (
              appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-bold">{appt.doctorName}</div>
                      <div className="text-xs text-muted-foreground">{appt.facilityName}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="inline-flex items-center gap-1 font-medium text-sky-700 dark:text-sky-300">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {appt.appointmentDate} at {appt.timeSlot}
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          Step-free access confirmed
                        </span>
                      </div>
                    </div>
                    <Badge variant="success" className="self-start sm:self-center">
                      {appt.status}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      <strong>Accommodations active:</strong>{" "}
                      {appt.accommodationNotes ?? "Wheelchair step-free ramp & quiet waiting room"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right rail */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent vitals</CardTitle>
              <CardDescription>{vitals?.recordedAt ?? "Latest readings"}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
              <VitalTile label="Blood pressure" value={vitals?.bloodPressure ?? "—"} note="Normal" />
              <VitalTile label="Heart rate" value={vitals ? `${vitals.heartRate} bpm` : "—"} note="Resting" />
              <VitalTile label="Oxygen SpO₂" value={vitals ? `${vitals.oxygenSaturation}%` : "—"} note="Optimal" />
              <VitalTile label="Resp. rate" value={vitals ? `${vitals.respiratoryRate}/min` : "—"} note="Normal" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Refill queue</CardTitle>
              <CardDescription>Live pharmacy processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {refillOrders.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  No orders in progress.{" "}
                  <button onClick={() => onNavigate("medications")} className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                    Start a refill
                  </button>
                </p>
              ) : (
                refillOrders.slice(0, 2).map((o) => (
                  <div key={o.id} className="rounded-lg border p-3 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate">{o.medicationName}</span>
                      <Badge variant="success" className="ml-2 shrink-0">{o.status}</Badge>
                    </div>
                    <div className="mt-1 text-muted-foreground">Ready {o.readyTime} · {o.copay}</div>
                  </div>
                ))
              )}
              {patient && (
                <div className="rounded-lg bg-amber-500/10 p-3 text-xs">
                  <div className="font-semibold text-amber-800 dark:text-amber-300">Chart alerts</div>
                  <div className="mt-1 text-muted-foreground">
                    Allergies: {patient.allergies.join(" · ")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VitalTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-bold tracking-tight">{value}</div>
      <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{note}</div>
    </div>
  );
}

function daypart(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
