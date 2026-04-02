import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Star } from "lucide-react";
import { categories } from "@/components/HeroCategoryItems";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BrowseCategoriesGridProps {
  onSelectCategory?: (categoryIndex: number) => void;
  onSelectItem?: (item: { id: string; nameEn: string; nameAr: string }) => void;
  searchQuery?: string;
  stationFilter?: "research" | "choose" | "finance" | "protect";
}

type JourneyKey = "research" | "choose" | "finance" | "protect";

const journeyMap: Record<string, JourneyKey> = {
  "categories.platforms": "research",
  "categories.channels": "research",
  "categories.research": "research",
  "categories.exhibitions": "research",
  "categories.apps": "research",
  "categories.training": "research",
  "categories.units": "choose",
  "categories.brokers": "choose",
  "categories.shares": "choose",
  "categories.lands": "choose",
  "categories.leasing": "choose",
  "categories.mortgage": "finance",
  "categories.valuation": "finance",
  "categories.auctions": "finance",
  "categories.blockchain": "finance",
  "categories.lawFirms": "protect",
  "categories.tax": "protect",
  "categories.management": "protect",
};

const stationCircle: Record<JourneyKey, { bg: string; text: string }> = {
  research: { bg: "bg-journey-research/15", text: "text-journey-research" },
  choose: { bg: "bg-journey-choose/15", text: "text-journey-choose" },
  finance: { bg: "bg-journey-finance/15", text: "text-journey-finance" },
  protect: { bg: "bg-journey-protect/15", text: "text-journey-protect" },
};

export const BrowseCategoriesGrid = ({ onSelectCategory, onSelectItem, searchQuery = "", stationFilter }: BrowseCategoriesGridProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";
  const q = searchQuery.toLowerCase().trim();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filteredCategories = categories.map((category, originalIndex) => {
    const categoryName = t(category.labelKey).toLowerCase();
    const matchingItems = category.items.filter(
      item => item.nameEn.toLowerCase().includes(q) || item.nameAr.includes(q)
    );
    const categoryMatches = categoryName.includes(q);
    const journeyKey = journeyMap[category.labelKey] || "research";
    return { category, originalIndex, matchingItems, categoryMatches, journeyKey };
  }).filter(({ matchingItems, categoryMatches, journeyKey }) => {
    if (stationFilter && journeyKey !== stationFilter) return false;
    return !q || categoryMatches || matchingItems.length > 0;
  });

  const handleCategoryClick = (originalIndex: number) => {
    setExpandedIdx(prev => prev === originalIndex ? null : originalIndex);
    onSelectCategory?.(originalIndex);
  };

  const handleBusinessClick = (item: { id: string; nameEn: string; nameAr: string }) => {
    navigate(`/entity/${item.id}`);
    onSelectItem?.(item);
  };

  const expandedCategory = expandedIdx !== null ? categories[expandedIdx] : null;
  const expandedJourneyKey = expandedCategory ? journeyMap[expandedCategory.labelKey] || "research" : "research";
  const expandedColors = stationCircle[expandedJourneyKey];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3">
      {/* Back button when expanded */}
      {expandedIdx !== null && expandedCategory && (
        <button
          onClick={() => setExpandedIdx(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5", isRTL && "rotate-180")} />
          {isRTL ? "رجوع للفئات" : "Back to categories"}
        </button>
      )}

      {/* Expanded: show businesses in selected category */}
      {expandedIdx !== null && expandedCategory && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className={cn("w-7 h-7 rounded-full flex items-center justify-center", expandedColors.bg, expandedColors.text)}>
              {expandedCategory.icon}
            </span>
            {t(expandedCategory.labelKey)}
            <span className="text-[10px] font-normal text-muted-foreground">
              ({expandedCategory.items.length})
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {expandedCategory.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleBusinessClick(item)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card/60 hover:border-primary/30 hover:bg-card transition-all text-start group"
              >
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={item.avatar} alt={isRTL ? item.nameAr : item.nameEn} />
                  <AvatarFallback className={cn("text-[10px] font-bold", expandedColors.bg, expandedColors.text)}>
                    {(isRTL ? item.nameAr : item.nameEn).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {isRTL ? item.nameAr : item.nameEn}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] text-muted-foreground">
                      {item.rating} · {item.reviewCount} {isRTL ? "تقييم" : "reviews"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed: category icons grid */}
      {expandedIdx === null && (
        <>
          <h2 className="text-base md:text-lg font-bold text-foreground mb-3">
            {isRTL ? "استكشف حسب الفئة" : "Explore by category"}
          </h2>

          {q && filteredCategories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {isRTL ? "لا توجد نتائج" : "No results found"}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
            {filteredCategories.map(({ category, originalIndex }) => {
              const journeyKey = journeyMap[category.labelKey] || "research";
              const colors = stationCircle[journeyKey];
              const categoryName = t(category.labelKey);
              const count = category.items.length;

              return (
                <button
                  key={category.labelKey}
                  onClick={() => handleCategoryClick(originalIndex)}
                  className="flex flex-col items-center gap-1 w-14 md:w-16 group cursor-pointer"
                >
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md",
                      colors.bg, colors.text
                    )}>
                      {category.icon}
                    </div>
                    {/* Business count badge */}
                    <span className={cn(
                      "absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1 border border-background",
                      colors.bg, colors.text
                    )}>
                      {count}
                    </span>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">
                    {categoryName}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
