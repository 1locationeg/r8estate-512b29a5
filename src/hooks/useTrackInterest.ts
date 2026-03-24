import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showCoinToast } from "@/components/CoinEarnedToast";

type InterestType = "click" | "search" | "linger" | "scroll_stop";

/**
 * Tracks implicit user interest in entities (developers, projects, etc).
 * Used to power real-time review notifications for entities users care about.
 */
export function useTrackInterest() {
  const { user } = useAuth();
  const lingerTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const trackInterest = useCallback(
    async (entityId: string, entityName: string | null, type: InterestType) => {
      if (!user) return;

      const strengthMap: Record<InterestType, number> = {
        scroll_stop: 1,
        linger: 2,
        click: 3,
        search: 3,
      };

      try {
        // Upsert: increase strength if already exists
        const { data: existing } = await supabase
          .from("user_interests" as any)
          .select("id, strength")
          .eq("user_id", user.id)
          .eq("entity_id", entityId)
          .maybeSingle();

        if (existing) {
          const current = (existing as any).strength || 0;
          const newStrength = Math.min(10, current + strengthMap[type]);
          await supabase
            .from("user_interests" as any)
            .update({
              strength: newStrength,
              interest_type: type,
              updated_at: new Date().toISOString(),
            } as any)
            .eq("id", (existing as any).id);
        } else {
          await supabase.from("user_interests" as any).insert({
            user_id: user.id,
            entity_id: entityId,
            entity_name: entityName,
            interest_type: type,
            strength: strengthMap[type],
          } as any);
        }
      } catch {
        // Silent fail — tracking is non-critical
      }
    },
    [user]
  );

  /** Call on click/tap of an entity card */
  const trackClick = useCallback(
    (entityId: string, entityName?: string | null) => {
      trackInterest(entityId, entityName || null, "click");
      showCoinToast("developer_view");
    },
    [trackInterest]
  );

  /** Call when user searches and selects a result */
  const trackSearch = useCallback(
    (entityId: string, entityName?: string | null) => {
      trackInterest(entityId, entityName || null, "search");
    },
    [trackInterest]
  );

  /** Start a linger timer — call when entity enters viewport / user pauses */
  const startLinger = useCallback(
    (entityId: string, entityName?: string | null, delayMs = 3000) => {
      if (lingerTimers.current[entityId]) return;
      lingerTimers.current[entityId] = setTimeout(() => {
        trackInterest(entityId, entityName || null, "linger");
        delete lingerTimers.current[entityId];
      }, delayMs);
    },
    [trackInterest]
  );

  /** Cancel linger if user scrolls away before threshold */
  const cancelLinger = useCallback((entityId: string) => {
    if (lingerTimers.current[entityId]) {
      clearTimeout(lingerTimers.current[entityId]);
      delete lingerTimers.current[entityId];
    }
  }, []);

  return { trackClick, trackSearch, startLinger, cancelLinger };
}
