import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Sparkles, Award, TrendingUp, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TrustInsightsModal } from "@/components/TrustInsightsModal";
import { SearchSuggestions } from "@/components/SearchSuggestions";
import { ItemDetailSection } from "@/components/ItemDetailSection";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { CompareModal } from "@/components/CompareModal";
import { type SearchItem } from "@/data/searchIndex";

interface HeroSearchBarProps {
  onSelectDeveloper: (developerId: string) => void;
}

export const HeroSearchBar = ({ onSelectDeveloper }: HeroSearchBarProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [reviewItem, setReviewItem] = useState<SearchItem | null>(null);
  const [compareItem, setCompareItem] = useState<SearchItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleSelect = useCallback((item: SearchItem) => {
    // Show item detail inline on the page
    setSelectedItem(item);
    setQuery("");
    setIsFocused(false);
    
    // Also trigger developer selection for developers
    if (item.category === 'developers') {
      onSelectDeveloper(item.id);
    }
  }, [onSelectDeveloper]);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleWriteReview = useCallback((item: SearchItem) => {
    setReviewItem(item);
    setIsFocused(false);
  }, []);

  const handleValidateDecision = useCallback(() => {
    // If there's a query with results, open the first result
    // Otherwise, show a prompt to search first
    if (query.trim()) {
      setIsFocused(true);
    } else {
      inputRef.current?.focus();
    }
  }, [query]);

  const handleCorrection = useCallback((corrected: string) => {
    setQuery(corrected);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isFocused) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(-1, prev - 1));
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
      case 'Enter':
        // If an item is selected, trigger selection
        // This would need access to the flat items list
        break;
    }
  }, [isFocused]);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Delay to allow click on suggestions
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Search Container */}
      <div className="relative flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 md:p-2">
        {/* Ask AI Button */}
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-xs md:text-sm whitespace-nowrap hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>{t("hero.askAI")}</span>
        </button>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={t("hero.searchPlaceholder")}
            className="w-full px-3 py-2 md:py-2.5 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Search Icon */}
        <Search className="w-5 h-5 text-muted-foreground me-2" />

        {/* Validate Decision Button */}
        <button 
          onClick={handleValidateDecision}
          className="hidden sm:flex items-center px-4 py-2 md:px-5 md:py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold text-xs md:text-sm whitespace-nowrap hover:bg-accent/90 transition-colors"
        >
          {t("hero.validateDecision")}
        </button>
      </div>

      {/* Search Suggestions Dropdown */}
      <SearchSuggestions
        query={query}
        isOpen={isFocused}
        onSelect={handleSelect}
        onCorrection={handleCorrection}
        onWriteReview={handleWriteReview}
        selectedIndex={selectedIndex}
      />

      {/* AI Trust Insights Modal */}
      <TrustInsightsModal open={isAIModalOpen} onOpenChange={setIsAIModalOpen} />

      {/* Write Review Modal */}
      <WriteReviewModal
        open={!!reviewItem}
        onOpenChange={(open) => !open && setReviewItem(null)}
        developerName={reviewItem?.name || ""}
        developerId={reviewItem?.id || ""}
      />
      
      {/* Item Detail Section - Inline on page */}
      {selectedItem && (
        <ItemDetailSection 
          item={selectedItem} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
};

interface CategoryLink {
  icon: string;
  label: string;
}

interface HeroCategoryLinksProps {
  onViewSelect?: (view: 'bestOf' | 'trending' | 'newLaunches') => void;
}

export const HeroCategoryLinks = ({ onViewSelect }: HeroCategoryLinksProps) => {
  const { t } = useTranslation();

  const categories: { icon: React.ReactNode; label: string; view: 'bestOf' | 'trending' | 'newLaunches' }[] = [
    { icon: <Award className="w-4 h-4 text-accent" />, label: t("hero.bestOf2025"), view: 'bestOf' },
    { icon: <TrendingUp className="w-4 h-4 text-primary" />, label: t("hero.trendingProjects"), view: 'trending' },
    { icon: <Zap className="w-4 h-4 text-brand-red" />, label: t("hero.newLaunches"), view: 'newLaunches' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
      {categories.map((cat) => (
        <button
          key={cat.view}
          onClick={() => onViewSelect?.(cat.view)}
          className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="group-hover:scale-110 transition-transform">{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

interface BottomCategory {
  icon: React.ReactNode;
  label: string;
}

export const HeroBottomBar = () => {
  const { t } = useTranslation();

  const categories: BottomCategory[] = [
    { icon: "🗄️", label: t("categories.units") },
    { icon: "📁", label: t("categories.apps") },
    { icon: "📂", label: t("categories.shares") },
    { icon: "📋", label: t("categories.platforms") },
    { icon: "🤝", label: t("categories.brokers") },
    { icon: "🖥️", label: t("categories.exhibitions") },
    { icon: "📺", label: t("categories.channels") },
  ];

  return (
    <div className="relative flex items-center bg-card border-t border-border">
      {/* Left Arrow */}
      <button className="p-2 md:p-3 hover:bg-secondary/50 transition-colors border-e border-border">
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
      </button>

      {/* Scrollable Categories */}
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 md:gap-2 px-2 py-2 md:py-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary rounded-lg text-xs md:text-sm text-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      <button className="p-2 md:p-3 hover:bg-secondary/50 transition-colors border-s border-border">
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
      </button>
    </div>
  );
};
