import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Search, X } from "lucide-react";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";

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
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-12 px-4 max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 text-foreground ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-foreground">
              {isRTL ? "الفئات" : "Categories"}
            </h1>
          </div>
          <div className="w-8" />
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3 max-w-5xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث عن فئة أو شركة..." : "Search categories or businesses..."}
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              dir={isRTL ? "rtl" : "ltr"}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
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
