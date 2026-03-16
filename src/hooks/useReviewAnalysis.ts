import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ReviewAnalysis {
  review_id: string;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  sentiment_confidence: number;
  is_suspicious: boolean;
  suspicion_reasons?: string[];
  suspicion_score: number;
  themes: string[];
  insight: string;
}

/**
 * Hook for AI-powered review analysis (sentiment + fake detection).
 * Returns a map of review_id -> analysis.
 */
export function useReviewAnalysis() {
  const [analyses, setAnalyses] = useState<Record<string, ReviewAnalysis>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeReviews = useCallback(
    async (reviews: Array<{ id: string; rating: number; comment: string; author_name?: string; guest_name?: string }>) => {
      if (reviews.length === 0) return;
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("review-analysis", {
          body: { reviews },
        });

        if (fnError) {
          setError(fnError.message);
          return;
        }

        const results: ReviewAnalysis[] = data?.analyses || [];
        const map: Record<string, ReviewAnalysis> = {};
        results.forEach((a) => {
          map[a.review_id] = a;
        });
        setAnalyses((prev) => ({ ...prev, ...map }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { analyses, analyzeReviews, loading, error };
}
