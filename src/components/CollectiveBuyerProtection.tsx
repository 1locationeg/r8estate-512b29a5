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
  const riskAmount = useCountUp(183, 2200);
  const protectedCount = useCountUp(323, 1800);

  const risks = isAr
    ? [
        "المشتري المصري يخاطر بـ 1.2 مليون جنيه على مطور غير موثق",
        "1 من كل 4 مشترين أوف بلان يواجه تأخير تسليم +1 سنة",
        "لا حماية قانونية لما توقّع من غير ما تقرأ تقييمات موثقة",
      ]
    : [
        "Average Egyptian buyer risks EGP 1.2M on an unverified developer",
        "1 in 4 off-plan buyers faces delivery delays of 1+ years",
        "No legal protection when signing without reading verified reviews",
      ];

  const shareText = isAr
    ? "183 مليون جنيه في خطر — احمي فلوسك مع R8ESTATE"
    : "183M EGP at risk — protect your money with R8ESTATE";

  return (
    <section className="w-full" dir={isAr ? "rtl" : "ltr"}>
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(203,81%,8%) 0%, hsl(203,65%,16%) 40%, hsl(203,55%,22%) 70%, hsl(203,45%,28%) 100%)",
        }}
      >
        {/* Dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 25% 50%, hsla(0,70%,50%,0.06) 0%, transparent 70%)",
          }}
        />

        <div ref={riskAmount.ref} className="relative z-10 flex flex-col gap-4 px-5 py-5 md:px-8 md:py-6">
          {/* WITHOUT R8ESTATE */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                {isAr ? "بدون R8ESTATE — الخطر الحقيقي" : "Without R8ESTATE — the real risk"}
              </span>
            </div>

            {/* Big risk number */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-black tabular-nums text-[hsl(0,85%,60%)]">
                {riskAmount.value}M EGP
              </span>
              <span className="text-xs text-white/50">
                {isAr ? "في خطر على المشترين المصريين الآن" : "at risk across Egyptian off-plan buyers right now"}
              </span>
            </div>

            {/* Risk bullets */}
            <div className="flex flex-col gap-1.5">
              {risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2">
                  <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* WITH R8ESTATE */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[hsl(45,96%,54%)] shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(45,96%,54%)]">
                {isAr ? "مع R8ESTATE" : "WITH R8ESTATE"}
              </span>
            </div>

            <div ref={protectedCount.ref} className="flex items-center gap-3">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full border-2 border-white/20 object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-white/70">
                <span className="text-white font-bold tabular-nums">{protectedCount.value}+</span>{" "}
                {isAr ? "مشتري حموا فلوسهم الشهر ده" : "buyers already protected their money this month"}
              </span>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="glow"
              className="text-xs font-bold"
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
              className="text-white/50 hover:text-white h-8 w-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
