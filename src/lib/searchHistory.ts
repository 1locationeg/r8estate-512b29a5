const SEARCH_HISTORY_KEY = 'r8estate_search_history';
const MAX_HISTORY = 10;

export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}

export function getSearchHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SearchHistoryEntry[];
  } catch {
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;

  const history = getSearchHistory().filter(
    (e) => e.query.toLowerCase() !== trimmed.toLowerCase()
  );
  history.unshift({ query: trimmed, timestamp: Date.now() });

  localStorage.setItem(
    SEARCH_HISTORY_KEY,
    JSON.stringify(history.slice(0, MAX_HISTORY))
  );
}

export function clearSearchHistory(): void {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}
