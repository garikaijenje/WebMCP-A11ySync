import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MedicationsView } from "@/components/views/MedicationsView";
import { fixtureOrders, fixturePrescriptions } from "../fixtures";

const noop = () => {};

describe("MedicationsView", () => {
  it("renders refill-due card with dosage pills, pharmacy search and submit", () => {
    render(
      <MedicationsView
        loading={false}
        prescriptions={fixturePrescriptions}
        refillOrders={[]}
        selectedDosage="200 Actuations (Standard Inhaler)"
        setSelectedDosage={noop}
        pharmacyId="memorial-outpatient-pharmacy"
        setPharmacyId={noop}
        trojanEnabled
        submittingId={null}
        onRefill={noop}
      />
    );
    expect(screen.getByText("Albuterol Sulfate HFA Inhalation Aerosol")).toBeInTheDocument();
    expect(screen.getByText("Refill due")).toBeInTheDocument();
    // WebMCP anchor for the refill tool
    expect(document.getElementById("refill-trigger")).toBeInTheDocument();
    expect(document.getElementById("refill-submit-action")).toBeInTheDocument();
    expect(screen.getByLabelText("Fulfillment pharmacy")).toBeInTheDocument();
    expect(document.getElementById("refill-confirmed-banner")).toBeInTheDocument();
  });

  it("selects dosage and submits the refill", async () => {
    const user = userEvent.setup();
    const setDosage = vi.fn();
    const onRefill = vi.fn();
    render(
      <MedicationsView
        loading={false}
        prescriptions={fixturePrescriptions}
        refillOrders={[]}
        selectedDosage="200 Actuations (Standard Inhaler)"
        setSelectedDosage={setDosage}
        pharmacyId="memorial-outpatient-pharmacy"
        setPharmacyId={noop}
        trojanEnabled
        submittingId={null}
        onRefill={onRefill}
      />
    );
    await user.click(screen.getByText("400 Actuations (2 Inhalers Supply)"));
    expect(setDosage).toHaveBeenCalledWith("400 Actuations (2 Inhalers Supply)");
    await user.click(screen.getByRole("button", { name: /submit refill order/i }));
    expect(onRefill).toHaveBeenCalledWith("rx-albuterol", "Albuterol Sulfate HFA Inhalation Aerosol");
  });

  it("lists refill history in a table", () => {
    render(
      <MedicationsView
        loading={false}
        prescriptions={fixturePrescriptions}
        refillOrders={fixtureOrders}
        selectedDosage="200 Actuations (Standard Inhaler)"
        setSelectedDosage={noop}
        pharmacyId="memorial-outpatient-pharmacy"
        setPharmacyId={noop}
        trojanEnabled={false}
        submittingId={null}
        onRefill={noop}
      />
    );
    expect(screen.getByText("Refill history")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("ORD-1")).toBeInTheDocument();
  });
});
