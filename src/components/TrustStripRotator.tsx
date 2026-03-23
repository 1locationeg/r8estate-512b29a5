import { useState, useEffect } from "react";
import { Shield, Ban, Eye, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const statements = [
  { icon: Ban, key: "strip1", en: "We blocked 47 fake reviews this week — so you don't get scammed", ar: "حظرنا 47 تقييم مزيف هذا الأسبوع — عشان محدش يضحك عليك" },
  { icon: Shield, key: "strip2", en: "Every review here is verified by real buyers, not marketing teams", ar: "كل تقييم هنا من مشترين حقيقيين، مش فرق تسويق" },
  { icon: Eye, key: "strip3", en: "See what developers hide before you sign anything", ar: "شوف اللي المطورين بيخبّوه قبل ما توقّع أي حاجة" },
  { icon: TrendingUp, key: "strip4", en: "1,200+ buyers checked here before signing — join them", ar: "١,٢٠٠+ مشتري فحصوا هنا قبل ما يوقّعوا — انضم ليهم" },
];

export const TrustStripRotator = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % statements.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const s = statements[idx];
  const Icon = s.icon;
  const text = isAr ? s.ar : s.en;

  return (
    <div className="w-full max-w-3xl px-4 mb-3">
      <div className="relative flex items-center justify-center gap-2 py-1.5 overflow-hidden">
        {/* Progress dots */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
          {statements.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                i === idx ? "bg-primary w-3" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Animated content */}
        <div
          className={`flex items-center gap-2 transition-all duration-400 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          }`}
        >
          <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[11px] md:text-xs font-medium text-foreground/70 text-center leading-tight">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};
