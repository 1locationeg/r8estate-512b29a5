import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
      { id: "studio", nameEn: "Studio", nameAr: "ستوديو", avatar: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 156 },
      { id: "twin-house", nameEn: "Twin House", nameAr: "توين هاوس", avatar: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 89 },
      { id: "villa", nameEn: "Villa", nameAr: "فيلا", avatar: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop", rating: 4.7, reviewCount: 234 },
      { id: "chalet", nameEn: "Chalet", nameAr: "شاليه", avatar: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 178 },
      { id: "penthouse", nameEn: "Penthouse", nameAr: "بنتهاوس", avatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop", rating: 4.8, reviewCount: 67 },
      { id: "loft", nameEn: "Loft", nameAr: "لوفت", avatar: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 45 },
      { id: "office", nameEn: "Office", nameAr: "مكتب", avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 112 },
      { id: "retail", nameEn: "Retail", nameAr: "محل تجاري", avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop", rating: 4.0, reviewCount: 98 },
    ],
  },
  {
    icon: "📁",
    labelKey: "categories.apps",
    items: [
      { id: "nawy", nameEn: "Nawy App", nameAr: "تطبيق ناوي", avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 1250 },
      { id: "farida", nameEn: "Farida", nameAr: "فريدة", avatar: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 876 },
      { id: "byit", nameEn: "Byit", nameAr: "بايت", avatar: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 543 },
      { id: "broker-zone", nameEn: "Broker Zone", nameAr: "بروكر زون", avatar: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 321 },
    ],
  },
  {
    icon: "📂",
    labelKey: "categories.shares",
    items: [
      { id: "orascom", nameEn: "Orascom Development", nameAr: "أوراسكوم للتنمية", avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 456 },
      { id: "talaat", nameEn: "Talaat Moustafa", nameAr: "طلعت مصطفى", avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 678 },
      { id: "palm-hills", nameEn: "Palm Hills", nameAr: "بالم هيلز", avatar: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 345 },
      { id: "sodic", nameEn: "SODIC", nameAr: "سوديك", avatar: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 234 },
    ],
  },
  {
    icon: "📋",
    labelKey: "categories.platforms",
    items: [
      { id: "aqarmap", nameEn: "Aqarmap", nameAr: "عقار ماب", avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 2340 },
      { id: "dubizzle", nameEn: "Dubizzle", nameAr: "دوبيزل", avatar: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 1876 },
      { id: "property-finder", nameEn: "Property Finder", nameAr: "بروبرتي فايندر", avatar: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 3210 },
      { id: "property-sorted", nameEn: "Property Sorted", nameAr: "بروبرتي سورتد", avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 567 },
    ],
  },
  {
    icon: "🤝",
    labelKey: "categories.brokers",
    items: [
      { id: "the-address", nameEn: "The Address", nameAr: "ذا أدرس", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.7, reviewCount: 456 },
      { id: "bold-routes", nameEn: "Bold Routes", nameAr: "بولد روتس", avatar: "https://randomuser.me/api/portraits/men/45.jpg", rating: 4.4, reviewCount: 234 },
      { id: "remax", nameEn: "RE/MAX", nameAr: "ري/ماكس", avatar: "https://randomuser.me/api/portraits/men/67.jpg", rating: 4.5, reviewCount: 1230 },
      { id: "red", nameEn: "RED", nameAr: "ريد", avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.3, reviewCount: 876 },
      { id: "coldwell", nameEn: "Coldwell Banker", nameAr: "كولدويل بانكر", avatar: "https://randomuser.me/api/portraits/men/22.jpg", rating: 4.6, reviewCount: 1567 },
      { id: "nawy-partners", nameEn: "Nawy Partners", nameAr: "شركاء ناوي", avatar: "https://randomuser.me/api/portraits/women/28.jpg", rating: 4.2, reviewCount: 345 },
    ],
  },
  {
    icon: "🖥️",
    labelKey: "categories.exhibitions",
    items: [
      { id: "cityscape", nameEn: "Cityscape", nameAr: "سيتي سكيب", avatar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop", rating: 4.8, reviewCount: 3456 },
      { id: "red-expo", nameEn: "RED Expo", nameAr: "ريد إكسبو", avatar: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1234 },
      { id: "al-ahram", nameEn: "Al-Ahram Expo", nameAr: "معرض الأهرام", avatar: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 2345 },
      { id: "the-real-estate", nameEn: "The Real Estate", nameAr: "ذا ريل إستيت", avatar: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 987 },
    ],
  },
  {
    icon: "📺",
    labelKey: "categories.channels",
    items: [
      { id: "property-insider", nameEn: "Property Insider", nameAr: "بروبرتي إنسايدر", avatar: "https://randomuser.me/api/portraits/men/52.jpg", rating: 4.6, reviewCount: 5678 },
      { id: "podcast-aqary", nameEn: "Podcast Aqary", nameAr: "بودكاست عقاري", avatar: "https://randomuser.me/api/portraits/men/36.jpg", rating: 4.4, reviewCount: 2345 },
      { id: "bait-sameh", nameEn: "Bait Sameh", nameAr: "بيت سامح", avatar: "https://randomuser.me/api/portraits/men/41.jpg", rating: 4.7, reviewCount: 4567 },
    ],
  },
];

const getRatingColor = (rating: number) => {
  if (rating >= 4) return "text-primary";
  if (rating >= 3) return "text-accent";
  return "text-destructive";
};

export const HeroCategoryItems = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isRTL = i18n.language === "ar";

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
            {categories.map((cat) => (
              <button
                key={cat.labelKey}
                onClick={() => setActiveCategory(activeCategory === cat.labelKey ? null : cat.labelKey)}
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
