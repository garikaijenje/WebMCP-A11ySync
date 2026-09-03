import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotPicker } from "@/components/scheduling/SlotPicker";
import { fixturePractitioners } from "../fixtures";

const doc = fixturePractitioners[0]; // Sep 18 (10:30 AM, 2:00 PM) + Sep 21 (9:00 AM)

describe("SlotPicker (Calendly-style availability)", () => {
  it("shows available days and times for the initial day", () => {
    render(<SlotPicker practitioner={doc} onSelect={() => {}} />);
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10:30 AM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2:00 PM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("switches days and selects a time, then continues", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SlotPicker practitioner={doc} onSelect={onSelect} />);

    // react-day-picker v8 renders day cells as gridcell (not button)
    await user.click(screen.getByRole("gridcell", { name: "21" }));
    expect(await screen.findByRole("button", { name: "9:00 AM" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "10:30 AM" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "9:00 AM" }));
    const cont = screen.getByRole("button", { name: /continue/i });
    expect(cont).toBeEnabled();
    await user.click(cont);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        slot: "Monday, Sep 21 at 9:00 AM",
        timezone: "ET"
      })
    );
  });

  it("converts display times to the selected timezone", async () => {
    const user = userEvent.setup();
    render(<SlotPicker practitioner={doc} onSelect={() => {}} />);

    await user.click(screen.getByRole("combobox", { name: "Display timezone" }));
    await user.click(await screen.findByRole("option", { name: /central africa time/i }));
    // 10:30 AM ET -> 4:30 PM CAT, facility time kept as caption
    expect(await screen.findByRole("button", { name: /4:30 pm/i })).toBeInTheDocument();
    expect(screen.getByText("10:30 AM ET")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is published", () => {
    render(<SlotPicker practitioner={{ ...doc, availableSlots: [] }} onSelect={() => {}} />);
    expect(screen.getByText("No open slots published")).toBeInTheDocument();
  });
});
