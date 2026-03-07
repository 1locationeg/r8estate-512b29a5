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
      meta: { 
        trustScore: dev.trustScore, 
        verified: dev.verified,
        yearEstablished: dev.yearEstablished,
        employees: dev.employees,
        registeredUsers: dev.registeredUsers,
        capital: dev.capital,
        projectsCompleted: dev.projectsCompleted,
        location: dev.location,
        specialties: dev.specialties,
      }
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
        developerId: project.developerId,
        developerName: developer?.name,
        unitTypes: project.unitTypes,
        priceRange: project.priceRange,
        totalUnits: project.totalUnits,
        builtUpArea: project.builtUpArea,
        launchDate: project.launchDate,
        expectedCompletion: project.expectedCompletion,
        paymentPlan: project.paymentPlan,
        amenities: project.amenities,
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
      meta: { 
        agentCount: broker.agentCount,
        yearFounded: broker.yearFounded,
        location: broker.location,
        dealsCompleted: broker.dealsCompleted,
        activeListings: broker.activeListings,
        languages: broker.languages,
        specialty: broker.specialty,
      }
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
      meta: { 
        downloads: app.downloads,
        launchYear: app.launchYear,
        platform: app.platform,
        monthlyActiveUsers: app.monthlyActiveUsers,
        featuredListings: app.featuredListings,
        supportedRegions: app.supportedRegions,
        type: app.type,
      }
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

// Get popular/trending items when no query
export function getPopularItems(): Record<SearchCategory, SearchItem[]> {
  const index = getSearchIndex();
  
  const popular: Record<SearchCategory, SearchItem[]> = {
    developers: index
      .filter(i => i.category === 'developers')
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 3),
    projects: index
      .filter(i => i.category === 'projects')
      .slice(0, 3),
    locations: index
      .filter(i => i.category === 'locations')
      .slice(0, 3),
    brokers: [],
    apps: [],
    units: index
      .filter(i => i.category === 'units')
      .slice(0, 4),
    'property-types': index
      .filter(i => i.category === 'property-types')
      .slice(0, 4),
    categories: index
      .filter(i => i.category === 'categories')
      .slice(0, 4),
    reviews: []
  };
  
  return popular;
}
