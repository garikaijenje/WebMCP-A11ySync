import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/dashboard/Sidebar";

describe("Sidebar", () => {
  it("marks the active section and shows count badges", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Sidebar
        activeTab="medications"
        onNavigate={onNavigate}
        appointmentCount={2}
        refillDueCount={1}
        isCloudActive
        trojanEnabled
        shortcutA="⌥A"
        shortcutD="⌥D"
      />
    );
    expect(screen.getByRole("button", { name: /medications 1/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /care overview 2/i })).toBeInTheDocument();
    expect(screen.getByText("Supabase Live")).toBeInTheDocument();
    expect(screen.getByText("A11ySync On")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /providers/i }));
    expect(onNavigate).toHaveBeenCalledWith("clinics");
  });

  it("reflects offline status", () => {
    render(
      <Sidebar
        activeTab="dashboard"
        onNavigate={() => {}}
        appointmentCount={0}
        refillDueCount={0}
        isCloudActive={false}
        trojanEnabled={false}
        shortcutA="⌥A"
        shortcutD="⌥D"
      />
    );
    expect(screen.getByText("Offline cache")).toBeInTheDocument();
    expect(screen.getByText("A11ySync Off")).toBeInTheDocument();
  });
});
