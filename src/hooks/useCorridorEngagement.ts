import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "corridor_engagement";
const ACTIONS_KEY = "corridor_completed_actions";

const ACTIONS_PER_ZONE: Record<number, string[]> = {
  1: ["search", "suggestion_click", "voice_search", "ai_ask"],
  2: ["entity_view", "compare_open", "detail_click", "spotlight_click"],
  3: ["deal_click", "launch_click", "pricing_view", "how_we_work"],
  4: ["community_click", "feedback_submit", "cta_click", "review_click"],
};

const POINTS: Record<string, number> = {
  search: 0.25,
  suggestion_click: 0.2,
  voice_search: 0.15,
  ai_ask: 0.2,
  entity_view: 0.25,
  compare_open: 0.25,
  detail_click: 0.15,
  spotlight_click: 0.15,
  deal_click: 0.2,
  launch_click: 0.2,
  pricing_view: 0.2,
  how_we_work: 0.15,
  community_click: 0.2,
  feedback_submit: 0.25,
  cta_click: 0.25,
  review_click: 0.2,
};

type ZoneTuple = [number, number, number, number];
type CompletedActions = Record<number, string[]>;

function loadFromStorage(): ZoneTuple {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [0, 0, 0, 0];
}

function loadActionsFromStorage(): CompletedActions {
  try {
    const raw = localStorage.getItem(ACTIONS_KEY) || sessionStorage.getItem(ACTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveToStorage(data: ZoneTuple) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function saveActionsToStorage(data: CompletedActions) {
  try {
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(data));
    sessionStorage.setItem(ACTIONS_KEY, JSON.stringify(data));
  } catch {}
}

/** Merge two engagement tuples, taking the max of each zone */
function mergeEngagement(a: ZoneTuple, b: ZoneTuple): ZoneTuple {
  return [
    Math.min(1, Math.max(a[0], b[0])),
    Math.min(1, Math.max(a[1], b[1])),
    Math.min(1, Math.max(a[2], b[2])),
    Math.min(1, Math.max(a[3], b[3])),
  ];
}

/** Merge two completed-actions records (union of arrays per zone) */
function mergeActions(a: CompletedActions, b: CompletedActions): CompletedActions {
  const result: CompletedActions = {};
  const allZones = new Set([...Object.keys(a), ...Object.keys(b)].map(Number));
  for (const z of allZones) {
    const merged = new Set([...(a[z] || []), ...(b[z] || [])]);
    result[z] = Array.from(merged);
  }
  return result;
}

export function useCorridorEngagement() {
  const { user } = useAuth();
  const [zoneEngagement, setZoneEngagement] = useState<ZoneTuple>(loadFromStorage);
  const [completedActions, setCompletedActions] = useState<CompletedActions>(loadActionsFromStorage);
  const dbLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from DB on auth, merge with localStorage (take max)
  useEffect(() => {
    if (!user) {
      dbLoaded.current = false;
      return;
    }

    const loadFromDb = async () => {
      try {
        const { data } = await supabase
          .from("journey_progress")
          .select("zone_engagement")
          .eq("user_id", user.id)
          .maybeSingle();

        const dbData: ZoneTuple = data?.zone_engagement
          ? (data.zone_engagement as unknown as ZoneTuple)
          : [0, 0, 0, 0];

        setZoneEngagement((local) => {
          const merged = mergeEngagement(local, dbData);
          saveToStorage(merged);
          return merged;
        });
        dbLoaded.current = true;
      } catch (err) {
        console.error("Failed to load journey progress:", err);
        dbLoaded.current = true;
      }
    };

    loadFromDb();
  }, [user]);

  // Debounced save to DB
  const persistToDb = useCallback(
    (data: ZoneTuple) => {
      if (!user) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const { data: existing } = await supabase
            .from("journey_progress")
            .select("id, zone_engagement")
            .eq("user_id", user.id)
            .maybeSingle();

          if (existing) {
            const dbData = existing.zone_engagement as unknown as ZoneTuple;
            const merged = mergeEngagement(data, dbData);
            await supabase
              .from("journey_progress")
              .update({ zone_engagement: merged as unknown as any, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          } else {
            await supabase
              .from("journey_progress")
              .insert({ user_id: user.id, zone_engagement: data as unknown as any });
          }
        } catch (err) {
          console.error("Failed to save journey progress:", err);
        }
      }, 1500);
    },
    [user]
  );

  const trackEngagement = useCallback(
    (zone: number, action: string) => {
      if (zone < 1 || zone > 4) return;
      const pts = POINTS[action] ?? 0.15;

      // Update zone engagement scores
      setZoneEngagement((prev) => {
        const next = [...prev] as ZoneTuple;
        next[zone - 1] = Math.min(1, next[zone - 1] + pts);
        saveToStorage(next);
        persistToDb(next);
        return next;
      });

      // Track completed action (deduplicated)
      setCompletedActions((prev) => {
        const zoneActions = prev[zone] || [];
        if (zoneActions.includes(action)) return prev;
        const next = { ...prev, [zone]: [...zoneActions, action] };
        saveActionsToStorage(next);
        return next;
      });
    },
    [persistToDb]
  );

  // Listen for custom DOM events from any component
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.zone && detail?.action) {
        trackEngagement(detail.zone, detail.action);
      }
    };
    window.addEventListener("corridor:engage", handler);
    return () => window.removeEventListener("corridor:engage", handler);
  }, [trackEngagement]);

  return { zoneEngagement, completedActions, trackEngagement };
}
