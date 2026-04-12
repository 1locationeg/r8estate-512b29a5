import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Shield, AlertTriangle } from "lucide-react";
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
  const protectedAmount = useCountUp(847, 2200);
  const buyerCount = useCountUp(1247, 1800);
  const [riskIndex, setRiskIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const risks = isAr
    ? [
        "المشتري المصري يخاطر بـ 1.2 مليون جنيه على مطور غير موثق",
        "1 من كل 3 مشترين أوف بلان يواجه تأخير تسليم +1 سنة",
        "لا حماية قانونية لما توقّع من غير ما تقرأ تقييمات موثقة",
      ]
    : [
        "Average buyer risks EGP 1.2M on an unverified developer",
        "1 in 3 off-plan buyers faces delivery delays of 1+ years",
        "No protection when you sign without verified reviews",
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setRiskIndex((prev) => (prev + 1) % risks.length);
        setFadeIn(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [risks.length]);

  const shareText = isAr
    ? "847 مليون جنيه محميين بتقييمات مشترين حقيقيين على R8ESTATE"
    : "847M EGP protected by real buyers on R8ESTATE";

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
              "radial-gradient(ellipse 50% 60% at 25% 50%, hsla(45,96%,54%,0.06) 0%, transparent 70%)",
          }}
        />

        <div ref={protectedAmount.ref} className="relative z-10 flex flex-col gap-3 px-5 py-4 md:px-8 md:py-5">
          {/* Hook headline */}
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[hsl(45,96%,54%)] animate-pulse shrink-0" />
            <h2 className="text-base md:text-lg font-extrabold text-white leading-tight">
              {isAr ? (
                <>ما تشتريش وانت أعمى. <span className="text-[hsl(45,96%,54%)] tabular-nums">{protectedAmount.value}M</span> جنيه محميين بالفعل.</>
              ) : (
                <>Don't buy blind. <span className="text-[hsl(45,96%,54%)] tabular-nums">{protectedAmount.value}M EGP</span> already protected.</>
              )}
            </h2>
          </div>

          {/* Social proof + rotating risk */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            {/* Avatars */}
            <div ref={buyerCount.ref} className="flex items-center gap-2 shrink-0">
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
              <span className="text-xs text-white/50 font-medium">
                <span className="text-white/80 font-bold tabular-nums">{buyerCount.value.toLocaleString()}+</span>{" "}
                {isAr ? "مشتري انضموا" : "buyers joined"}
              </span>
            </div>

            {/* Rotating risk */}
            <div className="flex items-center gap-2 min-h-[20px]">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <p
                className="text-xs text-white/60 leading-relaxed transition-opacity duration-300"
                style={{ opacity: fadeIn ? 1 : 0 }}
              >
                {risks[riskIndex]}
              </p>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3 pt-1">
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
