import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useHubFilters } from "@/hooks/useHubFilters";
import { HubHeroBand } from "@/components/hub/HubHeroBand";
import { HubFiltersSidebar } from "@/components/hub/HubFiltersSidebar";
import { PersonalizedReviewsStrip } from "@/components/hub/PersonalizedReviewsStrip";
import { TrendingReviewsGrid } from "@/components/hub/TrendingReviewsGrid";
import { JustPostedFeed } from "@/components/hub/JustPostedFeed";
import { WriteReviewCtaStrip } from "@/components/hub/WriteReviewCtaStrip";

const Categories = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [search, setSearch] = useState("");
  const { filters, setFilters, reset, isDirty } = useHubFilters();

  return (
    <StationPageWrapper className="min-h-screen bg-background pb-16">
      <HubHeroBand search={search} onSearchChange={setSearch} />

      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Mobile filters trigger */}
        <div className="md:hidden mb-4 flex justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <SlidersHorizontal className="w-4 h-4 me-2" />
                {isRTL ? "الفلاتر" : "Filters"}
                {isDirty && <span className="ms-2 w-2 h-2 rounded-full bg-primary" />}
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80">
              <div className="pt-6">
                <HubFiltersSidebar
                  filters={filters}
                  setFilters={setFilters}
                  isDirty={isDirty}
                  reset={reset}
                  embedded
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6 items-start">
          <HubFiltersSidebar
            filters={filters}
            setFilters={setFilters}
            isDirty={isDirty}
            reset={reset}
          />

          <div className="flex-1 min-w-0">
            <PersonalizedReviewsStrip />
            <TrendingReviewsGrid filters={filters} search={search} />
            <JustPostedFeed />

            {/* Browse by category — demoted */}
            <section className="mt-10">
              <header className="mb-3">
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  {isRTL ? "أو تصفّح كل الفئات" : "Or browse all categories"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL ? "18 قطاعاً — ابدأ بالمطورين" : "18 segments — start with Developers"}
                </p>
              </header>
              <BrowseCategoriesGrid searchQuery={search} />
            </section>

            <WriteReviewCtaStrip />
          </div>
        </div>
      </div>
    </StationPageWrapper>
  );
};

export default Categories;
