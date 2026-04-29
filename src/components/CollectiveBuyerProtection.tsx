import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Shield, X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareMenu } from "@/components/ShareMenu";
import { Button } from "@/components/ui/button";
import avatar1 from "@/assets/protection-avatar-1.jpg";
import avatar2 from "@/assets/protection-avatar-2.jpg";
import avatar3 from "@/assets/protection-avatar-3.jpg";
import avatar4 from "@/assets/protection-avatar-4.jpg";

const avatars = [avatar1, avatar2, avatar3, avatar4];

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
}

export const CollectiveBuyerProtection = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const riskAmount = useCountUp(847, 2200);
  const protectedCount = useCountUp(323, 1800);

  const riskKeywords = isAr
    ? ["تأخير", "بلا حماية"]
    : ["Delays", "No Protection"];

  const shareText = isAr
    ? "847 مليون جنيه في خطر — احمي فلوسك مع R8ESTATE"
    : "847M EGP at risk — protect your money with R8ESTATE";

  return (
    <section className="w-full" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative overflow-hidden rounded-2xl border border-red-200/40 dark:border-red-900/30 bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm">
        {/* Red gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/[0.06] via-transparent to-destructive/[0.04]" />
        {/* Dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--destructive)) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div ref={riskAmount.ref} className="relative z-10 flex flex-col gap-2 px-4 py-3 md:px-6 md:py-4">
          {/* Row 1: Header + Counter */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
                {isAr ? "بدون R8ESTATE" : "Without R8ESTATE"}
              </span>
            </div>
            <span className="text-2xl md:text-3xl font-black tabular-nums text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.2)] ltr:ml-6 rtl:mr-6">
              {riskAmount.value}M EGP
            </span>
            <span className="text-xs text-muted-foreground ltr:ml-6 rtl:mr-6">
              {isAr ? "في خطر عبر مشتري العقارات في مصر" : "at risk across Egyptian off-plan buyers"}
            </span>
          </div>

          {/* Row 2: Risk keyword pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {riskKeywords.map((word, i) => (
              <div key={i} className="flex items-center gap-1 bg-red-100/60 dark:bg-red-900/20 rounded-full px-2.5 py-0.5">
                <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-sm font-bold text-foreground">{word}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Standalone green safe zone */}
      <div className="mt-1.5 relative overflow-hidden rounded-2xl border border-green-200/40 dark:border-green-900/30 bg-green-50/80 dark:bg-green-950/20 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/[0.04] via-transparent to-green-500/[0.03]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 px-4 py-3 md:px-6 md:py-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-journey-protect shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-journey-protect">
              {isAr ? "مع R8ESTATE" : "WITH R8ESTATE"}
            </span>
          </div>
          <div ref={protectedCount.ref}>
            <span className="text-2xl md:text-3xl font-black tabular-nums text-journey-protect drop-shadow-[0_0_8px_rgba(34,197,94,0.2)] flex items-center gap-2">
              {protectedCount.value}+
              <span className="flex -space-x-2 rtl:space-x-reverse">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border-2 border-journey-protect/30 object-cover"
                  />
                ))}
              </span>
              {isAr ? "محمي" : "Protected"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="text-xs font-bold bg-journey-protect hover:bg-journey-protect/90 text-white"
              onClick={() => navigate("/reviews")}
            >
              {isAr ? "احمي شرايك" : "Protect My Purchase"}
            </Button>
            <ShareMenu
              title="R8ESTATE"
              description={shareText}
              iconOnly
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
