import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewSnippet {
  authorName: string;
  rating: number;
  comment: string;
}

interface WidgetData {
  config: {
    id: string;
    type: string;
    entity_type: string;
    entity_id: string;
    settings: Record<string, any>;
    embed_token: string;
  };
  entityName: string;
  score: number;
  reviewCount: number;
  recentReviews: ReviewSnippet[];
  isLoading: boolean;
  error: string | null;
}

export function useWidgetData(token: string): WidgetData {
  // 1. Fetch widget config
  const configQuery = useQuery({
    queryKey: ["widget-config", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widget_configs")
        .select("*")
        .eq("embed_token", token)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Widget not found");
      return data;
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const config = configQuery.data;
  const entityId = config?.entity_id;

  // 2. Fetch entity name from business_profiles
  const entityQuery = useQuery({
    queryKey: ["widget-entity", entityId],
    queryFn: async () => {
      const { data } = await supabase
        .from("business_profiles")
        .select("company_name")
        .eq("id", entityId!)
        .maybeSingle();
      return data?.company_name || "Unknown Entity";
    },
    enabled: !!entityId,
    staleTime: 60_000,
  });

  // 3. Fetch reviews for entity
  const reviewsQuery = useQuery({
    queryKey: ["widget-reviews", entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating, author_name, comment, created_at")
        .eq("developer_id", entityId!)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!entityId,
    staleTime: 60_000,
  });

  const reviews = reviewsQuery.data || [];
  const reviewCount = reviews.length;
  const score = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const recentReviews: ReviewSnippet[] = reviews.slice(0, 2).map((r) => ({
    authorName: r.author_name,
    rating: r.rating,
    comment: r.comment,
  }));

  const isLoading = configQuery.isLoading || entityQuery.isLoading || reviewsQuery.isLoading;
  const error = configQuery.error?.message || entityQuery.error?.message || reviewsQuery.error?.message || null;

  return {
    config: config
      ? {
          id: config.id,
          type: config.type,
          entity_type: config.entity_type,
          entity_id: config.entity_id,
          settings: (config.settings as Record<string, any>) || {},
          embed_token: config.embed_token,
        }
      : {
          id: "",
          type: "",
          entity_type: "",
          entity_id: "",
          settings: {},
          embed_token: "",
        },
    entityName: entityQuery.data || config?.entity_id || "",
    score,
    reviewCount,
    recentReviews,
    isLoading,
    error,
  };
}
