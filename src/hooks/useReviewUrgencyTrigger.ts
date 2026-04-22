import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useReviewability } from "@/hooks/useReviewability";

const VIEW_THRESHOLD = 3;
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const dismissKey = (userId: string, developerId: string) =>
  `r8_urgency_dismiss_${userId}_${developerId}`;

function isDismissed(userId: string, developerId: string): boolean {
  try {
    const raw = localStorage.getItem(dismissKey(userId, developerId));
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

interface UrgencyState {
  shouldShow: boolean;
  viewCount: number;
  isLoading: boolean;
  dismiss: () => void;
}

/**
 * Determines whether the High-Stakes Review CTA banner should appear.
 * All five conditions must be true: authenticated, viewed ≥ 3 times,
 * no existing review, not dismissed in last 7 days, profile is reviewable.
 */
export function useReviewUrgencyTrigger(developerId: string | undefined): UrgencyState {
  const { user } = useAuth();
  const { isReviewable, isLoading: isReviewabilityLoading } = useReviewability(developerId);
  const [viewCount, setViewCount] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedTick, setDismissedTick] = useState(0);

  useEffect(() => {
    if (!user || !developerId) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    (async () => {
      const [interestRes, reviewRes] = await Promise.all([
        supabase
          .from("user_interests" as any)
          .select("strength")
          .eq("user_id", user.id)
          .eq("entity_id", developerId)
          .maybeSingle(),
        supabase
          .from("reviews")
          .select("id")
          .eq("user_id", user.id)
          .eq("developer_id", developerId)
          .limit(1)
          .maybeSingle(),
      ]);

      if (!active) return;

      const strength = (interestRes.data as any)?.strength ?? 0;
      setViewCount(strength);
      setHasReviewed(!!reviewRes.data);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user, developerId]);

  const dismiss = useCallback(() => {
    if (!user || !developerId) return;
    try {
      localStorage.setItem(dismissKey(user.id, developerId), Date.now().toString());
      setDismissedTick((t) => t + 1);
    } catch {
      /* noop */
    }
  }, [user, developerId]);

  const dismissed = user && developerId ? isDismissed(user.id, developerId) : false;
  // re-evaluate when dismissedTick changes
  void dismissedTick;

  const shouldShow =
    !!user &&
    !!developerId &&
    !isLoading &&
    !isReviewabilityLoading &&
    isReviewable &&
    viewCount >= VIEW_THRESHOLD &&
    !hasReviewed &&
    !dismissed;

  return { shouldShow, viewCount, isLoading, dismiss };
}