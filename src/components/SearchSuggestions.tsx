import { useMemo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, Home, FolderOpen, Users, Smartphone, LayoutGrid, Star, ArrowRight, Sparkles, Building, Mic, FileDown, GitCompare, PenLine, Loader2, Search, TrendingUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { performSearch, getPopularItems, type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { getSearchHistory } from "@/lib/searchHistory";
import { supabase } from "@/integrations/supabase/client";
import { useTrackInterest } from "@/hooks/useTrackInterest";
import { mapPublicBusinessProfileToSearchItem } from "@/lib/businessProfileSearch";

import { getRatingColorClass } from "@/lib/ratingColors";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onSelect: (item: SearchItem) => void;
  onCorrection: (corrected: string) => void;
  onWriteReview?: (item: SearchItem) => void;
  onCompare?: (item: SearchItem) => void;
  selectedIndex: number;
  className?: string;
}

const categoryFilters: { key: SearchCategory | 'all'; icon: React.ReactNode; label: string; color: string }[] = [
  { key: 'all', icon: <LayoutGrid className="w-3.5 h-3.5" />, label: 'All', color: 'bg-primary/10 text-primary border-primary/20' },
  { key: 'developers', icon: <Building2 className="w-3.5 h-3.5" />, label: 'Developers', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { key: 'projects', icon: <Home className="w-3.5 h-3.5" />, label: 'Projects', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { key: 'locations', icon: <MapPin className="w-3.5 h-3.5" />, label: 'Locations', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { key: 'brokers', icon: <Users className="w-3.5 h-3.5" />, label: 'Brokers', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { key: 'units', icon: <LayoutGrid className="w-3.5 h-3.5" />, label: 'Units', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  { key: 'apps', icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Apps', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
];

const categoryIcons: Record<SearchCategory, React.ReactNode> = {
  developers: <Building2 className="w-4 h-4" />,
  projects: <Home className="w-4 h-4" />,
  locations: <MapPin className="w-4 h-4" />,
  brokers: <Users className="w-4 h-4" />,
  apps: <Smartphone className="w-4 h-4" />,
  units: <LayoutGrid className="w-4 h-4" />,
  'property-types': <Building className="w-4 h-4" />,
  categories: <FolderOpen className="w-4 h-4" />,
  reviews: <Star className="w-4 h-4" />
};

const categoryOrder: SearchCategory[] = ['developers', 'locations', 'projects', 'property-types', 'units', 'categories', 'brokers', 'apps'];

export const SearchSuggestions = ({
  query,
  isOpen,
  onSelect,
  onCorrection,
  onWriteReview,
  onCompare,
  selectedIndex,
  className
}: SearchSuggestionsProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiCorrection, setAiCorrection] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory | 'all'>('all');
  const [remoteBusinessItems, setRemoteBusinessItems] = useState<SearchItem[]>([]);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const businessDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { trackSearch } = useTrackInterest();

  const handleSelect = (item: SearchItem) => {
    trackSearch(item.id, item.name);
    onSelect(item);
  };

  // Reset category filter when query changes
  useEffect(() => {
    setActiveCategory('all');
  }, [query]);

  useEffect(() => {
    if (businessDebounceRef.current) clearTimeout(businessDebounceRef.current);

    const normalizedQuery = query.trim().replace(/[,%_'"\\]/g, " ").replace(/\s+/g, " ").trim();

    if (!isOpen || normalizedQuery.length < 2) {
      setRemoteBusinessItems([]);
      return;
    }

    businessDebounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('public_business_profiles')
        .select('id, company_name, location, logo_url, website, specialties, year_established, description, categories')
        .or(`company_name.ilike.%${normalizedQuery}%,location.ilike.%${normalizedQuery}%,website.ilike.%${normalizedQuery}%`)
        .limit(6);

      if (error || !data) {
        setRemoteBusinessItems([]);
        return;
      }

      setRemoteBusinessItems(data.map(mapPublicBusinessProfileToSearchItem));
    }, 250);

    return () => {
      if (businessDebounceRef.current) clearTimeout(businessDebounceRef.current);
    };
  }, [isOpen, query]);

  // Debounced AI autocomplete
  useEffect(() => {
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    
    if (query.trim().length < 3 || !isOpen) {
      setAiSuggestions([]);
      setAiCorrection(null);
      setAiLoading(false);
      return;
    }

    setAiLoading(true);
    aiDebounceRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke("ai-chat", {
          body: { mode: "autocomplete", query: query.trim() },
        });
        if (data?.suggestions) setAiSuggestions(data.suggestions);
        if (data?.correction) setAiCorrection(data.correction);
      } catch {
        // Silently fail - local search still works
      } finally {
        setAiLoading(false);
      }
    }, 500);

    return () => {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    };
  }, [query, isOpen]);
  
  // Perform search or get popular items
  const { results, popular, flatItems, groupedResults } = useMemo(() => {
    if (query.trim().length > 0) {
      const searchResults = performSearch(query);
      const mergedDevelopers = [...remoteBusinessItems, ...searchResults.groupedResults.developers].filter(
        (item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index,
      );
      const mergedGroupedResults = {
        ...searchResults.groupedResults,
        developers: mergedDevelopers,
      };
      const flat: SearchItem[] = [];
      
      // Flatten grouped results in category order
      for (const cat of categoryOrder) {
        flat.push(...mergedGroupedResults[cat]);
      }
      
      return { 
        results: searchResults, 
        popular: null, 
        groupedResults: mergedGroupedResults,
        flatItems: flat 
      };
    } else {
      const popularItems = getPopularItems();
      const flat: SearchItem[] = [];
      
      for (const cat of categoryOrder) {
        flat.push(...popularItems[cat]);
      }
      
      return { 
        results: null, 
        popular: popularItems,
        groupedResults: popularItems,
        flatItems: flat 
      };
    }
  }, [query, remoteBusinessItems]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const selectedElement = containerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);
  
  if (!isOpen) return null;
  
  const hasResults = query.trim() 
    ? flatItems.length > 0 || results?.spellCorrection 
    : flatItems.length > 0;
  
  if (!hasResults && query.trim()) {
    return (
      <div className={cn(
        "absolute top-full start-0 end-0 mt-1 bg-card border border-border/60 rounded-b-2xl shadow-2xl shadow-primary/[0.08] overflow-hidden z-50 p-5",
        className
      )}>
        <div className="text-center text-muted-foreground text-sm py-2">
          {t("search.noResults")}
        </div>
      </div>
    );
  }
  
  let itemIndex = -1;
  
  // Generate a deterministic trust score for non-developer items based on id
  const generateTrustScore = (item: SearchItem): number => {
    // Developers already have trustScore in meta
    if (item.category === 'developers' && item.meta?.trustScore) {
      return item.meta.trustScore as number;
    }
    // Generate a consistent score based on item id hash
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
      hash = hash & hash;
    }
    return 55 + Math.abs(hash % 40); // Range 55-94
  };

  const handleActionClick = (e: React.MouseEvent, action: string, item: SearchItem) => {
    e.stopPropagation();
    if (action === 'write-review' && onWriteReview) {
      onWriteReview(item);
    } else if (action === 'download-report') {
      downloadTrustReport(item);
    } else if (action === 'compare' && onCompare) {
      onCompare(item);
    } else {
      console.log(`Action: ${action} for item:`, item);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    const colorClass = getRatingColorClass(rating);
    
    return (
      <div className="flex items-center gap-0.5">
        <span className={`text-xs md:text-sm font-bold me-1.5 ${colorClass}`}>{rating.toFixed(1)}</span>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3 md:w-4 md:h-4",
              i < fullStars ? colorClass : (i === fullStars && hasHalf ? colorClass + " opacity-50" : "text-muted-foreground/30")
            )}
          />
        ))}
      </div>
    );
  };

  const renderItem = (item: SearchItem, isSelected: boolean) => {
    itemIndex++;
    const currentIndex = itemIndex;
    const trustScore = generateTrustScore(item);
    const itemRating = item.rating || (3 + Math.abs(generateTrustScore(item) % 3));
    
    return (
      <div
        key={`${item.category}-${item.id}`}
        data-index={currentIndex}
        className={cn(
          "px-4 py-3 md:px-5 md:py-3.5 transition-all duration-200 border-b border-border/30 last:border-b-0",
          isSelected 
            ? "bg-primary/5" 
            : "hover:bg-secondary/40 hover:scale-[1.005]"
        )}
      >
        {/* Main item row - clickable */}
        <button
          onClick={() => handleSelect(item)}
          className="w-full flex items-center gap-2.5 md:gap-4 text-start"
        >
          {/* Logo with verification badge */}
          <div className="relative flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover bg-secondary"
              />
            ) : (
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-secondary flex items-center justify-center">
                {categoryIcons[item.category]}
              </div>
            )}
            {/* Verification badge */}
            <div className="absolute -bottom-1 -end-1 w-4 h-4 md:w-5 md:h-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-card">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          
          {/* Name & subtitle */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground text-sm truncate">
              {item.name}
            </div>
            {item.subtitle && (
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {item.subtitle}
              </div>
            )}
          </div>
          
          {/* Star Rating - visual stars like the reference */}
          {renderStars(itemRating)}
        </button>
        
        {/* Action buttons row */}
        <div className="flex items-center gap-1.5 mt-2 md:mt-2.5 ms-[46px] md:ms-[60px]">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 md:h-7 px-2 md:px-2.5 text-xs gap-1.5"
                  onClick={(e) => handleActionClick(e, 'write-review', item)}
                >
                  <PenLine className="w-3 h-3" />
                  <span className="hidden md:inline">{t("search.writeReview")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("search.writeReviewTooltip")}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 md:h-7 md:w-7 p-0"
                  onClick={(e) => handleActionClick(e, 'voice-review', item)}
                >
                  <Mic className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("search.voiceReviewTooltip")}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 md:h-7 md:w-7 p-0"
                  onClick={(e) => handleActionClick(e, 'download-report', item)}
                >
                  <FileDown className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("search.downloadReportTooltip")}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 md:h-7 px-2 md:px-2.5 text-xs gap-1.5"
                  onClick={(e) => handleActionClick(e, 'compare', item)}
                >
                  <GitCompare className="w-3 h-3" />
                  <span className="hidden md:inline">{t("search.compare")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("search.compareTooltip")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };
  
  const renderCategorySection = (
    category: SearchCategory, 
    items: SearchItem[],
    label: string
  ) => {
    if (items.length === 0) return null;
    
    return (
      <div key={category} className="py-2">
        <div className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {categoryIcons[category]}
          <span>{label}</span>
        </div>
        <div className="mt-0.5">
          {items.map((item) => renderItem(item, itemIndex + 1 === selectedIndex))}
        </div>
      </div>
    );
  };
  
  const groupedToRender = groupedResults;
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute top-full start-0 end-0 mt-1 bg-card border border-border/60 rounded-b-2xl shadow-2xl shadow-primary/[0.08] overflow-hidden z-50 max-h-[360px] md:max-h-[440px] overflow-y-auto search-suggestions-scrollbar",
        className
      )}
    >
      {/* Spell Correction Banner */}
      {results?.spellCorrection && (
        <button
          onClick={() => onCorrection(results.spellCorrection!.corrected)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-primary/5 border-b border-border hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{t("search.didYouMean")}</span>
            <span className="font-semibold text-primary">
              "{results.spellCorrection.corrected}"
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-primary" />
        </button>
      )}

      {/* AI Correction (when local spell correction is absent) */}
      {!results?.spellCorrection && aiCorrection && query.trim().length >= 3 && (
        <button
          onClick={() => onCorrection(aiCorrection)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-primary/5 border-b border-border hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{t("search.didYouMean")}</span>
            <span className="font-semibold text-primary">
              "{aiCorrection}"
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-primary" />
        </button>
      )}

      {/* AI Suggestions Section */}
      {query.trim().length >= 3 && (aiSuggestions.length > 0 || aiLoading) && (
        <div className="border-b border-border">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t("search.aiSuggestions")}</span>
            {aiLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </div>
          {aiSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onCorrection(suggestion)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary/30 transition-colors text-start"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{suggestion}</span>
            </button>
          ))}
          {aiLoading && aiSuggestions.length === 0 && (
            <div className="px-4 py-2 text-xs text-muted-foreground">
              {t("search.aiSuggestionsLoading")}
            </div>
          )}
        </div>
      )}

      {/* Visual Category Filter Chips */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/40 px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categoryFilters.map((cf) => {
            const count = groupedToRender
              ? cf.key === 'all'
                ? categoryOrder.reduce((sum, cat) => sum + (groupedToRender[cat]?.length || 0), 0)
                : groupedToRender[cf.key]?.length || 0
              : 0;
            if (cf.key !== 'all' && count === 0) return null;
            return (
              <button
                key={cf.key}
                onClick={() => setActiveCategory(cf.key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0",
                  activeCategory === cf.key
                    ? `${cf.color} border-current/30 shadow-sm`
                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                )}
              >
                {cf.icon}
                <span>{cf.label}</span>
                {count > 0 && (
                  <span className={cn(
                    "ms-0.5 text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full",
                    activeCategory === cf.key ? "bg-current/10" : "bg-muted"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Trending + Recent & Popular Header (when no query) */}
      {!query.trim() && (() => {
        const history = getSearchHistory();
        const trendingSearches = [
          { term: "Palm Hills", icon: Flame, hot: true },
          { term: "New Cairo", icon: TrendingUp, hot: false },
          { term: "Mountain View", icon: TrendingUp, hot: false },
          { term: "Marassi", icon: Flame, hot: true },
          { term: "Zed East", icon: TrendingUp, hot: false },
          { term: "Hyde Park", icon: TrendingUp, hot: false },
          { term: "Sodic", icon: Flame, hot: true },
          { term: "6th October", icon: TrendingUp, hot: false },
        ];
        return (
          <>
            {/* Trending Searches */}
             <div className="border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("search.trending", "Trending Now")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trend) => {
                  const TIcon = trend.icon;
                  return (
                    <button
                      key={trend.term}
                      onClick={() => onCorrection(trend.term)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200",
                        trend.hot
                          ? "bg-destructive/8 text-destructive border border-destructive/15 hover:bg-destructive/15 hover:shadow-sm"
                          : "bg-secondary/70 text-foreground border border-border/60 hover:bg-secondary hover:shadow-sm"
                      )}
                    >
                      <TIcon className="w-3 h-3" />
                      {trend.term}
                    </button>
                  );
                })}
              </div>
            </div>

            {history.length > 0 && (
              <div className="border-b border-border/40">
                <div className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5" />
                  <span>{t("search.recent")}</span>
                </div>
                {history.slice(0, 5).map((entry, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCorrection(entry.query)}
                    className="w-full flex items-center gap-2.5 px-6 py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors duration-200 text-start"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 rtl:rotate-180" />
                    <span>{entry.query}</span>
                  </button>
                ))}
              </div>
            )}
            {activeCategory === 'all' && (
              <div className="px-5 py-3.5 border-b border-border/40">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("search.popular")}
                </div>
              </div>
            )}
          </>
        );
      })()}
      
      {/* Category Sections */}
      <div className="divide-y divide-border/30 pb-2">
        {groupedToRender && categoryOrder
          .filter((cat) => activeCategory === 'all' || cat === activeCategory)
          .map((cat) => {
            const items = groupedToRender[cat] || [];
            if (items.length === 0) return null;
            
            const labelKey = `search.${cat}` as const;
            const label = t(labelKey);
            
            return renderCategorySection(cat, items, label);
          })}
      </div>
    </div>
  );
};
