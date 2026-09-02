/**
 * WebMCP-A11ySync: Universal Agent Simulator
 * Provides pre-configured mock agent execution scenarios so any evaluator can test
 * the full interaction loop (actuation, ghost cursor, audio, Safe-Stop modal) with one click.
 */

import { WebMCPBridge } from "./webmcp";

export class AgentSimulator {
  private bridge: WebMCPBridge;

  constructor(bridge: WebMCPBridge) {
    this.bridge = bridge;
  }

  /**
   * Scenario 1: Triage patient symptoms and match to a specialist
   */
  public async simulateTriage(): Promise<unknown> {
    const tool = this.bridge.getTool("triage_specialist");
    if (!tool) {
      throw new Error('WebMCP tool "triage_specialist" is not registered on this page.');
    }
    return tool.execute({
      symptoms: "Severe left knee pain, swelling after physical therapy, and reduced mobility",
      urgency: "urgent"
    });
  }

  /**
   * Scenario 2: Search in-network clinics with physical/sensory accommodations
   */
  public async simulateFindClinic(): Promise<unknown> {
    const tool = this.bridge.getTool("find_accessible_clinic");
    if (!tool) {
      throw new Error('WebMCP tool "find_accessible_clinic" is not registered on this page.');
    }
    return tool.execute({
      specialty: "Physical Therapy & Rehabilitation",
      accommodations: ["wheelchair-step-free", "braille-signage", "sensory-quiet-room"],
      insuranceNetwork: "BlueCross Health Advocates"
    });
  }

  /**
   * Scenario 3: Request prescription refill (Triggers Safe-Stop human confirmation modal)
   */
  public async simulateRefill(): Promise<unknown> {
    const tool = this.bridge.getTool("request_prescription_refill");
    if (!tool) {
      throw new Error('WebMCP tool "request_prescription_refill" is not registered on this page.');
    }
    return tool.execute({
      medicationName: "Albuterol Inhaler (90mcg)",
      dosage: "200 Actuations (Standard Inhaler)",
      pharmacyId: "memorial-outpatient-pharmacy"
    });
  }

  /**
   * Scenario 4: Confirm accessible consultation appointment
   */
  public async simulateConfirmBooking(): Promise<unknown> {
    const tool = this.bridge.getTool("confirm_appointment");
    if (!tool) {
      throw new Error('WebMCP tool "confirm_appointment" is not registered on this page.');
    }
    return tool.execute({
      clinicId: "memorial-accessible-center-suite-4b",
      date: "2026-09-18",
      timeSlot: "10:30 AM",
      accommodationNotes: "Patient requires wheelchair step-free access and quiet waiting area"
    });
  }
}
