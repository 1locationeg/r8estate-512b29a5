import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid, Building2, Trophy, Package,
  GitCompare, Star, Sparkles, BarChart3,
  Bell, Lightbulb, ArrowRight, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchToolkitPanelProps {
  onClose: () => void;
  onOpenCompare?: () => void;
  onOpenAIAgent?: () => void;
}

interface ToolCard {
  icon: React.ElementType;
  labelKey: string;
  subtitleKey: string;
  action: "route" | "modal";
  route?: string;
  modalId?: "compare" | "ai";
}

const SECTIONS: { headerKey: string; tools: ToolCard[] }[] = [
  {
    headerKey: "researchHub.discover",
    tools: [
      { icon: LayoutGrid, labelKey: "researchHub.browseCategories", subtitleKey: "researchHub.browseCategoriesSub", action: "route", route: "/categories" },
      { icon: Building2, labelKey: "researchHub.developerDirectory", subtitleKey: "researchHub.developerDirectorySub", action: "route", route: "/directory" },
      { icon: Trophy, labelKey: "researchHub.leaderboard", subtitleKey: "researchHub.leaderboardSub", action: "route", route: "/leaderboard" },
      { icon: Package, labelKey: "researchHub.products", subtitleKey: "researchHub.productsSub", action: "route", route: "/products" },
    ],
  },
  {
    headerKey: "researchHub.evaluate",
    tools: [
      { icon: GitCompare, labelKey: "researchHub.compareDevelopers", subtitleKey: "researchHub.compareDevelopersSub", action: "modal", modalId: "compare" },
      { icon: Star, labelKey: "researchHub.readReviews", subtitleKey: "researchHub.readReviewsSub", action: "route", route: "/reviews" },
      { icon: Sparkles, labelKey: "researchHub.aiTrustAgent", subtitleKey: "researchHub.aiTrustAgentSub", action: "modal", modalId: "ai" },
      { icon: BarChart3, labelKey: "researchHub.marketInsights", subtitleKey: "researchHub.marketInsightsSub", action: "route", route: "/insights" },
    ],
  },
  {
    headerKey: "researchHub.track",
    tools: [
      { icon: Bell, labelKey: "researchHub.savedSearches", subtitleKey: "researchHub.savedSearchesSub", action: "route", route: "/buyer" },
      { icon: Lightbulb, labelKey: "researchHub.smartRecs", subtitleKey: "researchHub.smartRecsSub", action: "route", route: "/copilot" },
    ],
  },
];

export const ResearchToolkitPanel = ({ onClose, onOpenCompare, onOpenAIAgent }: ResearchToolkitPanelProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";

  const handleToolClick = (tool: ToolCard) => {
    if (tool.action === "route" && tool.route) {
      onClose();
      navigate(tool.route);
    } else if (tool.action === "modal") {
      if (tool.modalId === "compare") onOpenCompare?.();
      if (tool.modalId === "ai") onOpenAIAgent?.();
    }
  };

  const scrollToChoose = () => {
    onClose();
    const el = document.getElementById("journey-section-1");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="px-1 pb-4 space-y-4">
      {/* Section divider */}
      <div className="flex items-center gap-2 px-2 pt-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-journey-research">
          {t("researchHub.title")}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {SECTIONS.map((section) => (
        <div key={section.headerKey} className="space-y-1.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
            {t(section.headerKey)}
          </h4>
          <div className="grid grid-cols-2 gap-2 px-1">
            {section.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.labelKey}
                  onClick={() => handleToolClick(tool)}
                  className="group flex items-start gap-2.5 p-2.5 rounded-xl border border-border/50 bg-card/60 hover:border-journey-research/40 hover:bg-journey-research/5 transition-all text-start"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-journey-research/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-journey-research" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate">
                      {t(tool.labelKey)}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                      {t(tool.subtitleKey)}
                    </p>
                  </div>
                  <ArrowRight className={cn(
                    "shrink-0 w-3 h-3 text-muted-foreground/50 group-hover:text-journey-research transition-colors mt-1",
                    isRTL && "rotate-180"
                  )} />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quick stats */}
      <div className="flex items-center justify-center gap-3 py-2 text-[10px] text-muted-foreground">
        <span className="font-bold text-foreground">18</span> {isRTL ? "فئة" : "Categories"}
        <span className="text-border">·</span>
        <span className="font-bold text-foreground">70+</span> {isRTL ? "شركة" : "Businesses"}
        <span className="text-border">·</span>
        <span className="font-bold text-foreground">7</span> {isRTL ? "مطورين" : "Developers"}
      </div>

      {/* CTA to next station */}
      <button
        onClick={scrollToChoose}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-journey-research/10 border border-journey-research/20 text-journey-research font-semibold text-xs hover:bg-journey-research/20 transition-all"
      >
        <ChevronDown className="w-3.5 h-3.5" />
        {t("researchHub.readyToChoose")}
      </button>
    </div>
  );
};
