import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Star, Quote, MessageSquarePlus } from "lucide-react";
import { reviews as mockReviews, developers } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/utils/formatArabic";
import { BrandLogo } from "@/components/BrandLogo";
import { useNavigate } from "react-router-dom";

interface CarouselReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  developerId: string;
  avatar?: string;
}

interface BusinessLogo {
  id: string;
  name: string;
  logo: string;
}

function getRelativeTime(dateStr: string, lang: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return lang === "ar" ? "اليوم" : "today";
  const capped = Math.min(diffDays, 29);
  return lang === "ar" ? `منذ ${capped} يوم` : `${capped} day${capped > 1 ? "s" : ""} ago`;
}

export function ReviewsCarousel() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const [liveReviews, setLiveReviews] = useState<CarouselReview[]>([]);
  const [businessLogos, setBusinessLogos] = useState<BusinessLogo[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, author_name, is_anonymous, rating, created_at, comment, developer_id")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setLiveReviews(
          data.map((r) => ({
            id: r.id,
            author: r.is_anonymous ? t("review.anonymous") : r.author_name,
            rating: r.rating,
            date: new Date(r.created_at).toISOString().split("T")[0],
            comment: r.comment,
            developerId: r.developer_id,
          }))
        );
      }
    };
    const fetchBusinessLogos = async () => {
      const { data } = await supabase
        .from("business_profiles")
        .select("id, company_name, logo_url");
      if (data) {
        setBusinessLogos(
          data.map((b) => ({
            id: b.id,
            name: b.company_name || "",
            logo: b.logo_url || "",
          }))
        );
      }
    };
    fetchReviews();
    fetchBusinessLogos();
  }, [isRTL]);

  const allReviews: CarouselReview[] = [...liveReviews];
  if (allReviews.length < 12) {
    const liveIds = new Set(liveReviews.map((r) => r.id));
    const mockFill = mockReviews
      .filter((r) => !liveIds.has(r.id))
      .slice(0, 12 - allReviews.length)
      .map((r) => ({ id: r.id, author: r.author, rating: r.rating, date: r.date, comment: r.comment, developerId: r.developerId, avatar: (r as any).avatar }));
    allReviews.push(...mockFill);
  }

  const sortedReviews = allReviews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);

  const avgRating = sortedReviews.length
    ? (sortedReviews.reduce((s, r) => s + r.rating, 0) / sortedReviews.length).toFixed(1)
    : "0";

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

  const getStarColor = (rating: number) => {
    if (rating <= 1) return "text-red-500 fill-red-500";
    if (rating <= 2) return "text-orange-500 fill-orange-500";
    if (rating <= 3) return "text-yellow-500 fill-yellow-500";
    if (rating <= 4) return "text-green-500 fill-green-500";
    return "text-primary fill-primary";
  };

  const renderStars = (rating: number) => {
    const stars = [1, 2, 3, 4, 5];
    const orderedStars = isRTL ? [...stars].reverse() : stars;
    return (
      <div className={`flex gap-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {orderedStars.map((i) => (
          <Star
            key={i}
            className={`w-3 h-3 flex-shrink-0 ${i <= rating ? getStarColor(rating) : "text-muted stroke-muted-foreground/30 fill-none"}`}
          />
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return isRTL ? "ممتاز" : "Excellent";
    if (rating >= 4) return isRTL ? "جيد جداً" : "Great";
    if (rating >= 3) return isRTL ? "جيد" : "Good";
    if (rating >= 2) return isRTL ? "مقبول" : "Fair";
    return isRTL ? "ضعيف" : "Poor";
  };

  return (
    <section className="w-full py-0 overflow-hidden">
      <div className="max-w-6xl mx-auto px-2">
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
            style={{ WebkitOverflowScrolling: "touch" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            {sortedReviews.map((review) => {
              const mockDev = developers.find((d) => d.id === review.developerId);
              const dbBiz = businessLogos.find((b) => b.id === review.developerId);
              const bizName = dbBiz?.name || mockDev?.name || "";
              const bizLogo = dbBiz?.logo || mockDev?.logo || "";
              const isExpanded = expandedIds.has(review.id);
              const isLong = review.comment.length > 100;
              const diffMs = Date.now() - new Date(review.date).getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const isNew = diffDays <= 3;

              return (
                <div
                  key={review.id}
                  className="snap-start shrink-0 w-[80vw] sm:w-[270px] md:w-[300px] rounded-xl p-3 flex flex-col gap-1 relative overflow-hidden group/card transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-muted/30 border border-border/60 shadow-sm hover:shadow-lg hover:border-primary/20"
                >
                  {/* Decorative quote icon */}
                  <Quote className="absolute top-2 right-2 w-6 h-6 text-primary/[0.07] rotate-180" />

                  {/* New badge */}
                  {isNew && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-primary text-primary-foreground animate-pulse tracking-wider">
                      {isRTL ? "جديد" : "New"}
                    </span>
                  )}

                  {/* Rating row */}
                  <div className="flex items-center gap-1.5">
                    {renderStars(review.rating)}
                    <span className="text-[11px] font-semibold text-primary/80">
                      {getRatingLabel(review.rating)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="min-h-0">
                    <p className={`text-[12px] text-foreground/90 leading-[1.4] line-clamp-3 ${isExpanded ? "!line-clamp-none" : ""}`}>
                      {review.comment}
                    </p>
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                        className="text-[11px] font-semibold text-primary hover:underline mt-0.5"
                      >
                        {isExpanded ? (isRTL ? "أقل" : "Less") : (isRTL ? "المزيد" : "More")}
                      </button>
                    )}
                  </div>

                  {/* Author footer */}
                  <div className="flex items-center justify-between pt-1.5 mt-auto border-t border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      {bizLogo ? (
                        <img
                          src={bizLogo}
                          alt={bizName}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border-2 border-primary/20 shadow-sm"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 shrink-0 flex items-center justify-center shadow-sm">
                          <span className="text-[10px] font-bold text-primary">
                            {bizName.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-semibold text-foreground truncate leading-tight">
                          {bizName || review.author}
                        </span>
                        <span className="text-[9px] text-muted-foreground leading-tight">
                          {getRelativeTime(review.date, i18n.language)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA card — motivate engagement */}
            <div className="snap-start shrink-0 w-[80vw] sm:w-[270px] md:w-[300px] rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.04] to-accent/[0.06] hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              onClick={() => navigate("/reviews")}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground text-center">
                {isRTL ? "شاركنا تجربتك" : "Share your story."}
              </p>
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-[180px]">
                {isRTL
                  ? "ساعد مشترين آخرين باتخاذ قرارات أفضل"
                  : "Help other buyers make smarter decisions"}
              </p>
              <span className="text-[11px] font-semibold text-primary hover:underline">
                {isRTL ? "اكتب تقييم →" : "Write a review →"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-3 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 pb-2">
          <div className="flex items-center gap-1.5">
            {renderStars(Math.round(Number(avgRating)))}
            <span className="text-sm font-bold text-foreground">
              {avgRating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatNumber(sortedReviews.length, i18n.language)} {isRTL ? "تقييم" : "reviews"})
            </span>
          </div>
          <BrandLogo size="hero" tagline="" />
        </div>
      </div>
    </section>
  );
}
