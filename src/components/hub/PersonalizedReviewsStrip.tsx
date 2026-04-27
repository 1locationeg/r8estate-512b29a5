import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Row {
  id: string;
  developer_id: string;
  developer_name: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
}

const readInterests = (): string[] => {
  try {
    const raw = localStorage.getItem("r8_tracked_interests");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    if (parsed && typeof parsed === "object") return Object.keys(parsed);
  } catch {}
  return [];
};

export const PersonalizedReviewsStrip = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.dir() === "rtl";
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let mounted = true;
    const interests = readInterests();
    if (!user && interests.length === 0) {
      setRows([]);
      return;
    }
    (async () => {
      let q = supabase
        .from("reviews")
        .select("id, developer_id, developer_name, author_name, rating, title, comment")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(8);
      if (interests.length > 0) {
        q = q.in("developer_id", interests);
      }
      const { data } = await q;
      if (mounted) setRows((data as Row[]) ?? []);
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (rows.length === 0) return null;

  return (
    <section className="mt-2">
      <header className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {isRTL ? "مختار لك" : "For you"}
        </h2>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {rows.map((r) => (
          <Link
            key={r.id}
            to={`/entity/${r.developer_id}`}
            className="snap-start shrink-0 w-64 rounded-2xl border border-border bg-card p-3 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < r.rating ? "fill-accent text-accent" : "text-muted"}`}
                />
              ))}
            </div>
            {r.title && (
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{r.title}</h3>
            )}
            {r.comment && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{r.comment}</p>
            )}
            {r.developer_name && (
              <span className="text-[11px] font-medium text-foreground/80">@{r.developer_name}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};