import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { ItemDetailSection } from "@/components/ItemDetailSection";
import { getSearchIndex, type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { categories } from "@/components/HeroCategoryItems";
import { Button } from "@/components/ui/button";

const categoryToSearchCategory = (labelKey: string): SearchCategory => {
  const map: Record<string, SearchCategory> = {
    'categories.units': 'units',
    'categories.apps': 'apps',
    'categories.shares': 'developers',
    'categories.platforms': 'apps',
    'categories.brokers': 'brokers',
    'categories.exhibitions': 'categories',
    'categories.channels': 'categories',
    'categories.lawFirms': 'categories',
  };
  return map[labelKey] || 'categories';
};

const EntityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const entity = useMemo((): SearchItem | null => {
    if (!id) return null;

    // First check the search index
    const searchIndex = getSearchIndex();
    const fromIndex = searchIndex.find(si => si.id === id);
    if (fromIndex) return fromIndex;

    // Then check all category items
    for (const cat of categories) {
      const item = cat.items.find(i => i.id === id);
      if (item) {
        return {
          id: item.id,
          name: isRTL ? item.nameAr : item.nameEn,
          category: categoryToSearchCategory(cat.labelKey),
          subtitle: t(cat.labelKey),
          image: item.avatar,
          rating: item.rating,
          reviewCount: item.reviewCount,
        };
      }
    }

    return null;
  }, [id, isRTL, t]);

  if (!entity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold text-foreground">
          {isRTL ? "غير موجود" : "Not Found"}
        </h1>
        <p className="text-muted-foreground text-center">
          {isRTL ? "لم يتم العثور على هذا الكيان" : "This entity could not be found"}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 me-2" />
          {isRTL ? "رجوع" : "Go Back"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground truncate">
          {entity.name}
        </h1>
      </div>

      {/* Entity Detail */}
      <ItemDetailSection
        item={entity}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default EntityPage;
