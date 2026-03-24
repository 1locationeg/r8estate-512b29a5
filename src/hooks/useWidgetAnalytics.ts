import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWidgetAnalytics(widgetId: string, embedToken: string) {
  const impressionTracked = useRef(false);

  // Track impression once on mount
  useEffect(() => {
    if (!widgetId || !embedToken || impressionTracked.current) return;
    impressionTracked.current = true;

    supabase
      .from("widget_analytics")
      .insert({
        widget_id: widgetId,
        embed_token: embedToken,
        event_type: "impression",
        referrer_url: document.referrer || null,
      })
      .then(({ error }) => {
        if (error) console.warn("Widget impression tracking failed:", error.message);
      });
  }, [widgetId, embedToken]);

  // Track click
  const trackClick = useCallback(() => {
    if (!widgetId || !embedToken) return;
    supabase
      .from("widget_analytics")
      .insert({
        widget_id: widgetId,
        embed_token: embedToken,
        event_type: "click",
        referrer_url: document.referrer || null,
      })
      .then(({ error }) => {
        if (error) console.warn("Widget click tracking failed:", error.message);
      });
  }, [widgetId, embedToken]);

  return { trackClick };
}
