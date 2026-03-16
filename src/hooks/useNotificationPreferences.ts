import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationPreferences {
  review_notifications: boolean;
  announcement_notifications: boolean;
  status_notifications: boolean;
  trust_score_notifications: boolean;
  interest_notifications: boolean;
}

const DEFAULTS: NotificationPreferences = {
  review_notifications: true,
  announcement_notifications: true,
  status_notifications: true,
  trust_score_notifications: true,
  interest_notifications: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notification_preferences" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const d = data as any;
      setPreferences({
        review_notifications: d.review_notifications,
        announcement_notifications: d.announcement_notifications,
        status_notifications: d.status_notifications,
        trust_score_notifications: d.trust_score_notifications,
        interest_notifications: d.interest_notifications,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (!user) return;
      setSaving(true);
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);

      // Upsert
      const { error } = await supabase
        .from("notification_preferences" as any)
        .upsert(
          { user_id: user.id, ...updated } as any,
          { onConflict: "user_id" }
        );

      if (error) {
        // Revert on error
        setPreferences(preferences);
      }
      setSaving(false);
    },
    [user, preferences]
  );

  return { preferences, loading, saving, updatePreference };
};
