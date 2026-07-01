// Generated from the live Supabase project (ref: avmygueukigqbqhftuic) via
// `generate_typescript_types`. Do not hand-edit — regenerate when the schema
// changes. UGC fields (vendor, description, names, reject_reason, comment body)
// are plain text and are NEVER translated (PROJECT_STATE §9).
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
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          note_id: string | null
          receipt_id: string | null
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          note_id?: string | null
          receipt_id?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          note_id?: string | null
          receipt_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "no_receipt_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          currency: string
          rate_to_usd: number
          updated_at: string
        }
        Insert: {
          currency: string
          rate_to_usd: number
          updated_at?: string
        }
        Update: {
          currency?: string
          rate_to_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          body: string
          created_at: string
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          spending_limit: number | null
          submission_deadline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          spending_limit?: number | null
          submission_deadline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          spending_limit?: number | null
          submission_deadline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      no_receipt_notes: {
        Row: {
          created_at: string
          description: string
          group_id: string
          id: string
          note_date: string
          reject_reason: string | null
          signer1_name: string
          signer1_signature_path: string | null
          signer1_signed_at: string | null
          signer2_name: string | null
          signer2_signature_path: string | null
          signer2_signed_at: string | null
          status: Database["public"]["Enums"]["item_status"]
          submitted_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          group_id: string
          id?: string
          note_date?: string
          reject_reason?: string | null
          signer1_name: string
          signer1_signature_path?: string | null
          signer1_signed_at?: string | null
          signer2_name?: string | null
          signer2_signature_path?: string | null
          signer2_signed_at?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          submitted_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          group_id?: string
          id?: string
          note_date?: string
          reject_reason?: string | null
          signer1_name?: string
          signer1_signature_path?: string | null
          signer1_signed_at?: string | null
          signer2_name?: string | null
          signer2_signature_path?: string | null
          signer2_signed_at?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "no_receipt_notes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          additional_info: string | null
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          currency: string
          group_id: string
          id: string
          is_duplicate: boolean
          photo_path: string | null
          receipt_date: string
          reject_reason: string | null
          status: Database["public"]["Enums"]["item_status"]
          submitted_by: string
          updated_at: string
          usd_equivalent: number | null
          vendor: string
        }
        Insert: {
          additional_info?: string | null
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency: string
          group_id: string
          id?: string
          is_duplicate?: boolean
          photo_path?: string | null
          receipt_date: string
          reject_reason?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          submitted_by: string
          updated_at?: string
          usd_equivalent?: number | null
          vendor: string
        }
        Update: {
          additional_info?: string | null
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          group_id?: string
          id?: string
          is_duplicate?: boolean
          photo_path?: string | null
          receipt_date?: string
          reject_reason?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          submitted_by?: string
          updated_at?: string
          usd_equivalent?: number | null
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "fx_rates"
            referencedColumns: ["currency"]
          },
          {
            foreignKeyName: "receipts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string
          created_at: string
          created_by: string
          due_date: string | null
          group_id: string
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee: string
          created_at?: string
          created_by: string
          due_date?: string | null
          group_id: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          group_id?: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_group_member_names: {
        Args: { p_group_id: string }
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_member_of: { Args: { p_group_id: string }; Returns: boolean }
      is_treasurer_of: { Args: { p_group_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "treasurer" | "member"
      expense_category:
        | "groceries"
        | "fuel"
        | "meals"
        | "medical"
        | "transport"
        | "lodging"
        | "other"
      item_status: "pending" | "reviewed" | "approved" | "rejected"
      task_status: "assigned" | "done" | "approved"
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
    Enums: {
      app_role: ["admin", "treasurer", "member"],
      expense_category: [
        "groceries",
        "fuel",
        "meals",
        "medical",
        "transport",
        "lodging",
        "other",
      ],
      item_status: ["pending", "reviewed", "approved", "rejected"],
      task_status: ["assigned", "done", "approved"],
    },
  },
} as const
