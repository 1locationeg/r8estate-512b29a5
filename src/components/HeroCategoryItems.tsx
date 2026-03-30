import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, Share2, MessageCircle, ChevronRight, ChevronDown, LayoutGrid, Smartphone, BarChart3, Globe, Users, CalendarDays, Tv, Scale, DollarSign, GraduationCap, Gavel, Landmark, FlaskConical, Receipt, Building2, Key, Link, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type SearchItem } from "@/data/searchIndex";
import { generateAvatar } from "@/lib/avatarUtils";
import { useBusinessLogo } from "@/contexts/BusinessLogoContext";

const brandLogo = (name: string, _domain?: string): string =>
  generateAvatar(name, "category");

export interface CategoryItem {
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
  categoryIcon?: React.ReactNode;
  launchDate?: string;
  trendScore?: number;
}

interface Category {
  icon: React.ReactNode;
  labelKey: string;
  items: CategoryItem[];
}

// (duplicate interface removed)

export const categories: Category[] = [
  {
    icon: <LayoutGrid className="w-4 h-4 text-primary" />,
    labelKey: "categories.units",
    items: [
      { id: "studio", nameEn: "Studio", nameAr: "ستوديو", avatar: generateAvatar("Studio", "category"), rating: 4.2, reviewCount: 156, likes: 342, shares: 89, replies: 45, launchDate: "2025-01-15", trendScore: 78 },
      { id: "twin-house", nameEn: "Twin House", nameAr: "توين هاوس", avatar: generateAvatar("Twin House", "category"), rating: 4.5, reviewCount: 89, likes: 234, shares: 56, replies: 23, launchDate: "2024-11-20", trendScore: 65 },
      { id: "villa", nameEn: "Villa", nameAr: "فيلا", avatar: generateAvatar("Villa", "category"), rating: 4.7, reviewCount: 234, likes: 567, shares: 145, replies: 89, launchDate: "2024-06-10", trendScore: 92 },
      { id: "chalet", nameEn: "Chalet", nameAr: "شاليه", avatar: generateAvatar("Chalet", "category"), rating: 4.3, reviewCount: 178, likes: 289, shares: 67, replies: 34, launchDate: "2025-02-01", trendScore: 88 },
      { id: "penthouse", nameEn: "Penthouse", nameAr: "بنتهاوس", avatar: generateAvatar("Penthouse", "category"), rating: 4.8, reviewCount: 67, likes: 456, shares: 123, replies: 67, launchDate: "2025-01-28", trendScore: 95 },
      { id: "loft", nameEn: "Loft", nameAr: "لوفت", avatar: generateAvatar("Loft", "category"), rating: 4.1, reviewCount: 45, likes: 123, shares: 34, replies: 12, launchDate: "2024-12-05", trendScore: 42 },
      { id: "office", nameEn: "Office", nameAr: "مكتب", avatar: generateAvatar("Office", "category"), rating: 4.4, reviewCount: 112, likes: 234, shares: 56, replies: 28, launchDate: "2024-09-15", trendScore: 71 },
      { id: "retail", nameEn: "Retail", nameAr: "محل تجاري", avatar: generateAvatar("Retail", "category"), rating: 4.0, reviewCount: 98, likes: 167, shares: 45, replies: 19, launchDate: "2024-10-22", trendScore: 55 },
    ],
  },
  {
    icon: <Smartphone className="w-4 h-4 text-accent" />,
    labelKey: "categories.apps",
    items: [
      { id: "nawy", nameEn: "Nawy App", nameAr: "تطبيق ناوي", avatar: brandLogo("Nawy", "nawy.com"), rating: 4.6, reviewCount: 1250, likes: 3456, shares: 890, replies: 456, launchDate: "2024-03-10", trendScore: 97 },
      { id: "farida", nameEn: "Farida", nameAr: "فريدة", avatar: brandLogo("Farida", "farida.properties"), rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-08-15", trendScore: 82 },
      { id: "byit", nameEn: "Byit", nameAr: "بايت", avatar: brandLogo("Byit", "byit.com"), rating: 4.1, reviewCount: 543, likes: 1234, shares: 345, replies: 123, launchDate: "2025-01-05", trendScore: 91 },
      { id: "broker-zone", nameEn: "Broker Zone", nameAr: "بروكر زون", avatar: brandLogo("Broker Zone", "brokerzone.com"), rating: 4.4, reviewCount: 321, likes: 876, shares: 234, replies: 89, launchDate: "2024-11-01", trendScore: 68 },
    ],
  },
  {
    icon: <BarChart3 className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.shares",
    items: [
      { id: "orascom", nameEn: "Orascom Development", nameAr: "أوراسكوم للتنمية", avatar: brandLogo("Orascom", "orascomdh.com"), rating: 4.2, reviewCount: 456, likes: 1234, shares: 345, replies: 167, launchDate: "2023-05-01", trendScore: 60 },
      { id: "talaat", nameEn: "Talaat Moustafa", nameAr: "طلعت مصطفى", avatar: brandLogo("TMG", "talaatmoustafa.com"), rating: 4.5, reviewCount: 678, likes: 1567, shares: 456, replies: 234, launchDate: "2023-01-15", trendScore: 85 },
      { id: "palm-hills", nameEn: "Palm Hills", nameAr: "بالم هيلز", avatar: brandLogo("Palm Hills", "palmhillsdevelopments.com"), rating: 4.3, reviewCount: 345, likes: 987, shares: 234, replies: 123, launchDate: "2024-02-20", trendScore: 73 },
      { id: "sodic", nameEn: "SODIC", nameAr: "سوديك", avatar: brandLogo("SODIC", "sodic.com"), rating: 4.4, reviewCount: 234, likes: 654, shares: 167, replies: 89, launchDate: "2024-07-10", trendScore: 67 },
    ],
  },
  {
    icon: <Globe className="w-4 h-4 text-primary" />,
    labelKey: "categories.platforms",
    items: [
      { id: "aqarmap", nameEn: "Aqarmap", nameAr: "عقار ماب", avatar: brandLogo("Aqarmap", "aqarmap.com.eg"), rating: 4.5, reviewCount: 2340, likes: 5678, shares: 1234, replies: 567, launchDate: "2022-01-01", trendScore: 88 },
      { id: "dubizzle", nameEn: "Dubizzle", nameAr: "دوبيزل", avatar: brandLogo("Dubizzle", "dubizzle.com.eg"), rating: 4.3, reviewCount: 1876, likes: 4567, shares: 987, replies: 456, launchDate: "2021-06-15", trendScore: 79 },
      { id: "property-finder", nameEn: "Property Finder", nameAr: "بروبرتي فايندر", avatar: brandLogo("Property Finder", "propertyfinder.eg"), rating: 4.6, reviewCount: 3210, likes: 7890, shares: 1567, replies: 789, launchDate: "2020-03-20", trendScore: 96 },
      { id: "property-sorted", nameEn: "Property Sorted", nameAr: "بروبرتي سورتد", avatar: brandLogo("Property Sorted", "propertysorted.com"), rating: 4.1, reviewCount: 567, likes: 1234, shares: 345, replies: 167, launchDate: "2024-12-01", trendScore: 74 },
    ],
  },
  {
    icon: <Users className="w-4 h-4 text-accent" />,
    labelKey: "categories.brokers",
    items: [
      { id: "the-address", nameEn: "The Address", nameAr: "ذا أدرس", avatar: brandLogo("The Address", "theaddress.ae"), rating: 4.7, reviewCount: 456, likes: 1234, shares: 345, replies: 167, launchDate: "2023-04-10", trendScore: 81 },
      { id: "bold-routes", nameEn: "Bold Routes", nameAr: "بولد روتس", avatar: brandLogo("Bold Routes", "boldroutes.com"), rating: 4.4, reviewCount: 234, likes: 567, shares: 134, replies: 67, launchDate: "2024-06-20", trendScore: 72 },
      { id: "remax", nameEn: "RE/MAX", nameAr: "ري/ماكس", avatar: brandLogo("RE/MAX", "remax.com"), rating: 4.5, reviewCount: 1230, likes: 3456, shares: 789, replies: 345, launchDate: "2019-01-01", trendScore: 83 },
      { id: "red", nameEn: "RED", nameAr: "ريد", avatar: brandLogo("RED", "redcon-properties.com"), rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-09-15", trendScore: 76 },
      { id: "coldwell", nameEn: "Coldwell Banker", nameAr: "كولدويل بانكر", avatar: brandLogo("Coldwell Banker", "coldwellbanker.com"), rating: 4.6, reviewCount: 1567, likes: 4567, shares: 987, replies: 456, launchDate: "2020-05-01", trendScore: 89 },
      { id: "nawy-partners", nameEn: "Nawy Partners", nameAr: "شركاء ناوي", avatar: brandLogo("Nawy Partners", "nawy.com"), rating: 4.2, reviewCount: 345, likes: 876, shares: 234, replies: 123, launchDate: "2024-10-05", trendScore: 70 },
    ],
  },
  {
    icon: <CalendarDays className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.exhibitions",
    items: [
      { id: "cityscape", nameEn: "Cityscape", nameAr: "سيتي سكيب", avatar: brandLogo("Cityscape", "cityscapeglobal.com"), rating: 4.8, reviewCount: 3456, likes: 8901, shares: 2345, replies: 1234, launchDate: "2024-04-15", trendScore: 99 },
      { id: "red-expo", nameEn: "RED Expo", nameAr: "ريد إكسبو", avatar: brandLogo("RED Expo", "redcon-properties.com"), rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2024-09-20", trendScore: 86 },
      { id: "al-ahram", nameEn: "Al-Ahram Expo", nameAr: "معرض الأهرام", avatar: brandLogo("Al-Ahram", "ahram.org.eg"), rating: 4.3, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567, launchDate: "2024-02-10", trendScore: 77 },
      { id: "the-real-estate", nameEn: "The Real Estate", nameAr: "ذا ريل إستيت", avatar: brandLogo("The Real Estate", "therealestate.com"), rating: 4.4, reviewCount: 987, likes: 2345, shares: 567, replies: 234, launchDate: "2025-01-20", trendScore: 93 },
    ],
  },
  {
    icon: <Tv className="w-4 h-4 text-primary" />,
    labelKey: "categories.channels",
    items: [
      { id: "property-insider", nameEn: "Property Insider", nameAr: "بروبرتي إنسايدر", avatar: brandLogo("Property Insider", "propertyinsider.com"), rating: 4.6, reviewCount: 5678, likes: 12345, shares: 3456, replies: 1567, launchDate: "2022-08-01", trendScore: 94 },
      { id: "podcast-aqary", nameEn: "Podcast Aqary", nameAr: "بودكاست عقاري", avatar: brandLogo("Podcast Aqary", "podcastaqary.com"), rating: 4.4, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567, launchDate: "2023-11-15", trendScore: 84 },
      { id: "bait-sameh", nameEn: "Bait Sameh", nameAr: "بيت سامح", avatar: brandLogo("Bait Sameh", "youtube.com"), rating: 4.7, reviewCount: 4567, likes: 9876, shares: 2345, replies: 1234, launchDate: "2023-06-01", trendScore: 91 },
    ],
  },
  {
    icon: <Scale className="w-4 h-4 text-accent" />,
    labelKey: "categories.lawFirms",
    items: [
      { id: "diyaa-eldin", nameEn: "Diyaa Eldin", nameAr: "ضياء الدين", avatar: brandLogo("Diyaa Eldin", "diyaaeldin.com"), rating: 4.6, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-03-01", trendScore: 80 },
      { id: "mashoralaw", nameEn: "Mashoralaw", nameAr: "مشورة للمحاماة", avatar: brandLogo("Mashoralaw", "mashoralaw.com"), rating: 4.4, reviewCount: 654, likes: 1876, shares: 432, replies: 189, launchDate: "2024-01-15", trendScore: 75 },
      { id: "partners-law", nameEn: "Partners Law", nameAr: "بارتنرز لو", avatar: brandLogo("Partners Law", "partnerslaw.com"), rating: 4.5, reviewCount: 543, likes: 1567, shares: 389, replies: 156, launchDate: "2024-05-20", trendScore: 72 },
      { id: "adsero", nameEn: "ADSERO", nameAr: "أدسيرو", avatar: brandLogo("ADSERO", "adsero.com.eg"), rating: 4.7, reviewCount: 987, likes: 2876, shares: 678, replies: 312, launchDate: "2023-09-10", trendScore: 86 },
    ],
  },
  {
    icon: <DollarSign className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.valuation",
    items: [
      { id: "jll-val", nameEn: "JLL Valuation", nameAr: "جيه إل إل للتقييم", avatar: brandLogo("JLL", "jll.com"), rating: 4.6, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-06-01", trendScore: 82 },
      { id: "cbre-val", nameEn: "CBRE Valuation", nameAr: "سي بي آر إي للتقييم", avatar: brandLogo("CBRE", "cbre.com"), rating: 4.5, reviewCount: 654, likes: 1876, shares: 432, replies: 189, launchDate: "2024-01-15", trendScore: 75 },
      { id: "savills-val", nameEn: "Savills", nameAr: "سافيلز", avatar: brandLogo("Savills", "savills.com"), rating: 4.4, reviewCount: 543, likes: 1567, shares: 389, replies: 156, launchDate: "2024-05-20", trendScore: 70 },
    ],
  },
  {
    icon: <GraduationCap className="w-4 h-4 text-primary" />,
    labelKey: "categories.training",
    items: [
      { id: "reidin-academy", nameEn: "REIDIN Academy", nameAr: "أكاديمية ريدن", avatar: brandLogo("REIDIN", "reidin.com"), rating: 4.7, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-09-10", trendScore: 88 },
      { id: "mim-academy", nameEn: "MIM Academy", nameAr: "أكاديمية ميم", avatar: brandLogo("MIM", "mim.academy"), rating: 4.5, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-03-01", trendScore: 80 },
      { id: "proptech-school", nameEn: "PropTech School", nameAr: "مدرسة بروبتك", avatar: brandLogo("PropTech", "proptechschool.com"), rating: 4.3, reviewCount: 456, likes: 1234, shares: 345, replies: 167, launchDate: "2024-08-15", trendScore: 72 },
    ],
  },
  {
    icon: <Gavel className="w-4 h-4 text-accent" />,
    labelKey: "categories.auctions",
    items: [
      { id: "auction-house", nameEn: "Auction House Egypt", nameAr: "دار المزادات مصر", avatar: brandLogo("Auction House", "auctionhouseegypt.com"), rating: 4.4, reviewCount: 567, likes: 1567, shares: 389, replies: 156, launchDate: "2024-01-20", trendScore: 76 },
      { id: "emirates-auction", nameEn: "Emirates Auction", nameAr: "مزادات الإمارات", avatar: brandLogo("Emirates Auction", "emiratesauction.com"), rating: 4.6, reviewCount: 987, likes: 2876, shares: 678, replies: 312, launchDate: "2023-05-10", trendScore: 84 },
      { id: "al-mal-auction", nameEn: "Al Mal Auctions", nameAr: "المال للمزادات", avatar: brandLogo("Al Mal", "almalauctions.com"), rating: 4.2, reviewCount: 345, likes: 876, shares: 234, replies: 123, launchDate: "2024-07-01", trendScore: 65 },
    ],
  },
  {
    icon: <Landmark className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.mortgage",
    items: [
      { id: "nbe-mortgage", nameEn: "NBE Mortgage", nameAr: "تمويل البنك الأهلي", avatar: brandLogo("NBE", "nbe.com.eg"), rating: 4.3, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567, launchDate: "2022-01-01", trendScore: 79 },
      { id: "cib-mortgage", nameEn: "CIB Home Loans", nameAr: "تمويل سي آي بي", avatar: brandLogo("CIB", "cibeg.com"), rating: 4.5, reviewCount: 1876, likes: 4567, shares: 987, replies: 456, launchDate: "2022-06-15", trendScore: 85 },
      { id: "arab-bank-mortgage", nameEn: "Arab Bank Mortgage", nameAr: "تمويل البنك العربي", avatar: brandLogo("Arab Bank", "arabbank.com"), rating: 4.1, reviewCount: 987, likes: 2345, shares: 567, replies: 234, launchDate: "2023-03-20", trendScore: 68 },
    ],
  },
  {
    icon: <FlaskConical className="w-4 h-4 text-primary" />,
    labelKey: "categories.research",
    items: [
      { id: "jll-research", nameEn: "JLL Research", nameAr: "أبحاث جيه إل إل", avatar: brandLogo("JLL", "jll.com"), rating: 4.7, reviewCount: 1567, likes: 4321, shares: 987, replies: 456, launchDate: "2023-01-01", trendScore: 90 },
      { id: "knight-frank", nameEn: "Knight Frank", nameAr: "نايت فرانك", avatar: brandLogo("Knight Frank", "knightfrank.com"), rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-04-15", trendScore: 83 },
      { id: "cushman", nameEn: "Cushman & Wakefield", nameAr: "كوشمان آند ويكفيلد", avatar: brandLogo("Cushman", "cushmanwakefield.com"), rating: 4.4, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-02-01", trendScore: 77 },
    ],
  },
  {
    icon: <Receipt className="w-4 h-4 text-accent" />,
    labelKey: "categories.tax",
    items: [
      { id: "pwc-tax", nameEn: "PwC Tax Advisory", nameAr: "بي دبليو سي للضرائب", avatar: brandLogo("PwC", "pwc.com"), rating: 4.6, reviewCount: 987, likes: 2876, shares: 678, replies: 312, launchDate: "2023-01-10", trendScore: 81 },
      { id: "kpmg-tax", nameEn: "KPMG Tax", nameAr: "كي بي إم جي للضرائب", avatar: brandLogo("KPMG", "kpmg.com"), rating: 4.5, reviewCount: 765, likes: 2134, shares: 543, replies: 234, launchDate: "2023-06-20", trendScore: 74 },
      { id: "ey-tax", nameEn: "EY Tax Services", nameAr: "إي واي للضرائب", avatar: brandLogo("EY", "ey.com"), rating: 4.4, reviewCount: 654, likes: 1876, shares: 432, replies: 189, launchDate: "2024-01-05", trendScore: 70 },
    ],
  },
  {
    icon: <Building2 className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.management",
    items: [
      { id: "cbre-mgmt", nameEn: "CBRE Management", nameAr: "سي بي آر إي للإدارة", avatar: brandLogo("CBRE", "cbre.com"), rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-03-01", trendScore: 84 },
      { id: "hill-intl", nameEn: "Hill International", nameAr: "هيل إنترناشيونال", avatar: brandLogo("Hill International", "hillintl.com"), rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-08-15", trendScore: 76 },
      { id: "emaar-fm", nameEn: "Emaar FM", nameAr: "إعمار لإدارة المرافق", avatar: brandLogo("Emaar", "emaar.com"), rating: 4.6, reviewCount: 1567, likes: 4567, shares: 987, replies: 456, launchDate: "2022-11-01", trendScore: 87 },
    ],
  },
  {
    icon: <Key className="w-4 h-4 text-primary" />,
    labelKey: "categories.leasing",
    items: [
      { id: "better-home", nameEn: "Better Home", nameAr: "بيتر هوم", avatar: brandLogo("Better Home", "betterhome.ae"), rating: 4.4, reviewCount: 2340, likes: 5678, shares: 1234, replies: 567, launchDate: "2022-05-01", trendScore: 82 },
      { id: "allsopp", nameEn: "Allsopp & Allsopp", nameAr: "ألسوب آند ألسوب", avatar: brandLogo("Allsopp", "allsoppandallsopp.com"), rating: 4.6, reviewCount: 1876, likes: 4567, shares: 987, replies: 456, launchDate: "2021-09-15", trendScore: 86 },
      { id: "cluttons", nameEn: "Cluttons", nameAr: "كلاتونز", avatar: brandLogo("Cluttons", "cluttons.com"), rating: 4.2, reviewCount: 987, likes: 2345, shares: 567, replies: 234, launchDate: "2023-07-01", trendScore: 71 },
    ],
  },
  {
    icon: <Link className="w-4 h-4 text-accent" />,
    labelKey: "categories.blockchain",
    items: [
      { id: "propy", nameEn: "Propy", nameAr: "بروبي", avatar: brandLogo("Propy", "propy.com"), rating: 4.3, reviewCount: 567, likes: 1567, shares: 389, replies: 156, launchDate: "2024-02-10", trendScore: 91 },
      { id: "realtoken", nameEn: "RealToken", nameAr: "ريل توكن", avatar: brandLogo("RealToken", "realt.co"), rating: 4.1, reviewCount: 345, likes: 987, shares: 234, replies: 123, launchDate: "2024-06-01", trendScore: 88 },
      { id: "brickblock", nameEn: "Brickblock", nameAr: "بريك بلوك", avatar: brandLogo("Brickblock", "brickblock.io"), rating: 4.0, reviewCount: 234, likes: 654, shares: 167, replies: 89, launchDate: "2024-09-15", trendScore: 79 },
    ],
  },
  {
    icon: <MapPin className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.lands",
    items: [
      { id: "nuca", nameEn: "NUCA", nameAr: "هيئة المجتمعات العمرانية", avatar: brandLogo("NUCA", "newcities.gov.eg"), rating: 4.2, reviewCount: 3456, likes: 8901, shares: 2345, replies: 1234, launchDate: "2022-01-01", trendScore: 80 },
      { id: "nakheel-lands", nameEn: "Nakheel Lands", nameAr: "نخيل للأراضي", avatar: brandLogo("Nakheel", "nakheel.com"), rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-04-01", trendScore: 77 },
      { id: "aldar-lands", nameEn: "Aldar Lands", nameAr: "الدار للأراضي", avatar: brandLogo("Aldar", "aldar.com"), rating: 4.4, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-01-10", trendScore: 73 },
    ],
  },
];

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "text-primary";
  if (rating >= 4) return "text-accent";
  return "text-destructive";
};

export const calculateEngagementScore = (item: CategoryItem) => {
  return (item.reviewCount * 2) + (item.rating * 1000) + ((item.likes || 0) * 1) + ((item.shares || 0) * 3) + ((item.replies || 0) * 2);
};

// ── Journey step definitions ────────────────────────────────────
type JourneyStepKey = "research" | "choose" | "finance" | "protect";

interface JourneyStep {
  key: JourneyStepKey;
  color: string; // tailwind bg class
  activeColor: string;
  textColor: string;
  categoryKeys: string[]; // which categories belong to this step
}

const journeySteps: JourneyStep[] = [
  {
    key: "research",
    color: "bg-primary/20",
    activeColor: "bg-primary",
    textColor: "text-primary",
    categoryKeys: ["categories.platforms", "categories.channels", "categories.research", "categories.exhibitions", "categories.apps", "categories.training"],
  },
  {
    key: "choose",
    color: "bg-accent/20",
    activeColor: "bg-accent",
    textColor: "text-accent",
    categoryKeys: ["categories.units", "categories.brokers", "categories.shares", "categories.lands", "categories.leasing"],
  },
  {
    key: "finance",
    color: "bg-[hsl(var(--coin))]/20",
    activeColor: "bg-[hsl(var(--coin))]",
    textColor: "text-[hsl(var(--coin))]",
    categoryKeys: ["categories.mortgage", "categories.valuation", "categories.auctions", "categories.blockchain"],
  },
  {
    key: "protect",
    color: "bg-brand-red/20",
    activeColor: "bg-brand-red",
    textColor: "text-brand-red",
    categoryKeys: ["categories.lawFirms", "categories.tax", "categories.management"],
  },
];

// ── Component ───────────────────────────────────────────────────
interface HeroCategoryItemsProps {
  onInteraction?: () => void;
  externalCategory?: string | null;
  onSelectItem?: (item: SearchItem) => void;
}

export const HeroCategoryItems = ({ onInteraction, externalCategory, onSelectItem }: HeroCategoryItemsProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getLogoOverride } = useBusinessLogo();
  const isRTL = i18n.language === "ar";

  const [activeStep, setActiveStep] = useState<JourneyStepKey>("research");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const currentStep = journeySteps.find(s => s.key === activeStep)!;
  const currentStepIndex = journeySteps.findIndex(s => s.key === activeStep);
  const nextStep = journeySteps[currentStepIndex + 1] ?? null;

  // Categories for this journey step
  const stepCategories = useMemo(() =>
    categories.filter(c => currentStep.categoryKeys.includes(c.labelKey)),
    [currentStep]
  );

  // Avg rating per category
  const getCategoryAvgRating = useCallback((cat: Category) => {
    const avg = cat.items.reduce((s, i) => s + i.rating, 0) / cat.items.length;
    return avg;
  }, []);

  const getLocalizedName = useCallback(
    (item: CategoryItem) => (isRTL ? item.nameAr : item.nameEn),
    [isRTL],
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleItemClick = (item: CategoryItem) => {
    onInteraction?.();
    navigate(`/entity/${item.id}`);
  };

  const handlePillClick = (labelKey: string) => {
    onInteraction?.();
    setExpandedCategory(expandedCategory === labelKey ? null : labelKey);
  };

  const expandedCategoryData = useMemo(
    () => categories.find(c => c.labelKey === expandedCategory) ?? null,
    [expandedCategory]
  );

  // Trending dot logic — show dot if any item in category has trendScore > 85
  const isTrending = (cat: Category) => cat.items.some(i => (i.trendScore || 0) > 85);

  const totalItemsInStep = stepCategories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="w-full bg-card border-t border-border overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Compact Stepper ──────────────────────────────── */}
      <div className="flex items-center border-b border-border">
        {journeySteps.map((step, i) => {
          const isActive = step.key === activeStep;
          const isPast = i < currentStepIndex;
          return (
            <button
              key={step.key}
              onClick={() => { setActiveStep(step.key); setExpandedCategory(null); onInteraction?.(); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-2 transition-all relative",
                isActive ? "bg-card" : "bg-muted/20 hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "absolute top-0 inset-x-0 h-[2px]",
                isActive ? step.activeColor : isPast ? step.activeColor + " opacity-40" : "bg-transparent"
              )} />
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                isActive
                  ? step.activeColor + " text-primary-foreground"
                  : isPast ? step.color + " " + step.textColor : "bg-muted text-muted-foreground"
              )}>
                {i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-semibold",
                isActive ? step.textColor : "text-muted-foreground"
              )}>
                {t(`journey.${step.key}.label`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Benefit Headline — direct value ───────────────── */}
      <div className="px-3 pt-2.5 pb-1 md:px-5">
        <h3 className="text-[13px] md:text-sm font-extrabold text-foreground leading-tight">
          {t(`journey.${activeStep}.headline`)}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug flex items-center gap-1">
          <span>{t(`journey.${activeStep}.benefit`)}</span>
          <span className="text-foreground/60">·</span>
          <span className="font-semibold text-foreground/70">{totalItemsInStep} {t("journey.companiesReviewed")}</span>
        </p>
      </div>

      {/* ── Category Pills — no stars, clean & compact ────── */}
      <div className="px-3 pb-1.5 md:px-5">
        <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4 md:gap-1.5">
          {stepCategories.map((cat) => {
            const isExpanded = expandedCategory === cat.labelKey;
            const trending = isTrending(cat);
            const count = cat.items.length;
            return (
              <button
                key={cat.labelKey}
                onClick={() => handlePillClick(cat.labelKey)}
                className={cn(
                  "group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-150",
                  isExpanded
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <span className="shrink-0">{cat.icon}</span>
                <span className="flex-1 text-start text-[11px] font-semibold text-foreground truncate">
                  {t(cat.labelKey)}
                </span>
                {trending && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0 animate-pulse" />
                )}
                <span className="text-[9px] text-muted-foreground font-medium shrink-0">{count}</span>
                <ChevronDown className={cn(
                  "w-3 h-3 text-muted-foreground shrink-0 transition-transform duration-150",
                  isExpanded && "rotate-180"
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Expanded Items — compact cards ────────────────── */}
      {expandedCategoryData && (
        <div className="border-t border-border bg-muted/30 animate-in slide-in-from-top-1 duration-150">
          <div className="p-2 md:p-4">
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-2">
              {expandedCategoryData.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group flex w-full flex-col items-center rounded-lg border border-border bg-card p-2 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                >
                  <Avatar className="h-9 w-9 md:h-12 md:w-12 ring-1 ring-border transition-all group-hover:ring-primary/40">
                    <AvatarImage src={getLogoOverride(item.id, getLocalizedName(item)) || item.avatar} alt={getLocalizedName(item)} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-[9px] font-bold">
                      {getLocalizedName(item).substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-1 line-clamp-1 text-[10px] md:text-xs font-bold text-foreground">
                    {getLocalizedName(item)}
                  </p>
                  <span className="text-[9px] text-muted-foreground mt-0.5">
                    {item.reviewCount.toLocaleString(isRTL ? "ar-EG" : "en-US")} {t("journey.reviews")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Journey Nudge — benefit-driven CTA ───────────── */}
      {nextStep && (
        <div className="border-t border-border px-3 py-1.5 md:px-5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {t(`journey.${activeStep}.nudge`)}
          </span>
          <button
            onClick={() => { setActiveStep(nextStep.key); setExpandedCategory(null); onInteraction?.(); }}
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold transition-colors",
              nextStep.textColor, "hover:opacity-80"
            )}
          >
            {t(`journey.${activeStep}.nextAction`)}
            <ChevronRight className={cn("w-3 h-3", isRTL && "rotate-180")} />
          </button>
        </div>
      )}
    </div>
  );
};
