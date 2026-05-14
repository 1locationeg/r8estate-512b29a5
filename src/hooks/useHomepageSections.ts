import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HomepageSection = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  phase: string;
  audience: string;
  is_visible: boolean;
  sort_order: number;
};

let cache: HomepageSection[] | null = null;
const listeners = new Set<(s: HomepageSection[]) => void>();

async function load() {
  const { data } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("sort_order", { ascending: true });
  cache = (data as HomepageSection[]) ?? [];
  listeners.forEach((l) => l(cache!));
  return cache;
}

export function useHomepageSections() {
  const [sections, setSections] = useState<HomepageSection[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    listeners.add(setSections);
    if (!cache) {
      load().finally(() => setLoading(false));
    }
    const channel = supabase
      .channel("homepage_sections_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_sections" },
        () => load(),
      )
      .subscribe();
    return () => {
      listeners.delete(setSections);
      supabase.removeChannel(channel);
    };
  }, []);

  return { sections, loading, reload: load };
}

/** Synchronous-ish lookup. Defaults to visible if section key is unknown. */
export function useSectionVisible(key: string): boolean {
  const { sections } = useHomepageSections();
  const found = sections.find((s) => s.key === key);
  return found ? found.is_visible : true;
}