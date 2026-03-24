import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";

const Categories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";

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
      </div>

      {/* Grid */}
      <BrowseCategoriesGrid
        onSelectCategory={handleSelectCategory}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
};

export default Categories;
