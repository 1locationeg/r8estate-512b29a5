import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Building2, ArrowRight } from "lucide-react";
import { R8MatchQuickCard } from "@/components/R8MatchQuickCard";
import { cn } from "@/lib/utils";

const BrowseLaunches = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className={cn("w-5 h-5 text-foreground", isRTL && "rotate-180")} />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {isRTL ? "تصفّح الإطلاقات" : "Browse Launches"}
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 pt-4 space-y-3">
        {/* R8 Match Card */}
        <R8MatchQuickCard />

        {/* Compare Developers Card */}
        <button
          onClick={() => navigate("/directory")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-journey-choose/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-journey-choose" />
          </div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {isRTL ? "قارن بين المطورين في 30 ثانية" : "Compare developers in 30 seconds"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isRTL ? "اعثر على الأنسب لك" : "Find the right fit for you"}
            </p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>
      </div>
    </div>
  );
};

export default BrowseLaunches;