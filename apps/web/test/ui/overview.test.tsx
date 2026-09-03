import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverviewView } from "@/components/views/OverviewView";
import {
  fixtureAppointments,
  fixtureOrders,
  fixturePatient,
  fixturePrescriptions,
  fixtureVitals,
  fixtureAssessment
} from "../fixtures";

const base = {
  loading: false,
  patient: fixturePatient,
  appointments: fixtureAppointments,
  prescriptions: fixturePrescriptions,
  vitals: fixtureVitals,
  refillOrders: fixtureOrders,
  latestAssessment: fixtureAssessment,
  onNavigate: vi.fn()
};

describe("OverviewView", () => {
  it("greets the patient and shows stat cards", () => {
    render(<OverviewView {...base} />);
    expect(screen.getByRole("heading", { name: /good (morning|afternoon|evening), sarah/i })).toBeInTheDocument();
    expect(screen.getByText("Upcoming visits")).toBeInTheDocument();
    expect(screen.getByText("Refills due")).toBeInTheDocument();
    expect(screen.getAllByText("Blood pressure").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Triage status")).toBeInTheDocument();
  });

  it("lists scheduled consultations with accommodations", () => {
    render(<OverviewView {...base} />);
    expect(screen.getByText("Dr. Marcus Vance, MD")).toBeInTheDocument();
    expect(screen.getByText(/Accommodations active/)).toBeInTheDocument();
  });

  it("shows vitals with normal-range notes", () => {
    render(<OverviewView {...base} />);
    expect(screen.getByText("118/76 mmHg")).toBeInTheDocument();
    expect(screen.getByText("72 bpm")).toBeInTheDocument();
  });

  it("renders skeletons while loading", () => {
    render(<OverviewView {...base} loading patient={null} vitals={null} />);
    // stat skeletons + appointment skeleton blocks
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty states when there is no data", () => {
    render(
      <OverviewView
        {...base}
        appointments={[]}
        refillOrders={[]}
        latestAssessment={null}
      />
    );
    expect(screen.getByText("No upcoming visits")).toBeInTheDocument();
    expect(screen.getByText(/Start a refill/)).toBeInTheDocument();
  });
});
