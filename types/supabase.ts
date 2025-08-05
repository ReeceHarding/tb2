export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      content: {
        Row: {
          author_display_name: string | null
          author_id: string | null
          author_profile_image_url: string | null
          author_username: string | null
          comments_count: number | null
          content_embedding: string | null
          created_at: string
          created_at_db: string | null
          description: string | null
          description_embedding: string | null
          duplicate_of: string | null
          embedding_generated_at: string | null
          embedding_model: string | null
          id: string
          is_duplicate: boolean | null
          likes_count: number | null
          platform: string
          platform_id: string
          published_at: string | null
          shares_count: number | null
          title: string | null
          views_count: number | null
        }
        Insert: {
          author_display_name?: string | null
          author_id?: string | null
          author_profile_image_url?: string | null
          author_username?: string | null
          comments_count?: number | null
          content_embedding?: string | null
          created_at: string
          created_at_db?: string | null
          description?: string | null
          description_embedding?: string | null
          duplicate_of?: string | null
          embedding_generated_at?: string | null
          embedding_model?: string | null
          id?: string
          is_duplicate?: boolean | null
          likes_count?: number | null
          platform: string
          platform_id: string
          published_at?: string | null
          shares_count?: number | null
          title?: string | null
          views_count?: number | null
        }
        Update: {
          author_display_name?: string | null
          author_id?: string | null
          author_profile_image_url?: string | null
          author_username?: string | null
          comments_count?: number | null
          content_embedding?: string | null
          created_at?: string
          created_at_db?: string | null
          description?: string | null
          description_embedding?: string | null
          duplicate_of?: string | null
          embedding_generated_at?: string | null
          embedding_model?: string | null
          id?: string
          is_duplicate?: boolean | null
          likes_count?: number | null
          platform?: string
          platform_id?: string
          published_at?: string | null
          shares_count?: number | null
          title?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          accuracy: number | null
          app: string | null
          correct_questions: number | null
          course: string | null
          created_at: string | null
          date: string
          essential_lessons_mastered: number | null
          id: string
          lessons_mastered: number | null
          minutes: number | null
          student_id: string
          subject: string
          total_questions: number | null
        }
        Insert: {
          accuracy?: number | null
          app?: string | null
          correct_questions?: number | null
          course?: string | null
          created_at?: string | null
          date: string
          essential_lessons_mastered?: number | null
          id?: string
          lessons_mastered?: number | null
          minutes?: number | null
          student_id: string
          subject: string
          total_questions?: number | null
        }
        Update: {
          accuracy?: number | null
          app?: string | null
          correct_questions?: number | null
          course?: string | null
          created_at?: string | null
          date?: string
          essential_lessons_mastered?: number | null
          id?: string
          lessons_mastered?: number | null
          minutes?: number | null
          student_id?: string
          subject?: string
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_gaps: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          subject: string
          working_grade_gap: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          subject: string
          working_grade_gap?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          subject?: string
          working_grade_gap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_gaps_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      map_scores: {
        Row: {
          created_at: string | null
          fall_rit: number | null
          id: string
          spring_prev_rit: number | null
          spring_rit: number | null
          student_id: string
          subject: string
          winter_rit: number | null
        }
        Insert: {
          created_at?: string | null
          fall_rit?: number | null
          id?: string
          spring_prev_rit?: number | null
          spring_rit?: number | null
          student_id: string
          subject: string
          winter_rit?: number | null
        }
        Update: {
          created_at?: string | null
          fall_rit?: number | null
          id?: string
          spring_prev_rit?: number | null
          spring_rit?: number | null
          student_id?: string
          subject?: string
          winter_rit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "map_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_image_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      marketing_images: {
        Row: {
          category: string
          content_type: string | null
          created_at: string
          description: string | null
          file_size: number | null
          google_drive_id: string | null
          google_drive_url: string | null
          height: number | null
          id: string
          image_url: string
          is_featured: boolean | null
          original_filename: string
          school_address: string | null
          school_city: string | null
          school_email: string | null
          school_id: string
          school_name: string
          school_phone: string | null
          school_state: string | null
          school_type: string
          school_website: string | null
          school_zip: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
          width: number | null
        }
        Insert: {
          category: string
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          google_drive_id?: string | null
          google_drive_url?: string | null
          height?: number | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          original_filename: string
          school_address?: string | null
          school_city?: string | null
          school_email?: string | null
          school_id: string
          school_name: string
          school_phone?: string | null
          school_state?: string | null
          school_type: string
          school_website?: string | null
          school_zip?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
          width?: number | null
        }
        Update: {
          category?: string
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          google_drive_id?: string | null
          google_drive_url?: string | null
          height?: number | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          original_filename?: string
          school_address?: string | null
          school_city?: string | null
          school_email?: string | null
          school_id?: string
          school_name?: string
          school_phone?: string | null
          school_state?: string | null
          school_type?: string
          school_website?: string | null
          school_zip?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
          width?: number | null
        }
        Relationships: []
      }
      media: {
        Row: {
          content_id: string
          created_at: string | null
          duration_seconds: number | null
          file_size: number | null
          height: number | null
          id: string
          local_file_path: string | null
          media_type: string
          url: string | null
          width: number | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          local_file_path?: string | null
          media_type?: string
          url?: string | null
          width?: number | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          local_file_path?: string | null
          media_type?: string
          url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age_grade: number
          campus: string
          created_at: string | null
          id: string
          level: string
          updated_at: string | null
        }
        Insert: {
          age_grade: number
          campus: string
          created_at?: string | null
          id: string
          level: string
          updated_at?: string | null
        }
        Update: {
          age_grade?: number
          campus?: string
          created_at?: string | null
          id?: string
          level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_seconds: number | null
          featured: boolean | null
          file_size_bytes: number | null
          id: string
          last_viewed_at: string | null
          local_video_path: string | null
          marketing_copy: Json | null
          student_age: number | null
          student_grade: string | null
          student_name: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          transcription: string
          updated_at: string | null
          video_height: number | null
          video_url: string
          video_width: number | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          featured?: boolean | null
          file_size_bytes?: number | null
          id?: string
          last_viewed_at?: string | null
          local_video_path?: string | null
          marketing_copy?: Json | null
          student_age?: number | null
          student_grade?: string | null
          student_name?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          transcription: string
          updated_at?: string | null
          video_height?: number | null
          video_url: string
          video_width?: number | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          featured?: boolean | null
          file_size_bytes?: number | null
          id?: string
          last_viewed_at?: string | null
          local_video_path?: string | null
          marketing_copy?: Json | null
          student_age?: number | null
          student_grade?: string | null
          student_name?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          transcription?: string
          updated_at?: string | null
          video_height?: number | null
          video_url?: string
          video_width?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      time_commitments: {
        Row: {
          created_at: string | null
          daily_minutes_vs_target: number | null
          hours_worked: number | null
          id: string
          mins_per_weekday: number | null
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          daily_minutes_vs_target?: number | null
          hours_worked?: number | null
          id?: string
          mins_per_weekday?: number | null
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string | null
          daily_minutes_vs_target?: number | null
          hours_worked?: number | null
          id?: string
          mins_per_weekday?: number | null
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_commitments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      transcriptions: {
        Row: {
          confidence_score: number | null
          content_id: string
          created_at: string | null
          embedding_generated_at: string | null
          embedding_model: string | null
          id: string
          language: string | null
          media_id: string | null
          model_version: string | null
          text: string
          text_embedding: string | null
          transcription_service: string | null
          word_count: number | null
        }
        Insert: {
          confidence_score?: number | null
          content_id: string
          created_at?: string | null
          embedding_generated_at?: string | null
          embedding_model?: string | null
          id?: string
          language?: string | null
          media_id?: string | null
          model_version?: string | null
          text: string
          text_embedding?: string | null
          transcription_service?: string | null
          word_count?: number | null
        }
        Update: {
          confidence_score?: number | null
          content_id?: string
          created_at?: string | null
          embedding_generated_at?: string | null
          embedding_model?: string | null
          id?: string
          language?: string | null
          media_id?: string | null
          model_version?: string | null
          text?: string
          text_embedding?: string | null
          transcription_service?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcriptions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcriptions_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      find_vector_duplicates: {
        Args: { similarity_threshold?: number; max_results?: number }
        Returns: {
          content1_id: string
          content2_id: string
          platform1: string
          platform2: string
          similarity_score: number
          description1: string
          description2: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_content_by_description: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          platform: string
          platform_id: string
          description: string
          author_username: string
          likes_count: number
          created_at: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
