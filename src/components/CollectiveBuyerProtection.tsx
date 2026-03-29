import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Shield, AlertTriangle, X } from "lucide-react";
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
  const protectedAmount = useCountUp(847, 2200);
  const buyerCount = useCountUp(1200, 1800);

  const risks = isAr
    ? [
        "المشتري المصري يخاطر بـ 1.2 مليون جنيه على مطور غير موثق",
        "1 من كل 3 مشترين أوف بلان يواجه تأخير تسليم +1 سنة",
        "لا حماية قانونية لما توقّع من غير ما تقرأ تقييمات موثقة",
      ]
    : [
        "Average Egyptian buyer risks EGP 1.2M on an unverified developer",
        "1 in 3 off-plan buyers faces delivery delays of 1+ years",
        "No legal protection when you sign without reading verified reviews",
      ];

  return (
    <section className="w-full" dir={isAr ? "rtl" : "ltr"}>
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(203,81%,12%) 0%, hsl(203,55%,22%) 50%, hsl(203,45%,28%) 100%)",
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

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-5 py-6 md:px-8 md:py-8">
          {/* Left — Protection stats */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(45,96%,54%)]/15 border border-[hsl(45,96%,54%)]/25 px-3 py-1 w-fit mb-4">
              <Shield className="h-3.5 w-3.5 text-[hsl(45,96%,54%)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(45,96%,54%)]">
                {isAr ? "حماية المشترين الجماعية" : "Collective Buyer Protection"}
              </span>
            </div>

            {/* Big number */}
            <div ref={protectedAmount.ref} className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl md:text-5xl font-extrabold text-[hsl(45,96%,54%)] tabular-nums tracking-tight">
                {protectedAmount.value}M
              </span>
              <span className="text-lg md:text-xl font-bold text-white/70">EGP</span>
            </div>

            <p className="text-sm text-white/50 mb-5">
              {isAr ? "محميين بتقييمات مشترين موثقين" : "Protected by verified buyer reviews"}
            </p>

            {/* Avatar row */}
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border-2 border-white/20 object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-white/45 font-medium tabular-nums">
                <span className="text-white/70 font-bold">{buyerCount.value.toLocaleString()}+</span>{" "}
                {isAr ? "مشتري حموا فلوسهم" : "buyers protected their money"}
              </span>
            </div>
          </div>

          {/* Right — Risk panel */}
          <div className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-[hsl(45,96%,54%)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {isAr ? "بدون R8ESTATE" : "Without R8ESTATE"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-white/65 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
