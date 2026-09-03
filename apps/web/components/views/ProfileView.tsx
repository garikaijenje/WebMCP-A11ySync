"use client";

import { Accessibility, Save, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading } from "@/components/dashboard/widgets";
import type { PatientProfile } from "@/lib/careRepository";

interface ProfileViewProps {
  loading: boolean;
  patient: PatientProfile | null;
  saving: boolean;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ProfileView({ loading, patient, saving, onSave }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Accessibility profile"
        description="Permanent chart accommodations, transmitted to every clinic automatically when you book."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">Chart accommodations</CardTitle>
                <CardDescription>Saved to your clinical record in Postgres</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading || !patient ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <form key={patient.accessibilityMobility + patient.accessibilitySensory + patient.accessibilityCommunication} onSubmit={onSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobility-input">Mobility &amp; physical access</Label>
                  <Input id="mobility-input" name="mobility" defaultValue={patient.accessibilityMobility} />
                  <p className="text-xs text-muted-foreground">Ramps, wide corridors, adjustable exam tables.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sensory-input">Sensory environment</Label>
                  <Input id="sensory-input" name="sensory" defaultValue={patient.accessibilitySensory} />
                  <p className="text-xs text-muted-foreground">Lighting, noise and waiting-room preferences.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="communication-input">Communication &amp; assistive tech</Label>
                  <Input id="communication-input" name="communication" defaultValue={patient.accessibilityCommunication} />
                  <p className="text-xs text-muted-foreground">Screen readers, audible verification, interpreters.</p>
                </div>
                <Button type="submit" size="lg" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving to chart…" : "Save changes to chart"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-600" aria-hidden="true" />
              <CardTitle className="text-base">Patient chart</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px]">
            {loading || !patient ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-semibold">{patient.firstName} {patient.lastName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">MRN</span>
                  <span className="font-mono font-semibold">{patient.mrn}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">DOB</span>
                  <span className="font-semibold">{patient.dob}</span>
                </div>
                <Separator />
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Primary doctor</span>
                  <span className="text-right font-semibold">{patient.primaryDoctor}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="text-right font-semibold">{patient.insuranceProvider}</span>
                </div>
                <Separator />
                <div>
                  <div className="mb-1.5 font-medium">Documented allergies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a) => (
                      <Badge key={a} variant="warning">{a}</Badge>
                    ))}
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
