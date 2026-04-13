import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, MessageSquarePlus, Building2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useNavigate } from "react-router-dom";
import { useBusinessLogo } from "@/contexts/BusinessLogoContext";

import avatar1 from "@/assets/testimonial-1.jpg";
import avatar2 from "@/assets/testimonial-2.jpg";
import avatar3 from "@/assets/testimonial-3.jpg";
import avatar4 from "@/assets/testimonial-4.jpg";
import avatar5 from "@/assets/testimonial-5.jpg";
import avatar6 from "@/assets/testimonial-6.jpg";
import avatar7 from "@/assets/testimonial-7.jpg";
import brandLogo1 from "@/assets/brand-logo-1.jpg";
import brandLogo2 from "@/assets/brand-logo-2.jpg";
import brandLogo3 from "@/assets/brand-logo-3.jpg";

interface CuratedTestimonial {
  id: string;
  author: string;
  authorAr: string;
  role: string;
  roleAr: string;
  rating: number;
  comment: string;
  commentAr: string;
  avatar: string;
  stage: "awareness" | "consideration" | "decision";
  isBusiness?: boolean;
}

const TESTIMONIALS: CuratedTestimonial[] = [
  // Awareness — Individual
  {
    id: "t1",
    author: "Ahmed Mostafa",
    authorAr: "أحمد مصطفى",
    role: "First-time Investor",
    roleAr: "مستثمر لأول مرة",
    rating: 5,
    comment: "I was tired of glossy brochures that didn't match reality. R8ESTATE showed the 'behind-the-scenes' risks no salesperson would ever mention.",
    commentAr: "كنت زهقت من البروشورات اللامعة اللي مش بتطابق الواقع. R8ESTATE وريتني المخاطر اللي مفيش سمسار هيقولها.",
    avatar: avatar1,
    stage: "awareness",
  },
  // Awareness — Business
  {
    id: "t8",
    author: "Colidwell Realty",
    authorAr: "كولدويل ريالتي",
    role: "Licensed Brokerage Firm",
    roleAr: "شركة وساطة مرخصة",
    rating: 5,
    comment: "R8ESTATE's transparency tools helped us build client trust from the first meeting. Our conversion rate jumped 40% since we started sharing R8ESTATE reports.",
    commentAr: "أدوات الشفافية في R8ESTATE ساعدتنا نبني ثقة العميل من أول لقاء. معدل التحويل زاد ٤٠٪ من وقت ما بدأنا نشارك تقارير R8ESTATE.",
    avatar: brandLogo1,
    stage: "awareness",
    isBusiness: true,
  },
  // Consideration — Individual
  {
    id: "t3",
    author: "Karim Abdel-Fattah",
    authorAr: "كريم عبدالفتاح",
    role: "Real Estate Investor",
    roleAr: "مستثمر عقاري",
    rating: 5,
    comment: "I was torn between two New Capital projects. R8ESTATE's verified reviews revealed delivery delays in one that the salesperson 'forgot' to mention. Saved me millions.",
    commentAr: "كنت محتار بين مشروعين في العاصمة. تقييمات R8ESTATE كشفت تأخير تسليم في واحد فيهم السمسار 'نسي' يقوله. وفّرت عليا ملايين.",
    avatar: avatar3,
    stage: "consideration",
  },
  // Consideration — Business
  {
    id: "t9",
    author: "Palim Hills Developments",
    authorAr: "بالم هيلز للتطوير",
    role: "Leading Developer",
    roleAr: "مطور رائد",
    rating: 5,
    comment: "We listed on R8ESTATE to prove our commitment to transparency. Genuine buyer reviews on our projects boosted pre-sales by 25%. The platform speaks truth.",
    commentAr: "سجّلنا في R8ESTATE عشان نثبت التزامنا بالشفافية. تقييمات المشترين الحقيقية رفعت مبيعاتنا المبكرة ٢٥٪. المنصة بتقول الحقيقة.",
    avatar: brandLogo2,
    stage: "consideration",
    isBusiness: true,
  },
  // Awareness — Individual
  {
    id: "t2",
    author: "Nadia El-Sayed",
    authorAr: "نادية السيد",
    role: "Property Analyst",
    roleAr: "محللة عقارية",
    rating: 5,
    comment: "I saw the R8ESTATE Audit checklists. It changed how I view off-plan projects entirely.",
    commentAr: "لما شفت قوائم تدقيق R8ESTATE، غيّرت نظرتي تماماً لمشاريع الأوف بلان.",
    avatar: avatar2,
    stage: "awareness",
  },
  // Consideration — Business
  {
    id: "t10",
    author: "Delita Capital Advisory",
    authorAr: "دلتا كابيتال",
    role: "Investment Advisory",
    roleAr: "استشارات استثمارية",
    rating: 5,
    comment: "We use R8ESTATE as our primary due diligence tool. The 'Integrity Score' is now a mandatory part of our investment committee's approval process.",
    commentAr: "بنستخدم R8ESTATE كأداة العناية الواجبة الأساسية. 'مؤشر النزاهة' بقى جزء إلزامي من عملية الموافقة.",
    avatar: brandLogo3,
    stage: "consideration",
    isBusiness: true,
  },
  // Decision — Transformation Story (Near-miss)
  {
    id: "t11",
    author: "Mona Rashad",
    authorAr: "منى رشاد",
    role: "Mother of Two · Saved from Disaster",
    roleAr: "أم لطفلين · نجت من كارثة",
    rating: 5,
    comment: "I was 2 days from signing a 3M EGP contract. R8ESTATE showed me 47 complaints about delayed delivery and hidden fees. I walked away. Six months later, that project froze. R8ESTATE saved my family's future.",
    commentAr: "كنت قدام توقيع عقد بـ٣ مليون جنيه بعد يومين. R8ESTATE وريتني ٤٧ شكوى عن تأخير التسليم ورسوم مخفية. مشيت. بعد ٦ شهور المشروع اتجمّد. R8ESTATE أنقذت مستقبل عيلتي.",
    avatar: avatar5,
    stage: "decision",
  },
  // Decision — Transformation Story (Life-changing)
  {
    id: "t12",
    author: "Tamer El-Gazzar",
    authorAr: "تامر الجزّار",
    role: "First Home at 28 · Zero Regrets",
    roleAr: "أول شقة في سن ٢٨ · صفر ندم",
    rating: 5,
    comment: "I almost gave up on owning a home. Every developer felt like a gamble. Then R8ESTATE's trust scores led me to a small, verified developer with 4.8 stars. I signed, moved in on time, and my neighbors all found it through R8ESTATE too.",
    commentAr: "كنت قربت أيأس من فكرة إني أملك شقة. كل مطور كان مقامرة. بعدين مؤشرات الثقة في R8ESTATE وصلتني لمطور صغير موثّق بتقييم ٤.٨. وقّعت، استلمت في الميعاد، وجيراني كلهم لقوه من R8ESTATE.",
    avatar: avatar6,
    stage: "decision",
  },
  // Decision — Individual
  {
    id: "t7",
    author: "Fatma El-Adly",
    authorAr: "فاطمة العدلي",
    role: "Real Estate Pro — 15 Years",
    roleAr: "خبيرة عقارات — ١٥ سنة",
    rating: 5,
    comment: "I've been in this industry for 15 years. R8ESTATE is the only platform I trust to give my clients the raw, unpolished truth before they commit.",
    commentAr: "في المجال ده من ١٥ سنة. R8ESTATE هي المنصة الوحيدة اللي بثق فيها تدي عملائي الحقيقة قبل ما يلتزموا.",
    avatar: avatar7,
    stage: "decision",
  },
];

export function ReviewsCarousel() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { getLogoOverride } = useBusinessLogo();

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector("div")?.offsetWidth ?? 280;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const absScroll = Math.abs(el.scrollLeft);
      if (absScroll >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: isRTL ? -cardWidth - 16 : cardWidth + 16, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, isRTL]);

  const renderStars = (rating: number) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="flex gap-0.5">
        {stars.map((i) => (
          <Star
            key={i}
            className={`w-3 h-3 flex-shrink-0 ${i <= rating ? "text-accent fill-accent" : "text-muted stroke-muted-foreground/30 fill-none"}`}
          />
        ))}
      </div>
    );
  };

  const stageBadge = (stage: string, isBusiness?: boolean) => {
    if (isBusiness) {
      return (
        <span className="px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider bg-primary/10 text-primary flex items-center gap-1">
          <Building2 className="w-2.5 h-2.5" />
          {isRTL ? "شركة" : "Business"}
        </span>
      );
    }
    const labels: Record<string, { en: string; ar: string; className: string }> = {
      awareness: { en: "Discovery", ar: "اكتشاف", className: "bg-accent/15 text-accent-foreground" },
      consideration: { en: "Validation", ar: "تحقق", className: "bg-primary/15 text-primary" },
      decision: { en: "Confidence", ar: "ثقة", className: "bg-green-500/15 text-green-700" },
    };
    const l = labels[stage] || labels.awareness;
    return (
      <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider ${l.className}`}>
        {isRTL ? l.ar : l.en}
      </span>
    );
  };

  // Mobile: single card with dots
  const [mobileIdx, setMobileIdx] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.offsetWidth;
      if (cardWidth > 0) setMobileIdx(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const renderCard = (item: CuratedTestimonial, className?: string) => (
    <div
      key={item.id}
      className={cn(
        "snap-center shrink-0 rounded-2xl p-4 flex flex-row gap-3 relative overflow-hidden group/card transition-all duration-300 hover:scale-[1.01] border border-border/40",
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 50%, hsl(var(--card)) 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at 80% 20%, hsl(var(--accent)) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div className="flex flex-col gap-1 flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          {stageBadge(item.stage, item.isBusiness)}
          {renderStars(item.rating)}
        </div>
        <p className="text-[13px] font-medium leading-[1.45] mt-1 text-foreground line-clamp-3">
          &ldquo;{isRTL ? item.commentAr : item.comment}&rdquo;
        </p>
        <div className="flex flex-col mt-auto">
          <span className="text-[11px] font-bold text-foreground truncate">
            {isRTL ? item.authorAr : item.author}
          </span>
          <span className="text-[9px] text-muted-foreground">
            {isRTL ? item.roleAr : item.role}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center relative z-10">
        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative shadow-md ${item.isBusiness ? "border-[3px] border-accent/40 bg-white p-1" : "border-[3px] border-primary/30 bg-muted"}`}>
          <img
            src={item.isBusiness ? (getLogoOverride(item.id, item.author) || item.avatar) : item.avatar}
            alt={isRTL ? item.authorAr : item.author}
            className={`object-cover ${item.isBusiness ? "w-[85%] h-[85%] object-contain rounded-full" : "w-full h-full"}`}
            loading="lazy"
            width={64}
            height={64}
          />
          {!item.isBusiness && (
            <div className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 text-white fill-current">
                <path d="M6.5 12.5l-4-4 1.5-1.5 2.5 2.5 5.5-5.5 1.5 1.5z" />
              </svg>
            </div>
          )}
          {item.isBusiness && (
            <div className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
              <Building2 className="w-2.5 h-2.5 text-accent-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ctaCard = (className?: string) => (
    <div
      className={cn(
        "snap-center shrink-0 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/30 bg-gradient-to-br from-card to-muted/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-[1.01]",
        className
      )}
      onClick={() => navigate("/reviews")}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageSquarePlus className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-bold text-foreground text-center">
        {isRTL ? "شاركنا تجربتك" : "Share your story."}
      </p>
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-[180px]">
        {isRTL ? "ساعد مشترين آخرين باتخاذ قرارات أفضل" : "Help other buyers make smarter decisions"}
      </p>
      <span className="text-[11px] font-semibold text-primary hover:underline">
        {isRTL ? "اكتب تقييم →" : "Write a review →"}
      </span>
    </div>
  );

  return (
    <section className="w-full py-0 overflow-hidden" style={{ paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Desktop: multi-card scroll */}
        <div className="relative group hidden md:block">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-1"
            style={{ WebkitOverflowScrolling: "touch" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {TESTIMONIALS.map((item) => renderCard(item, "w-[300px] md:w-[340px]"))}
            {ctaCard("w-[300px] md:w-[340px]")}
          </div>
        </div>

        {/* Mobile: single card + dots */}
        <div className="md:hidden">
          <div
            ref={mobileScrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            {TESTIMONIALS.map((item) => renderCard(item, "w-full min-w-full"))}
            {ctaCard("w-full min-w-full")}
          </div>
          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1 mt-2 pb-1">
            {[...TESTIMONIALS, null].map((_, i) => (
              <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === mobileIdx ? "bg-primary w-3" : "bg-muted-foreground/30")} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 pb-2">
          <div className="flex items-center gap-1.5">
            {renderStars(5)}
            <span className="text-sm font-bold text-foreground">5.0</span>
            <span className="text-xs text-muted-foreground">
              ( 98 {isRTL ? "تقييم" : "reviews"})
            </span>
          </div>
          <BrandLogo size="hero" tagline="" />
        </div>
      </div>
    </section>
  );
}
