import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileView } from "@/components/views/ProfileView";
import { fixturePatient } from "../fixtures";

const snapshot = { nextVisit: "Friday, Sep 18, 2026 at 10:30 AM", activeRx: 3, refillsDue: 1, lastVitals: "118/76 mmHg" };

describe("ProfileView (coded accommodations + chart)", () => {
  it("pre-checks chart values and shows the patient chart", () => {
    render(
      <ProfileView loading={false} patient={fixturePatient} snapshot={snapshot} saving={false} onSave={() => {}} />
    );
    // Seed values parsed back into checkboxes
    expect(screen.getByLabelText(/wheelchair step-free ramp/i)).toBeChecked();
    expect(screen.getByLabelText(/quiet waiting room/i)).toBeChecked();
    expect(screen.getByLabelText(/screen reader & audible verification/i)).toBeChecked();
    expect(screen.getByLabelText(/support person welcome/i)).toBeChecked();
    // Chart header with computed age (1984-11-14)
    expect(screen.getByText("Sarah Jenkins", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("#MH-88291")).toBeInTheDocument();
    expect(screen.getByText(/y\/o/)).toBeInTheDocument();
    // Snapshot + allergies
    expect(screen.getByText("Friday, Sep 18, 2026 at 10:30 AM")).toBeInTheDocument();
    expect(screen.getByText(/penicillin \(severe anaphylaxis\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /chart is up to date/i })).toBeDisabled();
  });

  it("toggles options, edits Other, picks a language and saves composed strings", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ProfileView loading={false} patient={fixturePatient} snapshot={snapshot} saving={false} onSave={onSave} />
    );

    // Uncheck a seed option, check a new one
    await user.click(screen.getByLabelText(/quiet waiting room/i));
    await user.click(screen.getByLabelText(/dimmed \/ adjustable lighting/i));
    // Free-text line
    await user.type(screen.getByLabelText(/other sensory environment needs/i), "No citrus scents");
    // Language -> Spanish
    await user.click(screen.getByRole("combobox", { name: "Preferred spoken language" }));
    await user.click(await screen.findByRole("option", { name: /spanish/i }));

    await user.click(screen.getByRole("button", { name: /save changes to chart/i }));
    expect(onSave).toHaveBeenCalledWith({
      mobility: "Wheelchair Step-Free Ramp & Wide Corridors",
      sensory: "Dimmed / adjustable lighting, No citrus scents",
      communication: "Screen Reader & Audible Verification Enabled, Preferred language: Spanish",
      support: "Support Person Welcome & Extra Time"
    });
  });

  it("resets edits back to chart values", async () => {
    const user = userEvent.setup();
    render(
      <ProfileView loading={false} patient={fixturePatient} snapshot={snapshot} saving={false} onSave={() => {}} />
    );
    await user.click(screen.getByLabelText(/quiet waiting room/i));
    expect(screen.getByRole("button", { name: /save changes to chart/i })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: /reset to chart/i }));
    expect(screen.getByLabelText(/quiet waiting room/i)).toBeChecked();
  });
});
