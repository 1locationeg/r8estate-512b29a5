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
  color: string;
  activeColor: string;
  textColor: string;
  bgMuted: string;
  categoryKeys: string[];
  emoji: string;
}

const journeySteps: JourneyStep[] = [
  {
    key: "research",
    color: "bg-primary/20",
    activeColor: "bg-primary",
    textColor: "text-primary",
    bgMuted: "bg-primary/5",
    categoryKeys: ["categories.platforms", "categories.channels", "categories.research", "categories.exhibitions", "categories.apps", "categories.training"],
    emoji: "🔍",
  },
  {
    key: "choose",
    color: "bg-accent/20",
    activeColor: "bg-accent",
    textColor: "text-accent",
    bgMuted: "bg-accent/5",
    categoryKeys: ["categories.units", "categories.brokers", "categories.shares", "categories.lands", "categories.leasing"],
    emoji: "🏠",
  },
  {
    key: "finance",
    color: "bg-[hsl(var(--coin))]/20",
    activeColor: "bg-[hsl(var(--coin))]",
    textColor: "text-[hsl(var(--coin))]",
    bgMuted: "bg-[hsl(var(--coin))]/5",
    categoryKeys: ["categories.mortgage", "categories.valuation", "categories.auctions", "categories.blockchain"],
    emoji: "💰",
  },
  {
    key: "protect",
    color: "bg-brand-red/20",
    activeColor: "bg-brand-red",
    textColor: "text-brand-red",
    bgMuted: "bg-brand-red/5",
    categoryKeys: ["categories.lawFirms", "categories.tax", "categories.management"],
    emoji: "🛡️",
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

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getLocalizedName = useCallback(
    (item: CategoryItem) => (isRTL ? item.nameAr : item.nameEn),
    [isRTL],
  );

  const handleItemClick = (item: CategoryItem) => {
    onInteraction?.();
    navigate(`/entity/${item.id}`);
  };

  const handlePillClick = (labelKey: string) => {
    onInteraction?.();
    setExpandedCategory(expandedCategory === labelKey ? null : labelKey);
  };

  const isTrending = (cat: Category) => cat.items.some(i => (i.trendScore || 0) > 85);

  return (
    <div className="w-full bg-card border-t border-border overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Title ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-foreground/80">
          {t("journey.corridorTitle")}
        </h3>
        <button
          onClick={() => navigate("/categories")}
          className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          {t("journey.continueJourney")}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── Horizontal step indicator ────────────────── */}
      <div className="px-3 pt-1 pb-3">
        <div className="flex items-center justify-between w-full max-w-lg mx-auto">
          {journeySteps.map((step, stepIdx) => {
            const isLast = stepIdx === journeySteps.length - 1;
            const stepCategories = categories.filter(c => step.categoryKeys.includes(c.labelKey));
            const totalItems = stepCategories.reduce((s, c) => s + c.items.length, 0);
            const isActive = expandedCategory !== null && stepCategories.some(c => c.labelKey === expandedCategory);

            // Step-specific ring/bg colors
            const ringColors: Record<JourneyStepKey, string> = {
              research: "ring-primary/40 bg-primary/10",
              choose: "ring-accent/40 bg-accent/10",
              finance: "ring-[hsl(var(--coin))]/40 bg-[hsl(var(--coin))]/10",
              protect: "ring-brand-red/40 bg-brand-red/10",
            };
            const activeRings: Record<JourneyStepKey, string> = {
              research: "ring-primary bg-primary/20",
              choose: "ring-accent bg-accent/20",
              finance: "ring-[hsl(var(--coin))] bg-[hsl(var(--coin))]/20",
              protect: "ring-brand-red bg-brand-red/20",
            };
            const badgeBg: Record<JourneyStepKey, string> = {
              research: "bg-primary text-primary-foreground",
              choose: "bg-accent text-accent-foreground",
              finance: "bg-[hsl(var(--coin))] text-white",
              protect: "bg-brand-red text-white",
            };

            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                {/* Step circle + label */}
                <button
                  onClick={() => {
                    onInteraction?.();
                    // Toggle first category of this step
                    const firstCat = stepCategories[0]?.labelKey;
                    if (firstCat) {
                      setExpandedCategory(expandedCategory === firstCat ? null : firstCat);
                    }
                  }}
                  className="flex flex-col items-center gap-1 group relative"
                >
                  {/* Number badge */}
                  <div className={cn(
                    "absolute -top-1 z-10 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold",
                    badgeBg[step.key],
                    isRTL ? "-left-0.5" : "-right-0.5"
                  )}>
                    {stepIdx + 1}
                  </div>
                  {/* Circle icon */}
                  <div className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ring-2 transition-all duration-200",
                    isActive ? activeRings[step.key] : ringColors[step.key],
                    "group-hover:scale-105"
                  )}>
                    <span className="text-xl md:text-2xl">{step.emoji}</span>
                  </div>
                  {/* Label */}
                  <span className={cn(
                    "text-[10px] md:text-[11px] font-bold",
                    isActive ? step.textColor : "text-foreground/70"
                  )}>
                    {t(`journey.${step.key}.label`)}
                  </span>
                  {/* Subtitle */}
                  <span className="text-[8px] md:text-[9px] text-muted-foreground leading-tight text-center max-w-[70px]">
                    {t(`journey.${step.key}.benefit`)}
                  </span>
                </button>

                {/* Arrow connector */}
                {!isLast && (
                  <div className="flex-1 flex items-center justify-center px-1 -mt-5">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expanded content below the steps ──────────── */}
      {expandedCategory && (
        <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
          {/* Category pills for the active step */}
          {journeySteps.map((step) => {
            const stepCategories = categories.filter(c => step.categoryKeys.includes(c.labelKey));
            const hasActive = stepCategories.some(c => c.labelKey === expandedCategory);
            if (!hasActive) return null;

            return (
              <div key={step.key}>
                {/* Pills row */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {stepCategories.map((cat) => {
                    const isExpanded = expandedCategory === cat.labelKey;
                    const trending = isTrending(cat);
                    return (
                      <button
                        key={cat.labelKey}
                        onClick={() => handlePillClick(cat.labelKey)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold transition-all duration-150",
                          isExpanded
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border/50 bg-card hover:border-primary/30 text-foreground/80"
                        )}
                      >
                        <span className="shrink-0 [&>svg]:w-3 [&>svg]:h-3">{cat.icon}</span>
                        <span className="truncate max-w-[80px]">{t(cat.labelKey)}</span>
                        {trending && <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0 animate-pulse" />}
                        <span className="text-[8px] text-muted-foreground">{cat.items.length}</span>
                        <ChevronDown className={cn(
                          "w-2.5 h-2.5 text-muted-foreground shrink-0 transition-transform duration-150",
                          isExpanded && "rotate-180"
                        )} />
                      </button>
                    );
                  })}
                </div>

                {/* Expanded items grid */}
                {stepCategories.map((cat) => {
                  if (expandedCategory !== cat.labelKey) return null;
                  return (
                    <div key={cat.labelKey + "-items"} className="rounded-lg border border-border/50 bg-muted/30 p-2 animate-in slide-in-from-top-1 duration-150">
                      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="group flex w-full flex-col items-center rounded-md border border-border bg-card p-1.5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                          >
                            <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-1 ring-border transition-all group-hover:ring-primary/40">
                              <AvatarImage src={getLogoOverride(item.id, getLocalizedName(item)) || item.avatar} alt={getLocalizedName(item)} className="object-cover" />
                              <AvatarFallback className="bg-secondary text-[8px] font-bold">
                                {getLocalizedName(item).substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="mt-1 line-clamp-1 text-[9px] md:text-[10px] font-bold text-foreground">
                              {getLocalizedName(item)}
                            </p>
                            <span className="text-[8px] text-muted-foreground">
                              {item.reviewCount.toLocaleString(isRTL ? "ar-EG" : "en-US")} {t("journey.reviews")}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
