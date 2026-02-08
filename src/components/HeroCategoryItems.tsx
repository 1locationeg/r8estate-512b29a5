import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Star, Trophy, Heart, Share2, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  likes?: number;
  shares?: number;
  replies?: number;
  categoryKey?: string;
  categoryIcon?: string;
}

interface Category {
  icon: string;
  labelKey: string;
  items: CategoryItem[];
}

const categories: Category[] = [
  {
    icon: "🗄️",
    labelKey: "categories.units",
    items: [
      { id: "studio", nameEn: "Studio", nameAr: "ستوديو", avatar: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 156, likes: 342, shares: 89, replies: 45 },
      { id: "twin-house", nameEn: "Twin House", nameAr: "توين هاوس", avatar: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 89, likes: 234, shares: 56, replies: 23 },
      { id: "villa", nameEn: "Villa", nameAr: "فيلا", avatar: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop", rating: 4.7, reviewCount: 234, likes: 567, shares: 145, replies: 89 },
      { id: "chalet", nameEn: "Chalet", nameAr: "شاليه", avatar: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 178, likes: 289, shares: 67, replies: 34 },
      { id: "penthouse", nameEn: "Penthouse", nameAr: "بنتهاوس", avatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop", rating: 4.8, reviewCount: 67, likes: 456, shares: 123, replies: 67 },
      { id: "loft", nameEn: "Loft", nameAr: "لوفت", avatar: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 45, likes: 123, shares: 34, replies: 12 },
      { id: "office", nameEn: "Office", nameAr: "مكتب", avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 112, likes: 234, shares: 56, replies: 28 },
      { id: "retail", nameEn: "Retail", nameAr: "محل تجاري", avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop", rating: 4.0, reviewCount: 98, likes: 167, shares: 45, replies: 19 },
    ],
  },
  {
    icon: "📁",
    labelKey: "categories.apps",
    items: [
      { id: "nawy", nameEn: "Nawy App", nameAr: "تطبيق ناوي", avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 1250, likes: 3456, shares: 890, replies: 456 },
      { id: "farida", nameEn: "Farida", nameAr: "فريدة", avatar: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234 },
      { id: "byit", nameEn: "Byit", nameAr: "بايت", avatar: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 543, likes: 1234, shares: 345, replies: 123 },
      { id: "broker-zone", nameEn: "Broker Zone", nameAr: "بروكر زون", avatar: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 321, likes: 876, shares: 234, replies: 89 },
    ],
  },
  {
    icon: "📂",
    labelKey: "categories.shares",
    items: [
      { id: "orascom", nameEn: "Orascom Development", nameAr: "أوراسكوم للتنمية", avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 456, likes: 1234, shares: 345, replies: 167 },
      { id: "talaat", nameEn: "Talaat Moustafa", nameAr: "طلعت مصطفى", avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 678, likes: 1567, shares: 456, replies: 234 },
      { id: "palm-hills", nameEn: "Palm Hills", nameAr: "بالم هيلز", avatar: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 345, likes: 987, shares: 234, replies: 123 },
      { id: "sodic", nameEn: "SODIC", nameAr: "سوديك", avatar: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 234, likes: 654, shares: 167, replies: 89 },
    ],
  },
  {
    icon: "📋",
    labelKey: "categories.platforms",
    items: [
      { id: "aqarmap", nameEn: "Aqarmap", nameAr: "عقار ماب", avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 2340, likes: 5678, shares: 1234, replies: 567 },
      { id: "dubizzle", nameEn: "Dubizzle", nameAr: "دوبيزل", avatar: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 1876, likes: 4567, shares: 987, replies: 456 },
      { id: "property-finder", nameEn: "Property Finder", nameAr: "بروبرتي فايندر", avatar: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 3210, likes: 7890, shares: 1567, replies: 789 },
      { id: "property-sorted", nameEn: "Property Sorted", nameAr: "بروبرتي سورتد", avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 567, likes: 1234, shares: 345, replies: 167 },
    ],
  },
  {
    icon: "🤝",
    labelKey: "categories.brokers",
    items: [
      { id: "the-address", nameEn: "The Address", nameAr: "ذا أدرس", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.7, reviewCount: 456, likes: 1234, shares: 345, replies: 167 },
      { id: "bold-routes", nameEn: "Bold Routes", nameAr: "بولد روتس", avatar: "https://randomuser.me/api/portraits/men/45.jpg", rating: 4.4, reviewCount: 234, likes: 567, shares: 134, replies: 67 },
      { id: "remax", nameEn: "RE/MAX", nameAr: "ري/ماكس", avatar: "https://randomuser.me/api/portraits/men/67.jpg", rating: 4.5, reviewCount: 1230, likes: 3456, shares: 789, replies: 345 },
      { id: "red", nameEn: "RED", nameAr: "ريد", avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234 },
      { id: "coldwell", nameEn: "Coldwell Banker", nameAr: "كولدويل بانكر", avatar: "https://randomuser.me/api/portraits/men/22.jpg", rating: 4.6, reviewCount: 1567, likes: 4567, shares: 987, replies: 456 },
      { id: "nawy-partners", nameEn: "Nawy Partners", nameAr: "شركاء ناوي", avatar: "https://randomuser.me/api/portraits/women/28.jpg", rating: 4.2, reviewCount: 345, likes: 876, shares: 234, replies: 123 },
    ],
  },
  {
    icon: "🖥️",
    labelKey: "categories.exhibitions",
    items: [
      { id: "cityscape", nameEn: "Cityscape", nameAr: "سيتي سكيب", avatar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop", rating: 4.8, reviewCount: 3456, likes: 8901, shares: 2345, replies: 1234 },
      { id: "red-expo", nameEn: "RED Expo", nameAr: "ريد إكسبو", avatar: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345 },
      { id: "al-ahram", nameEn: "Al-Ahram Expo", nameAr: "معرض الأهرام", avatar: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567 },
      { id: "the-real-estate", nameEn: "The Real Estate", nameAr: "ذا ريل إستيت", avatar: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 987, likes: 2345, shares: 567, replies: 234 },
    ],
  },
  {
    icon: "📺",
    labelKey: "categories.channels",
    items: [
      { id: "property-insider", nameEn: "Property Insider", nameAr: "بروبرتي إنسايدر", avatar: "https://randomuser.me/api/portraits/men/52.jpg", rating: 4.6, reviewCount: 5678, likes: 12345, shares: 3456, replies: 1567 },
      { id: "podcast-aqary", nameEn: "Podcast Aqary", nameAr: "بودكاست عقاري", avatar: "https://randomuser.me/api/portraits/men/36.jpg", rating: 4.4, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567 },
      { id: "bait-sameh", nameEn: "Bait Sameh", nameAr: "بيت سامح", avatar: "https://randomuser.me/api/portraits/men/41.jpg", rating: 4.7, reviewCount: 4567, likes: 9876, shares: 2345, replies: 1234 },
    ],
  },
];

const getRatingColor = (rating: number) => {
  if (rating >= 4) return "text-primary";
  if (rating >= 3) return "text-accent";
  return "text-destructive";
};

// Calculate engagement score for ranking
const calculateEngagementScore = (item: CategoryItem) => {
  const reviewWeight = 2;
  const ratingWeight = 1000;
  const likeWeight = 1;
  const shareWeight = 3;
  const replyWeight = 2;
  
  return (
    (item.reviewCount * reviewWeight) +
    (item.rating * ratingWeight) +
    ((item.likes || 0) * likeWeight) +
    ((item.shares || 0) * shareWeight) +
    ((item.replies || 0) * replyWeight)
  );
};

export const HeroCategoryItems = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showBestOf2025, setShowBestOf2025] = useState(false);
  const isRTL = i18n.language === "ar";

  // Get best items across all categories
  const bestOf2025Items = useMemo(() => {
    const allItems: CategoryItem[] = [];
    
    categories.forEach(cat => {
      cat.items.forEach(item => {
        allItems.push({
          ...item,
          categoryKey: cat.labelKey,
          categoryIcon: cat.icon,
        });
      });
    });
    
    // Sort by engagement score and take top 12
    return allItems
      .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
      .slice(0, 12);
  }, []);

  const handleBestOf2025Click = () => {
    setShowBestOf2025(!showBestOf2025);
    setActiveCategory(null);
  };

  const handleCategoryClick = (labelKey: string) => {
    setActiveCategory(activeCategory === labelKey ? null : labelKey);
    setShowBestOf2025(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="relative bg-card border-t border-border">
      {/* Category Tabs */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button className="p-2 md:p-3 hover:bg-secondary/50 transition-colors border-e border-border">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
        </button>

        {/* Scrollable Categories */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 md:gap-2 px-2 py-2 md:py-3">
            {/* Best of 2025 Button */}
            <button
              onClick={handleBestOf2025Click}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap",
                showBestOf2025
                  ? "bg-accent text-accent-foreground"
                  : "bg-accent/20 text-accent-foreground hover:bg-accent/40"
              )}
            >
              <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{t("hero.bestOf2025")}</span>
            </button>

            {/* Category Buttons */}
            {categories.map((cat) => (
              <button
                key={cat.labelKey}
                onClick={() => handleCategoryClick(cat.labelKey)}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap",
                  activeCategory === cat.labelKey
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                <span>{cat.icon}</span>
                <span>{t(cat.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button className="p-2 md:p-3 hover:bg-secondary/50 transition-colors border-s border-border">
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Best of 2025 Items */}
      {showBestOf2025 && (
        <div className="border-t border-border bg-gradient-to-b from-accent/5 to-background">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-foreground">
                {isRTL ? "الأفضل في 2025" : "Best of 2025"}
              </h3>
              <span className="text-sm text-muted-foreground">
                {isRTL ? "- الأكثر تفاعلاً وتقييماً" : "- Most Engaged & Top Rated"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {bestOf2025Items.map((item, index) => (
                <button
                  key={item.id}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all group"
                >
                  {/* Rank Badge */}
                  <div className={cn(
                    "absolute -top-2 -start-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-accent text-accent-foreground" :
                    index === 1 ? "bg-muted-foreground text-background" :
                    index === 2 ? "bg-orange-500 text-white" :
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
                    
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className={cn("w-3 h-3 fill-current", getRatingColor(item.rating))} />
                      <span className={cn("text-xs font-semibold", getRatingColor(item.rating))}>
                        {item.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.reviewCount.toLocaleString(isRTL ? "ar-EG" : "en-US")})
                      </span>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-center gap-2 mt-1.5 text-muted-foreground">
                      <div className="flex items-center gap-0.5" title={isRTL ? "إعجابات" : "Likes"}>
                        <Heart className="w-2.5 h-2.5" />
                        <span className="text-[10px]">{formatNumber(item.likes || 0)}</span>
                      </div>
                      <div className="flex items-center gap-0.5" title={isRTL ? "مشاركات" : "Shares"}>
                        <Share2 className="w-2.5 h-2.5" />
                        <span className="text-[10px]">{formatNumber(item.shares || 0)}</span>
                      </div>
                      <div className="flex items-center gap-0.5" title={isRTL ? "ردود" : "Replies"}>
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span className="text-[10px]">{formatNumber(item.replies || 0)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Items Dropdown */}
      {activeCategory && (
        <div className="border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {categories
                .find((c) => c.labelKey === activeCategory)
                ?.items.map((item) => (
                  <button
                    key={item.id}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                  >
                    <Avatar className="w-12 h-12 md:w-14 md:h-14 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                      <AvatarImage src={item.avatar} alt={isRTL ? item.nameAr : item.nameEn} />
                      <AvatarFallback className="bg-secondary text-xs">
                        {(isRTL ? item.nameAr : item.nameEn).substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
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
                      
                      {/* Engagement Stats for regular items too */}
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
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};