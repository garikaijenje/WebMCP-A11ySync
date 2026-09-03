import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect } from "@/components/ui/multi-select";

const OPTIONS = [
  { value: "wheelchair", label: "Wheelchair Step-Free", hint: "Ramps" },
  { value: "quiet", label: "Sensory Quiet Room", hint: "Low stimulation" },
  { value: "braille", label: "Braille & Tactile", hint: "Wayfinding" }
];

describe("MultiSelect (searchable multi filter)", () => {
  it("renders placeholder and selected chips", () => {
    const { rerender } = render(<MultiSelect options={OPTIONS} selected={[]} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Select filters");
    rerender(<MultiSelect options={OPTIONS} selected={["wheelchair", "quiet"]} onChange={() => {}} />);
    expect(screen.getByText("Wheelchair Step-Free")).toBeInTheDocument();
    expect(screen.getByText("Sensory Quiet Room")).toBeInTheDocument();
  });

  it("toggles options and clears all", async () => {
    const user = userEvent.setup();
    let selected: string[] = [];
    const onChange = vi.fn((v: string[]) => {
      selected = v;
    });
    const { rerender } = render(
      <MultiSelect options={OPTIONS} selected={selected} onChange={onChange} />
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Sensory Quiet Room"));
    expect(onChange).toHaveBeenCalledWith(["quiet"]);

    rerender(<MultiSelect options={OPTIONS} selected={["quiet"]} onChange={onChange} />);
    await user.click(screen.getByText(/Clear all/));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("removes a chip via keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} selected={["wheelchair"]} onChange={onChange} />);
    const remove = screen.getByRole("button", { name: "Remove Wheelchair Step-Free" });
    remove.focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
