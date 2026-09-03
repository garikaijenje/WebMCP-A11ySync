import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriageView } from "@/components/views/TriageView";
import { fixtureAssessment } from "../fixtures";

const noop = () => {};

describe("TriageView", () => {
  it("renders intake form with engine anchor IDs", () => {
    render(
      <TriageView
        symptoms="Knee pain"
        setSymptoms={noop}
        bodyRegion="Left Knee & Lower Extremity"
        setBodyRegion={noop}
        urgency="URGENT"
        setUrgency={noop}
        painLevel={7}
        setPainLevel={noop}
        latestAssessment={null}
        submitting={false}
        onSubmit={noop}
        onFindSpecialist={noop}
      />
    );
    expect(document.getElementById("triage-form")).toHaveAttribute("toolname", "triage_specialist");
    expect(document.getElementById("triage-submit-btn")).toBeInTheDocument();
    expect(document.getElementById("triage-result-card")).toBeInTheDocument();
    expect(screen.getByLabelText("What are you experiencing?")).toHaveValue("Knee pain");
    expect(screen.getByText("7/10 · Severe")).toBeInTheDocument();
  });

  it("submits the assessment", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <TriageView
        symptoms="Knee pain"
        setSymptoms={noop}
        bodyRegion="Left Knee & Lower Extremity"
        setBodyRegion={noop}
        urgency="URGENT"
        setUrgency={noop}
        painLevel={7}
        setPainLevel={noop}
        latestAssessment={null}
        submitting={false}
        onSubmit={onSubmit}
        onFindSpecialist={noop}
      />
    );
    await user.click(screen.getByRole("button", { name: /submit symptom assessment/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows the clinical recommendation when present", () => {
    render(
      <TriageView
        symptoms="Knee pain"
        setSymptoms={noop}
        bodyRegion="Left Knee & Lower Extremity"
        setBodyRegion={noop}
        urgency="URGENT"
        setUrgency={noop}
        painLevel={7}
        setPainLevel={noop}
        latestAssessment={fixtureAssessment}
        submitting={false}
        onSubmit={noop}
        onFindSpecialist={noop}
      />
    );
    expect(screen.getByText("Orthopedic Physical Therapy & Sports Medicine")).toBeInTheDocument();
    expect(screen.getByText("URGENT")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book with in-network specialist/i })).toBeInTheDocument();
  });
});
