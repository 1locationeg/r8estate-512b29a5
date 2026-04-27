import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Loader2 } from "lucide-react";
import { categories } from "@/components/HeroCategoryItems";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { generateAvatar } from "@/lib/avatarUtils";
import { BUSINESS_CATEGORIES } from "@/data/businessCategories";

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

// Map category labelKey to the BUSINESS_CATEGORIES value used in DB
const labelKeyToCategoryValue: Record<string, string> = {
  "categories.units": "units",
  "categories.apps": "apps",
  "categories.shares": "shares",
  "categories.platforms": "platforms",
  "categories.brokers": "brokers",
  "categories.exhibitions": "exhibitions",
  "categories.channels": "channels",
  "categories.lawFirms": "law-firms",
  "categories.valuation": "valuation",
  "categories.training": "training",
  "categories.auctions": "auctions",
  "categories.mortgage": "mortgage",
  "categories.research": "research",
  "categories.tax": "tax",
  "categories.management": "management",
  "categories.leasing": "leasing",
  "categories.blockchain": "blockchain",
  "categories.lands": "lands",
};

interface DbBusiness {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  categories: string[];
}

export const BrowseCategoriesGrid = ({ onSelectCategory, onSelectItem, searchQuery = "", stationFilter }: BrowseCategoriesGridProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";
  const q = searchQuery.toLowerCase().trim();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [dbBusinesses, setDbBusinesses] = useState<DbBusiness[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Fetch category counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase
        .from("business_profiles")
        .select("categories");
      if (data) {
        const counts: Record<string, number> = {};
        for (const row of data) {
          for (const cat of row.categories || []) {
            const lower = cat.toLowerCase();
            counts[lower] = (counts[lower] || 0) + 1;
          }
        }
        setCategoryCounts(counts);
      }
    };
    fetchCounts();
  }, []);

  // Fetch businesses for expanded category
  useEffect(() => {
    if (expandedIdx === null) {
      setDbBusinesses([]);
      return;
    }
    const category = categories[expandedIdx];
    if (!category) return;
    const catValue = labelKeyToCategoryValue[category.labelKey];
    if (!catValue) return;

    setLoadingDb(true);
    supabase
      .from("business_profiles")
      .select("id, company_name, logo_url, categories")
      .contains("categories", [catValue])
      .then(({ data }) => {
        setDbBusinesses((data as DbBusiness[]) || []);
        setLoadingDb(false);
      });
  }, [expandedIdx]);

  // Promote the Developers segment ("categories.shares" — Orascom, TMG,
  // Palm Hills, SODIC, etc.) to the first slot so users land on it first
  // when they open the grid. Original indices are preserved for downstream
  // handlers (counts, expansion, navigation).
  const developersFirstCategories = (() => {
    const indexed = categories.map((category, originalIndex) => ({ category, originalIndex }));
    const devIdx = indexed.findIndex(({ category }) => category.labelKey === "categories.shares");
    if (devIdx <= 0) return indexed;
    const [dev] = indexed.splice(devIdx, 1);
    return [dev, ...indexed];
  })();

  const filteredCategories = developersFirstCategories.map(({ category, originalIndex }) => {
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

  const handleBusinessClick = (businessId: string) => {
    navigate(`/entity/${businessId}`);
  };

  const expandedCategory = expandedIdx !== null ? categories[expandedIdx] : null;
  const expandedJourneyKey = expandedCategory ? journeyMap[expandedCategory.labelKey] || "research" : "research";
  const expandedColors = stationCircle[expandedJourneyKey];

  // Merge: show DB businesses first, then static items that aren't duplicated
  const mergedItems = expandedCategory ? (() => {
    const dbIds = new Set(dbBusinesses.map(b => b.id));
    const staticItems = expandedCategory.items.filter(item => !dbIds.has(item.id));
    return { dbBusinesses, staticItems };
  })() : { dbBusinesses: [], staticItems: [] };

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
              ({mergedItems.dbBusinesses.length + mergedItems.staticItems.length})
            </span>
          </h3>

          {loadingDb ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Real DB businesses */}
              {mergedItems.dbBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleBusinessClick(biz.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card/60 hover:border-primary/30 hover:bg-card transition-all text-start group"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={biz.logo_url || undefined} alt={biz.company_name || ""} />
                    <AvatarFallback className={cn("text-[10px] font-bold", expandedColors.bg, expandedColors.text)}>
                      {(biz.company_name || "B").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {biz.company_name || "Business"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isRTL ? "ملف تجاري مسجل" : "Registered business"}
                    </p>
                  </div>
                </button>
              ))}

              {/* Static/mock items */}
              {mergedItems.staticItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleBusinessClick(item.id)}
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

              {mergedItems.dbBusinesses.length === 0 && mergedItems.staticItems.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-6">
                  {isRTL ? "لا توجد شركات في هذه الفئة بعد" : "No businesses in this category yet"}
                </p>
              )}
            </div>
          )}
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
              const catValue = labelKeyToCategoryValue[category.labelKey] || "";
              const dbCount = categoryCounts[catValue] || 0;
              const totalCount = dbCount + category.items.length;

              return (
                <button
                  key={category.labelKey}
                  onClick={() => handleCategoryClick(originalIndex)}
                  className="flex flex-col items-center gap-1.5 w-16 md:w-18 group cursor-pointer"
                >
                  <div className="relative">
                    <div className={cn(
                      "w-14 h-14 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md [&>svg]:w-6 [&>svg]:h-6",
                      colors.bg, colors.text
                    )}>
                      {category.icon}
                    </div>
                    {/* Business count badge */}
                    <span className={cn(
                      "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 border border-background",
                      colors.bg, colors.text
                    )}>
                      {totalCount}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-medium text-foreground text-center leading-tight line-clamp-2">
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
