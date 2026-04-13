import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "corridor_engagement";
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

function loadFromStorage(): [number, number, number, number] {
  try {
    // Try localStorage first (persistent), fall back to sessionStorage
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [0, 0, 0, 0];
}

function saveToStorage(data: [number, number, number, number]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Keep sessionStorage in sync for backward compat
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useCorridorEngagement() {
  const [zoneEngagement, setZoneEngagement] = useState<[number, number, number, number]>(loadFromStorage);

  const trackEngagement = useCallback((zone: number, action: string) => {
    if (zone < 1 || zone > 4) return;
    const pts = POINTS[action] ?? 0.15;
    setZoneEngagement((prev) => {
      const next = [...prev] as [number, number, number, number];
      next[zone - 1] = Math.min(1, next[zone - 1] + pts);
      saveToStorage(next);
      return next;
    });
  }, []);

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

  return { zoneEngagement, trackEngagement };
}
