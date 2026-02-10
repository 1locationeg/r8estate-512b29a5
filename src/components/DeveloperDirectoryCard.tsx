import { useTranslation } from "react-i18next";
import { Developer } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DeveloperDirectoryCardProps {
  developer: Developer;
  onClick: () => void;
}

export const DeveloperDirectoryCard = ({ developer, onClick }: DeveloperDirectoryCardProps) => {
  const { t } = useTranslation();

  return (
    <Card
      className="p-6 hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Logo */}
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
          <img src={developer.logo} alt={developer.name} className="w-full h-full object-cover" />
        </div>

        {/* Developer Name */}
        <h3 className="text-xl font-bold text-foreground">{developer.name}</h3>

        {/* Sentiment Score */}
        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-2">{t("developers.publicSentimentScore")}</p>
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold text-primary">
              {developer.sentimentScore.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">/10</div>
          </div>
        </div>

        {/* Unclaimed Profile Badge */}
        {!developer.isClaimed && (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
            {t("developers.unclaimedProfile")}
          </Badge>
        )}
      </div>
    </Card>
  );
};
