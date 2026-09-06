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
      banners: {
        Row: {
          created_at: string
          id: string
          image: string
          link: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          image?: string
          link?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          link?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          external_link: string | null
          featured: boolean
          id: string
          image: string
          name: string
          original_price: number | null
          price: number
          store_category_id: string | null
          store_id: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          external_link?: string | null
          featured?: boolean
          id: string
          image?: string
          name: string
          original_price?: number | null
          price?: number
          store_category_id?: string | null
          store_id?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          external_link?: string | null
          featured?: boolean
          id?: string
          image?: string
          name?: string
          original_price?: number | null
          price?: number
          store_category_id?: string | null
          store_id?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_category_id_fkey"
            columns: ["store_category_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          description: string
          duration: string | null
          featured: boolean
          id: string
          image: string
          name: string
          price: number | null
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          featured?: boolean
          id: string
          image?: string
          name: string
          price?: number | null
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          featured?: boolean
          id?: string
          image?: string
          name?: string
          price?: number | null
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provider_works: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          image: string
          provider_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          description?: string
          id: string
          image?: string
          provider_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          image?: string
          provider_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          blocked: boolean
          category_ids: string[]
          city: string | null
          cover: string
          created_at: string
          description: string
          facebook: string | null
          featured: boolean
          id: string
          instagram: string | null
          name: string
          phone: string | null
          photo: string
          schedule: string | null
          service_area: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          blocked?: boolean
          category_ids?: string[]
          city?: string | null
          cover?: string
          created_at?: string
          description?: string
          facebook?: string | null
          featured?: boolean
          id: string
          instagram?: string | null
          name: string
          phone?: string | null
          photo?: string
          schedule?: string | null
          service_area?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          blocked?: boolean
          category_ids?: string[]
          city?: string | null
          cover?: string
          created_at?: string
          description?: string
          facebook?: string | null
          featured?: boolean
          id?: string
          instagram?: string | null
          name?: string
          phone?: string | null
          photo?: string
          schedule?: string | null
          service_area?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          featured: boolean
          id: string
          image: string
          name: string
          store_id: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          description?: string
          featured?: boolean
          id: string
          image?: string
          name: string
          store_id?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image?: string
          name?: string
          store_id?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          position?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          banner: string
          blocked: boolean
          category_id: string | null
          created_at: string
          description: string
          featured: boolean
          id: string
          instagram: string | null
          logo: string
          name: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string | null
          banner?: string
          blocked?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id: string
          instagram?: string | null
          logo?: string
          name: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address?: string | null
          banner?: string
          blocked?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          instagram?: string | null
          logo?: string
          name?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_clicks: {
        Row: {
          clicked_at: string
          created_at: string
          id: string
          store_id: string
          store_name: string
        }
        Insert: {
          clicked_at?: string
          created_at?: string
          id?: string
          store_id: string
          store_name: string
        }
        Update: {
          clicked_at?: string
          created_at?: string
          id?: string
          store_id?: string
          store_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "viewer"
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
    Enums: {
      app_role: ["admin", "operator", "viewer"],
    },
  },
} as const
