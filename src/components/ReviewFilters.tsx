import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type ReviewFilterType = "all" | "5" | "4" | "3" | "2" | "1";

interface ReviewFiltersProps {
  activeFilter: ReviewFilterType;
  onFilterChange: (filter: ReviewFilterType) => void;
}

export const ReviewFilters = ({ activeFilter, onFilterChange }: ReviewFiltersProps) => {
  const { t } = useTranslation();

  const filters: { value: ReviewFilterType; label: string }[] = [
    { value: "all", label: t("reviews.all") },
    { value: "5", label: "5 ★" },
    { value: "4", label: "4 ★" },
    { value: "3", label: "3 ★" },
    { value: "2", label: "2 ★" },
    { value: "1", label: "1 ★" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            activeFilter === filter.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
