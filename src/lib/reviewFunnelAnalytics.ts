import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight tracker for the Write Review funnel.
 * Lets us measure which chips/words drive review completion.
 */

export type ReviewFunnelEventType =
  | "modal_open"
  | "rating_selected"
  | "chip_selected"
  | "chip_deselected"
  | "phase_advanced"
  | "review_submitted";

export interface ReviewFunnelEventInput {
  eventType: ReviewFunnelEventType;
  reviewId?: string | null;
  developerId?: string | null;
  developerName?: string | null;
  rating?: number | null;
  chipLabel?: string | null;
  chipSentiment?: string | null;
  selectedChips?: string[];
  phase?: number | null;
  isGuest?: boolean;
  metadata?: Record<string, any>;
}

const SESSION_KEY = "r8_review_funnel_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `rf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `rf_${Date.now()}`;
  }
}

export async function trackReviewFunnelEvent(input: ReviewFunnelEventInput): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const locale =
      typeof document !== "undefined" ? document.documentElement.lang || "en" : "en";

    await supabase.from("review_funnel_events" as any).insert({
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      review_id: input.reviewId ?? null,
      developer_id: input.developerId ?? null,
      developer_name: input.developerName ?? null,
      event_type: input.eventType,
      rating: input.rating ?? null,
      chip_label: input.chipLabel ?? null,
      chip_sentiment: input.chipSentiment ?? null,
      selected_chips: input.selectedChips ?? null,
      phase: input.phase ?? null,
      metadata: input.metadata ?? {},
      locale,
      is_guest: input.isGuest ?? !user,
    });
  } catch (err) {
    // Never let analytics break the UX
    if (typeof console !== "undefined") {
      console.debug("[reviewFunnel] track failed", err);
    }
  }
}