import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { categories } from "@/components/HeroCategoryItems";
import { cn } from "@/lib/utils";

interface BrowseCategoriesGridProps {
  onSelectCategory?: (categoryIndex: number) => void;
  onSelectItem?: (item: { id: string; nameEn: string; nameAr: string }) => void;
  searchQuery?: string;
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

export const BrowseCategoriesGrid = ({ onSelectCategory, onSelectItem, searchQuery = "" }: BrowseCategoriesGridProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";
  const q = searchQuery.toLowerCase().trim();

  const filteredCategories = categories.map((category, originalIndex) => {
    const categoryName = t(category.labelKey).toLowerCase();
    const matchingItems = category.items.filter(
      item => item.nameEn.toLowerCase().includes(q) || item.nameAr.includes(q)
    );
    const categoryMatches = categoryName.includes(q);
    return { category, originalIndex, matchingItems, categoryMatches };
  }).filter(({ matchingItems, categoryMatches }) => !q || categoryMatches || matchingItems.length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3">
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

          return (
            <button
              key={category.labelKey}
              onClick={() => onSelectCategory?.(originalIndex)}
              className="flex flex-col items-center gap-1 w-14 md:w-16 group cursor-pointer"
            >
              <div className={cn(
                "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md",
                colors.bg, colors.text
              )}>
                {category.icon}
              </div>
              <span className="text-[9px] md:text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">
                {categoryName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
