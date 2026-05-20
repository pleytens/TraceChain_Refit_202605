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
      tc_action_custom_params: {
        Row: {
          action_id: string
          id: string
          is_required: boolean
          param_name: string
          param_type: string
          param_unit: string
          sort_order: number
        }
        Insert: {
          action_id: string
          id?: string
          is_required?: boolean
          param_name: string
          param_type?: string
          param_unit?: string
          sort_order?: number
        }
        Update: {
          action_id?: string
          id?: string
          is_required?: boolean
          param_name?: string
          param_type?: string
          param_unit?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "tc_action_custom_params_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "tc_action_library"
            referencedColumns: ["id"]
          },
        ]
      }
      tc_action_library: {
        Row: {
          action_key: string
          category: string
          created_at: string | null
          custom_param_example: string
          description: string
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          produces_output: boolean
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          action_key: string
          category?: string
          created_at?: string | null
          custom_param_example?: string
          description?: string
          id: string
          is_active?: boolean
          is_system?: boolean
          name: string
          produces_output?: boolean
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          action_key?: string
          category?: string
          created_at?: string | null
          custom_param_example?: string
          description?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          produces_output?: boolean
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      tc_client_action_categories: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tc_locations: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          notes: string
          postal_code: string
          street_address: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string
          postal_code?: string
          street_address?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string
          postal_code?: string
          street_address?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tc_materials: {
        Row: {
          activity_log: Json
          created_at: string
          current_storage_room_id: string | null
          id: string
          import_packing_item: string
          import_packing_unit_default_qty: string
          import_unit_item: string
          material_category: string
          name: string
          origin_city: string
          origin_country: string
          origin_district: string
          origin_house_number: string
          origin_post_code: string
          origin_street_name: string
          storage_requirement_id: string | null
          supplier_id: string
          supplier_name: string
        }
        Insert: {
          activity_log?: Json
          created_at?: string
          current_storage_room_id?: string | null
          id: string
          import_packing_item?: string
          import_packing_unit_default_qty?: string
          import_unit_item?: string
          material_category?: string
          name: string
          origin_city?: string
          origin_country?: string
          origin_district?: string
          origin_house_number?: string
          origin_post_code?: string
          origin_street_name?: string
          storage_requirement_id?: string | null
          supplier_id?: string
          supplier_name?: string
        }
        Update: {
          activity_log?: Json
          created_at?: string
          current_storage_room_id?: string | null
          id?: string
          import_packing_item?: string
          import_packing_unit_default_qty?: string
          import_unit_item?: string
          material_category?: string
          name?: string
          origin_city?: string
          origin_country?: string
          origin_district?: string
          origin_house_number?: string
          origin_post_code?: string
          origin_street_name?: string
          storage_requirement_id?: string | null
          supplier_id?: string
          supplier_name?: string
        }
        Relationships: []
      }
      tc_process_action_steps: {
        Row: {
          action_id: string
          id: string
          is_required: boolean
          notes: string
          process_id: string
          step_order: number
          variable_details: Json
        }
        Insert: {
          action_id: string
          id?: string
          is_required?: boolean
          notes?: string
          process_id: string
          step_order?: number
          variable_details?: Json
        }
        Update: {
          action_id?: string
          id?: string
          is_required?: boolean
          notes?: string
          process_id?: string
          step_order?: number
          variable_details?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tc_process_action_steps_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "tc_action_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tc_process_action_steps_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "tc_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      tc_process_actions: {
        Row: {
          color: string
          created_at: string | null
          description: string
          id: string
          name: string
          status: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string
          id: string
          name: string
          status?: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      tc_processes: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_final: boolean
          is_used: boolean
          name: string
          sort_order: number
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string
          id?: string
          is_final?: boolean
          is_used?: boolean
          name: string
          sort_order?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_final?: boolean
          is_used?: boolean
          name?: string
          sort_order?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tc_products: {
        Row: {
          category_name: string
          created_at: string
          current_storage_room_id: string | null
          gtin_code: string
          id: number
          product_name: string
          storage_requirement_id: string | null
        }
        Insert: {
          category_name?: string
          created_at: string
          current_storage_room_id?: string | null
          gtin_code: string
          id?: number
          product_name: string
          storage_requirement_id?: string | null
        }
        Update: {
          category_name?: string
          created_at?: string
          current_storage_room_id?: string | null
          gtin_code?: string
          id?: number
          product_name?: string
          storage_requirement_id?: string | null
        }
        Relationships: []
      }
      tc_recordings: {
        Row: {
          batch_lot_number: string | null
          created_at: string | null
          data: Json
          expiry_date: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          locked_by_name: string | null
          process_id: string
          record_name: string
          recorded_at: string | null
          recorded_by: string
          status: string
          updated_at: string | null
          user_name: string
        }
        Insert: {
          batch_lot_number?: string | null
          created_at?: string | null
          data?: Json
          expiry_date?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          locked_by_name?: string | null
          process_id: string
          record_name: string
          recorded_at?: string | null
          recorded_by: string
          status?: string
          updated_at?: string | null
          user_name: string
        }
        Update: {
          batch_lot_number?: string | null
          created_at?: string | null
          data?: Json
          expiry_date?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          locked_by_name?: string | null
          process_id?: string
          record_name?: string
          recorded_at?: string | null
          recorded_by?: string
          status?: string
          updated_at?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tc_recordings_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "tc_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      tc_settings_customers: {
        Row: {
          created_at: string | null
          data: Json
          id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
        }
        Relationships: []
      }
      tc_settings_products: {
        Row: {
          activity_log: Json
          barcode_id: string
          commercial_name: string
          created_at: string
          gs1_id: string
          id: string
          internal_id: string
          name: string
          other1: string
          other2: string
          other3: string
          packing_item: string
          product_category: string
          storage_city: string
          storage_country: string
          storage_district: string
          storage_house_number: string
          storage_location_room: string
          storage_post_code: string
          storage_requirement: string
          storage_street_name: string
          unit: string
          unit_default_quantity: string
        }
        Insert: {
          activity_log?: Json
          barcode_id?: string
          commercial_name?: string
          created_at?: string
          gs1_id?: string
          id: string
          internal_id?: string
          name: string
          other1?: string
          other2?: string
          other3?: string
          packing_item?: string
          product_category?: string
          storage_city?: string
          storage_country?: string
          storage_district?: string
          storage_house_number?: string
          storage_location_room?: string
          storage_post_code?: string
          storage_requirement?: string
          storage_street_name?: string
          unit?: string
          unit_default_quantity?: string
        }
        Update: {
          activity_log?: Json
          barcode_id?: string
          commercial_name?: string
          created_at?: string
          gs1_id?: string
          id?: string
          internal_id?: string
          name?: string
          other1?: string
          other2?: string
          other3?: string
          packing_item?: string
          product_category?: string
          storage_city?: string
          storage_country?: string
          storage_district?: string
          storage_house_number?: string
          storage_location_room?: string
          storage_post_code?: string
          storage_requirement?: string
          storage_street_name?: string
          unit?: string
          unit_default_quantity?: string
        }
        Relationships: []
      }
      tc_settings_suppliers: {
        Row: {
          created_at: string | null
          data: Json
          id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
        }
        Relationships: []
      }
      tc_storage_requirements: {
        Row: {
          code: string
          created_at: string | null
          description: string
          humidity_max_pct: number | null
          humidity_min_pct: number | null
          id: string
          is_active: boolean
          name: string
          notes: string
          requires_cold_chain: boolean
          requires_hazmat: boolean
          temperature_max_c: number | null
          temperature_min_c: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string
          humidity_max_pct?: number | null
          humidity_min_pct?: number | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string
          requires_cold_chain?: boolean
          requires_hazmat?: boolean
          temperature_max_c?: number | null
          temperature_min_c?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          humidity_max_pct?: number | null
          humidity_min_pct?: number | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string
          requires_cold_chain?: boolean
          requires_hazmat?: boolean
          temperature_max_c?: number | null
          temperature_min_c?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tc_storage_rooms: {
        Row: {
          building: string
          capacity_units: string
          capacity_value: number | null
          created_at: string | null
          floor: string
          id: string
          is_active: boolean
          location_id: string
          notes: string
          room: string
          storage_requirement_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          building?: string
          capacity_units?: string
          capacity_value?: number | null
          created_at?: string | null
          floor?: string
          id?: string
          is_active?: boolean
          location_id: string
          notes?: string
          room: string
          storage_requirement_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          building?: string
          capacity_units?: string
          capacity_value?: number | null
          created_at?: string | null
          floor?: string
          id?: string
          is_active?: boolean
          location_id?: string
          notes?: string
          room?: string
          storage_requirement_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tc_storage_rooms_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "tc_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tc_storage_rooms_storage_requirement_id_fkey"
            columns: ["storage_requirement_id"]
            isOneToOne: false
            referencedRelation: "tc_storage_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      tc_suppliers: {
        Row: {
          address: string
          created_at: string
          email: string
          gs1_code: string
          id: number
          name: string
        }
        Insert: {
          address?: string
          created_at: string
          email?: string
          gs1_code: string
          id: number
          name: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          gs1_code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      tc_units: {
        Row: {
          abbreviation: string
          created_at: string | null
          id: string
          name: string
          status: string
          type: string
        }
        Insert: {
          abbreviation: string
          created_at?: string | null
          id: string
          name: string
          status?: string
          type?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
        }
        Relationships: []
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
