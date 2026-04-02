import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { categories } from "@/components/HeroCategoryItems";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface BrowseCategoriesGridProps {
  onSelectCategory?: (categoryIndex: number) => void;
  onSelectItem?: (item: { id: string; nameEn: string; nameAr: string }) => void;
  searchQuery?: string;
}

// Soft pastel backgrounds that cycle through categories — matching R8ESTATE's trust palette
const categoryColors = [
  "bg-primary/8",
  "bg-accent/10",
  "bg-[hsl(150,60%,95%)]",
  "bg-[hsl(340,50%,95%)]",
  "bg-[hsl(200,60%,94%)]",
  "bg-[hsl(30,60%,95%)]",
  "bg-primary/6",
  "bg-accent/8",
  "bg-[hsl(160,50%,94%)]",
  "bg-[hsl(280,40%,95%)]",
  "bg-[hsl(210,50%,94%)]",
  "bg-[hsl(20,50%,95%)]",
  "bg-primary/5",
  "bg-accent/6",
  "bg-[hsl(140,50%,94%)]",
  "bg-[hsl(350,40%,95%)]",
  "bg-[hsl(190,50%,94%)]",
  "bg-[hsl(40,50%,95%)]",
];

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
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      <h2 className="text-base md:text-lg font-bold text-foreground mb-3">
        {isRTL ? "استكشف حسب الفئة" : "Explore by category"}
      </h2>

      {q && filteredCategories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          {isRTL ? "لا توجد نتائج" : "No results found"}
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
        {filteredCategories.map(({ category, originalIndex }) => {
          const colorClass = categoryColors[originalIndex % categoryColors.length];
          const categoryName = t(category.labelKey);

          return (
            <button
              key={category.labelKey}
              onClick={() => onSelectCategory?.(originalIndex)}
              className={cn(
                "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:scale-105 cursor-pointer",
                colorClass
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                {category.icon}
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-foreground text-center leading-tight line-clamp-2">
                {categoryName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
