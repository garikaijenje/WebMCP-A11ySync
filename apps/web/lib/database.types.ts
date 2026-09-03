export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          accommodation_notes: string | null
          appointment_date: string
          created_at: string
          doctor_name: string
          facility_name: string
          id: string
          patient_id: string | null
          practitioner_id: string | null
          status: string
          time_slot: string
        }
        Insert: {
          accommodation_notes?: string | null
          appointment_date: string
          created_at?: string
          doctor_name: string
          facility_name: string
          id: string
          patient_id?: string | null
          practitioner_id?: string | null
          status?: string
          time_slot: string
        }
        Update: {
          accommodation_notes?: string | null
          appointment_date?: string
          created_at?: string
          doctor_name?: string
          facility_name?: string
          id?: string
          patient_id?: string | null
          practitioner_id?: string | null
          status?: string
          time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_vitals: {
        Row: {
          blood_pressure: string
          heart_rate: number
          id: string
          oxygen_saturation: number
          patient_id: string | null
          recorded_at: string
          respiratory_rate: number
        }
        Insert: {
          blood_pressure: string
          heart_rate: number
          id: string
          oxygen_saturation: number
          patient_id?: string | null
          recorded_at?: string
          respiratory_rate: number
        }
        Update: {
          blood_pressure?: string
          heart_rate?: number
          id?: string
          oxygen_saturation?: number
          patient_id?: string | null
          recorded_at?: string
          respiratory_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          accessibility_communication: string | null
          accessibility_mobility: string | null
          accessibility_sensory: string | null
          allergies: string[] | null
          created_at: string
          dob: string
          first_name: string
          gender: string | null
          id: string
          insurance_provider: string
          last_name: string
          mrn: string
          primary_doctor: string
        }
        Insert: {
          accessibility_communication?: string | null
          accessibility_mobility?: string | null
          accessibility_sensory?: string | null
          allergies?: string[] | null
          created_at?: string
          dob: string
          first_name: string
          gender?: string | null
          id: string
          insurance_provider: string
          last_name: string
          mrn: string
          primary_doctor: string
        }
        Update: {
          accessibility_communication?: string | null
          accessibility_mobility?: string | null
          accessibility_sensory?: string | null
          allergies?: string[] | null
          created_at?: string
          dob?: string
          first_name?: string
          gender?: string | null
          id?: string
          insurance_provider?: string
          last_name?: string
          mrn?: string
          primary_doctor?: string
        }
        Relationships: []
      }
      practitioners: {
        Row: {
          accommodations: string[]
          available_slots: string[]
          created_at: string
          distance: string
          facility_address: string
          facility_name: string
          id: string
          name: string
          specialty: string
          title: string
        }
        Insert: {
          accommodations: string[]
          available_slots: string[]
          created_at?: string
          distance: string
          facility_address: string
          facility_name: string
          id: string
          name: string
          specialty: string
          title: string
        }
        Update: {
          accommodations?: string[]
          available_slots?: string[]
          created_at?: string
          distance?: string
          facility_address?: string
          facility_name?: string
          id?: string
          name?: string
          specialty?: string
          title?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          copay: string
          created_at: string
          id: string
          last_filled: string | null
          medication_name: string
          patient_id: string | null
          pharmacy_name: string
          prescribed_by: string
          refills_remaining: number
          rx_number: string
          status: string
          strength: string
        }
        Insert: {
          copay: string
          created_at?: string
          id: string
          last_filled?: string | null
          medication_name: string
          patient_id?: string | null
          pharmacy_name: string
          prescribed_by: string
          refills_remaining?: number
          rx_number: string
          status?: string
          strength: string
        }
        Update: {
          copay?: string
          created_at?: string
          id?: string
          last_filled?: string | null
          medication_name?: string
          patient_id?: string | null
          pharmacy_name?: string
          prescribed_by?: string
          refills_remaining?: number
          rx_number?: string
          status?: string
          strength?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      refill_orders: {
        Row: {
          copay: string
          dosage: string
          id: string
          medication_name: string
          patient_id: string | null
          pharmacy_id: string
          pharmacy_name: string
          prescription_id: string | null
          ready_time: string
          requested_at: string
          status: string
        }
        Insert: {
          copay: string
          dosage: string
          id: string
          medication_name: string
          patient_id?: string | null
          pharmacy_id: string
          pharmacy_name: string
          prescription_id?: string | null
          ready_time: string
          requested_at?: string
          status?: string
        }
        Update: {
          copay?: string
          dosage?: string
          id?: string
          medication_name?: string
          patient_id?: string | null
          pharmacy_id?: string
          pharmacy_name?: string
          prescription_id?: string | null
          ready_time?: string
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refill_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refill_orders_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_assessments: {
        Row: {
          body_region: string | null
          clinical_advice: string
          created_at: string
          id: string
          pain_level: number
          patient_id: string | null
          recommended_clinic: string
          recommended_specialty: string
          symptoms: string
          urgency: string
        }
        Insert: {
          body_region?: string | null
          clinical_advice: string
          created_at?: string
          id: string
          pain_level: number
          patient_id?: string | null
          recommended_clinic: string
          recommended_specialty: string
          symptoms: string
          urgency: string
        }
        Update: {
          body_region?: string | null
          clinical_advice?: string
          created_at?: string
          id?: string
          pain_level?: number
          patient_id?: string | null
          recommended_clinic?: string
          recommended_specialty?: string
          symptoms?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
