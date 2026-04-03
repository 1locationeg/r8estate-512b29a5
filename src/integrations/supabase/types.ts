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
      business_claims: {
        Row: {
          admin_notes: string | null
          business_mock_id: string | null
          business_name: string
          business_profile_id: string | null
          created_at: string
          document_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_mock_id?: string | null
          business_name: string
          business_profile_id?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_mock_id?: string | null
          business_name?: string
          business_profile_id?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      business_upgrade_requests: {
        Row: {
          admin_notes: string | null
          company_name: string
          created_at: string
          description: string | null
          document_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          flagged_at: string | null
          id: string
          image_urls: string[] | null
          is_hidden: boolean
          is_pinned: boolean
          link_url: string | null
          moderation_flags: Json | null
          moderation_status: string
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
          flagged_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_hidden?: boolean
          is_pinned?: boolean
          link_url?: string | null
          moderation_flags?: Json | null
          moderation_status?: string
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
          flagged_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_hidden?: boolean
          is_pinned?: boolean
          link_url?: string | null
          moderation_flags?: Json | null
          moderation_status?: string
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
      content_reports: {
        Row: {
          admin_notes: string | null
          content_id: string
          content_type: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          content_id: string
          content_type: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      deal_ratings: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          is_verified_buyer: boolean | null
          review_text: string | null
          stars: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          is_verified_buyer?: boolean | null
          review_text?: string | null
          stars: number
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          is_verified_buyer?: boolean | null
          review_text?: string | null
          stars?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_ratings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_votes: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          user_id: string
          vote: boolean
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          user_id: string
          vote: boolean
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          user_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "deal_votes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          admin_notes: string | null
          avg_rating: number | null
          business_id: string
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          down_payment_percent: number | null
          headline: string
          id: string
          price: number | null
          rating_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["deal_status"]
          tags: string[] | null
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          admin_notes?: string | null
          avg_rating?: number | null
          business_id: string
          created_at?: string
          deal_type?: Database["public"]["Enums"]["deal_type"]
          description: string
          down_payment_percent?: number | null
          headline: string
          id?: string
          price?: number | null
          rating_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          tags?: string[] | null
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          admin_notes?: string | null
          avg_rating?: number | null
          business_id?: string
          created_at?: string
          deal_type?: Database["public"]["Enums"]["deal_type"]
          description?: string
          down_payment_percent?: number | null
          headline?: string
          id?: string
          price?: number | null
          rating_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_businesses: {
        Row: {
          business_id: string
          business_name: string
          created_at: string
          follow_reminded_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          business_name: string
          created_at?: string
          follow_reminded_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          business_name?: string
          created_at?: string
          follow_reminded_at?: string | null
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
          device_fingerprint: Json | null
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
          device_fingerprint?: Json | null
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
          device_fingerprint?: Json | null
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
      launch_phases: {
        Row: {
          id: string
          launch_id: string
          phase_number: number
          price_per_m2: number
          started_at: string
          units_in_phase: number | null
        }
        Insert: {
          id?: string
          launch_id: string
          phase_number: number
          price_per_m2: number
          started_at?: string
          units_in_phase?: number | null
        }
        Update: {
          id?: string
          launch_id?: string
          phase_number?: number
          price_per_m2?: number
          started_at?: string
          units_in_phase?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_phases_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_ratings: {
        Row: {
          buyer_type: Database["public"]["Enums"]["launch_buyer_type"]
          buyer_verified: boolean
          created_at: string
          id: string
          launch_id: string
          review_text: string | null
          stars_developer_transparency: number
          stars_location_value: number
          stars_overall: number
          stars_payment_terms: number
          stars_price_fairness: number
          user_id: string
        }
        Insert: {
          buyer_type?: Database["public"]["Enums"]["launch_buyer_type"]
          buyer_verified?: boolean
          created_at?: string
          id?: string
          launch_id: string
          review_text?: string | null
          stars_developer_transparency: number
          stars_location_value: number
          stars_overall: number
          stars_payment_terms: number
          stars_price_fairness: number
          user_id: string
        }
        Update: {
          buyer_type?: Database["public"]["Enums"]["launch_buyer_type"]
          buyer_verified?: boolean
          created_at?: string
          id?: string
          launch_id?: string
          review_text?: string | null
          stars_developer_transparency?: number
          stars_location_value?: number
          stars_overall?: number
          stars_payment_terms?: number
          stars_price_fairness?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_ratings_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_watchlist: {
        Row: {
          created_at: string
          id: string
          launch_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          launch_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          launch_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_watchlist_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      launches: {
        Row: {
          admin_notes: string | null
          business_id: string
          created_at: string
          current_phase: number
          current_price_per_m2: number | null
          delivery_date: string | null
          down_payment_pct: number | null
          id: string
          installment_years: number | null
          is_verified: boolean
          launch_date: string | null
          launch_type: Database["public"]["Enums"]["launch_type"]
          location_compound: string | null
          location_district: string
          project_name: string
          reservation_date: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["launch_status"]
          total_units: number
          unit_types: string[] | null
          units_remaining: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_id: string
          created_at?: string
          current_phase?: number
          current_price_per_m2?: number | null
          delivery_date?: string | null
          down_payment_pct?: number | null
          id?: string
          installment_years?: number | null
          is_verified?: boolean
          launch_date?: string | null
          launch_type?: Database["public"]["Enums"]["launch_type"]
          location_compound?: string | null
          location_district: string
          project_name: string
          reservation_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["launch_status"]
          total_units?: number
          unit_types?: string[] | null
          units_remaining?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_id?: string
          created_at?: string
          current_phase?: number
          current_price_per_m2?: number | null
          delivery_date?: string | null
          down_payment_pct?: number | null
          id?: string
          installment_years?: number | null
          is_verified?: boolean
          launch_date?: string | null
          launch_type?: Database["public"]["Enums"]["launch_type"]
          location_compound?: string | null
          location_district?: string
          project_name?: string
          reservation_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["launch_status"]
          total_units?: number
          unit_types?: string[] | null
          units_remaining?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          browser: string | null
          clicked_at: string
          device_type: string | null
          id: string
          ip_country: string | null
          link_id: string
          referrer_url: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          clicked_at?: string
          device_type?: string | null
          id?: string
          ip_country?: string | null
          link_id: string
          referrer_url?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          clicked_at?: string
          device_type?: string | null
          id?: string
          ip_country?: string | null
          link_id?: string
          referrer_url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "smart_links"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
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
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_dismissed: boolean
          role: string
          steps_completed: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_dismissed?: boolean
          role?: string
          steps_completed?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_dismissed?: boolean
          role?: string
          steps_completed?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_reviews: {
        Row: {
          created_at: string
          developer_id: string | null
          developer_name: string | null
          expires_at: string | null
          first_name: string | null
          id: string
          is_used: boolean
          project_name: string | null
          token: string
        }
        Insert: {
          created_at?: string
          developer_id?: string | null
          developer_name?: string | null
          expires_at?: string | null
          first_name?: string | null
          id?: string
          is_used?: boolean
          project_name?: string | null
          token: string
        }
        Update: {
          created_at?: string
          developer_id?: string | null
          developer_name?: string | null
          expires_at?: string | null
          first_name?: string | null
          id?: string
          is_used?: boolean
          project_name?: string | null
          token?: string
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
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          budget_range: string | null
          buyer_type: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          full_name: string | null
          id: string
          id_document_url: string | null
          identity_provider: string | null
          identity_verified: boolean
          interests: string[] | null
          kyc_verified: boolean
          linkedin_url: string | null
          phone_number: string | null
          selfie_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          budget_range?: string | null
          buyer_type?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          identity_provider?: string | null
          identity_verified?: boolean
          interests?: string[] | null
          kyc_verified?: boolean
          linkedin_url?: string | null
          phone_number?: string | null
          selfie_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          budget_range?: string | null
          buyer_type?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          identity_provider?: string | null
          identity_verified?: boolean
          interests?: string[] | null
          kyc_verified?: boolean
          linkedin_url?: string | null
          phone_number?: string | null
          selfie_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
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
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          points_awarded: number
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          points_awarded?: number
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          points_awarded?: number
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      review_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          review_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          review_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          review_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string
          developer_id: string | null
          document_url: string | null
          id: string
          id_document_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string | null
          social_url: string | null
          status: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          developer_id?: string | null
          document_url?: string | null
          id?: string
          id_document_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          social_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_type?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          developer_id?: string | null
          document_url?: string | null
          id?: string
          id_document_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          social_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
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
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string | null
          unit_type: string | null
          user_id: string
          verification_level: string
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
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string | null
          unit_type?: string | null
          user_id: string
          verification_level?: string
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
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string | null
          unit_type?: string | null
          user_id?: string
          verification_level?: string
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
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          last_notified_at: string | null
          notify_enabled: boolean
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_notified_at?: string | null
          notify_enabled?: boolean
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_notified_at?: string | null
          notify_enabled?: boolean
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_links: {
        Row: {
          created_at: string
          created_by: string | null
          destination_url: string
          id: string
          is_active: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_url: string
          id?: string
          is_active?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_url?: string
          id?: string
          is_active?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          slug?: string
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
      user_presence: {
        Row: {
          hide_online_status: boolean
          id: string
          is_online: boolean
          last_seen: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          hide_online_status?: boolean
          id?: string
          is_online?: boolean
          last_seen?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          hide_online_status?: boolean
          id?: string
          is_online?: boolean
          last_seen?: string | null
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
      widget_analytics: {
        Row: {
          created_at: string
          embed_token: string
          event_type: string
          id: string
          referrer_url: string | null
          widget_id: string
        }
        Insert: {
          created_at?: string
          embed_token: string
          event_type?: string
          id?: string
          referrer_url?: string | null
          widget_id: string
        }
        Update: {
          created_at?: string
          embed_token?: string
          event_type?: string
          id?: string
          referrer_url?: string | null
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_analytics_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widget_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_configs: {
        Row: {
          created_at: string
          created_by: string | null
          embed_token: string
          entity_id: string
          entity_type: string
          id: string
          is_active: boolean
          settings: Json
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          embed_token: string
          entity_id: string
          entity_type: string
          id?: string
          is_active?: boolean
          settings?: Json
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          embed_token?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          settings?: Json
          type?: string
          updated_at?: string
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
      find_or_create_conversation: {
        Args: { _other_user_id: string }
        Returns: string
      }
      generate_embed_token: { Args: never; Returns: string }
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
      user_in_conversation: {
        Args: { _conversation_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_permission_level: "super_admin" | "admin" | "editor" | "view_only"
      app_role: "user" | "buyer" | "business" | "admin"
      community_post_category:
        | "discussion"
        | "question"
        | "tip"
        | "experience"
        | "poll"
      deal_status: "pending" | "verified" | "rejected"
      deal_type:
        | "payment_plan"
        | "discount"
        | "early_access"
        | "exclusive_units"
        | "other"
      launch_buyer_type: "reserver" | "purchaser" | "attendee" | "observer"
      launch_status: "upcoming" | "reservations_open" | "active" | "sold_out"
      launch_type: "new_project" | "new_phase" | "relaunch"
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
      app_role: ["user", "buyer", "business", "admin"],
      community_post_category: [
        "discussion",
        "question",
        "tip",
        "experience",
        "poll",
      ],
      deal_status: ["pending", "verified", "rejected"],
      deal_type: [
        "payment_plan",
        "discount",
        "early_access",
        "exclusive_units",
        "other",
      ],
      launch_buyer_type: ["reserver", "purchaser", "attendee", "observer"],
      launch_status: ["upcoming", "reservations_open", "active", "sold_out"],
      launch_type: ["new_project", "new_phase", "relaunch"],
    },
  },
} as const
