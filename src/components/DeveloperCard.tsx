import { useTranslation } from "react-i18next";
import { Star, MapPin, Building } from "lucide-react";
import { Developer } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { TrustBadge } from "./TrustBadge";
import { TrustScore } from "./TrustScore";
import { getRatingColorClass } from "@/lib/ratingColors";

interface DeveloperCardProps {
  developer: Developer;
}

export const DeveloperCard = ({ developer }: DeveloperCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-xl flex items-center justify-center text-2xl md:text-3xl">
            {developer.logo}
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-xl font-bold text-foreground mb-0.5 md:mb-1 truncate">{developer.name}</h3>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
              <span className="truncate">{developer.location}</span>
            </div>
          </div>
        </div>
        {developer.verified && <TrustBadge />}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border">
        <div className="flex items-center gap-1">
          <Star className={`w-4 h-4 md:w-5 md:h-5 ${getRatingColorClass(developer.rating)}`} />
          <span className="text-xl md:text-2xl font-bold text-foreground">{developer.rating}</span>
          <span className="text-xs md:text-sm text-muted-foreground">({developer.reviewCount})</span>
        </div>
        <TrustScore score={developer.trustScore} />
      </div>

      <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Building className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">{developer.projectsCompleted}</span>
          <span className="font-semibold text-foreground">{t("developers.projectsCompleted")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {developer.specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="px-2 md:px-3 py-0.5 md:py-1 bg-secondary text-[10px] md:text-xs font-medium rounded-full text-foreground"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <button className="w-full py-2 md:py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm md:text-base">
        {t("common.viewAll").replace(" →", "")}
      </button>
    </Card>
  );
};
