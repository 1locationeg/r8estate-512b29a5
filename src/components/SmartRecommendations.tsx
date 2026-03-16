import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Star, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { developers, Developer } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface SmartRecommendationsProps {
  onSelectDeveloper: (developerId: string) => void;
}

export const SmartRecommendations = ({ onSelectDeveloper }: SmartRecommendationsProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recommended, setRecommended] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        // For non-authenticated users, show top-rated developers
        const topRated = [...developers].sort((a, b) => b.trustScore - a.trustScore).slice(0, 4);
        setRecommended(topRated);
        const reasons: Record<string, string> = {};
        topRated.forEach((d) => { reasons[d.id] = "Top rated"; });
        setReason(reasons);
        setLoading(false);
        return;
      }

      try {
        // Fetch user interests to power recommendations
        const [interestsRes, savedRes, followedRes] = await Promise.all([
          supabase.from("user_interests").select("entity_id, entity_name, strength").eq("user_id", user.id).order("strength", { ascending: false }).limit(20),
          supabase.from("saved_items").select("item_id, item_name").eq("user_id", user.id).limit(20),
          supabase.from("followed_businesses").select("business_id, business_name").eq("user_id", user.id).limit(20),
        ]);

        const interactedIds = new Set<string>();
        const reasons: Record<string, string> = {};

        // Collect all interacted entity IDs
        interestsRes.data?.forEach((i) => interactedIds.add(i.entity_id));
        savedRes.data?.forEach((s) => interactedIds.add(s.item_id));
        followedRes.data?.forEach((f) => interactedIds.add(f.business_id));

        // Score developers based on similarity to interests
        const scored = developers.map((dev) => {
          let score = 0;
          let why = "";

          // If already interacted, deprioritize (they already know this developer)
          if (interactedIds.has(dev.id)) {
            score -= 5;
          }

          // Specialty matching with user's interests
          const interestNames = [
            ...(interestsRes.data?.map((i) => i.entity_name?.toLowerCase() || "") || []),
            ...(savedRes.data?.map((s) => s.item_name?.toLowerCase() || "") || []),
          ];

          dev.specialties?.forEach((spec) => {
            const specLower = spec.toLowerCase();
            if (interestNames.some((n) => n.includes(specLower) || specLower.includes(n))) {
              score += 3;
              why = `Similar to your interests`;
            }
          });

          // Trust score bonus
          score += dev.trustScore / 25;
          if (!why) {
            if (dev.trustScore >= 90) why = "Highly trusted";
            else if (dev.reviewCount > 500) why = "Popular choice";
            else why = "Rising developer";
          }

          return { dev, score, why };
        });

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, 4);
        setRecommended(top.map((t) => t.dev));
        top.forEach((t) => { reasons[t.dev.id] = t.why; });
        setReason(reasons);
      } catch {
        // Fallback to top-rated
        const topRated = [...developers].sort((a, b) => b.trustScore - a.trustScore).slice(0, 4);
        setRecommended(topRated);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading || recommended.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          {user ? "Recommended For You" : "Top Developers"}
        </h3>
        <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20">
          AI
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {recommended.map((dev) => (
          <Card
            key={dev.id}
            className="p-3 cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => onSelectDeveloper(dev.id)}
          >
            <div className="flex items-start gap-2.5">
              <img
                src={dev.logo}
                alt={dev.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {dev.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-[10px] font-medium text-foreground">{dev.rating}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({dev.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-2.5 h-2.5 text-trust-excellent" />
                  <span className="text-[9px] text-muted-foreground">
                    {reason[dev.id] || "Recommended"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end mt-1.5">
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
