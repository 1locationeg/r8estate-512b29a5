import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Flame, Star, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HubFiltersState } from "@/hooks/useHubFilters";

interface ReviewRow {
  id: string;
  developer_id: string;
  developer_name: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Props {
  filters: HubFiltersState;
  search: string;
}

export const TrendingReviewsGrid = ({ filters, search }: Props) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [rows, setRows] = useState<ReviewRow[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let q = supabase
        .from("reviews")
        .select("id, developer_id, developer_name, author_name, rating, title, comment, is_verified, created_at")
        .eq("status", "approved");

      if (filters.minRating > 0) q = q.gte("rating", filters.minRating);
      if (filters.verifiedOnly) q = q.eq("is_verified", true);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`title.ilike.${s},comment.ilike.${s},developer_name.ilike.${s},author_name.ilike.${s}`);
      }

      if (filters.sort === "highest") q = q.order("rating", { ascending: false }).order("created_at", { ascending: false });
      else q = q.order("created_at", { ascending: false });

      const { data } = await q.limit(6);
      if (mounted) setRows((data as ReviewRow[]) ?? []);
    })();
    return () => {
      mounted = false;
    };
  }, [filters.sort, filters.minRating, filters.verifiedOnly, search]);

  return (
    <section className="mt-8">
      <header className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {isRTL ? "الأكثر رواجاً الآن" : "Trending now"}
        </h2>
      </header>

      {rows === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {isRTL ? "لا توجد مراجعات تطابق الفلاتر" : "No reviews match these filters"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((r) => (
            <Tile key={r.id} review={r} isRTL={isRTL} />
          ))}
        </div>
      )}
    </section>
  );
};

const Tile = ({ review, isRTL }: { review: ReviewRow; isRTL: boolean }) => (
  <Link
    to={`/entity/${review.developer_id}`}
    className="group block rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-muted"}`}
          />
        ))}
      </div>
      {review.is_verified && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
          <ShieldCheck className="w-3 h-3" />
          {isRTL ? "موثّق" : "Verified"}
        </span>
      )}
    </div>
    {review.title && (
      <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {review.title}
      </h3>
    )}
    {review.comment && (
      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{review.comment}</p>
    )}
    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
      <span className="truncate">{review.author_name}</span>
      {review.developer_name && (
        <span className="truncate font-medium text-foreground/80 ms-2">@{review.developer_name}</span>
      )}
    </div>
  </Link>
);