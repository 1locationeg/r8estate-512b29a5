import { useTranslation } from "react-i18next";
import { Developer } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { useSavedItem, useFollowBusiness } from "@/hooks/useSaveFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTrackInterest } from "@/hooks/useTrackInterest";

interface DeveloperDirectoryCardProps {
  developer: Developer;
  onClick: () => void;
}

export const DeveloperDirectoryCard = ({ developer, onClick }: DeveloperDirectoryCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isSaved, toggle: toggleSave, loading: saveLoading } = useSavedItem(developer.id, "developer");
  const { isFollowing, toggle: toggleFollow, loading: followLoading } = useFollowBusiness(developer.id);
  const { trackClick, startLinger, cancelLinger } = useTrackInterest();

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate("/auth"); return; }
    toggleSave(developer.name, developer.logo);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate("/auth"); return; }
    toggleFollow(developer.name);
  };

  const handleCardClick = () => {
    trackClick(developer.id, developer.name);
    onClick();
  };

  return (
    <Card
      className="p-6 hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 cursor-pointer relative"
      onClick={handleCardClick}
      onMouseEnter={() => startLinger(developer.id, developer.name)}
      onMouseLeave={() => cancelLinger(developer.id)}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={handleSave}
          disabled={saveLoading}
          className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          title={isSaved ? t("common.removeSaved", "Remove from saved") : t("common.save", "Save")}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </button>
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          title={isFollowing ? t("common.unfollow", "Unfollow") : t("common.follow", "Follow")}
        >
          {isFollowing ? (
            <UserCheck className="h-4 w-4 text-primary" />
          ) : (
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
          <img src={developer.logo} alt={developer.name} className="w-full h-full object-cover" />
        </div>

        <h3 className="text-xl font-bold text-foreground">{developer.name}</h3>

        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-2">{t("developers.publicSentimentScore")}</p>
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold text-primary">
              {developer.sentimentScore.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">/10</div>
          </div>
        </div>

        {!developer.isClaimed && (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
            {t("developers.unclaimedProfile")}
          </Badge>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/community?newPost=true&developer=${developer.id}`);
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{t("community.askCommunity", "Ask the community")}</span>
        </button>
      </div>
    </Card>
  );
};
