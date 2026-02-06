import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Trophy, TrendingUp, Rocket, X, Building2, MapPin, Home, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { developers, projects, locations, apps } from "@/data/mockData";
import { TrustGaugeMini } from "./TrustGaugeMini";
import { getRatingColorClass } from "@/lib/ratingColors";
import { cn } from "@/lib/utils";

interface BestOfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "best" | "trending" | "new";
}

type TabType = "developers" | "projects" | "locations" | "apps";

export const BestOfModal = ({ open, onOpenChange, category }: BestOfModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("developers");

  const title = useMemo(() => {
    switch (category) {
      case "best": return t("hero.bestOf2025");
      case "trending": return t("hero.trendingProjects");
      case "new": return t("hero.newLaunches");
    }
  }, [category, t]);

  const icon = useMemo(() => {
    switch (category) {
      case "best": return <Trophy className="w-5 h-5 text-accent" />;
      case "trending": return <TrendingUp className="w-5 h-5 text-primary" />;
      case "new": return <Rocket className="w-5 h-5 text-emerald-500" />;
    }
  }, [category]);

  // Get top items sorted by rating and review count
  const topDevelopers = useMemo(() => {
    return [...developers]
      .sort((a, b) => {
        // Score = rating * 100 + reviewCount * 0.1 + trustScore
        const scoreA = a.rating * 100 + a.reviewCount * 0.1 + a.trustScore;
        const scoreB = b.rating * 100 + b.reviewCount * 0.1 + b.trustScore;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, []);

  const topProjects = useMemo(() => {
    // Join with developer data to get ratings
    return projects
      .map(p => {
        const dev = developers.find(d => d.id === p.developerId);
        return { ...p, developerRating: dev?.rating || 0, developerReviews: dev?.reviewCount || 0 };
      })
      .sort((a, b) => b.developerRating - a.developerRating)
      .slice(0, 5);
  }, []);

  const topLocations = useMemo(() => {
    return [...locations]
      .sort((a, b) => b.projectCount - a.projectCount)
      .slice(0, 5);
  }, []);

  const topApps = useMemo(() => {
    return [...apps]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, []);

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "developers", label: t("search.developers"), icon: <Building2 className="w-4 h-4" /> },
    { key: "projects", label: t("search.projects"), icon: <Home className="w-4 h-4" /> },
    { key: "locations", label: t("search.locations"), icon: <MapPin className="w-4 h-4" /> },
    { key: "apps", label: t("search.apps"), icon: <Smartphone className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border px-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === "developers" && topDevelopers.map((dev, index) => (
            <div
              key={dev.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {index + 1}
              </div>
              <img src={dev.logo} alt={dev.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{dev.name}</div>
                <div className="text-xs text-muted-foreground">{dev.reviewCount.toLocaleString()} {t("reviews.reviews")}</div>
              </div>
              <div className="flex items-center gap-2">
                <TrustGaugeMini score={dev.trustScore} size="xs" />
                <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                  <Star className={cn("w-3.5 h-3.5 fill-current", getRatingColorClass(dev.rating))} />
                  <span className={cn("text-sm font-semibold", getRatingColorClass(dev.rating))}>{dev.rating}</span>
                </div>
              </div>
            </div>
          ))}

          {activeTab === "projects" && topProjects.map((proj, index) => (
            <div
              key={proj.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {index + 1}
              </div>
              {proj.image && <img src={proj.image} alt={proj.name} className="w-10 h-10 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{proj.name}</div>
                <div className="text-xs text-muted-foreground">{proj.location} • {proj.status}</div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                <Star className={cn("w-3.5 h-3.5 fill-current", getRatingColorClass(proj.developerRating))} />
                <span className={cn("text-sm font-semibold", getRatingColorClass(proj.developerRating))}>{proj.developerRating}</span>
              </div>
            </div>
          ))}

          {activeTab === "locations" && topLocations.map((loc, index) => (
            <div
              key={loc.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{loc.name}</div>
                <div className="text-xs text-muted-foreground">{loc.region}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {loc.projectCount} {t("search.projects").toLowerCase()}
              </div>
            </div>
          ))}

          {activeTab === "apps" && topApps.map((app, index) => (
            <div
              key={app.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{app.name}</div>
                <div className="text-xs text-muted-foreground">{app.type} • {app.downloads}</div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                <Star className={cn("w-3.5 h-3.5 fill-current", getRatingColorClass(app.rating))} />
                <span className={cn("text-sm font-semibold", getRatingColorClass(app.rating))}>{app.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
