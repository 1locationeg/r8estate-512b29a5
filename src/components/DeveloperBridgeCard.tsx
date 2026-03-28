import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, Minus, TrendingDown, Star, FileDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessLogo } from "@/contexts/BusinessLogoContext";
import { supabase } from "@/integrations/supabase/client";
import { developers, type Developer } from "@/data/mockData";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import type { SearchItem } from "@/data/searchIndex";
import type { CommunityPost } from "@/hooks/useCommunity";

interface Props {
  post: CommunityPost;
}

/** Match developer names (≥2 consecutive words) in post text.
 *  Also strips @mentions so "@palm hills" matches "Palm Hills Developments". */
function findMentionedDeveloper(text: string): Developer | null {
  // Normalize: lowercase + strip @ symbols so "@palm hills" becomes "palm hills"
  const lower = text.toLowerCase().replace(/@/g, "");
  for (const dev of developers) {
    const words = dev.name.toLowerCase().split(/\s+/);
    if (words.length >= 2) {
      // Check if 2+ consecutive words appear
      for (let i = 0; i <= words.length - 2; i++) {
        const phrase = words.slice(i, i + 2).join(" ");
        if (lower.includes(phrase)) return dev;
      }
    }
    // Single-word developer names: exact word boundary match
    if (words.length === 1) {
      const regex = new RegExp(`\\b${words[0]}\\b`, "i");
      if (regex.test(lower)) return dev;
    }
  }
  // Also check developer id (slug) mentions like @palm-hills
  const slugified = text.toLowerCase().replace(/@/g, "");
  for (const dev of developers) {
    if (slugified.includes(dev.id)) return dev;
  }
  return null;
}

function getSentiment(score: number): "rising" | "stable" | "declining" {
  // sentimentScore is 0-10 scale in mock data; normalize to 0-100
  const normalized = score <= 10 ? score * 10 : score;
  if (normalized >= 75) return "rising";
  if (normalized >= 50) return "stable";
  return "declining";
}

const sentimentConfig = {
  rising: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  stable: { icon: Minus, color: "text-amber-500", bg: "bg-amber-500/10" },
  declining: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
};

export function DeveloperBridgeCard({ post }: Props) {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const { getLogoOverride } = useBusinessLogo();
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState<boolean | null>(null);

  // Find mentioned developer
  const matchedDev = useMemo(
    () => findMentionedDeveloper(`${post.title} ${post.body}`),
    [post.title, post.body]
  );

  // Check verified buyer status (only if buyer role + dev matched)
  useEffect(() => {
    if (!user || role !== "buyer" || !matchedDev) {
      setIsVerifiedBuyer(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("receipt_submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) setIsVerifiedBuyer((data?.length ?? 0) > 0);
      });
    return () => { cancelled = true; };
  }, [user, role, matchedDev]);

  if (!matchedDev || !isVerifiedBuyer) return null;

  const sentiment = getSentiment(matchedDev.sentimentScore);
  const cfg = sentimentConfig[sentiment];
  const SentimentIcon = cfg.icon;
  const logoOverride = getLogoOverride(matchedDev.id, matchedDev.name);
  const logo = logoOverride || matchedDev.logo;

  const handleDownload = () => {
    // Track analytics
    supabase
      .from("widget_analytics")
      .insert({
        widget_id: "00000000-0000-0000-0000-000000000000",
        embed_token: `dev_${matchedDev.id}`,
        event_type: "bridge_click",
        referrer_url: `/community?post=${post.id}`,
      })
      .then(() => {});

    // Build SearchItem for report
    const item: SearchItem = {
      id: matchedDev.id,
      name: matchedDev.name,
      category: "developers",
      subtitle: matchedDev.location,
      image: matchedDev.logo,
      rating: matchedDev.rating,
      reviewCount: matchedDev.reviewCount,
      meta: {
        trustScore: matchedDev.trustScore,
        verified: matchedDev.verified,
        projectsCompleted: matchedDev.projectsCompleted,
        location: matchedDev.location,
        specialties: matchedDev.specialties,
      },
    };
    downloadTrustReport(item);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 space-y-3 shadow-lg">
      {/* Verified badge */}
      <div className="absolute top-2 end-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <ShieldCheck className="w-3 h-3 text-primary" />
        <span>{t("community.bridgeVerifiedOnly", "Verified buyers only")}</span>
      </div>

      {/* Header: logo + name + trust score */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt={matchedDev.name}
          className="w-10 h-10 rounded-lg object-contain bg-background/50 p-1"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {matchedDev.name}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{t("community.bridgeTrustScore", "Trust Score")}</span>
            <span className="font-bold text-foreground">{matchedDev.trustScore}%</span>
            <div className="flex items-center gap-0.5 ms-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(matchedDev.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
          <SentimentIcon className="w-3 h-3" />
          <span>
            {sentiment === "rising" && t("community.bridgeSentimentRising", "Rising")}
            {sentiment === "stable" && t("community.bridgeSentimentStable", "Stable")}
            {sentiment === "declining" && t("community.bridgeSentimentDeclining", "Declining")}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-2 text-xs border-primary/30 hover:bg-primary/10"
        onClick={handleDownload}
      >
        <FileDown className="w-3.5 h-3.5" />
        {t("community.bridgeDownloadReport", "Download Buyer Report for {{name}}", { name: matchedDev.name })}
      </Button>
    </div>
  );
}
