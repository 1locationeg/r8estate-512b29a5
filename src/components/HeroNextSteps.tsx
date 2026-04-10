import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Home, Zap, Search, GitCompareArrows, Rocket, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompareModal } from "@/components/CompareModal";
import ContractUploadModal from "@/components/ContractUploadModal";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const actions = [
  { key: "reviews", icon: Search, route: "/reviews" },
  { key: "compare", icon: GitCompareArrows, route: null },
  { key: "launch", icon: Rocket, route: "/launch-watch" },
  { key: "contract", icon: ShieldCheck, route: null },
] as const;

export const HeroNextSteps = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState<"start" | "smart" | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [visible, setVisible] = useState([false, false]);
  const ref = useRef<HTMLDivElement>(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          [0, 1].forEach((i) => {
            setTimeout(() => setVisible((v) => { const n = [...v]; n[i] = true; return n; }), i * 120);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleAction = (key: string) => {
    setDrawerOpen(null);
    if (key === "reviews") navigate("/reviews");
    if (key === "compare") setShowCompare(true);
    if (key === "launch") navigate("/launch-watch");
    if (key === "contract") setShowContract(true);
  };

  const persona = drawerOpen;
  const drawerLabel = persona === "start" ? "startHere" : "smartTools";

  return (
    <>
      <div ref={ref} className="w-full mt-5 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Start Here CTA */}
          <button
            onClick={() => navigate("/reviews")}
            className={cn(
              "group relative flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary text-primary-foreground overflow-hidden text-start",
              "hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer",
              visible[0] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/20">
              <Home className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold leading-tight">{t("nextSteps.startHere.cta")}</span>
              <span className="block text-[11px] leading-snug mt-0.5 opacity-80">{t("nextSteps.startHere.subtitle")}</span>
            </div>
            <ChevronRight className={cn("shrink-0 w-4 h-4 opacity-60 group-hover:opacity-100 transition-all", isRtl && "rotate-180")} />
          </button>

          {/* Smart Tools CTA */}
          <button
            onClick={() => setDrawerOpen("smart")}
            className={cn(
              "group relative flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card text-foreground overflow-hidden text-start",
              "hover:border-primary/30 hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer",
              visible[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold leading-tight text-foreground">{t("nextSteps.smartTools.cta")}</span>
              <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{t("nextSteps.smartTools.subtitle")}</span>
            </div>
            <ChevronRight className={cn("shrink-0 w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-all", isRtl && "rotate-180")} />
          </button>
        </div>

        {/* Social proof */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-trust-excellent mr-1 align-middle animate-pulse" />
          {t("nextSteps.socialProof")}
        </p>
      </div>

      {/* Drawer */}
      <Drawer open={!!drawerOpen} onOpenChange={(open) => !open && setDrawerOpen(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{persona ? t(`nextSteps.${drawerLabel}.drawerTitle`) : ""}</DrawerTitle>
            <DrawerDescription>{persona ? t(`nextSteps.${drawerLabel}.drawerDesc`) : ""}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              const labelKey = persona === "start" ? action.key : action.key;
              return (
                <button
                  key={action.key}
                  onClick={() => handleAction(action.key)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">
                    {t(`nextSteps.${labelKey}.cta`)}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center leading-snug">
                    {t(`nextSteps.${labelKey}.subtitle`)}
                  </span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      <CompareModal item={null} open={showCompare} onClose={() => setShowCompare(false)} />
      <ContractUploadModal open={showContract} onOpenChange={setShowContract} />
    </>
  );
};
