import { developers, reviews, projects, locations, brokerages, apps, unitTypes, categories, propertyTypes } from './mockData';
import { fuzzySearch, findSpellCorrection, checkCommonMisspelling, type FuzzyMatchResult } from '@/lib/fuzzySearch';

export type SearchCategory = 
  | 'developers' 
  | 'projects' 
  | 'locations' 
  | 'brokers' 
  | 'apps' 
  | 'units' 
  | 'property-types'
  | 'categories'
  | 'reviews';

export interface SearchItem {
  id: string;
  name: string;
  category: SearchCategory;
  subtitle?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  meta?: Record<string, unknown>;
}

// Build the unified search index
function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  
  // Add developers
  for (const dev of developers) {
    items.push({
      id: dev.id,
      name: dev.name,
      category: 'developers',
      subtitle: dev.location,
      image: dev.logo,
      rating: dev.rating,
      reviewCount: dev.reviewCount,
      meta: { trustScore: dev.trustScore, verified: dev.verified }
    });
  }
  
  // Add projects
  for (const project of projects) {
    const developer = developers.find(d => d.id === project.developerId);
    items.push({
      id: project.id,
      name: project.name,
      category: 'projects',
      subtitle: developer ? `by ${developer.name}` : project.location,
      image: project.image,
      meta: { 
        location: project.location, 
        status: project.status,
        developerId: project.developerId 
      }
    });
  }
  
  // Add locations
  for (const loc of locations) {
    items.push({
      id: loc.id,
      name: loc.name,
      category: 'locations',
      subtitle: loc.region,
      meta: { projectCount: loc.projectCount }
    });
  }
  
  // Add brokerages
  for (const broker of brokerages) {
    items.push({
      id: broker.id,
      name: broker.name,
      category: 'brokers',
      subtitle: broker.specialty,
      image: broker.logo,
      meta: { agentCount: broker.agentCount }
    });
  }
  
  // Add apps
  for (const app of apps) {
    items.push({
      id: app.id,
      name: app.name,
      category: 'apps',
      subtitle: app.type,
      image: app.icon,
      rating: app.rating,
      meta: { downloads: app.downloads }
    });
  }
  
  // Add unit types
  for (const unit of unitTypes) {
    items.push({
      id: unit.id,
      name: unit.name,
      category: 'units',
      subtitle: unit.description,
      meta: { averagePrice: unit.averagePrice, propertyType: unit.propertyType }
    });
  }
  
  // Add property types
  for (const propType of propertyTypes) {
    items.push({
      id: propType.id,
      name: propType.name,
      category: 'property-types',
      subtitle: propType.description,
      meta: { icon: propType.icon, count: propType.count }
    });
  }
  
  // Add categories
  for (const cat of categories) {
    items.push({
      id: cat.id,
      name: cat.name,
      category: 'categories',
      subtitle: `${cat.count} items`,
      meta: { icon: cat.icon }
    });
  }
  
  return items;
}

// Cached search index
let searchIndex: SearchItem[] | null = null;

export function getSearchIndex(): SearchItem[] {
  if (!searchIndex) {
    searchIndex = buildSearchIndex();
  }
  return searchIndex;
}

// Get all searchable terms for spell correction
export function getAllSearchTerms(): string[] {
  const index = getSearchIndex();
  return index.map(item => item.name);
}

export interface SearchResults {
  items: (SearchItem & { score: number; matchType: FuzzyMatchResult['matchType'] })[];
  spellCorrection: { original: string; corrected: string } | null;
  groupedResults: Record<SearchCategory, (SearchItem & { score: number })[]>;
}

// Perform search with fuzzy matching
export function performSearch(query: string, limit: number = 15): SearchResults {
  const index = getSearchIndex();
  const allTerms = getAllSearchTerms();
  
  // Check for common misspellings first
  const commonCorrection = checkCommonMisspelling(query);
  
  // Get spell correction suggestion
  const spellResult = findSpellCorrection(query, allTerms);
  
  // Use corrected query if there's a common misspelling
  const effectiveQuery = commonCorrection || query;
  
  // Get fuzzy matches
  const fuzzyResults = fuzzySearch(effectiveQuery, allTerms, limit * 2);
  
  // Map fuzzy results to search items
  const matchedItems: (SearchItem & { score: number; matchType: FuzzyMatchResult['matchType'] })[] = [];
  
  for (const result of fuzzyResults) {
    const item = index.find(i => i.name.toLowerCase() === result.item.toLowerCase());
    if (item) {
      matchedItems.push({
        ...item,
        score: result.score,
        matchType: result.matchType
      });
    }
  }
  
  // Group results by category
  const groupedResults: Record<SearchCategory, (SearchItem & { score: number })[]> = {
    developers: [],
    projects: [],
    locations: [],
    brokers: [],
    apps: [],
    units: [],
    'property-types': [],
    categories: [],
    reviews: []
  };
  
  for (const item of matchedItems) {
    if (groupedResults[item.category].length < 3) {
      groupedResults[item.category].push(item);
    }
  }
  
  return {
    items: matchedItems.slice(0, limit),
    spellCorrection: commonCorrection 
      ? { original: query, corrected: commonCorrection }
      : spellResult 
        ? { original: spellResult.original, corrected: spellResult.corrected }
        : null,
    groupedResults
  };
}

// Get most searched/interactive items when no query - prioritized by engagement
export function getPopularItems(): Record<SearchCategory, SearchItem[]> {
  const index = getSearchIndex();
  
  // Score items by engagement (reviewCount, rating, meta data)
  const scoreItem = (item: SearchItem): number => {
    let score = 0;
    score += (item.reviewCount || 0) * 2;
    score += (item.rating || 0) * 100;
    if (item.meta?.trustScore) score += (item.meta.trustScore as number) * 5;
    if (item.meta?.projectCount) score += (item.meta.projectCount as number) * 3;
    if (item.meta?.downloads) {
      const downloads = String(item.meta.downloads);
      if (downloads.includes('M')) score += 500;
      else if (downloads.includes('K')) score += 100;
    }
    return score;
  };
  
  const popular: Record<SearchCategory, SearchItem[]> = {
    // Top developers by reviews & trust score
    developers: index
      .filter(i => i.category === 'developers')
      .sort((a, b) => scoreItem(b) - scoreItem(a))
      .slice(0, 4),
    // Top projects (from highest-rated developers)
    projects: index
      .filter(i => i.category === 'projects')
      .sort((a, b) => scoreItem(b) - scoreItem(a))
      .slice(0, 3),
    // Most popular locations by project count
    locations: index
      .filter(i => i.category === 'locations')
      .sort((a, b) => ((b.meta?.projectCount as number) || 0) - ((a.meta?.projectCount as number) || 0))
      .slice(0, 4),
    // Top brokers
    brokers: index
      .filter(i => i.category === 'brokers')
      .sort((a, b) => ((b.meta?.agentCount as number) || 0) - ((a.meta?.agentCount as number) || 0))
      .slice(0, 3),
    // Top apps by rating & downloads
    apps: index
      .filter(i => i.category === 'apps')
      .sort((a, b) => scoreItem(b) - scoreItem(a))
      .slice(0, 3),
    // Most searched unit types
    units: index
      .filter(i => i.category === 'units')
      .slice(0, 4),
    // Property types
    'property-types': index
      .filter(i => i.category === 'property-types')
      .sort((a, b) => ((b.meta?.count as number) || 0) - ((a.meta?.count as number) || 0))
      .slice(0, 4),
    // Top categories
    categories: index
      .filter(i => i.category === 'categories')
      .sort((a, b) => ((b.meta?.count as number) || 0) - ((a.meta?.count as number) || 0))
      .slice(0, 3),
    reviews: []
  };
  
  return popular;
}
