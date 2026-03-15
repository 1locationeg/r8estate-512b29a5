import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { reviews as mockReviews, developers } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import r8Stars from "@/assets/r8-stars.png";
import logoSlogan from "@/assets/logo-slogan.jpg";

interface CarouselReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  developerId: string;
  avatar?: string;
}
function getRelativeTime(dateStr: string, lang: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return lang === "ar" ? "اليوم" : "today";
  if (diffDays < 7) return lang === "ar" ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return lang === "ar" ? `منذ ${w} أسابيع` : `${w} week${w > 1 ? "s" : ""} ago`;
  }
  const m = Math.floor(diffDays / 30);
  return lang === "ar" ? `منذ ${m} أشهر` : `${m} month${m > 1 ? "s" : ""} ago`;
}

export function ReviewsCarousel() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const [liveReviews, setLiveReviews] = useState<CarouselReview[]>([]);

  // Fetch live reviews from database
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
            author: r.is_anonymous ? (isRTL ? "مستخدم مجهول" : "Anonymous") : r.author_name,
            rating: r.rating,
            date: new Date(r.created_at).toISOString().split("T")[0],
            comment: r.comment,
            developerId: r.developer_id,
          }))
        );
      }
    };
    fetchReviews();
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

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
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
              const dev = developers.find((d) => d.id === review.developerId);
              return (
                <div
                  key={review.id}
                  className="snap-start shrink-0 w-[85vw] sm:w-[280px] md:w-[300px] bg-card border border-border rounded-xl p-3 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Stars + Title */}
                  <div className="flex items-center gap-1.5">
                    <img src={r8Stars} alt="R8 Stars" className="h-4 object-contain shrink-0" />
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                      {review.comment.slice(0, 50)}
                      {review.comment.length > 50 ? "…" : ""}
                    </h3>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug flex-1">
                    {review.comment}
                  </p>

                  {/* Author + time */}
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <div className="flex items-center gap-2">
                      {review.avatar && (
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-xs font-medium text-foreground">
                        {review.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {getRelativeTime(review.date, i18n.language)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            {renderStars(Math.round(Number(avgRating)))}
            <span className="text-sm font-semibold text-foreground">
              {t("reviews.basedOn", {
                rating: avgRating,
                count: sortedReviews.length,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={logoSlogan}
              alt="R8ESTATE"
              className="h-7 md:h-9 object-contain rounded"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
