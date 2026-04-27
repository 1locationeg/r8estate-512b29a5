import { useTranslation } from "react-i18next";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HubFiltersState, HubMinRating, HubSort } from "@/hooks/useHubFilters";

interface Props {
  filters: HubFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<HubFiltersState>>;
  isDirty: boolean;
  reset: () => void;
  /** When true, removes the sticky positioning (e.g. inside a Sheet). */
  embedded?: boolean;
}

export const HubFiltersSidebar = ({ filters, setFilters, isDirty, reset, embedded = false }: Props) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const t = (en: string, ar: string) => (isRTL ? ar : en);

  return (
    <aside
      className={
        embedded
          ? "w-full"
          : "hidden md:block w-64 shrink-0 sticky top-20 self-start"
      }
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("Filters", "الفلاتر")}
            </h3>
          </div>
          {isDirty && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              {t("Reset", "إعادة")}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <FieldGroup label={t("Sort by", "الترتيب حسب")}>
            <Select
              value={filters.sort}
              onValueChange={(v) => setFilters((s) => ({ ...s, sort: v as HubSort }))}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("Newest", "الأحدث")}</SelectItem>
                <SelectItem value="highest">{t("Highest rated", "الأعلى تقييماً")}</SelectItem>
                <SelectItem value="helpful">{t("Most helpful", "الأكثر فائدة")}</SelectItem>
                <SelectItem value="trending">{t("Trending", "الأكثر رواجاً")}</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label={t("Minimum rating", "أقل تقييم")}>
            <Select
              value={String(filters.minRating)}
              onValueChange={(v) => setFilters((s) => ({ ...s, minRating: Number(v) as HubMinRating }))}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("All ratings", "كل التقييمات")}</SelectItem>
                <SelectItem value="5">{t("5 stars only", "5 نجوم فقط")}</SelectItem>
                <SelectItem value="4">{t("4 stars & up", "4 نجوم فأكثر")}</SelectItem>
                <SelectItem value="3">{t("3 stars & up", "3 نجوم فأكثر")}</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label={t("Verified buyers", "المشترون الموثّقون")}>
            <Select
              value={filters.verifiedOnly ? "yes" : "all"}
              onValueChange={(v) => setFilters((s) => ({ ...s, verifiedOnly: v === "yes" }))}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All reviews", "كل المراجعات")}</SelectItem>
                <SelectItem value="yes">{t("Verified only", "الموثّقة فقط")}</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>
      </div>
    </aside>
  );
};

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
      {label}
    </label>
    {children}
  </div>
);