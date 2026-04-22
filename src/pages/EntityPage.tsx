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
import { EntityMeta } from "@/components/EntityMeta";
import { EntityJsonLd } from "@/components/EntityJsonLd";
import { AlphaReportModal } from "@/components/AlphaReportModal";
import { HighStakesReviewBanner } from "@/components/HighStakesReviewBanner";

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
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [topReviews, setTopReviews] = useState<Array<{ author_name: string; rating: number; comment: string | null; created_at: string }>>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Track entity/detail view for corridor progress (zone 2)
    window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 2, action: "detail_click" } }));
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
        .select('id, company_name, location, logo_url, cover_image_url, website, specialties, year_established, description, categories')
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

  // Fetch top reviews + last_updated for SEO/JSON-LD
  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const [{ data: reviewData }, { data: bizData }] = await Promise.all([
        supabase
          .from("reviews")
          .select("author_name, rating, comment, created_at")
          .eq("developer_id", id)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("public_business_profiles")
          .select("updated_at")
          .eq("id", id)
          .maybeSingle(),
      ]);
      if (!active) return;
      if (reviewData) setTopReviews(reviewData);
      if (bizData?.updated_at) setLastUpdated(bizData.updated_at);
      else setLastUpdated(new Date().toISOString());
    })();
    return () => {
      active = false;
    };
  }, [id]);

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
      {entity && <EntityMeta entity={entity} lastUpdated={lastUpdated} />}
      {entity && <EntityJsonLd entity={entity} reviews={topReviews} />}
      <PageHeader
        title={entity.name}
        breadcrumbs={[
          { label: isRTL ? "الدليل" : "Directory", path: "/directory" },
          { label: entity.name },
        ]}
      />

      {/* Entity Detail */}
      <article itemScope itemType="https://schema.org/Organization">
        <meta itemProp="name" content={entity.name} />
        {entity.image && <meta itemProp="logo" content={entity.image} />}
        <ItemDetailSection
          item={entity}
          onClose={() => navigate(-1)}
        />

        {/* High-Stakes loss-framed review CTA (shows after 3 views without a review) */}
        <HighStakesReviewBanner
          developerId={entity.id}
          developerName={entity.name}
          entityCategory={entity.category}
        />

        {/* Alpha Report lead-gen + freshness signal */}
        <section aria-label="alpha-report" className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                {isRTL ? `تقرير ألفا الكامل لـ ${entity.name}` : `Full Alpha Report for ${entity.name}`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "تحليل شامل من 12 صفحة: السجل القانوني، تاريخ التسليم، القوة المالية، ومقارنة بالمنافسين."
                  : "A 12-page deep-dive: legal record, delivery history, financial strength, and competitor benchmark."}
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-2">
                  <time dateTime={lastUpdated}>
                    {isRTL ? "آخر تحديث: " : "Last updated: "}
                    {new Date(lastUpdated).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </p>
              )}
            </div>
            <AlphaReportModal entityId={entity.id} entityName={entity.name} />
          </div>
        </section>
      </article>
    </StationPageWrapper>
  );
};

export default EntityPage;
