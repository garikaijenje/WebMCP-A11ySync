"use client";

import { AlertTriangle, CheckCircle2, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeading } from "@/components/dashboard/widgets";
import { BODY_REGION_OPTIONS, URGENCY_OPTIONS } from "@/components/dashboard/nav";
import type { TriageAssessment } from "@/lib/careRepository";

export type Urgency = "ROUTINE" | "URGENT" | "EMERGENCY";

interface TriageViewProps {
  symptoms: string;
  setSymptoms: (v: string) => void;
  bodyRegion: string;
  setBodyRegion: (v: string) => void;
  urgency: Urgency;
  setUrgency: (v: Urgency) => void;
  painLevel: number;
  setPainLevel: (v: number) => void;
  latestAssessment: TriageAssessment | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFindSpecialist: () => void;
}

export function TriageView({
  symptoms,
  setSymptoms,
  bodyRegion,
  setBodyRegion,
  urgency,
  setUrgency,
  painLevel,
  setPainLevel,
  latestAssessment,
  submitting,
  onSubmit,
  onFindSpecialist
}: TriageViewProps) {
  const severity = painLevel >= 7 ? "Severe" : painLevel >= 4 ? "Moderate" : "Mild";

  return (
    <div className="space-y-6">
      <PageHeading
        title="Symptom triage"
        description="Describe what you're experiencing. The assessment is matched against Memorial Health triage protocols and saved to your record."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Stethoscope className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">Clinical symptom assessment</CardTitle>
                <CardDescription>Plain language — no medical codes required</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              id="triage-form"
              toolname="triage_specialist"
              tooldescription="Evaluates patient symptoms against clinical triage protocols to recommend specialties and urgency."
              onSubmit={onSubmit}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="symptoms-input">What are you experiencing?</Label>
                <Textarea
                  id="symptoms-input"
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Sharp pain in my left knee with swelling after physical therapy"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="body-region-combobox">Affected body area</Label>
                  <Combobox
                    id="body-region-combobox"
                    label="Affected body area"
                    options={BODY_REGION_OPTIONS}
                    value={bodyRegion}
                    onChange={setBodyRegion}
                    placeholder="Search body areas…"
                    searchPlaceholder="Search body areas…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="urgency-select">Perceived urgency</Label>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                    <SelectTrigger id="urgency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label} <span className="text-muted-foreground">· {u.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pain-slider">Pain severity</Label>
                  <Badge variant={painLevel >= 7 ? "destructive" : painLevel >= 4 ? "warning" : "secondary"}>
                    {painLevel}/10 · {severity}
                  </Badge>
                </div>
                <Slider
                  id="pain-slider"
                  min={1}
                  max={10}
                  step={1}
                  value={[painLevel]}
                  onValueChange={([v]) => setPainLevel(v)}
                  aria-label={`Pain severity ${painLevel} out of 10`}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>1 · Mild</span>
                  <span>5 · Moderate</span>
                  <span>10 · Severe</span>
                </div>
              </div>

              <Button id="triage-submit-btn" type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Assessing symptoms…" : "Submit symptom assessment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card id="triage-result-card" tabIndex={-1}>
          <CardHeader>
            <CardTitle className="text-base">Clinical recommendation</CardTitle>
            <CardDescription>Protocol-matched specialty &amp; next steps</CardDescription>
          </CardHeader>
          <CardContent>
            {latestAssessment ? (
              <div className="space-y-3 rounded-xl border bg-sky-500/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-muted-foreground">Matched specialty</span>
                  <Badge
                    variant={
                      latestAssessment.urgency === "EMERGENCY"
                        ? "destructive"
                        : latestAssessment.urgency === "URGENT"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {latestAssessment.urgency}
                  </Badge>
                </div>
                <div className="text-[15px] font-bold leading-snug">{latestAssessment.recommendedSpecialty}</div>
                <p className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
                  {latestAssessment.urgency === "ROUTINE" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  )}
                  {latestAssessment.clinicalAdvice}
                </p>
                <div className="border-t pt-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Recommended clinic
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold">{latestAssessment.recommendedClinic}</div>
                </div>
                <Button size="sm" className="w-full" onClick={onFindSpecialist}>
                  Book with in-network specialist
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Stethoscope className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                <p className="max-w-[220px] text-[13px] text-muted-foreground">
                  Complete the assessment to see your matched specialty and care plan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
