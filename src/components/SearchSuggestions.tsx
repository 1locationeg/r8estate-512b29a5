import { useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, Home, FolderOpen, Users, Smartphone, LayoutGrid, Star, ArrowRight, Sparkles, Building, Hotel, Stethoscope, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { performSearch, getPopularItems, type SearchItem, type SearchCategory, type SearchResults } from "@/data/searchIndex";

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onSelect: (item: SearchItem) => void;
  onCorrection: (corrected: string) => void;
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
  selectedIndex,
  className
}: SearchSuggestionsProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
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
  
  const renderItem = (item: SearchItem, isSelected: boolean) => {
    itemIndex++;
    const currentIndex = itemIndex;
    
    return (
      <button
        key={`${item.category}-${item.id}`}
        data-index={currentIndex}
        onClick={() => onSelect(item)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-start rounded-lg",
          isSelected 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-secondary/50"
        )}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            {categoryIcons[item.category]}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground text-sm truncate">
            {item.name}
          </div>
          {item.subtitle && (
            <div className="text-xs text-muted-foreground truncate">
              {item.subtitle}
            </div>
          )}
        </div>
        
        {item.rating && (
          <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 rounded-lg flex-shrink-0">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-semibold text-accent">
              {item.rating}
            </span>
          </div>
        )}
        
        {item.reviewCount && !item.rating && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {item.reviewCount} {t("reviews.reviews")}
          </span>
        )}
      </button>
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
        "absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto",
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
      
      {/* Popular Header (when no query) */}
      {!query.trim() && (
        <div className="px-4 py-3 border-b border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("search.popular")}
          </div>
        </div>
      )}
      
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
