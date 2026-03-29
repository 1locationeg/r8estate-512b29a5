import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Shield, CheckCircle2, Users, Search, AlertTriangle, Bell, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const reviewCount = useCountUp(50, 1800);
  const companyCount = useCountUp(1200, 2000);
  const userCount = useCountUp(100, 1600);
  const trustScore = useCountUp(48, 1400); // 4.8

  const pills = [
    { icon: Shield, text: isAr ? "مجاني للأبد" : "Free forever" },
    { icon: CheckCircle2, text: isAr ? "تقييمات موثقة" : "Verified reviews" },
    { icon: Users, text: isAr ? "+100 ألف مشتري" : "100K+ buyers" },
  ];

  const benefits = [
    {
      icon: Search,
      title: isAr ? "قارن المطورين الموثقين" : "Compare verified developers",
      desc: isAr
        ? "ابحث في +1,200 مطور وسمسار ومشروع — كلهم في مكان واحد"
        : "Search 1,200+ developers, brokers & projects — all in one place.",
    },
    {
      icon: AlertTriangle,
      title: isAr ? "شوف درجات الثقة والعلامات الحمراء" : "See trust scores & red flags",
      desc: isAr
        ? "اعرف مين عنده تأخيرات تسليم أو شكاوى أو مشاكل مخفية قبل ما توقع"
        : "Know who has delivery delays, complaints, or hidden issues before you sign.",
    },
    {
      icon: Star,
      title: isAr ? "+50,000 تقييم مشتري موثق" : "50,000+ verified buyer reviews",
      desc: isAr
        ? "آراء حقيقية من مشترين مصريين دفعوا ملايين — مش محتوى مدفوع"
        : "Real feedback from Egyptian buyers who paid millions — not sponsored content.",
    },
    {
      icon: Bell,
      title: isAr ? "تنبيهات على المشاريع اللي بتتابعها" : "Get alerts on projects you track",
      desc: isAr
        ? "تابع كمبوند واتنبّه لما تقييمات جديدة أو تحديثات تنزل"
        : "Follow a compound and get notified when new reviews or updates drop.",
    },
  ];

  const stats = [
    { value: reviewCount, suffix: "K+", label: isAr ? "تقييم" : "Reviews" },
    { value: companyCount, suffix: "+", label: isAr ? "شركة" : "Companies" },
    { value: userCount, suffix: "K+", label: isAr ? "مستخدم" : "Users" },
    { value: trustScore, suffix: "", label: isAr ? "متوسط الثقة" : "Trust Score Avg", decimal: true },
  ];

  return (
    <section className="w-full max-w-[1100px]" dir={isAr ? "rtl" : "ltr"}>
      <div className="overflow-hidden rounded-2xl">
        {/* Top Hero Section — Navy gradient */}
        <div
          className="relative px-6 py-8 md:px-10 md:py-10 text-center"
          style={{
            background:
              "linear-gradient(160deg, hsl(203,81%,12%) 0%, hsl(203,81%,21%) 40%, hsl(203,55%,28%) 100%)",
          }}
        >
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 30%, hsla(45,96%,54%,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Dot texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Lock icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(45,96%,54%)]/15 border border-[hsl(45,96%,54%)]/25">
              <Lock className="h-6 w-6 text-[hsl(45,96%,54%)]" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              {isAr ? "احمي استثمارك" : "Protect Your Investment"}
            </h2>

            <p className="text-sm md:text-base text-white/60 max-w-md leading-relaxed mb-5">
              {isAr
                ? "المنصة الوحيدة في مصر اللي المشترين بيوثقوا فيها المطورين والمشاريع والسماسرة — مجاناً تماماً."
                : "Egypt's only platform where buyers verify developers, projects & brokers — completely free."}
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {pills.map((pill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-sm px-3.5 py-1.5"
                >
                  <pill.icon className="h-3.5 w-3.5 text-[hsl(45,96%,54%)]" />
                  <span className="text-[11px] font-semibold text-white/85 whitespace-nowrap">
                    {pill.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Avatar row */}
            <div className="flex items-center gap-2.5">
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
              <span className="text-[11px] text-white/45 font-medium">
                {isAr ? "انضم لـ +100 ألف مشتري ذكي" : "Join 100K+ smart buyers"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 divide-x rtl:divide-x-reverse divide-border bg-card border-x border-border">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-4 px-2">
              <span
                ref={stat.value.ref}
                className="text-lg md:text-xl font-extrabold text-primary tabular-nums"
              >
                {stat.decimal
                  ? (stat.value.value / 10).toFixed(1)
                  : stat.value.value.toLocaleString()}
                {stat.suffix}
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Benefits Section — White card */}
        <div className="bg-card border border-t-0 border-border rounded-b-2xl px-6 py-6 md:px-10 md:py-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">
              {isAr ? "ماذا تفتح — مجاناً" : "What you unlock — Free"}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <benefit.icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground leading-tight mb-0.5">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/auth")}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(45,96%,54%) 0%, hsl(40,90%,48%) 100%)",
              color: "hsl(203,81%,12%)",
            }}
          >
            {isAr ? "سجل مجاناً وابدأ" : "Sign up free & start exploring"}
            <ArrowRight className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
};
