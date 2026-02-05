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
    <Card className="p-6 border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{review.author}</span>
            {review.verified && (
              <CheckCircle2 className="w-4 h-4 text-verified fill-verified" />
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {review.project} • {developer?.name}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${getStarColorClass(review.rating, i)}`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-3">{review.comment}</p>
      <div className="text-xs text-muted-foreground mb-3">
        {new Date(review.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-AE' : 'en-US', {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      {/* Developer Reply */}
      {review.developerReply && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-start gap-3 bg-secondary/50 rounded-lg p-4">
            <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {review.developerReply.author}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.developerReply.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-AE' : 'en-US', {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.developerReply.comment}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
