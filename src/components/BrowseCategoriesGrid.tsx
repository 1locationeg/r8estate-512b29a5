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
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
        {isRTL ? "استكشف حسب الفئة" : "Explore by category"}
      </h2>

      {q && filteredCategories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {isRTL ? "لا توجد نتائج" : "No results found"}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredCategories.map(({ category, originalIndex, matchingItems, categoryMatches }) => {
          const colorClass = categoryColors[originalIndex % categoryColors.length];
          const categoryName = t(category.labelKey);
          const itemsToShow = q && !categoryMatches ? matchingItems : category.items;

          return (
            <div
              key={category.labelKey}
              className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Category Header */}
              <button
                onClick={() => onSelectCategory?.(originalIndex)}
                className={cn(
                  "w-full flex flex-col items-center gap-1.5 px-3 py-4 transition-colors cursor-pointer",
                  colorClass
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  {category.icon}
                </div>
                <span className="text-xs md:text-sm font-semibold text-foreground text-center leading-tight">
                  {categoryName}
                </span>
              </button>

              {/* Sub-items List */}
              <div className="px-2 py-2 space-y-0.5">
                {itemsToShow.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/entity/${item.id}`)}
                    className={cn(
                      "w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-start",
                      isRTL && "flex-row-reverse text-end"
                    )}
                  >
                    <span className="truncate">{isRTL ? item.nameAr : item.nameEn}</span>
                    <ChevronRight className={cn("w-3 h-3 shrink-0 opacity-40", isRTL && "rotate-180")} />
                  </button>
                ))}
                {itemsToShow.length > 4 && (
                  <button
                    onClick={() => onSelectCategory?.(originalIndex)}
                    className="w-full text-[10px] font-medium text-primary hover:text-primary/80 px-2 py-1 transition-colors"
                  >
                    {isRTL ? `+${itemsToShow.length - 4} المزيد` : `+${itemsToShow.length - 4} more`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
