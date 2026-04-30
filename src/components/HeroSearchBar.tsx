import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchPhrases } from "@/hooks/useSearchPhrases";
import { ChevronLeft, ChevronRight, Search, Sparkles, Award, TrendingUp, Zap, Star, Trophy, Rocket, Heart, Share2, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { categories, calculateEngagementScore, type CategoryItem } from "@/components/HeroCategoryItems";
import { TractionStats } from "@/components/TractionStats";

interface HeroSearchBarProps {
  onSelectDeveloper: (developerId: string) => void;
  onSelectItem?: (item: SearchItem) => void;
  onFocusChange?: (focused: boolean) => void;
  showQuickIcons?: boolean;
}

export const HeroSearchBar = ({ onSelectDeveloper, onSelectItem, onFocusChange, showQuickIcons = true }: HeroSearchBarProps) => {
  const { t, i18n } = useTranslation();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  const trustPhrases = useSearchPhrases();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % trustPhrases.length);
        setPlaceholderVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [trustPhrases.length]);

  const searchNavigate = useNavigate();

  const goToSearch = useCallback(() => {
    searchNavigate("/search");
  }, [searchNavigate]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Container - navigates to /search on click */}
      <div
        className="relative flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/60 rounded-xl p-1.5 md:p-2 shadow-md shadow-primary/[0.04] transition-all duration-300 ease-in-out w-full my-[8px] cursor-pointer hover:shadow-lg hover:border-primary/30"
        onClick={goToSearch}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") goToSearch(); }}
      >
        {/* Ask AI Badge */}
        <span className="group flex shrink-0 items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-lg font-medium text-xs md:text-sm whitespace-nowrap relative overflow-hidden">
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>{t("hero.askAI")}</span>
        </span>

        {/* Placeholder text */}
        <div className="flex-1 min-w-0 min-h-[40px] flex items-center px-3 py-2 md:py-2.5">
          <span className={cn(
            "text-sm md:text-base text-muted-foreground truncate transition-opacity duration-300",
            placeholderVisible ? "opacity-100" : "opacity-0"
          )}>
            {trustPhrases[placeholderIndex]}
          </span>
        </div>

        {/* Search Icon */}
        <Search className="w-5 h-5 text-muted-foreground me-1 shrink-0" />

        {/* Validate Decision Badge */}
        <span className="flex shrink-0 items-center px-3 py-2 md:px-5 md:py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold text-xs md:text-sm whitespace-nowrap">
          {t("hero.validateDecision")}
        </span>
      </div>

      {/* KPI Quick Icons */}
      {showQuickIcons && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); searchNavigate("/deal-watch"); }} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Trending</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); searchNavigate("/categories", { state: { view: "bestOf" } }); }} className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>BEST OF 2026</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); searchNavigate("/categories", { state: { view: "trending" } }); }} className="w-8 h-8 rounded-full bg-accent/10 text-accent-foreground hover:bg-accent/20 transition-colors cursor-pointer flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Trending Projects</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); searchNavigate("/launch-watch"); }} className="w-8 h-8 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer flex items-center justify-center">
                  <Rocket className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>New Launches</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

    </div>
  );
};
interface CategoryLink {
  icon: string;
  label: string;
}

interface HeroCategoryLinksProps {
  onViewSelect?: (view: 'bestOf' | 'trending' | 'newLaunches') => void;
  activeView?: 'bestOf' | 'trending' | 'newLaunches' | null;
  onSelectItem?: (item: SearchItem) => void;
  onCategorySelect?: (categoryKey: string) => void;
}

export const HeroCategoryLinks = ({ onViewSelect, activeView, onSelectItem, onCategorySelect }: HeroCategoryLinksProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const viewCategories: { icon: React.ReactNode; label: string; view: 'bestOf' | 'trending' | 'newLaunches' }[] = [
    { icon: <Award className="w-4 h-4 text-accent" />, label: t("hero.bestOf2025"), view: 'bestOf' },
    { icon: <TrendingUp className="w-4 h-4 text-primary" />, label: t("hero.trendingProjects"), view: 'trending' },
    { icon: <Zap className="w-4 h-4 text-brand-red" />, label: t("hero.newLaunches"), view: 'newLaunches' },
  ];

  const allItemsWithMeta = useMemo(() => {
    const allItems: CategoryItem[] = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        allItems.push({ ...item, categoryKey: cat.labelKey, categoryIcon: cat.icon });
      });
    });
    return allItems;
  }, []);

  const bestOf2025Items = useMemo(() => {
    return [...allItemsWithMeta].sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a)).slice(0, 12);
  }, [allItemsWithMeta]);

  const trendingItems = useMemo(() => {
    return [...allItemsWithMeta].sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)).slice(0, 12);
  }, [allItemsWithMeta]);

  const newLaunchItems = useMemo(() => {
    return [...allItemsWithMeta].sort((a, b) => new Date(b.launchDate || "2020-01-01").getTime() - new Date(a.launchDate || "2020-01-01").getTime()).slice(0, 12);
  }, [allItemsWithMeta]);

  const activeSpecialItems = activeView === 'bestOf' ? bestOf2025Items : activeView === 'trending' ? trendingItems : activeView === 'newLaunches' ? newLaunchItems : null;
  const activeSpecialLabel = activeView === 'bestOf'
    ? { icon: <Trophy className="w-5 h-5 text-accent" />, titleEn: "Best of 2025", titleAr: "الأفضل لعام 2025", subtitleEn: "Most Engaged & Top Rated", subtitleAr: "الأكثر تفاعلاً وتقييماً" }
    : activeView === 'trending'
    ? { icon: <TrendingUp className="w-5 h-5 text-primary" />, titleEn: "Trending Projects", titleAr: "المشاريع الرائجة", subtitleEn: "Gaining Momentum Now", subtitleAr: "الأكثر رواجاً حالياً" }
    : activeView === 'newLaunches'
    ? { icon: <Rocket className="w-5 h-5 text-destructive" />, titleEn: "New Launches", titleAr: "إطلاقات جديدة", subtitleEn: "Recently Launched", subtitleAr: "تم إطلاقها مؤخراً" }
    : null;

  const categoryToSearchCategory = (labelKey: string): SearchCategory => {
    const map: Record<string, SearchCategory> = {
      'categories.units': 'units',
      'categories.apps': 'apps',
      'categories.shares': 'developers',
      'categories.platforms': 'apps',
      'categories.brokers': 'brokers',
      'categories.exhibitions': 'categories',
      'categories.channels': 'categories',
      'categories.lawFirms': 'categories',
    };
    return map[labelKey] || 'categories';
  };

  const categoryLinksNavigate = useNavigate();

  const handleItemClick = (item: CategoryItem) => {
    categoryLinksNavigate(`/entity/${item.id}`);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-primary";
    if (rating >= 3) return "text-accent";
    return "text-destructive";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="w-full max-w-5xl px-4">
      {/* View Buttons */}
      <div className="flex items-center justify-center gap-2 md:gap-6 flex-nowrap">
        {viewCategories.map((cat) => (
          <button
            key={cat.view}
            onClick={() => onViewSelect?.(cat.view)}
            className={cn(
              "relative flex items-center gap-1 text-[11px] md:text-sm transition-all group px-2.5 py-1 md:px-3 md:py-1.5 rounded-full whitespace-nowrap border overflow-hidden",
              activeView === cat.view
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]"
                : "text-muted-foreground hover:text-foreground border-border/40 hover:border-border/70 hover:shadow-[0_0_6px_hsl(var(--primary)/0.1)]"
            )}
          >
            {/* Subtle shimmer effect */}
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none" />
            <span className="group-hover:scale-110 transition-transform relative">{cat.icon}</span>
            <span className="relative">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Identity - Infinite scrolling marquee */}
      {!activeView && (() => {
        const featuredItems = [...allItemsWithMeta]
          .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
          .slice(0, 12);

        if (!featuredItems.length) return null;

        // Triple-copy for seamless infinite marquee without visual gaps
        const loopItems = [...featuredItems, ...featuredItems, ...featuredItems];

        return (
          <div className="mt-3 w-full overflow-hidden overflow-x-hidden">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-start">
              {t("hero.featured")}
            </h3>
            <div className="relative">
              <div
                className={cn("flex w-max", isRTL ? "animate-marquee-rtl" : "animate-marquee")}
              >
                {loopItems.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 px-4 py-2.5 mx-1.5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer shrink-0 min-w-[180px] max-w-[220px]"
                  >
                    <Avatar className="w-10 h-10 ring-2 ring-accent/30 group-hover:ring-accent transition-all shrink-0">
                      <AvatarImage src={item.avatar} alt={isRTL ? item.nameAr : item.nameEn} />
                      <AvatarFallback className="bg-secondary text-[10px]">
                        {(isRTL ? item.nameAr : item.nameEn).substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-start min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {isRTL ? item.nameAr : item.nameEn}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className={cn("w-3 h-3 fill-current", getRatingColor(item.rating))} />
                        <span className={cn("text-[10px] font-semibold", getRatingColor(item.rating))}>
                          {item.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({item.reviewCount.toLocaleString(isRTL ? "ar-EG" : "en-US")})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {item.categoryIcon}
                        <span className="text-[9px] text-muted-foreground">{t(item.categoryKey || '')}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {activeSpecialItems && activeSpecialLabel && (
        <div className="mt-6 bg-gradient-to-b from-accent/5 to-background rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            {activeSpecialLabel.icon}
            <h3 className="text-lg font-bold text-foreground">
              {isRTL ? activeSpecialLabel.titleAr : activeSpecialLabel.titleEn}
            </h3>
            <span className="text-sm text-muted-foreground">
              - {isRTL ? activeSpecialLabel.subtitleAr : activeSpecialLabel.subtitleEn}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {activeSpecialItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all group cursor-pointer"
              >
                {/* Rank Badge */}
                <div className={cn(
                  "absolute -top-2 -start-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 ? "bg-accent text-accent-foreground" :
                  index === 1 ? "bg-muted-foreground text-background" :
                  index === 2 ? "bg-destructive/80 text-destructive-foreground" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                {/* Category Badge */}
                <div className="absolute -top-2 -end-2 text-sm">
                  {item.categoryIcon}
                </div>

                <Avatar className="w-12 h-12 md:w-14 md:h-14 ring-2 ring-accent/30 group-hover:ring-accent transition-all">
                  <AvatarImage src={item.avatar} alt={isRTL ? item.nameAr : item.nameEn} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {(isRTL ? item.nameAr : item.nameEn).substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center w-full">
                  <p className="text-xs md:text-sm font-medium text-foreground line-clamp-1">
                    {isRTL ? item.nameAr : item.nameEn}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className={cn("w-3 h-3 fill-current", getRatingColor(item.rating))} />
                    <span className={cn("text-xs font-semibold", getRatingColor(item.rating))}>
                      {item.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({item.reviewCount.toLocaleString(isRTL ? "ar-EG" : "en-US")})
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-1.5 text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5" />
                      <span className="text-[10px]">{formatNumber(item.likes || 0)}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Share2 className="w-2.5 h-2.5" />
                      <span className="text-[10px]">{formatNumber(item.shares || 0)}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span className="text-[10px]">{formatNumber(item.replies || 0)}</span>
                    </div>
                  </div>

                  {activeView === 'newLaunches' && item.launchDate && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(item.launchDate).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}

                  {activeView === 'trending' && item.trendScore && (
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="w-2.5 h-2.5 text-primary" />
                      <span className="text-[10px] text-primary font-semibold">{item.trendScore}%</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface BottomCategory {
  icon: React.ReactNode;
  label: string;
}

export const HeroBottomBar = () => {
  const { t } = useTranslation();

  const categories: BottomCategory[] = [
    { icon: "🗄️", label: t("categories.units") },
    { icon: "📁", label: t("categories.apps") },
    { icon: "📂", label: t("categories.shares") },
    { icon: "📋", label: t("categories.platforms") },
    { icon: "🤝", label: t("categories.brokers") },
    { icon: "🖥️", label: t("categories.exhibitions") },
    { icon: "📺", label: t("categories.channels") },
  ];

  return (
    <div className="relative flex items-center bg-card border-t border-border">
      {/* Left Arrow */}
      <button className="p-2 md:p-3 hover:bg-secondary/50 transition-colors border-e border-border">
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
      </button>

      {/* Scrollable Categories */}
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 md:gap-2 px-2 py-2 md:py-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary rounded-lg text-xs md:text-sm text-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      <button className="p-2 md:p-3 hover:bg-secondary/50 transition-colors border-s border-border">
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
      </button>
    </div>
  );
};
