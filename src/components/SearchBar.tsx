import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export const SearchBar = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("hero.searchPlaceholder")}
          className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-card border border-border rounded-xl text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 md:mt-4 text-xs md:text-sm">
        <span className="text-muted-foreground">{t("hero.popularSearches")}</span>
        <button className="px-2 md:px-3 py-1 bg-secondary rounded-full text-foreground hover:bg-secondary/80 transition-colors">
          {t("hero.emaarProperties")}
        </button>
        <button className="px-2 md:px-3 py-1 bg-secondary rounded-full text-foreground hover:bg-secondary/80 transition-colors">
          {t("hero.dubaiCreekHarbour")}
        </button>
        <button className="hidden sm:inline-block px-2 md:px-3 py-1 bg-secondary rounded-full text-foreground hover:bg-secondary/80 transition-colors">
          {t("hero.downtownDubai")}
        </button>
      </div>
    </div>
  );
};
