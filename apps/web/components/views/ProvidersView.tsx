"use client";

import * as React from "react";
import { Building2, CalendarCheck, CalendarDays, CheckCircle2, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multi-select";
import { EmptyState, PageHeading } from "@/components/dashboard/widgets";
import { SlotPicker, type SlotSelection } from "@/components/scheduling/SlotPicker";
import { ACCOMMODATION_OPTIONS, SPECIALTY_OPTIONS } from "@/components/dashboard/nav";
import type { Practitioner } from "@/lib/careRepository";

interface ProvidersViewProps {
  loading: boolean;
  practitioners: Practitioner[];
  specialtyQuery: string;
  setSpecialtyQuery: (v: string) => void;
  accFilter: string[];
  setAccFilter: (v: string[]) => void;
  onFilter: () => void;
  booking: boolean;
  onBook: (doc: Practitioner, slot: string) => void;
}

export function ProvidersView({
  loading,
  practitioners,
  specialtyQuery,
  setSpecialtyQuery,
  accFilter,
  setAccFilter,
  onFilter,
  booking,
  onBook
}: ProvidersViewProps) {
  const [confirm, setConfirm] = React.useState<{ doc: Practitioner; slot: string; displayLabel?: string } | null>(null);
  const [pickerDoc, setPickerDoc] = React.useState<Practitioner | null>(null);

  const chooseSlot = (doc: Practitioner, selection: SlotSelection) => {
    setPickerDoc(null);
    setConfirm({ doc, slot: selection.slot, displayLabel: selection.displayLabel });
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Accessible providers"
        description="In-network clinics verified for physical, sensory and communication accommodations."
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[240px_1fr_auto] lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="specialty-combobox">Specialty</Label>
            <Combobox
              id="specialty-combobox"
              label="Specialty"
              options={[{ value: "", label: "All specialties", hint: `${practitioners.length} clinics` }, ...SPECIALTY_OPTIONS]}
              value={specialtyQuery}
              onChange={(v) => {
                setSpecialtyQuery(v);
              }}
              placeholder="Search specialties…"
              searchPlaceholder="Search specialties…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accommodation-filter">Required accommodations</Label>
            <MultiSelect
              id="accommodation-filter"
              label="Required accommodations"
              options={ACCOMMODATION_OPTIONS}
              selected={accFilter}
              onChange={setAccFilter}
              placeholder="Filter by accommodation…"
              searchPlaceholder="Search accommodations…"
            />
          </div>
          <Button id="clinic-search-btn" onClick={onFilter} className="lg:w-auto">
            <Search className="h-4 w-4" aria-hidden="true" />
            Filter directory
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-xl bg-muted" />
          <div className="h-56 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : practitioners.length === 0 ? (
        <Card>
          <CardContent className="p-5">
            <EmptyState
              icon={Building2}
              title="No matching clinics"
              description="Try broadening the specialty or removing an accommodation filter."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSpecialtyQuery("");
                    setAccFilter([]);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div id="practitioner-results-grid" tabIndex={-1} className="grid gap-4 md:grid-cols-2" aria-live="polite">
          {practitioners.map((doc, i) => (
            <Card key={doc.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-[15px]">{doc.name}</CardTitle>
                    <CardDescription>
                      {doc.title} · {doc.specialty}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0">{doc.distance}</Badge>
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {doc.facilityName} — {doc.facilityAddress}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex flex-wrap gap-1.5" aria-label="Verified accommodations">
                  {doc.accommodations.map((acc) => (
                    <Badge key={acc} variant="secondary" className="gap-1 text-[11px]">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                      {acc}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold">Available slots</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs text-sky-700 dark:text-sky-300"
                      aria-label={`Open calendar for ${doc.name}`}
                      onClick={() => setPickerDoc(doc)}
                    >
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      Calendar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.availableSlots.map((slot, sIdx) => (
                      <Button
                        key={slot}
                        id={i === 0 && sIdx === 0 ? "confirm-booking-btn" : undefined}
                        size="sm"
                        variant="outline"
                        className="text-xs hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                        onClick={() => setConfirm({ doc, slot })}
                      >
                        <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Calendly-style availability picker */}
      <Dialog open={pickerDoc !== null} onOpenChange={(open) => !open && setPickerDoc(null)}>
        <DialogContent className="max-w-3xl" aria-label="Select appointment date and time">
          <DialogHeader>
            <DialogTitle>Select date and time</DialogTitle>
            <DialogDescription>
              {pickerDoc ? `${pickerDoc.name} · ${pickerDoc.facilityName}` : "Choose an open slot"}
            </DialogDescription>
          </DialogHeader>
          {pickerDoc && (
            <SlotPicker practitioner={pickerDoc} onSelect={(selection) => chooseSlot(pickerDoc, selection)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Booking confirmation */}
      <Dialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm consultation</DialogTitle>
            <DialogDescription>
              Review the visit details. Accommodations are transmitted to the clinic automatically.
            </DialogDescription>
          </DialogHeader>
          {confirm && (
            <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Provider</span>
                <span className="text-right font-semibold">{confirm.doc.name}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Clinic</span>
                <span className="text-right font-semibold">{confirm.doc.facilityName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Slot</span>
                <span className="text-right font-semibold">{confirm.displayLabel ?? confirm.slot}</span>
              </div>
              <div className="border-t pt-2">
                <span className="text-muted-foreground">Accommodations sent</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {confirm.doc.accommodations.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[11px]">{a}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              disabled={booking}
              size="lg"
              onClick={() => {
                if (confirm) {
                  onBook(confirm.doc, confirm.slot);
                  setConfirm(null);
                }
              }}
            >
              {booking ? "Booking…" : "Confirm booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
