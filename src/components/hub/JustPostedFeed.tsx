import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Clock3, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  id: string;
  developer_id: string;
  developer_name: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

const timeAgo = (iso: string, isRTL: boolean) => {
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return isRTL ? "الآن" : "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}${isRTL ? "د" : "m"}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${isRTL ? "س" : "h"}`;
  return `${Math.floor(diff / 86400)}${isRTL ? "ي" : "d"}`;
};

export const JustPostedFeed = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, developer_id, developer_name, author_name, rating, title, comment, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5);
    setRows((data as Row[]) ?? []);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="mt-8">
      <header className="flex items-center gap-2 mb-3">
        <Clock3 className="w-5 h-5 text-primary" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {isRTL ? "نُشرت للتو" : "Just posted"}
        </h2>
        <span className="ms-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isRTL ? "مباشر" : "Live"}
        </span>
      </header>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
        {rows.map((r) => {
          const snippet = (r.title || r.comment || "").slice(0, 90);
          return (
            <Link
              key={r.id}
              to={`/entity/${r.developer_id}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < r.rating ? "fill-accent text-accent" : "text-muted"}`}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  <span className="font-semibold">{r.author_name}</span>
                  {snippet && <span className="text-muted-foreground"> — {snippet}…</span>}
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {timeAgo(r.created_at, isRTL)}
              </span>
              {r.developer_name && (
                <span className="hidden sm:inline text-[11px] font-medium text-foreground/80 shrink-0 truncate max-w-[120px]">
                  @{r.developer_name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};