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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      devices: {
        Row: {
          calibration_factor: number | null
          created_at: string | null
          device_id: string
          firmware_version: string | null
          id: string
          ip_address: string | null
          is_online: boolean | null
          last_seen_at: string | null
          mac_address: string | null
          name: string
          num_readings: number | null
          pending_tare: boolean | null
          reading_interval: number | null
          smoothing_factor: number | null
          tare_offset: number | null
          temp_compensation_coeff: number | null
          updated_at: string | null
        }
        Insert: {
          calibration_factor?: number | null
          created_at?: string | null
          device_id: string
          firmware_version?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          mac_address?: string | null
          name: string
          num_readings?: number | null
          pending_tare?: boolean | null
          reading_interval?: number | null
          smoothing_factor?: number | null
          tare_offset?: number | null
          temp_compensation_coeff?: number | null
          updated_at?: string | null
        }
        Update: {
          calibration_factor?: number | null
          created_at?: string | null
          device_id?: string
          firmware_version?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          mac_address?: string | null
          name?: string
          num_readings?: number | null
          pending_tare?: boolean | null
          reading_interval?: number | null
          smoothing_factor?: number | null
          tare_offset?: number | null
          temp_compensation_coeff?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      keg_sessions: {
        Row: {
          abv: number | null
          average_pour_liters: number | null
          beer_name: string
          brewery: string | null
          capacity_liters: number | null
          created_at: string | null
          empty_weight_grams: number
          full_weight_grams: number
          ibu: number | null
          id: string
          keg_id: string | null
          kicked_at: string | null
          style: string | null
          tapped_at: string
          total_consumed_liters: number | null
          total_pours: number | null
        }
        Insert: {
          abv?: number | null
          average_pour_liters?: number | null
          beer_name: string
          brewery?: string | null
          capacity_liters?: number | null
          created_at?: string | null
          empty_weight_grams: number
          full_weight_grams: number
          ibu?: number | null
          id?: string
          keg_id?: string | null
          kicked_at?: string | null
          style?: string | null
          tapped_at: string
          total_consumed_liters?: number | null
          total_pours?: number | null
        }
        Update: {
          abv?: number | null
          average_pour_liters?: number | null
          beer_name?: string
          brewery?: string | null
          capacity_liters?: number | null
          created_at?: string | null
          empty_weight_grams?: number
          full_weight_grams?: number
          ibu?: number | null
          id?: string
          keg_id?: string | null
          kicked_at?: string | null
          style?: string | null
          tapped_at?: string
          total_consumed_liters?: number | null
          total_pours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keg_sessions_keg_id_fkey"
            columns: ["keg_id"]
            isOneToOne: false
            referencedRelation: "current_keg_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keg_sessions_keg_id_fkey"
            columns: ["keg_id"]
            isOneToOne: false
            referencedRelation: "kegs"
            referencedColumns: ["id"]
          },
        ]
      }
      kegs: {
        Row: {
          abv: number | null
          beer_name: string | null
          brewery: string | null
          capacity_liters: number | null
          created_at: string | null
          description: string | null
          device_id: string
          empty_weight_grams: number
          full_weight_grams: number
          hops: string | null
          ibu: number | null
          id: string
          is_active: boolean | null
          kicked_at: string | null
          logo_url: string | null
          name: string
          srm: number | null
          style: string | null
          tap_position: number | null
          tapped_at: string | null
          tower_number: number | null
          updated_at: string | null
        }
        Insert: {
          abv?: number | null
          beer_name?: string | null
          brewery?: string | null
          capacity_liters?: number | null
          created_at?: string | null
          description?: string | null
          device_id: string
          empty_weight_grams: number
          full_weight_grams: number
          hops?: string | null
          ibu?: number | null
          id?: string
          is_active?: boolean | null
          kicked_at?: string | null
          logo_url?: string | null
          name: string
          srm?: number | null
          style?: string | null
          tap_position?: number | null
          tapped_at?: string | null
          tower_number?: number | null
          updated_at?: string | null
        }
        Update: {
          abv?: number | null
          beer_name?: string | null
          brewery?: string | null
          capacity_liters?: number | null
          created_at?: string | null
          description?: string | null
          device_id?: string
          empty_weight_grams?: number
          full_weight_grams?: number
          hops?: string | null
          ibu?: number | null
          id?: string
          is_active?: boolean | null
          kicked_at?: string | null
          logo_url?: string | null
          name?: string
          srm?: number | null
          style?: string | null
          tap_position?: number | null
          tapped_at?: string | null
          tower_number?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weight_measurements: {
        Row: {
          created_at: string | null
          device_id: string
          esp32_timestamp: number
          id: number
          keg_id: string | null
          mac_address: string | null
          temperature_c: number | null
          temperature_celsius: number | null
          weight_grams: number
        }
        Insert: {
          created_at?: string | null
          device_id: string
          esp32_timestamp: number
          id?: number
          keg_id?: string | null
          mac_address?: string | null
          temperature_c?: number | null
          temperature_celsius?: number | null
          weight_grams: number
        }
        Update: {
          created_at?: string | null
          device_id?: string
          esp32_timestamp?: number
          id?: number
          keg_id?: string | null
          mac_address?: string | null
          temperature_c?: number | null
          temperature_celsius?: number | null
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_measurements_keg_id_fkey"
            columns: ["keg_id"]
            isOneToOne: false
            referencedRelation: "current_keg_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_measurements_keg_id_fkey"
            columns: ["keg_id"]
            isOneToOne: false
            referencedRelation: "kegs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      current_keg_status: {
        Row: {
          abv: number | null
          beer_name: string | null
          beer_weight_grams: number | null
          brewery: string | null
          capacity_liters: number | null
          current_weight_grams: number | null
          description: string | null
          device_id: string | null
          empty_weight_grams: number | null
          full_beer_weight_grams: number | null
          full_weight_grams: number | null
          hops: string | null
          ibu: number | null
          id: string | null
          kicked_at: string | null
          last_reading_at: string | null
          liters_remaining: number | null
          logo_url: string | null
          name: string | null
          percentage_full: number | null
          pints_remaining: number | null
          seconds_since_reading: number | null
          srm: number | null
          status: string | null
          style: string | null
          tap_position: number | null
          tapped_at: string | null
          tower_number: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_measurements: { Args: never; Returns: undefined }
      get_keg_consumption: {
        Args: { p_interval?: string; p_keg_id: string }
        Returns: {
          avg_weight: number
          liters_consumed: number
          time_bucket: string
        }[]
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
