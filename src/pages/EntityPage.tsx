import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemDetailSection } from "@/components/ItemDetailSection";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { getSearchIndex, type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { categories } from "@/components/HeroCategoryItems";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useBusinessLogo } from "@/contexts/BusinessLogoContext";
import { supabase } from "@/integrations/supabase/client";
import { mapPublicBusinessProfileToSearchItem } from "@/lib/businessProfileSearch";

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
  const { getLogoOverride } = useBusinessLogo();
  const [remoteEntity, setRemoteEntity] = useState<SearchItem | null>(null);
  const [isRemoteLoading, setIsRemoteLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const logoOverride = id ? getLogoOverride(id) : null;

  const staticEntity = useMemo((): SearchItem | null => {
    if (!id) return null;

    // First check the search index
    const searchIndex = getSearchIndex();
    const fromIndex = searchIndex.find(si => si.id === id);
    if (fromIndex) {
      if (logoOverride) return { ...fromIndex, image: logoOverride };
      return fromIndex;
    }

    // Then check all category items
    for (const cat of categories) {
      const item = cat.items.find(i => i.id === id);
      if (item) {
        return {
          id: item.id,
          name: isRTL ? item.nameAr : item.nameEn,
          category: categoryToSearchCategory(cat.labelKey),
          subtitle: t(cat.labelKey),
          image: logoOverride || item.avatar,
          rating: item.rating,
          reviewCount: item.reviewCount,
          meta: {
            likes: item.likes,
            shares: item.shares,
            replies: item.replies,
            trendScore: item.trendScore,
            launchDate: item.launchDate,
          },
        };
      }
    }

    return null;
  }, [id, isRTL, t, logoOverride]);

  useEffect(() => {
    if (!id || staticEntity) {
      setRemoteEntity(null);
      setIsRemoteLoading(false);
      return;
    }

    let isActive = true;

    const loadRemoteEntity = async () => {
      setIsRemoteLoading(true);

      const { data, error } = await supabase
        .from('public_business_profiles')
        .select('id, company_name, location, logo_url, website, specialties, year_established, description')
        .eq('id', id)
        .maybeSingle();

      if (!isActive) return;

      if (error || !data) {
        setRemoteEntity(null);
        setIsRemoteLoading(false);
        return;
      }

      const mapped = mapPublicBusinessProfileToSearchItem(data);
      setRemoteEntity(logoOverride ? { ...mapped, image: logoOverride } : mapped);
      setIsRemoteLoading(false);
    };

    void loadRemoteEntity();

    return () => {
      isActive = false;
    };
  }, [id, staticEntity, logoOverride]);

  const entity = staticEntity || remoteEntity;

  if (!entity && isRemoteLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {isRTL ? "جارٍ تحميل الصفحة..." : "Loading business page..."}
        </p>
      </div>
    );
  }

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
    <StationPageWrapper className="min-h-screen bg-background pb-20">
      <PageHeader
        title={entity.name}
        breadcrumbs={[
          { label: isRTL ? "الدليل" : "Directory", path: "/directory" },
          { label: entity.name },
        ]}
      />

      {/* Entity Detail */}
      <ItemDetailSection
        item={entity}
        onClose={() => navigate(-1)}
      />
    </StationPageWrapper>
  );
};

export default EntityPage;
