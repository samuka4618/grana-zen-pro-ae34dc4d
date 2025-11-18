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
      bank_accounts: {
        Row: {
          account_type: string
          active: boolean
          bank_name: string | null
          color: string | null
          created_at: string
          current_balance: number
          id: string
          initial_balance: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          active?: boolean
          bank_name?: string | null
          color?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          active?: boolean
          bank_name?: string | null
          color?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          month: string
          planned_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          month: string
          planned_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          month?: string
          planned_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_card_purchases: {
        Row: {
          category: string
          created_at: string
          credit_card_id: string
          description: string
          id: string
          installment_amount: number
          installments: number
          purchase_date: string
          total_amount: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          credit_card_id: string
          description: string
          id?: string
          installment_amount: number
          installments: number
          purchase_date?: string
          total_amount: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          credit_card_id?: string
          description?: string
          id?: string
          installment_amount?: number
          installments?: number
          purchase_date?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_purchases_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          active: boolean
          closing_day: number
          created_at: string
          credit_limit: number
          due_day: number
          id: string
          last_four_digits: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          closing_day: number
          created_at?: string
          credit_limit: number
          due_day: number
          id?: string
          last_four_digits: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          closing_day?: number
          created_at?: string
          credit_limit?: number
          due_day?: number
          id?: string
          last_four_digits?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string
          created_at: string
          current_month: string
          goal_type: string
          id: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_month: string
          goal_type: string
          id?: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_month?: string
          goal_type?: string
          id?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          category: string
          created_at: string | null
          current_installment: number
          description: string
          id: string
          installment_amount: number
          installment_count: number
          start_date: string
          total_amount: number
          type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          current_installment?: number
          description: string
          id?: string
          installment_amount: number
          installment_count: number
          start_date: string
          total_amount: number
          type: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          current_installment?: number
          description?: string
          id?: string
          installment_amount?: number
          installment_count?: number
          start_date?: string
          total_amount?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_contracts: {
        Row: {
          active: boolean
          amount: number
          category: string
          created_at: string | null
          description: string
          due_day: number
          id: string
          start_date: string
          type: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          category: string
          created_at?: string | null
          description: string
          due_day: number
          id?: string
          start_date?: string
          type: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          due_day?: number
          id?: string
          start_date?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_access: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["share_permission"]
          shared_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["share_permission"]
          shared_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["share_permission"]
          shared_by?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          attachment_url: string | null
          bank_account_id: string | null
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          bank_account_id?: string | null
          category: string
          created_at?: string | null
          date?: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          bank_account_id?: string | null
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: {
          _owner_id: string
          _required_permission: Database["public"]["Enums"]["share_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_shared_access: {
        Args: { _owner_id: string; _viewer_id: string }
        Returns: boolean
      }
    }
    Enums: {
      share_permission: "owner" | "admin" | "editor" | "viewer"
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
      share_permission: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
