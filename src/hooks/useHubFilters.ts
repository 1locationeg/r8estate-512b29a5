import { useState, useMemo } from "react";

export type HubSort = "newest" | "highest" | "helpful" | "trending";
export type HubMinRating = 0 | 3 | 4 | 5;

export interface HubFiltersState {
  sort: HubSort;
  minRating: HubMinRating;
  verifiedOnly: boolean;
  category: string; // "all" or a segment id
}

const DEFAULTS: HubFiltersState = {
  sort: "newest",
  minRating: 0,
  verifiedOnly: false,
  category: "all",
};

export function useHubFilters() {
  const [state, setState] = useState<HubFiltersState>(DEFAULTS);

  const isDirty = useMemo(
    () =>
      state.sort !== DEFAULTS.sort ||
      state.minRating !== DEFAULTS.minRating ||
      state.verifiedOnly !== DEFAULTS.verifiedOnly ||
      state.category !== DEFAULTS.category,
    [state],
  );

  return {
    filters: state,
    setFilters: setState,
    reset: () => setState(DEFAULTS),
    isDirty,
  };
}