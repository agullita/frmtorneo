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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ayudantes: {
        Row: {
          created_at: string
          dia: string
          email: string
          id: number
          nombre: string
          turno: string
        }
        Insert: {
          created_at?: string
          dia: string
          email: string
          id?: number
          nombre: string
          turno: string
        }
        Update: {
          created_at?: string
          dia?: string
          email?: string
          id?: number
          nombre?: string
          turno?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          bot_response: string
          created_at: string
          id: string
          session_id: string
          user_message: string
        }
        Insert: {
          bot_response: string
          created_at?: string
          id?: string
          session_id: string
          user_message: string
        }
        Update: {
          bot_response?: string
          created_at?: string
          id?: string
          session_id?: string
          user_message?: string
        }
        Relationships: []
      }
      equipos: {
        Row: {
          categoria: string
          confirmed: boolean
          created_at: string
          duracion_partido: string | null
          entrenador: string | null
          id: number
          name: string
          segundo_entrenador: string | null
          updated_at: string
        }
        Insert: {
          categoria: string
          confirmed?: boolean
          created_at?: string
          duracion_partido?: string | null
          entrenador?: string | null
          id?: number
          name: string
          segundo_entrenador?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string
          confirmed?: boolean
          created_at?: string
          duracion_partido?: string | null
          entrenador?: string | null
          id?: number
          name?: string
          segundo_entrenador?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          file_name: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          chunk_index?: number
          content: string
          created_at?: string
          file_name: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          file_name?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notificaciones_enviadas: {
        Row: {
          created_at: string
          enviadas_a: number
          fallidas: number
          id: string
          mensaje: string
          titulo: string
        }
        Insert: {
          created_at?: string
          enviadas_a?: number
          fallidas?: number
          id?: string
          mensaje: string
          titulo: string
        }
        Update: {
          created_at?: string
          enviadas_a?: number
          fallidas?: number
          id?: string
          mensaje?: string
          titulo?: string
        }
        Relationships: []
      }
      partidos: {
        Row: {
          campo: string
          categoria: string
          created_at: string
          duracion: string
          entrenador: string
          escuela: string
          fecha: string
          hora: string
          id: string
          updated_at: string
        }
        Insert: {
          campo: string
          categoria: string
          created_at?: string
          duracion: string
          entrenador: string
          escuela: string
          fecha: string
          hora: string
          id?: string
          updated_at?: string
        }
        Update: {
          campo?: string
          categoria?: string
          created_at?: string
          duracion?: string
          entrenador?: string
          escuela?: string
          fecha?: string
          hora?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      partidos_pedidos: {
        Row: {
          campo: string
          categoria: string
          created_at: string
          duracion: string
          email: string
          entrenador: string
          escuela: string
          fecha: string
          hora: string
          id: string
          sustituto: string | null
        }
        Insert: {
          campo: string
          categoria: string
          created_at?: string
          duracion: string
          email: string
          entrenador: string
          escuela: string
          fecha: string
          hora: string
          id?: string
          sustituto?: string | null
        }
        Update: {
          campo?: string
          categoria?: string
          created_at?: string
          duracion?: string
          email?: string
          entrenador?: string
          escuela?: string
          fecha?: string
          hora?: string
          id?: string
          sustituto?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_admin_role: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
