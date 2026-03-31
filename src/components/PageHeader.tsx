import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getStationForRoute } from "@/lib/journeyStations";
import { MiniJourneyArc } from "@/components/MiniJourneyArc";
import { cn } from "@/lib/utils";

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbEntry[];
  rightSlot?: ReactNode;
  showBack?: boolean;
}

export const PageHeader = ({
  title,
  breadcrumbs,
  rightSlot,
  showBack = true,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const station = getStationForRoute(pathname);

  const BADGE_TEXT: Record<string, string> = {
    research: "text-journey-research",
    choose: "text-journey-choose",
    finance: "text-journey-finance",
    protect: "text-journey-protect",
  };
  const BADGE_BG: Record<string, string> = {
    research: "bg-journey-research/10",
    choose: "bg-journey-choose/10",
    finance: "bg-journey-finance/10",
    protect: "bg-journey-protect/10",
  };

  const BackArrow = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-3xl mx-auto px-4">
        {/* Main row */}
        <div className="flex items-center gap-2 h-[54px]">
          {/* Home */}
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-muted/60 transition-colors shrink-0"
            aria-label={t("pageHeader.home", "Home")}
          >
            <Home className="w-5 h-5 text-foreground" />
          </button>

          {/* Back */}
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors shrink-0"
              aria-label={t("pageHeader.back", "Go back")}
            >
              <BackArrow className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Title + Station Badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">
              {title}
            </h1>
            {station && (
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", BADGE_BG[station.key], BADGE_TEXT[station.key])}>
                {station.emoji} {t(station.labelKey)}
              </span>
            )}
          </div>

          {/* Right slot */}
          {rightSlot && (
            <div className="shrink-0 flex items-center gap-2">
              {rightSlot}
            </div>
          )}
        </div>

        {/* Mini Journey Arc + Breadcrumbs */}
        <div className="flex items-center gap-3 pb-2 -mt-1">
          <MiniJourneyArc />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="border-l border-border/50 pl-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="cursor-pointer text-xs"
                    onClick={() => navigate("/")}
                  >
                    {t("pageHeader.home", "Home")}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <span key={idx} className="contents">
                      <BreadcrumbSeparator className="[&>svg]:size-3" />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="text-xs">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            className="cursor-pointer text-xs"
                            onClick={() => crumb.path && navigate(crumb.path)}
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </span>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
      </div>
    </div>
  );
};
