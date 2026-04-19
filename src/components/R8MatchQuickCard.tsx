import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AREA_OPTIONS } from "@/lib/r8Match";
import { cn } from "@/lib/utils";

interface R8MatchQuickCardProps {
  onNavigate?: () => void;
}

export const R8MatchQuickCard = ({ onNavigate }: R8MatchQuickCardProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [budget, setBudget] = useState<[number, number]>([3, 12]);
  const [area, setArea] = useState<string>("any");

  const handleSubmit = () => {
    const params = new URLSearchParams({
      budgetMin: String(budget[0]),
      budgetMax: String(budget[1]),
      auto: "1",
    });
    if (area !== "any") params.set("areas", area);
    onNavigate?.();
    navigate(`/match?${params.toString()}`);
  };

  return (
    <div className="relative rounded-2xl border-2 border-journey-choose/30 bg-gradient-to-br from-journey-choose/8 via-card to-card p-4 space-y-3 overflow-hidden shadow-md">
      <div className="absolute -top-8 -end-8 w-24 h-24 rounded-full bg-journey-choose/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-journey-choose/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-journey-choose" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-foreground truncate">R8 Match</h4>
            <span className="text-[9px] font-bold uppercase tracking-wider text-journey-choose bg-journey-choose/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {isRTL ? "بدون إعلانات" : "No paid ads"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {isRTL ? "ترشيحات مرتّبة بدرجات الثقة" : "Trust-ranked shortlist"}
          </p>
        </div>
      </div>

      <div className="relative space-y-2">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              {isRTL ? "الميزانية" : "Budget"}
            </label>
            <span className="text-xs font-bold text-journey-choose">
              EGP {budget[0]}M – {budget[1]}M
            </span>
          </div>
          <Slider
            value={budget}
            min={1}
            max={30}
            step={0.5}
            onValueChange={(v) => setBudget([v[0], v[1]] as [number, number])}
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            {isRTL ? "المنطقة" : "Area"}
          </label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger className="h-8 text-xs bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="any">{isRTL ? "أي منطقة" : "Anywhere"}</SelectItem>
              {AREA_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        size="sm"
        className="relative w-full bg-journey-choose hover:bg-journey-choose/90 text-white font-bold h-9 text-xs shadow-md"
      >
        <Sparkles className="w-3.5 h-3.5 me-1.5" />
        {isRTL ? "اعرضلي الترشيحات" : "Show my shortlist"}
        <ArrowRight className={cn("w-3.5 h-3.5 ms-1.5", isRTL && "rotate-180")} />
      </Button>

      <div className="relative flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
        <Lock className="w-2.5 h-2.5" />
        {isRTL ? "خوارزمية شفافة · بدون نتائج ممولة" : "Transparent algorithm · zero sponsored results"}
      </div>
    </div>
  );
};
