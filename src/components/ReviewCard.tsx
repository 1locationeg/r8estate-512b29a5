import { useTranslation } from "react-i18next";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { Review, developers } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { getStarColorClass } from "@/lib/ratingColors";

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const { t, i18n } = useTranslation();
  const developer = developers.find((d) => d.id === review.developerId);

  return (
    <Card className="p-4 md:p-6 border-border hover:border-primary/50 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 md:mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 md:mb-1">
            <span className="font-semibold text-foreground text-sm md:text-base truncate">{review.author}</span>
            {review.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-verified fill-verified flex-shrink-0" />
            )}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground truncate">
            {review.project} • {developer?.name}
          </div>
        </div>
        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${getStarColorClass(review.rating, i)}`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs md:text-sm text-foreground leading-relaxed mb-2 md:mb-3 line-clamp-3">{review.comment}</p>
      <div className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3">
        {new Date(review.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-AE' : 'en-US', {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      {/* Developer Reply */}
      {review.developerReply && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
          <div className="flex items-start gap-2 md:gap-3 bg-secondary/50 rounded-lg p-3 md:p-4">
            <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                <span className="text-xs md:text-sm font-semibold text-foreground truncate">
                  {review.developerReply.author}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {new Date(review.developerReply.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-AE' : 'en-US', {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {review.developerReply.comment}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
