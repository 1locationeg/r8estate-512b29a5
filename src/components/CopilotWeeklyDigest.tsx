import { useEffect, useState } from "react";
import { Newspaper, TrendingUp, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const CopilotWeeklyDigest = () => {
  const [stats, setStats] = useState({ reviews: 0, businesses: 0, launches: 0 });

  useEffect(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const fetch = async () => {
      const [rev, biz, launch] = await Promise.all([
        supabase.from("reviews").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("business_profiles").select("id", { count: "exact", head: true }),
        supabase.from("launches").select("id", { count: "exact", head: true }).eq("status", "reservations_open"),
      ]);
      setStats({
        reviews: rev.count || 0,
        businesses: biz.count || 0,
        launches: launch.count || 0,
      });
    };
    fetch();
  }, []);

  const items = [
    { icon: TrendingUp, label: "Reviews this week", value: stats.reviews },
    { icon: Building2, label: "Listed companies", value: stats.businesses },
    { icon: Users, label: "Active launches", value: stats.launches },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Weekly Digest</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
