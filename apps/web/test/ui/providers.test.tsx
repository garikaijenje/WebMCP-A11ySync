import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProvidersView } from "@/components/views/ProvidersView";
import { fixturePractitioners } from "../fixtures";

const noop = () => {};

describe("ProvidersView", () => {
  it("renders search controls with engine anchor IDs", () => {
    render(
      <ProvidersView
        loading={false}
        practitioners={fixturePractitioners}
        specialtyQuery=""
        setSpecialtyQuery={noop}
        accFilter={[]}
        setAccFilter={noop}
        onFilter={noop}
        booking={false}
        onBook={noop}
      />
    );
    expect(screen.getByLabelText("Specialty")).toBeInTheDocument();
    expect(document.getElementById("clinic-search-btn")).toBeInTheDocument();
    expect(document.getElementById("practitioner-results-grid")).toBeInTheDocument();
    expect(document.getElementById("confirm-booking-btn")).toBeInTheDocument();
  });

  it("shows provider cards with accommodations and slots", () => {
    render(
      <ProvidersView
        loading={false}
        practitioners={fixturePractitioners}
        specialtyQuery=""
        setSpecialtyQuery={noop}
        accFilter={[]}
        setAccFilter={noop}
        onFilter={noop}
        booking={false}
        onBook={noop}
      />
    );
    expect(screen.getByText("Dr. Marcus Vance, MD")).toBeInTheDocument();
    expect(screen.getByText("Wheelchair Step-Free")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /friday, sep 18 at 10:30 am/i })).toBeInTheDocument();
  });

  it("opens a booking dialog with a summary and confirms", async () => {
    const user = userEvent.setup();
    const onBook = vi.fn();
    render(
      <ProvidersView
        loading={false}
        practitioners={fixturePractitioners}
        specialtyQuery=""
        setSpecialtyQuery={noop}
        accFilter={[]}
        setAccFilter={noop}
        onFilter={noop}
        booking={false}
        onBook={onBook}
      />
    );
    await user.click(screen.getByRole("button", { name: /friday, sep 18 at 10:30 am/i }));
    expect(await screen.findByText("Confirm consultation")).toBeInTheDocument();
    expect(screen.getByText("Accommodations sent")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));
    expect(onBook).toHaveBeenCalledWith(fixturePractitioners[0], "Friday, Sep 18 at 10:30 AM");
  });

  it("shows an empty state when no clinics match", () => {    render(
      <ProvidersView
        loading={false}
        practitioners={[]}
        specialtyQuery="Dermatology"
        setSpecialtyQuery={noop}
        accFilter={[]}
        setAccFilter={noop}
        onFilter={noop}
        booking={false}
        onBook={noop}
      />
    );
    expect(screen.getByText("No matching clinics")).toBeInTheDocument();
  });

  it("opens the Calendly-style picker from a provider card", async () => {
    const user = userEvent.setup();
    render(
      <ProvidersView
        loading={false}
        practitioners={fixturePractitioners}
        specialtyQuery=""
        setSpecialtyQuery={noop}
        accFilter={[]}
        setAccFilter={noop}
        onFilter={noop}
        booking={false}
        onBook={noop}
      />
    );
    await user.click(screen.getByRole("button", { name: /open calendar for dr. marcus vance/i }));
    expect(await screen.findByText("Select date and time")).toBeInTheDocument();
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10:30 AM" })).toBeInTheDocument();
  });
});
