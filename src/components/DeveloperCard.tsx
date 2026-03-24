import { useTranslation } from "react-i18next";
import { Star, MapPin, Building, Bookmark, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { Developer } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { TrustBadge } from "./TrustBadge";
import { TrustScore } from "./TrustScore";
import { getRatingColorClass } from "@/lib/ratingColors";
import { useSavedItem, useFollowBusiness } from "@/hooks/useSaveFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTrackInterest } from "@/hooks/useTrackInterest";
import { useBusinessLogo } from "@/contexts/BusinessLogoContext";

interface DeveloperCardProps {
  developer: Developer;
  onClick?: () => void;
}

export const DeveloperCard = ({ developer, onClick }: DeveloperCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLogoOverride } = useBusinessLogo();
  const logoSrc = getLogoOverride(developer.id, developer.name) || developer.logo;
  const { isSaved, toggle: toggleSave, loading: saveLoading } = useSavedItem(developer.id, "developer");
  const { isFollowing, toggle: toggleFollow, loading: followLoading } = useFollowBusiness(developer.id);
  const { trackClick, startLinger, cancelLinger } = useTrackInterest();

  const handleCardClick = () => {
    trackClick(developer.id, developer.name);
    onClick?.();
  };

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

  return (
    <Card
      className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 cursor-pointer relative"
      onClick={handleCardClick}
      onMouseEnter={() => startLinger(developer.id, developer.name)}
      onMouseLeave={() => cancelLinger(developer.id)}
    >
      {/* Save & Follow buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
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

      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-xl flex items-center justify-center overflow-hidden">
            <img src={logoSrc} alt={developer.name} className="w-full h-full object-cover" />
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

      <div className="flex gap-2">
        <button className="flex-1 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm md:text-base">
          {t("common.viewAll").replace(" →", "")}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/community?newPost=true&developer=${developer.id}`);
          }}
          className="px-3 py-2 md:py-2.5 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          title="Ask the community"
        >
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </Card>
  );
};
