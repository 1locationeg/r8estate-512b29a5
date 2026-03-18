import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { reviews as mockReviews, developers } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import logoOnly from "@/assets/logo-only.png";
import sideLongLogo from "@/assets/side-long-logo.png";

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const [liveReviews, setLiveReviews] = useState<CarouselReview[]>([]);
  const [businessLogos, setBusinessLogos] = useState<BusinessLogo[]>([]);

  // Fetch live reviews and business profiles
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

  // Merge live DB reviews with mock, dedup by id, latest first
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

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const absScroll = Math.abs(scrollLeft);
    setCanScrollLeft(absScroll > 2);
    setCanScrollRight(absScroll + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

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
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isRTL]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 280;
    const amount = dir === "left" ? -(cardWidth + 16) : cardWidth + 16;
    el.scrollBy({ left: isRTL ? -amount : amount, behavior: "smooth" });
  };

  // Star color based on satisfaction level
  const getStarColor = (rating: number) => {
    if (rating <= 1) return "text-red-500 fill-red-500";
    if (rating <= 2) return "text-orange-500 fill-orange-500";
    if (rating <= 3) return "text-yellow-500 fill-yellow-500";
    if (rating <= 4) return "text-green-500 fill-green-500";
    return "text-primary fill-primary"; // navy for 5 stars
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 flex-shrink-0 ${i <= rating ? getStarColor(rating) : "text-muted stroke-muted-foreground/30 fill-none"}`}
        />
      ))}
    </div>
  );

  return (
    <section className="w-full py-0 overflow-hidden">
      <div className="max-w-6xl mx-auto px-2">

        {/* Carousel */}
        <div className="relative group">
          {/* Nav buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-opacity opacity-70 hover:opacity-100 start-0 md:-start-3"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-opacity opacity-70 hover:opacity-100 end-0 md:-end-3"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-0"
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
              const isLong = review.comment.length > 120;
              return (
                <div
                  key={review.id}
                  className="snap-start shrink-0 w-[85vw] sm:w-[300px] md:w-[340px] bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Stars + New badge */}
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {(() => {
                      const diffMs = Date.now() - new Date(review.date).getTime();
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      return diffDays <= 3 ? (
                        <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-primary text-primary-foreground animate-pulse">
                          {isRTL ? "جديد" : "New"}
                        </span>
                      ) : null;
                    })()}
                  </div>

                  {/* Comment — 2 lines max with inline "more" */}
                  <div className="relative">
                    <p className={`text-sm text-foreground leading-relaxed ${!isExpanded && isLong ? "line-clamp-2" : ""}`}>
                      {review.comment}
                      {!isExpanded && isLong && (
                        <button
                          onClick={() => toggleExpand(review.id)}
                          className="text-sm font-semibold text-primary hover:underline ml-1 inline"
                         >
                           {t("review.more")}
                         </button>
                      )}
                    </p>
                    {isExpanded && isLong && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                       className="text-xs font-medium text-primary hover:underline mt-1"
                     >
                       {t("review.show_less")}
                     </button>
                      </button>
                    )}
                  </div>

                  {/* Business profile + Author + time */}
                  <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                    <div className="flex items-center gap-2 min-w-0">
                      {bizLogo ? (
                        <img
                          src={bizLogo}
                          alt={bizName}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted shrink-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {bizName.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-foreground truncate">
                        {bizName || review.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {getRelativeTime(review.date, i18n.language)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-2 flex flex-row flex-wrap items-center justify-center gap-1.5 sm:gap-3 pb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {renderStars(Math.round(Number(avgRating)))}
            <span className="text-sm font-bold text-foreground">
              {avgRating}
            </span>
            <span className="text-sm text-muted-foreground">
              ({sortedReviews.length.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src={logoOnly}
              alt="R8ESTATE"
              className="h-4 sm:h-6 md:h-7 w-auto object-contain"
            />
            <img
              src={sideLongLogo}
              alt="R8ESTATE"
              className="h-5 sm:h-7 md:h-9 object-contain rounded"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
