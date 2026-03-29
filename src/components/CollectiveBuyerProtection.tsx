import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Shield, AlertTriangle, X, Clock, FileWarning } from "lucide-react";
import buyerAvatar1 from "@/assets/buyer-avatar-1.jpg";
import buyerAvatar2 from "@/assets/buyer-avatar-2.jpg";
import buyerAvatar3 from "@/assets/buyer-avatar-3.jpg";
import buyerAvatar4 from "@/assets/buyer-avatar-4.jpg";

const avatarImages = [buyerAvatar1, buyerAvatar2, buyerAvatar3, buyerAvatar4];

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const protectedAmount = useCountUp(847, 2000);
  const buyerCount = useCountUp(1247, 1800);


  const risks = [
    {
      icon: X,
      text: isAr
        ? "متوسط المشتري المصري يخاطر بـ 1.2 مليون جنيه مع مطور غير موثوق"
        : "Average Egyptian buyer risks EGP 1.2M on an unverified developer",
    },
    {
      icon: Clock,
      text: isAr
        ? "1 من كل 3 مشترين أوف بلان يواجه تأخير تسليم +1 سنة"
        : "1 in 3 off-plan buyers faces delivery delays of 1+ years",
    },
    {
      icon: FileWarning,
      text: isAr
        ? "لا حماية قانونية عند التوقيع بدون قراءة تقييمات موثوقة"
        : "No legal protection when you sign without reading verified reviews",
    },
  ];

  return (
    <section className="w-full max-w-[1100px]" dir={isAr ? "rtl" : "ltr"}>
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-10 md:py-8"
        style={{
          background:
            "linear-gradient(135deg, hsl(203,81%,16%) 0%, hsl(203,55%,28%) 50%, hsl(203,45%,34%) 100%)",
        }}
      >
        {/* Dot texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          {/* Left — Protected Amount */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
              <Shield className="h-3.5 w-3.5 text-[#fac417]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                {isAr ? "حماية المشتري الجماعية" : "Collective Buyer Protection"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span ref={protectedAmount.ref} className="text-4xl md:text-5xl font-extrabold text-[#fac417] tracking-tight leading-none tabular-nums">
                {protectedAmount.value}M
              </span>
              <span className="text-lg md:text-xl font-bold text-white/70">
                {isAr ? "ج.م" : "EGP"}
              </span>
            </div>

            <p className="text-xs md:text-sm text-white/60 font-medium mb-3">
              {isAr
                ? "محمية بتقييمات المشترين الموثقين"
                : "Protected by verified buyer reviews"}
            </p>

            {/* Avatar row */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {avatarImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-7 w-7 rounded-full border-2 border-white/20 object-cover"
                  />
                ))}
              </div>
              <span className="text-[11px] text-white/50 font-medium">
                {buyerCount.value.toLocaleString()}+{" "}
                {isAr ? "مشتري حموا أموالهم" : "buyers protected their money"}
              </span>
            </div>
          </div>

          {/* Right — Risk Panel */}
          <div className="w-full md:w-auto md:min-w-[360px] bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-[#fac417]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {isAr ? "بدون R8ESTATE" : "Without R8ESTATE"}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <risk.icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />
                  <span className="text-[11px] md:text-xs text-white/70 leading-relaxed">
                    {risk.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
