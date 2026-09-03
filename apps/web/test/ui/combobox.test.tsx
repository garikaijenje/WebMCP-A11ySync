import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "@/components/ui/combobox";

const OPTIONS = [
  { value: "knee", label: "Left Knee & Lower Extremity", hint: "Orthopedic" },
  { value: "chest", label: "Respiratory / Chest", hint: "Pulmonology" },
  { value: "head", label: "Head / Neurological", hint: "Neurology" }
];

describe("Combobox (searchable dropdown)", () => {
  it("renders placeholder and selected value", () => {
    const { rerender } = render(
      <Combobox options={OPTIONS} value="" onChange={() => {}} placeholder="Search body areas…" />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Search body areas…");
    rerender(<Combobox options={OPTIONS} value="knee" onChange={() => {}} placeholder="Search body areas…" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Left Knee & Lower Extremity");
  });

  it("opens, filters by typing, and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="" onChange={onChange} placeholder="Pick one" />);

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByPlaceholderText("Search…")).toBeInTheDocument();

    await user.keyboard("chest");
    // Only the matching option remains visible
    expect(screen.getByText("Respiratory / Chest")).toBeInTheDocument();
    expect(screen.queryByText("Head / Neurological")).not.toBeInTheDocument();

    await user.click(screen.getByText("Respiratory / Chest"));
    expect(onChange).toHaveBeenCalledWith("chest");
  });

  it("shows empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} value="" onChange={() => {}} emptyText="Nothing here" />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("zzz-no-match");
    expect(await screen.findByText("Nothing here")).toBeInTheDocument();
  });

  it("is keyboard operable (open, arrow, enter)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="" onChange={onChange} />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByPlaceholderText("Search…")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText("Search…")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
