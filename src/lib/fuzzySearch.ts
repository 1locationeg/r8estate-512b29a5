/**
 * Fuzzy search utility with Levenshtein distance and spell correction
 */

// Calculate Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate similarity score (0-1) between two strings
export function stringSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  if (aLower === bLower) return 1;
  if (aLower.length === 0 || bLower.length === 0) return 0;
  
  const distance = levenshteinDistance(aLower, bLower);
  const maxLength = Math.max(aLower.length, bLower.length);
  
  return 1 - distance / maxLength;
}

export interface FuzzyMatchResult {
  item: string;
  score: number;
  matchType: 'exact' | 'startsWith' | 'contains' | 'fuzzy';
}

// Score a match based on match type
function getMatchScore(query: string, target: string): FuzzyMatchResult | null {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match
  if (queryLower === targetLower) {
    return { item: target, score: 1, matchType: 'exact' };
  }
  
  // Starts with query
  if (targetLower.startsWith(queryLower)) {
    return { item: target, score: 0.9, matchType: 'startsWith' };
  }
  
  // Contains query
  if (targetLower.includes(queryLower)) {
    return { item: target, score: 0.8, matchType: 'contains' };
  }
  
  // Fuzzy match using Levenshtein distance
  const similarity = stringSimilarity(queryLower, targetLower);
  
  // Also check if any word in target starts with query
  const words = targetLower.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) {
      return { item: target, score: 0.85, matchType: 'startsWith' };
    }
    // Check similarity with individual words
    const wordSimilarity = stringSimilarity(queryLower, word);
    if (wordSimilarity > similarity && wordSimilarity > 0.6) {
      return { item: target, score: wordSimilarity * 0.9, matchType: 'fuzzy' };
    }
  }
  
  // Return fuzzy match if similarity is above threshold
  if (similarity > 0.6) {
    return { item: target, score: similarity, matchType: 'fuzzy' };
  }
  
  return null;
}

// Find best matches from a list of strings
export function fuzzySearch(query: string, items: string[], limit: number = 5): FuzzyMatchResult[] {
  if (!query.trim()) return [];
  
  const results: FuzzyMatchResult[] = [];
  
  for (const item of items) {
    const match = getMatchScore(query, item);
    if (match) {
      results.push(match);
    }
  }
  
  // Sort by score (descending), then alphabetically
  return results
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.localeCompare(b.item);
    })
    .slice(0, limit);
}

export interface SpellCorrectionResult {
  original: string;
  corrected: string;
  similarity: number;
}

// Find best spell correction from a list of known terms
export function findSpellCorrection(
  query: string,
  knownTerms: string[],
  threshold: number = 0.7
): SpellCorrectionResult | null {
  if (!query.trim()) return null;
  
  const queryLower = query.toLowerCase();
  
  let bestMatch: SpellCorrectionResult | null = null;
  let bestSimilarity = 0;
  
  for (const term of knownTerms) {
    const termLower = term.toLowerCase();
    
    // Skip if it's an exact match
    if (queryLower === termLower) return null;
    
    // Skip if query is a substring (user is still typing)
    if (termLower.startsWith(queryLower)) return null;
    
    const similarity = stringSimilarity(queryLower, termLower);
    
    // Only suggest correction if similarity is in the sweet spot (70-95%)
    // Too high similarity means it's probably fine, too low means it's probably intentional
    if (similarity >= threshold && similarity < 0.95 && similarity > bestSimilarity) {
      bestMatch = {
        original: query,
        corrected: term,
        similarity
      };
      bestSimilarity = similarity;
    }
  }
  
  return bestMatch;
}

// Common misspelling patterns for Egypt real estate
export const commonMisspellings: Record<string, string> = {
  'palm hills': 'Palm Hills Developments',
  'palmhills': 'Palm Hills Developments',
  'palm hils': 'Palm Hills Developments',
  'emaar': 'Emaar Misr',
  'emar': 'Emaar Misr',
  'sodec': 'SODIC',
  'sodik': 'SODIC',
  'ora': 'Ora Developers',
  'tatwir': 'Tatweer Misr',
  'tatwer': 'Tatweer Misr',
  'mountain veiw': 'Mountain View',
  'hyde parl': 'Hyde Park Developments',
  'new cayro': 'New Cairo',
  'sheik zayed': 'Sheikh Zayed',
  'sheikh zaied': 'Sheikh Zayed',
  'sokna': 'Ain Sokhna',
  'sokhna': 'Ain Sokhna',
  'sahel': 'North Coast',
  'north coast': 'North Coast',
  'new capital': 'New Administrative Capital',
  'marassi': 'Marassi',
  'marasi': 'Marassi',
};

// Check common misspellings first
export function checkCommonMisspelling(query: string): string | null {
  const queryLower = query.toLowerCase().trim();
  return commonMisspellings[queryLower] || null;
}
