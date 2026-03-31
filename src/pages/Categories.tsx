import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";

const Categories = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";
  const [search, setSearch] = useState("");

  const handleSelectCategory = (categoryIndex: number) => {
    navigate("/", { state: { scrollToCategory: categoryIndex } });
  };

  const handleSelectItem = (item: { id: string; nameEn: string; nameAr: string }) => {
    navigate("/", { state: { openItemId: item.id, openItemName: isRTL ? item.nameAr : item.nameEn } });
  };

  return (
    <StationPageWrapper className="min-h-screen bg-background pb-16">
      <PageHeader
        title={isRTL ? "الفئات" : "Categories"}
        breadcrumbs={[{ label: isRTL ? "الفئات" : "Categories" }]}
      />

      {/* Search bar */}
      <div className="px-4 pb-3 max-w-5xl mx-auto pt-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث عن فئة أو شركة..." : "Search categories or businesses..."}
            className="w-full h-9 ps-9 pe-8 rounded-lg border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            dir={isRTL ? "rtl" : "ltr"}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <BrowseCategoriesGrid
        onSelectCategory={handleSelectCategory}
        onSelectItem={handleSelectItem}
        searchQuery={search}
      />
    </div>
  );
};

export default Categories;
