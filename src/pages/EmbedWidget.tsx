import { useParams } from "react-router-dom";
import { useWidgetData } from "@/hooks/useWidgetData";
import { MicroBadge } from "@/components/widgets/MicroBadge";
import { EntityProfileWidget } from "@/components/widgets/EntityProfileWidget";
import { ProjectJourneyWidget } from "@/components/widgets/ProjectJourneyWidget";
import { ComparisonStrip } from "@/components/widgets/ComparisonStrip";
import { ReviewUsWidget } from "@/components/widgets/ReviewUsWidget";
import { Skeleton } from "@/components/ui/skeleton";

const EmbedWidget = () => {
  const { token } = useParams<{ token: string }>();
  const { config, entityName, score, reviewCount, recentReviews, isLoading, error } = useWidgetData(token || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80px] p-4">
        <Skeleton className="w-full h-16 rounded-2xl" />
      </div>
    );
  }

  if (error || !config.type) {
    return (
      <div
        className="flex items-center justify-center min-h-[60px] p-4 text-xs opacity-50"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        Reviews on R8ESTATE
      </div>
    );
  }

  const settings = config.settings || {};
  const theme = (settings.theme as "dark" | "light") || "dark";
  const ctaUrl = (settings.cta_url as string) || `https://r8estate.lovable.app/reviews?developer=${config.entity_id}`;

  switch (config.type) {
    case "micro_badge":
      return (
        <MicroBadge
          entityName={entityName}
          score={score}
          reviewCount={reviewCount}
          isVerified={settings.show_verified !== false}
          theme={theme}
          ctaUrl={ctaUrl}
        />
      );
    case "entity_profile":
      return (
        <EntityProfileWidget
          entityName={entityName}
          entityType={config.entity_type}
          score={score}
          reviewCount={reviewCount}
          isVerified={settings.show_verified !== false}
          recentReviews={recentReviews}
          theme={theme}
          ctaUrl={ctaUrl}
        />
      );
    case "project_journey":
      return (
        <ProjectJourneyWidget
          projectName={entityName}
          developerName={config.entity_type}
          score={score}
          reviewCount={reviewCount}
          theme={theme}
          ctaUrl={ctaUrl}
        />
      );
    case "comparison_strip":
      return (
        <ComparisonStrip
          entityName={entityName}
          score={score}
          theme={theme}
          ctaUrl={ctaUrl}
        />
      );
    case "review_us":
      return (
        <ReviewUsWidget
          entityName={entityName}
          theme={theme}
          ctaUrl={ctaUrl}
        />
      );
    default:
      return <div className="text-xs opacity-50 p-4">Unknown widget type</div>;
  }
};

export default EmbedWidget;
