import { useTranslation } from "react-i18next";
import { Star, MapPin, Building } from "lucide-react";
import { Developer } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { TrustBadge } from "./TrustBadge";
import { TrustScore } from "./TrustScore";

interface DeveloperCardProps {
  developer: Developer;
}

export const DeveloperCard = ({ developer }: DeveloperCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-3xl">
            {developer.logo}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{developer.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {developer.location}
            </div>
          </div>
        </div>
        {developer.verified && <TrustBadge />}
      </div>

      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-accent text-accent" />
          <span className="text-2xl font-bold text-foreground">{developer.rating}</span>
          <span className="text-sm text-muted-foreground">({developer.reviewCount})</span>
        </div>
        <TrustScore score={developer.trustScore} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Building className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{developer.projectsCompleted}</span>
          <span className="font-semibold text-foreground">{t("developers.projectsCompleted")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {developer.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-3 py-1 bg-secondary text-xs font-medium rounded-full text-foreground"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
        {t("common.viewAll").replace(" →", "")}
      </button>
    </Card>
  );
};
