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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          created_at: string
          id: string
          permission_level: Database["public"]["Enums"]["admin_permission_level"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["admin_permission_level"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["admin_permission_level"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          function_name: string
          id: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          email: string | null
          employees: number | null
          id: string
          is_reviewable: boolean
          license_url: string | null
          location: string | null
          logo_url: string | null
          parent_id: string | null
          phone: string | null
          social_links: Json | null
          specialties: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          year_established: number | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employees?: number | null
          id?: string
          is_reviewable?: boolean
          license_url?: string | null
          location?: string | null
          logo_url?: string | null
          parent_id?: string | null
          phone?: string | null
          social_links?: Json | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          year_established?: number | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employees?: number | null
          id?: string
          is_reviewable?: boolean
          license_url?: string | null
          location?: string | null
          logo_url?: string | null
          parent_id?: string | null
          phone?: string | null
          social_links?: Json | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_engagement: {
        Row: {
          community_posts: number
          community_replies: number
          community_votes: number
          created_at: string
          developers_viewed: number
          helpful_votes: number
          id: string
          projects_saved: number
          reports_unlocked: number
          updated_at: string
          user_id: string
        }
        Insert: {
          community_posts?: number
          community_replies?: number
          community_votes?: number
          created_at?: string
          developers_viewed?: number
          helpful_votes?: number
          id?: string
          projects_saved?: number
          reports_unlocked?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          community_posts?: number
          community_replies?: number
          community_votes?: number
          created_at?: string
          developers_viewed?: number
          helpful_votes?: number
          id?: string
          projects_saved?: number
          reports_unlocked?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          body: string
          category: Database["public"]["Enums"]["community_post_category"]
          created_at: string
          developer_id: string | null
          id: string
          is_pinned: boolean
          reply_count: number
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          body: string
          category?: Database["public"]["Enums"]["community_post_category"]
          created_at?: string
          developer_id?: string | null
          id?: string
          is_pinned?: boolean
          reply_count?: number
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          body?: string
          category?: Database["public"]["Enums"]["community_post_category"]
          created_at?: string
          developer_id?: string | null
          id?: string
          is_pinned?: boolean
          reply_count?: number
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: []
      }
      community_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "community_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      community_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          parent_reply_id: string | null
          post_id: string
          upvotes: number
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          parent_reply_id?: string | null
          post_id: string
          upvotes?: number
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          parent_reply_id?: string | null
          post_id?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "community_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
          vote_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "community_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_businesses: {
        Row: {
          business_id: string
          business_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          business_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          business_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      guest_feedback: {
        Row: {
          created_at: string
          feedback: string
          feedback_type: string
          id: string
          rating: number
          session_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          feedback_type?: string
          id?: string
          rating: number
          session_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          feedback_type?: string
          id?: string
          rating?: number
          session_id?: string
        }
        Relationships: []
      }
      guest_reviews: {
        Row: {
          claimed_by: string | null
          comment: string
          created_at: string
          developer_id: string
          developer_name: string | null
          experience_type: string | null
          guest_email: string | null
          guest_name: string
          id: string
          is_claimed: boolean
          rating: number
          title: string | null
        }
        Insert: {
          claimed_by?: string | null
          comment: string
          created_at?: string
          developer_id: string
          developer_name?: string | null
          experience_type?: string | null
          guest_email?: string | null
          guest_name?: string
          id?: string
          is_claimed?: boolean
          rating: number
          title?: string | null
        }
        Update: {
          claimed_by?: string | null
          comment?: string
          created_at?: string
          developer_id?: string
          developer_name?: string | null
          experience_type?: string | null
          guest_email?: string | null
          guest_name?: string
          id?: string
          is_claimed?: boolean
          rating?: number
          title?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          announcement_notifications: boolean
          created_at: string
          id: string
          interest_notifications: boolean
          review_notifications: boolean
          status_notifications: boolean
          trust_score_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_notifications?: boolean
          created_at?: string
          id?: string
          interest_notifications?: boolean
          review_notifications?: boolean
          status_notifications?: boolean
          trust_score_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_notifications?: boolean
          created_at?: string
          id?: string
          interest_notifications?: boolean
          review_notifications?: boolean
          status_notifications?: boolean
          trust_score_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          budget_range: string | null
          buyer_type: string | null
          created_at: string
          full_name: string | null
          id: string
          interests: string[] | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          budget_range?: string | null
          buyer_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          interests?: string[] | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          budget_range?: string | null
          buyer_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          interests?: string[] | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipt_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          developer_id: string | null
          developer_name: string | null
          id: string
          image_url: string
          reviewed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          developer_id?: string | null
          developer_name?: string | null
          id?: string
          image_url: string
          reviewed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          developer_id?: string | null
          developer_name?: string | null
          id?: string
          image_url?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          attachment_urls: string[] | null
          author_name: string
          comment: string
          created_at: string
          developer_id: string
          developer_name: string | null
          experience_type: string | null
          id: string
          is_anonymous: boolean
          is_verified: boolean
          rating: number
          title: string | null
          unit_type: string | null
          user_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          author_name: string
          comment: string
          created_at?: string
          developer_id: string
          developer_name?: string | null
          experience_type?: string | null
          id?: string
          is_anonymous?: boolean
          is_verified?: boolean
          rating: number
          title?: string | null
          unit_type?: string | null
          user_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          author_name?: string
          comment?: string
          created_at?: string
          developer_id?: string
          developer_name?: string | null
          experience_type?: string | null
          id?: string
          is_anonymous?: boolean
          is_verified?: boolean
          rating?: number
          title?: string | null
          unit_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_image: string | null
          item_name: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_image?: string | null
          item_name: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_image?: string | null
          item_name?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          entity_id: string
          entity_name: string | null
          id: string
          interest_type: string
          strength: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_name?: string | null
          id?: string
          interest_type?: string
          strength?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_name?: string | null
          id?: string
          interest_type?: string
          strength?: number
          updated_at?: string
          user_id?: string
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
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_active_date: string
          longest_streak: number
          streak_bonus_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string
          longest_streak?: number
          streak_bonus_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string
          longest_streak?: number
          streak_bonus_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_buyer_engagement: {
        Row: {
          community_posts: number
          community_replies: number
          community_votes: number
          created_at: string
          developers_viewed: number
          helpful_votes: number
          id: string
          projects_saved: number
          reports_unlocked: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          community_posts?: number
          community_replies?: number
          community_votes?: number
          created_at?: string
          developers_viewed?: number
          helpful_votes?: number
          id?: string
          projects_saved?: number
          reports_unlocked?: number
          updated_at?: string
          user_id: string
          week_start?: string
        }
        Update: {
          community_posts?: number
          community_replies?: number
          community_votes?: number
          created_at?: string
          developers_viewed?: number
          helpful_votes?: number
          id?: string
          projects_saved?: number
          reports_unlocked?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      whatsapp_leads: {
        Row: {
          created_at: string
          id: string
          message: string | null
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      broadcast_notification: {
        Args: {
          _message: string
          _metadata?: Json
          _title: string
          _type: string
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _message: string
          _metadata?: Json
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          community_posts: number
          community_replies: number
          community_votes: number
          developers_viewed: number
          full_name: string
          helpful_votes: number
          projects_saved: number
          reports_unlocked: number
          total_points: number
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_weekly_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          community_posts: number
          community_replies: number
          community_votes: number
          developers_viewed: number
          full_name: string
          helpful_votes: number
          projects_saved: number
          reports_unlocked: number
          total_points: number
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      set_my_account_type: {
        Args: { _account_type: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      update_user_streak: {
        Args: { _user_id: string }
        Returns: {
          bonus_awarded: number
          current_streak: number
          longest_streak: number
        }[]
      }
    }
    Enums: {
      admin_permission_level: "super_admin" | "admin" | "editor" | "view_only"
      app_role: "user" | "buyer" | "developer" | "admin"
      community_post_category:
        | "discussion"
        | "question"
        | "tip"
        | "experience"
        | "poll"
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
      admin_permission_level: ["super_admin", "admin", "editor", "view_only"],
      app_role: ["user", "buyer", "developer", "admin"],
      community_post_category: [
        "discussion",
        "question",
        "tip",
        "experience",
        "poll",
      ],
    },
  },
} as const
