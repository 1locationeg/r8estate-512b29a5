import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Minus, TrendingDown, Star, FileDown, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessLogo } from "@/contexts/BusinessLogoContext";
import { supabase } from "@/integrations/supabase/client";
import { developers, type Developer } from "@/data/mockData";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { useStartChat } from "@/hooks/useStartChat";
import type { SearchItem } from "@/data/searchIndex";
import type { CommunityPost } from "@/hooks/useCommunity";

interface Props {
  post: CommunityPost;
}

function findMentionedDeveloper(text: string): Developer | null {
  const lower = text.toLowerCase();
  const normalized = lower.replace(/@/g, "");

  // Extract @mentions
  const mentions = Array.from(lower.matchAll(/@([a-z0-9-_.]+)/gi), (m) => m[1].toLowerCase());

  for (const dev of developers) {
    const words = dev.name.toLowerCase().split(/\s+/).filter(Boolean);
    const firstWord = words[0];
    const aliases = new Set<string>([
      dev.id.toLowerCase(),
      dev.id.toLowerCase().replace(/-/g, " "),
      firstWord,
      ...words,
    ]);

    // Multi-word phrase match (e.g. "palm hills")
    if (words.length >= 2) {
      for (let i = 0; i <= words.length - 2; i++) {
        const phrase = words.slice(i, i + 2).join(" ");
        if (normalized.includes(phrase)) return dev;
      }
    }

    // Single alias word-boundary match in plain text (catches "emaar" without @)
    for (const alias of aliases) {
      if (alias.length < 3) continue; // skip very short aliases
      try {
        const regex = new RegExp(`\\b${alias}\\b`, "i");
        if (regex.test(normalized)) return dev;
      } catch {
        if (normalized.includes(alias)) return dev;
      }
    }

    // @mention match
    if (mentions.some((mention) => aliases.has(mention))) return dev;
    if (normalized.includes(dev.id)) return dev;
  }

  return null;
}

function getSentiment(score: number): "rising" | "stable" | "declining" {
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
  const navigate = useNavigate();
  const { getLogoOverride } = useBusinessLogo();
  const { startChatWithBusinessId } = useStartChat();
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState<boolean | null>(null);

  const matchedDev = useMemo(
    () => findMentionedDeveloper(`${post.title} ${post.body}`),
    [post.title, post.body]
  );

  useEffect(() => {
    if (!user || role !== "buyer" || !matchedDev) {
      setIsVerifiedBuyer(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      supabase
        .from("receipt_submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(1),
      supabase
        .from("reviewer_verifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(1),
    ]).then(([receipts, verifications]) => {
      if (!cancelled) {
        const has = (receipts.data?.length ?? 0) > 0 || (verifications.data?.length ?? 0) > 0;
        setIsVerifiedBuyer(has);
      }
    });
    return () => { cancelled = true; };
  }, [user, role, matchedDev]);

  if (!matchedDev) return null;

  const sentiment = getSentiment(matchedDev.sentimentScore);
  const cfg = sentimentConfig[sentiment];
  const SentimentIcon = cfg.icon;
  const logoOverride = getLogoOverride(matchedDev.id, matchedDev.name);
  const logo = logoOverride || matchedDev.logo;

  const handleDownload = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    supabase
      .from("widget_analytics")
      .insert({
        widget_id: "00000000-0000-0000-0000-000000000000",
        embed_token: `dev_${matchedDev.id}`,
        event_type: "bridge_click",
        referrer_url: `/community?post=${post.id}`,
      })
      .then(() => {});

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

  const handleMessage = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    startChatWithBusinessId(matchedDev.id);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-xl p-3 sm:p-4 space-y-2.5 shadow-lg mt-2">
      {isVerifiedBuyer && (
        <div className="absolute top-2 end-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span>{t("community.bridgeVerifiedOnly", "Verified buyer")}</span>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <img
          src={logo}
          alt={matchedDev.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain bg-background/50 p-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {matchedDev.name}
          </p>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
            <span>{t("community.bridgeTrustScore", "Trust Score")}</span>
            <span className="font-bold text-foreground">{matchedDev.trustScore}%</span>
            <div className="flex items-center gap-0.5 ms-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.round(matchedDev.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
          <SentimentIcon className="w-3 h-3" />
          <span className="hidden xs:inline">
            {sentiment === "rising" && t("community.bridgeSentimentRising", "Rising")}
            {sentiment === "stable" && t("community.bridgeSentimentStable", "Stable")}
            {sentiment === "declining" && t("community.bridgeSentimentDeclining", "Declining")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[11px] sm:text-xs border-primary/30 hover:bg-primary/10 h-8 sm:h-9 px-2 sm:px-3"
          onClick={handleDownload}
        >
          <FileDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="truncate">{t("community.bridgeDownloadReport", "Download Report")}</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[11px] sm:text-xs border-primary/30 hover:bg-primary/10 h-8 sm:h-9 px-2 sm:px-3"
          onClick={handleMessage}
        >
          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="truncate">{t("community.bridgeMessageBusiness", "Message Business")}</span>
        </Button>
      </div>
    </div>
  );
}
