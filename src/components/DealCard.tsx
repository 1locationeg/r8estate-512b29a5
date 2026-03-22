import { useState } from "react";
import { Star, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStarColorClass } from "@/lib/ratingColors";
import { DealRatingModal } from "./DealRatingModal";
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
    business_profiles?: {
      id: string;
      company_name: string | null;
      logo_url: string | null;
      specialties: string[] | null;
    };
  };
  onRated?: () => void;
}

const dealTypeLabels: Record<string, string> = {
  payment_plan: "Payment Plan",
  discount: "Discount",
  early_access: "Early Access",
  exclusive_units: "Exclusive Units",
  other: "Other",
};

export const DealCard = ({ deal, onRated }: DealCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const biz = deal.business_profiles;
  const avgRating = Number(deal.avg_rating) || 0;
  const isExpired = deal.valid_until && new Date(deal.valid_until) < new Date();

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Avatar className="h-8 w-8">
            {biz?.logo_url && <AvatarImage src={biz.logo_url} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {(biz?.company_name || "B")[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm text-foreground">{biz?.company_name || "Business"}</span>
          {biz?.specialties?.[0] && (
            <Badge className="bg-primary text-accent text-[10px] px-1.5 py-0">
              {biz.specialties[0]}
            </Badge>
          )}
          <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent text-[10px] px-1.5 py-0">
            Submitted by business
          </Badge>
          {deal.status === "verified" && (
            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-[10px] px-1.5 py-0">
              Verified
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Expired</Badge>
          )}
        </div>

        {/* Headline */}
        <h3 className="font-bold text-base text-foreground leading-tight">{deal.headline}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? deal.description : deal.description.slice(0, 120)}
          {deal.description.length > 120 && (
            <button onClick={() => setExpanded(!expanded)} className="text-primary text-xs ml-1 font-medium">
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              setShowRating(true);
            }}
            className="bg-primary text-primary-foreground text-xs"
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
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto">
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
