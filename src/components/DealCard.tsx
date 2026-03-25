import { useState } from "react";
import { Star, Share2, Flame, Clock, Scale } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStarColorClass } from "@/lib/ratingColors";
import { DealRatingModal } from "./DealRatingModal";
import { DealVotePoll } from "./DealVotePoll";
import { DealVerdictBadge } from "./DealVerdictBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DealCardProps {
  deal: {
    id: string;
    headline: string;
    description: string;
    deal_type: string;
    tags: string[];
    status: string;
    avg_rating: number;
    rating_count: number;
    valid_until: string | null;
    created_at: string;
    price?: number | null;
    down_payment_percent?: number | null;
    business_profiles?: {
      id: string;
      company_name: string | null;
      logo_url: string | null;
      specialties: string[] | null;
    };
  };
  onRated?: () => void;
  compareMode?: boolean;
  isSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}

const dealTypeLabels: Record<string, string> = {
  payment_plan: "Payment Plan",
  discount: "Discount",
  early_access: "Early Access",
  exclusive_units: "Exclusive Units",
  other: "Other",
};

function isNew(created: string) {
  return (Date.now() - new Date(created).getTime()) < 7 * 24 * 60 * 60 * 1000;
}

function isHot(ratingCount: number) {
  return ratingCount >= 10;
}

export const DealCard = ({ deal, onRated, compareMode, isSelected, onToggleCompare }: DealCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const biz = deal.business_profiles;
  const avgRating = Number(deal.avg_rating) || 0;
  const isExpired = deal.valid_until && new Date(deal.valid_until) < new Date();
  const hot = isHot(deal.rating_count);
  const fresh = isNew(deal.created_at);

  return (
    <>
      <div
        className={`relative bg-card border rounded-xl shadow-sm p-4 space-y-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
          hot
            ? "border-orange-400/60 ring-1 ring-orange-400/20"
            : fresh
            ? "border-accent/50 ring-1 ring-accent/15"
            : "border-border"
        }`}
      >
        {/* Heat / freshness ribbon */}
        {hot && (
          <div className="absolute -top-px -right-px">
            <div className="bg-gradient-to-bl from-orange-500 to-red-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg rounded-tr-xl flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3" /> POPULAR
            </div>
          </div>
        )}
        {!hot && fresh && (
          <div className="absolute -top-px -right-px">
            <div className="bg-gradient-to-bl from-accent to-yellow-500 text-primary text-[9px] font-bold px-3 py-0.5 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
              <Clock className="w-3 h-3" /> JUST IN
            </div>
          </div>
        )}

        {/* Top row — business identity */}
        <div className="flex items-center gap-2 flex-wrap">
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            {biz?.logo_url && <AvatarImage src={biz.logo_url} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {(biz?.company_name || "B")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground leading-tight">
              {biz?.company_name || "Business"}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Submitted by business
            </span>
          </div>
          {biz?.specialties?.[0] && (
            <Badge className="bg-primary text-accent text-[10px] px-1.5 py-0 ms-auto">
              {biz.specialties[0]}
            </Badge>
          )}
          {deal.status === "verified" && (
            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-[10px] px-1.5 py-0">
              ✓ Verified
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Expired</Badge>
          )}
        </div>

        {/* Deal type pill + verdict */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-primary/30 text-primary font-medium">
            {dealTypeLabels[deal.deal_type] || deal.deal_type}
          </Badge>
          <DealVerdictBadge avgRating={avgRating} ratingCount={deal.rating_count} dealType={deal.deal_type} />
        </div>

        {/* Headline */}
        <h3 className="font-bold text-base text-foreground leading-tight">{deal.headline}</h3>

        {/* Price & Down Payment */}
        {(deal.price || deal.down_payment_percent) && (
          <div className="flex items-center gap-3 text-sm">
            {deal.price && (
              <span className="font-semibold text-foreground">{Number(deal.price).toLocaleString()} EGP</span>
            )}
            {deal.down_payment_percent && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-400/50 text-emerald-700 font-semibold">
                {Number(deal.down_payment_percent)}% Down
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? deal.description : deal.description.slice(0, 120)}
          {deal.description.length > 120 && (
            <button onClick={() => setExpanded(!expanded)} className="text-primary text-xs ms-1 font-medium">
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>

        {/* Tags */}
        {deal.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Rating row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(avgRating) ? getStarColorClass(avgRating, i) : "text-muted"}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({deal.rating_count} ratings)</span>
          {hot && (
            <span className="text-[10px] text-orange-600 font-semibold ms-1 flex items-center gap-0.5">
              <Flame className="w-3 h-3" /> Trending
            </span>
          )}
        </div>

        {/* Community poll */}
        <DealVotePoll dealId={deal.id} />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {compareMode && onToggleCompare && (
            <Button
              variant={isSelected ? "secondary" : "outline"}
              size="sm"
              className="text-xs gap-1"
              onClick={() => onToggleCompare(deal.id)}
            >
              <Scale className="w-3 h-3" />
              {isSelected ? "Selected" : "Compare"}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              setShowRating(true);
            }}
            className={`text-xs ${
              hot
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            Rate this deal
          </Button>
          {biz?.id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => navigate(`/directory`)}
            >
              View business
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 ms-auto">
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {showRating && (
        <DealRatingModal
          dealId={deal.id}
          dealHeadline={deal.headline}
          open={showRating}
          onClose={() => setShowRating(false)}
          onSuccess={() => { setShowRating(false); onRated?.(); }}
        />
      )}
    </>
  );
};