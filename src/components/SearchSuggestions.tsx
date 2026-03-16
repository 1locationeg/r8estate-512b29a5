import { useMemo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, Home, FolderOpen, Users, Smartphone, LayoutGrid, Star, ArrowRight, Sparkles, Building, Mic, FileDown, GitCompare, PenLine, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { performSearch, getPopularItems, type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { getSearchHistory } from "@/lib/searchHistory";
import { supabase } from "@/integrations/supabase/client";
import { useTrackInterest } from "@/hooks/useTrackInterest";

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
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout>>();

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
  const { results, popular, flatItems } = useMemo(() => {
    if (query.trim().length > 0) {
      const searchResults = performSearch(query);
      const flat: SearchItem[] = [];
      
      // Flatten grouped results in category order
      for (const cat of categoryOrder) {
        flat.push(...searchResults.groupedResults[cat]);
      }
      
      return { 
        results: searchResults, 
        popular: null, 
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
        flatItems: flat 
      };
    }
  }, [query]);
  
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
        "absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 p-4",
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
          "px-3 py-2.5 md:px-4 md:py-3.5 transition-colors border-b border-border/40 last:border-b-0",
          isSelected 
            ? "bg-primary/5" 
            : "hover:bg-secondary/30"
        )}
      >
        {/* Main item row - clickable */}
        <button
          onClick={() => onSelect(item)}
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
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {categoryIcons[category]}
          <span>{label}</span>
        </div>
        <div className="mt-1">
          {items.map((item) => renderItem(item, itemIndex + 1 === selectedIndex))}
        </div>
      </div>
    );
  };
  
  const groupedToRender = query.trim() 
    ? results?.groupedResults 
    : popular;
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-[320px] md:max-h-[400px] overflow-y-auto",
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
      
      {/* Recent & Popular Header (when no query) */}
      {!query.trim() && (() => {
        const history = getSearchHistory();
        return (
          <>
            {history.length > 0 && (
              <div className="border-b border-border">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5" />
                  <span>{t("search.recent")}</span>
                </div>
                {history.slice(0, 5).map((entry, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCorrection(entry.query)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary/30 transition-colors text-start"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 rtl:rotate-180" />
                    <span>{entry.query}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="px-4 py-3 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("search.popular")}
              </div>
            </div>
          </>
        );
      })()}
      
      {/* Category Sections */}
      <div className="divide-y divide-border/50">
        {groupedToRender && categoryOrder.map((cat) => {
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
