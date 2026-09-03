"use client";

import { CheckCircle2, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { EmptyState, PageHeading } from "@/components/dashboard/widgets";
import { PHARMACY_OPTIONS } from "@/components/dashboard/nav";
import type { Prescription, RefillOrder } from "@/lib/careRepository";

interface MedicationsViewProps {
  loading: boolean;
  prescriptions: Prescription[];
  refillOrders: RefillOrder[];
  selectedDosage: string;
  setSelectedDosage: (v: string) => void;
  pharmacyId: string;
  setPharmacyId: (v: string) => void;
  trojanEnabled: boolean;
  submittingId: string | null;
  onRefill: (rxId: string, medName: string) => void;
}

export function MedicationsView({
  loading,
  prescriptions,
  refillOrders,
  selectedDosage,
  setSelectedDosage,
  pharmacyId,
  setPharmacyId,
  trojanEnabled,
  submittingId,
  onRefill
}: MedicationsViewProps) {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Medications"
        description="Active prescriptions from your clinical record. Refill orders go straight to the Memorial pharmacy queue."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="h-32 animate-pulse rounded-xl bg-muted" />
                <div className="h-32 animate-pulse rounded-xl bg-muted" />
              </CardContent>
            </Card>
          ) : (
            prescriptions.map((rx) => {
              const due = rx.status === "refill_due";
              return (
                <Card key={rx.id} className={due ? "border-amber-500/40" : undefined}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-amber-500" aria-hidden="true" />
                          <span className="text-[15px] font-bold">{rx.medicationName}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {rx.strength} · Rx #{rx.rxNumber} · {rx.prescribedBy}
                        </div>
                      </div>
                      <Badge variant={due ? "warning" : rx.status === "in_transit" ? "default" : "secondary"}>
                        {due ? "Refill due" : rx.status === "in_transit" ? "In transit" : "Active"}
                      </Badge>
                    </div>

                    {due && (
                      <div className="space-y-2.5 rounded-xl bg-muted/50 p-4">
                        <Label>Select refill quantity</Label>
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Refill quantity">
                          {["200 Actuations (Standard Inhaler)", "400 Actuations (2 Inhalers Supply)"].map(
                            (dose) => (
                              <div
                                key={dose}
                                id={dose.startsWith("200") ? "refill-trigger" : undefined}
                                role="button"
                                tabIndex={0}
                                aria-pressed={selectedDosage === dose}
                                onClick={() => setSelectedDosage(dose)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedDosage(dose);
                                  }
                                }}
                                className={`cursor-pointer rounded-lg border px-4 py-2 text-[13px] font-semibold transition-colors ${
                                  selectedDosage === dose
                                    ? "border-sky-500 bg-sky-500/10 text-sky-900 dark:text-sky-200"
                                    : "border-input bg-background hover:border-sky-300"
                                }`}
                              >
                                {dose}
                              </div>
                            )
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground" aria-live="polite">
                          {trojanEnabled
                            ? "A11ySync enhancer active — keyboard operable with spoken label."
                            : "Standard selector. Enable A11ySync for enhanced semantics."}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor={`pharmacy-${rx.id}`}>Fulfillment pharmacy</Label>
                            <Combobox
                              id={`pharmacy-${rx.id}`}
                              label="Fulfillment pharmacy"
                              options={PHARMACY_OPTIONS}
                              value={pharmacyId}
                              onChange={setPharmacyId}
                              placeholder="Search pharmacies…"
                              searchPlaceholder="Search pharmacies…"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              id="refill-submit-action"
                              size="lg"
                              className="w-full bg-amber-600 hover:bg-amber-700"
                              disabled={submittingId === rx.id}
                              onClick={() => onRefill(rx.id, rx.medicationName)}
                            >
                              {submittingId === rx.id ? "Submitting…" : "Submit refill order"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{rx.pharmacyName}</span>
                      <span>
                        Copay <strong className="text-foreground">{rx.copay}</strong> · Refills left{" "}
                        <strong className="text-foreground">{rx.refillsRemaining}</strong> · Last filled{" "}
                        {rx.lastFilled}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card id="refill-confirmed-banner" tabIndex={-1} className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Order status</CardTitle>
            <CardDescription>Live pharmacy processing queue</CardDescription>
          </CardHeader>
          <CardContent>
            {refillOrders.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="No orders yet"
                description="Submit a refill to track pharmacy fulfillment here."
              />
            ) : (
              <div className="space-y-3">
                {refillOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 text-[13px]">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Order {order.id}
                    </div>
                    <dl className="mt-2 space-y-1 text-muted-foreground">
                      <div className="flex justify-between gap-2"><dt>Medication</dt><dd className="text-right font-medium text-foreground">{order.medicationName}</dd></div>
                      <div className="flex justify-between gap-2"><dt>Dosage</dt><dd className="text-right font-medium text-foreground">{order.dosage}</dd></div>
                      <div className="flex justify-between gap-2"><dt>Ready</dt><dd className="text-right font-medium text-foreground">{order.readyTime}</dd></div>
                      <div className="flex justify-between gap-2"><dt>Copay</dt><dd className="text-right font-medium text-foreground">{order.copay}</dd></div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {refillOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Refill history</CardTitle>
            <CardDescription>Every order synced from the pharmacy database</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Copay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refillOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium">{o.medicationName}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">{o.pharmacyName}</TableCell>
                    <TableCell>
                      <Badge variant="success">{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{o.copay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
