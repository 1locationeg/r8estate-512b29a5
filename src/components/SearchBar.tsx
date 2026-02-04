import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <Search className="absolute start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("hero.searchPlaceholder")}
          className="w-full h-16 ps-14 pe-6 text-lg border-2 border-border focus:border-primary rounded-2xl shadow-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        <span className="text-sm text-muted-foreground">{t("hero.popularSearches")}</span>
        <button className="text-sm text-primary hover:underline">{t("hero.emaarProperties")}</button>
        <span className="text-muted-foreground">•</span>
        <button className="text-sm text-primary hover:underline">{t("hero.dubaiCreekHarbour")}</button>
        <span className="text-muted-foreground">•</span>
        <button className="text-sm text-primary hover:underline">{t("hero.downtownDubai")}</button>
      </div>
    </div>
  );
};
