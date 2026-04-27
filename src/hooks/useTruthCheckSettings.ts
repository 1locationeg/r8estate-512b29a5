import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TruthCheckSettings {
  enabled: boolean;
  showOnHomepage: boolean;
  pageEnabled: boolean;
  showCompareLink: boolean;
  pageTitle: string;
  pageSubtitle: string;
  cardEyebrow: string;
  exampleClaims: string[];
  throttleSeconds: number;
  minClaimChars: number;
  requireAuth: boolean;
}

export const TRUTH_CHECK_DEFAULTS: TruthCheckSettings = {
  enabled: true,
  showOnHomepage: true,
  pageEnabled: true,
  showCompareLink: true,
  pageTitle: "Don't take the brochure's word for it.",
  pageSubtitle:
    "Paste any claim a developer is making. We'll check it against verified buyer reviews and contract receipts.",
  cardEyebrow: "R8 Truth-Check",
  exampleClaims: [
    "Delivery in 2026, 100% on schedule, 12% guaranteed ROI",
    "The biggest developer in New Cairo, never a single delivery delay",
  ],
  throttleSeconds: 10,
  minClaimChars: 8,
  requireAuth: false,
};

const TRUTH_KEYS = [
  "truth_check_enabled",
  "truth_check_show_on_homepage",
  "truth_check_page_enabled",
  "truth_check_show_compare_link",
  "truth_check_page_title",
  "truth_check_page_subtitle",
  "truth_check_card_eyebrow",
  "truth_check_example_claims",
  "truth_check_throttle_seconds",
  "truth_check_min_claim_chars",
  "truth_check_require_auth",
] as const;

const parseBool = (v: string | undefined, def: boolean): boolean => {
  if (v === undefined || v === null) return def;
  return v === "true" || v === "1";
};

const parseInt10 = (v: string | undefined, def: number): number => {
  if (v === undefined || v === null) return def;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : def;
};

const parseLines = (v: string | undefined, def: string[]): string[] => {
  if (!v) return def;
  const lines = v.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 6);
  return lines.length > 0 ? lines : def;
};

const STORAGE_EVENT = "truth-check-settings-updated";

export const fireTruthCheckSettingsUpdate = () => {
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  } catch {
    /* noop */
  }
};

export function useTruthCheckSettings() {
  const [settings, setSettings] = useState<TruthCheckSettings>(TRUTH_CHECK_DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", [...TRUTH_KEYS]);

      const map = new Map((data ?? []).map((r: any) => [r.key, r.value as string]));
      setSettings({
        enabled: parseBool(map.get("truth_check_enabled"), TRUTH_CHECK_DEFAULTS.enabled),
        showOnHomepage: parseBool(
          map.get("truth_check_show_on_homepage"),
          TRUTH_CHECK_DEFAULTS.showOnHomepage,
        ),
        pageEnabled: parseBool(
          map.get("truth_check_page_enabled"),
          TRUTH_CHECK_DEFAULTS.pageEnabled,
        ),
        showCompareLink: parseBool(
          map.get("truth_check_show_compare_link"),
          TRUTH_CHECK_DEFAULTS.showCompareLink,
        ),
        pageTitle: map.get("truth_check_page_title") || TRUTH_CHECK_DEFAULTS.pageTitle,
        pageSubtitle:
          map.get("truth_check_page_subtitle") || TRUTH_CHECK_DEFAULTS.pageSubtitle,
        cardEyebrow:
          map.get("truth_check_card_eyebrow") || TRUTH_CHECK_DEFAULTS.cardEyebrow,
        exampleClaims: parseLines(
          map.get("truth_check_example_claims"),
          TRUTH_CHECK_DEFAULTS.exampleClaims,
        ),
        throttleSeconds: parseInt10(
          map.get("truth_check_throttle_seconds"),
          TRUTH_CHECK_DEFAULTS.throttleSeconds,
        ),
        minClaimChars: parseInt10(
          map.get("truth_check_min_claim_chars"),
          TRUTH_CHECK_DEFAULTS.minClaimChars,
        ),
        requireAuth: parseBool(
          map.get("truth_check_require_auth"),
          TRUTH_CHECK_DEFAULTS.requireAuth,
        ),
      });
    } catch (err) {
      console.error("useTruthCheckSettings: failed to fetch", err);
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const handler = () => fetchSettings();
    window.addEventListener(STORAGE_EVENT, handler);
    return () => window.removeEventListener(STORAGE_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { settings, loading, refetch: fetchSettings };
}
