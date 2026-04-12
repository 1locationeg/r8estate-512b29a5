import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Lightbulb, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function SiteExperienceFeedback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value: number) => {
    setRating(value);
    setSubmitted(true);
    toast({ title: t("siteFeedback.thankYou") });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center flex flex-col items-center gap-4">
      {/* Badge */}
      <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 border-primary/30 text-primary">
        <Star className="w-3 h-3 fill-primary" />
        {t("siteFeedback.badge")}
      </Badge>

      {/* Headline */}
      <h2 className="text-lg md:text-xl font-semibold italic text-foreground max-w-md">
        {t("siteFeedback.headline")}
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t("siteFeedback.subtitle")}
      </p>

      {/* Stars */}
      <div className="flex gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            disabled={submitted}
            className="transition-transform hover:scale-110 disabled:cursor-default"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoveredStar || rating)
                  ? "fill-[hsl(var(--coin))] text-[hsl(var(--coin))]"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <Button size="sm" onClick={() => navigate("/contact")} className="gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5" />
          {t("siteFeedback.foundIt")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/contact")} className="gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          {t("siteFeedback.suggest")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/contact")} className="gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {t("siteFeedback.reportIssue")}
        </Button>
      </div>

      {/* Footnote */}
      <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-xs">
        {t("siteFeedback.footnote")}
      </p>
    </div>
  );
}
