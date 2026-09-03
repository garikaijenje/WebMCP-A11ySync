"use client";

import * as React from "react";
import {
  Accessibility,
  AlertTriangle,
  CalendarCheck,
  Check,
  Copy,
  HeartPulse,
  Pill,
  RotateCcw,
  Save,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Combobox } from "@/components/ui/combobox";
import { PageHeading } from "@/components/dashboard/widgets";
import {
  COMMUNICATION_OPTIONS,
  LANGUAGE_OPTIONS,
  MOBILITY_OPTIONS,
  SENSORY_OPTIONS,
  SUPPORT_OPTIONS,
  composeAccommodationString,
  computeAge,
  parseStoredAccommodations,
  type AccommodationOption
} from "@/components/dashboard/accommodations";
import type { PatientProfile } from "@/lib/careRepository";

export interface AccommodationValues {
  mobility: string;
  sensory: string;
  communication: string;
  support: string;
}

export interface ChartSnapshot {
  nextVisit?: string;
  activeRx: number;
  refillsDue: number;
  lastVitals?: string;
}

interface ProfileViewProps {
  loading: boolean;
  patient: PatientProfile | null;
  snapshot: ChartSnapshot;
  saving: boolean;
  onSave: (values: AccommodationValues) => void;
}

interface GroupState {
  selected: string[];
  other: string;
}

function initGroup(stored: string | undefined, options: AccommodationOption[]): GroupState {
  const parsed = parseStoredAccommodations(stored, options);
  return { selected: parsed.selected, other: parsed.other };
}

export function ProfileView({ loading, patient, snapshot, saving, onSave }: ProfileViewProps) {
  const [mobility, setMobility] = React.useState<GroupState>({ selected: [], other: "" });
  const [sensory, setSensory] = React.useState<GroupState>({ selected: [], other: "" });
  const [communication, setCommunication] = React.useState<GroupState>({ selected: [], other: "" });
  const [support, setSupport] = React.useState<GroupState>({ selected: [], other: "" });
  const [language, setLanguage] = React.useState("English");
  const [copied, setCopied] = React.useState(false);

  const resetFromChart = React.useCallback(() => {
    if (!patient) return;
    setMobility(initGroup(patient.accessibilityMobility, MOBILITY_OPTIONS));
    setSensory(initGroup(patient.accessibilitySensory, SENSORY_OPTIONS));
    const comm = parseStoredAccommodations(patient.accessibilityCommunication, COMMUNICATION_OPTIONS);
    setCommunication({ selected: comm.selected, other: comm.other });
    setLanguage(comm.language);
    setSupport(initGroup(patient.accessibilitySupport, SUPPORT_OPTIONS));
  }, [patient]);

  React.useEffect(() => {
    resetFromChart();
  }, [resetFromChart]);

  const dirty =
    patient !== null &&
    (composeAccommodationString(mobility.selected, MOBILITY_OPTIONS, mobility.other) !==
      (patient.accessibilityMobility ?? "") ||
      composeAccommodationString(sensory.selected, SENSORY_OPTIONS, sensory.other) !==
        (patient.accessibilitySensory ?? "") ||
      composeAccommodationString(communication.selected, COMMUNICATION_OPTIONS, communication.other, language) !==
        (patient.accessibilityCommunication ?? "") ||
      composeAccommodationString(support.selected, SUPPORT_OPTIONS, support.other) !==
        (patient.accessibilitySupport ?? ""));

  const handleSave = () => {
    onSave({
      mobility: composeAccommodationString(mobility.selected, MOBILITY_OPTIONS, mobility.other),
      sensory: composeAccommodationString(sensory.selected, SENSORY_OPTIONS, sensory.other),
      communication: composeAccommodationString(
        communication.selected,
        COMMUNICATION_OPTIONS,
        communication.other,
        language
      ),
      support: composeAccommodationString(support.selected, SUPPORT_OPTIONS, support.other)
    });
  };

  const copyMrn = async () => {
    if (!patient) return;
    try {
      await navigator.clipboard.writeText(patient.mrn);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const age = patient ? computeAge(patient.dob) : null;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Accessibility profile"
        description="Tick what you need from the coded clinic lists. Selections are written to your chart in plain language and sent to every clinic when you book."
        actions={
          patient && (
            <Button variant="outline" size="sm" onClick={resetFromChart} disabled={!dirty || saving}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset to chart
            </Button>
          )
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {/* Accommodation form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">Chart accommodations</CardTitle>
                <CardDescription>
                  {dirty ? "Unsaved changes — review and save to your chart." : "Matches your clinical record."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading || !patient ? (
              <>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </>
            ) : (
              <>
                <AccommodationGroup
                  id="mobility"
                  title="Mobility & physical access"
                  description="Step-free routes, transfers and equipment."
                  options={MOBILITY_OPTIONS}
                  state={mobility}
                  setState={setMobility}
                />
                <AccommodationGroup
                  id="sensory"
                  title="Sensory environment"
                  description="Light, sound and waiting-room needs."
                  options={SENSORY_OPTIONS}
                  state={sensory}
                  setState={setSensory}
                />
                <AccommodationGroup
                  id="communication"
                  title="Communication & assistive tech"
                  description="Interpreters, listening support and visit notes."
                  options={COMMUNICATION_OPTIONS}
                  state={communication}
                  setState={setCommunication}
                  extra={
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="preferred-language">Preferred spoken language</Label>
                      <Combobox
                        id="preferred-language"
                        label="Preferred spoken language"
                        options={LANGUAGE_OPTIONS}
                        value={language}
                        onChange={setLanguage}
                        placeholder="Search languages…"
                        searchPlaceholder="Search languages…"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recorded on your chart when other than English.
                      </p>
                    </div>
                  }
                />
                <AccommodationGroup
                  id="support"
                  title="Support & cognitive needs"
                  description="Companions, pacing and reminders."
                  options={SUPPORT_OPTIONS}
                  state={support}
                  setState={setSupport}
                />
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving to chart…" : dirty ? "Save changes to chart" : "Chart is up to date"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Patient chart */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 to-teal-500 px-5 pb-8 pt-5 text-white">
            <div className="flex items-center gap-3">
              <Avatar
                name={patient ? `${patient.firstName} ${patient.lastName}` : "Patient"}
                size="lg"
                className="bg-white/20 ring-white/40"
              />
              <div className="leading-tight">
                <div className="text-lg font-bold">
                  {patient ? `${patient.firstName} ${patient.lastName}` : "—"}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-sky-100">
                  <span className="font-mono">{patient?.mrn ?? "—"}</span>
                  {patient && (
                    <button
                      onClick={copyMrn}
                      aria-label={copied ? "MRN copied" : "Copy medical record number"}
                      className="rounded p-1 hover:bg-white/20"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-sky-50">
              <span>
                {patient?.gender ?? "—"} · {age !== null ? `${age} y/o` : "—"} · DOB {patient?.dob ?? "—"}
              </span>
            </div>
          </div>

          <CardContent className="space-y-4 pt-4 text-[13px]">
            {loading || !patient ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <>
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-sky-600" aria-hidden="true" />
                    Care snapshot
                  </div>
                  <dl className="space-y-1.5 rounded-xl border bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> Next visit
                      </dt>
                      <dd className="text-right font-semibold">{snapshot.nextVisit ?? "None scheduled"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Pill className="h-3.5 w-3.5" aria-hidden="true" /> Active prescriptions
                      </dt>
                      <dd className="font-semibold">
                        {snapshot.activeRx}
                        {snapshot.refillsDue > 0 && (
                          <span className="text-amber-700 dark:text-amber-300"> · {snapshot.refillsDue} refill due</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" /> Last vitals
                      </dt>
                      <dd className="text-right font-semibold">{snapshot.lastVitals ?? "—"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-amber-500/40 bg-amber-500/[0.07] p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Documented allergies ({patient.allergies.length})
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {patient.allergies.map((a) => (
                      <Badge key={a} variant="warning">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Primary doctor</span>
                    <span className="text-right font-semibold">{patient.primaryDoctor}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="text-right font-semibold">{patient.insuranceProvider}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccommodationGroup({
  id,
  title,
  description,
  options,
  state,
  setState,
  extra
}: {
  id: string;
  title: string;
  description: string;
  options: AccommodationOption[];
  state: GroupState;
  setState: (s: GroupState) => void;
  extra?: React.ReactNode;
}) {
  const toggle = (value: string) => {
    setState({
      ...state,
      selected: state.selected.includes(value)
        ? state.selected.filter((v) => v !== value)
        : [...state.selected, value]
    });
  };

  return (
    <fieldset className="rounded-xl border p-4">
      <legend className="px-1 text-sm font-bold">
        {title}{" "}
        <span className="ml-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
          {state.selected.length} selected
        </span>
      </legend>
      <p className="-mt-1 mb-2 text-xs text-muted-foreground">{description}</p>
      <div className="grid gap-1 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = state.selected.includes(opt.value);
          const inputId = `${id}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
                className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60 has-[:checked]:bg-sky-500/[0.07]"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                className="h-6 w-6 shrink-0 cursor-pointer accent-sky-600"
              />
              <span className="leading-tight">
                <span className="block text-[13px] font-medium">{opt.label}</span>
                <span className="block text-[11px] text-muted-foreground">{opt.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-2 space-y-1.5">
        <Label htmlFor={`${id}-other`}>Other {title.toLowerCase()} needs</Label>
        <Input
          id={`${id}-other`}
          value={state.other}
          onChange={(e) => setState({ ...state, other: e.target.value })}
          placeholder="Anything else the clinic should prepare…"
        />
      </div>
      {extra}
    </fieldset>
  );
}
