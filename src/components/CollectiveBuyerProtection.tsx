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

  const riskKeywords = isAr
    ? ["نصب", "تأخير", "بلا حماية"]
    : ["Scams", "Delays", "No Protection"];

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

        <div ref={riskAmount.ref} className="relative z-10 flex flex-col gap-2 px-4 py-3 md:px-6 md:py-4">
          {/* Row 1: Header + Counter */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
                {isAr ? "بدون R8ESTATE" : "Without R8ESTATE"}
              </span>
            </div>
            <span className="text-2xl md:text-3xl font-black tabular-nums text-[hsl(0,85%,60%)] ltr:ml-6 rtl:mr-6">
              {riskAmount.value}M EGP
            </span>
          </div>

          {/* Row 2: Risk keyword pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {riskKeywords.map((word, i) => (
              <div key={i} className="flex items-center gap-1">
                <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-sm font-bold text-white">{word}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Row 3: WITH R8ESTATE */}
          <div ref={protectedCount.ref} className="flex items-center gap-2 flex-wrap">
            <CheckCircle className="h-4 w-4 text-[hsl(45,96%,54%)] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(45,96%,54%)]">
              {isAr ? "مع R8ESTATE" : "WITH R8ESTATE"}
            </span>
            <div className="flex -space-x-2 rtl:space-x-reverse ltr:ml-2 rtl:mr-2">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] rounded-full border-2 border-white/20 object-cover"
                />
              ))}
            </div>
            <span className="text-white font-bold tabular-nums text-xs">{protectedCount.value}+</span>
            
          </div>
          <div className="ltr:ml-6 rtl:mr-6">
            <span className="text-xs text-white/70">
              {isAr ? "حموا فلوسهم هذا الشهر" : "already protected their money this month"}
            </span>
          </div>

          {/* Row 4: CTA */}
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
