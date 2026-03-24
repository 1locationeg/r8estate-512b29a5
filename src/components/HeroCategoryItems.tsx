import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Star, Heart, Share2, MessageCircle, LayoutGrid, Smartphone, BarChart3, Globe, Users, CalendarDays, Tv, Scale, DollarSign, GraduationCap, Gavel, Landmark, FlaskConical, Receipt, Building2, Key, Link, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type SearchItem } from "@/data/searchIndex";
import { generateAvatar } from "@/lib/avatarUtils";

// Brand logo mapping — real logos via Clearbit/direct URLs, fallback to generateAvatar for units
const brandLogo = (name: string, domain?: string): string =>
  domain ? `https://logo.clearbit.com/${domain}` : generateAvatar(name, "category");

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
  launchDate?: string; // ISO date for "New Launches" sorting
  trendScore?: number; // recent momentum score for "Trending"
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
  if (rating >= 4) return "text-primary";
  if (rating >= 3) return "text-accent";
  return "text-destructive";
};

// Calculate engagement score for ranking
export const calculateEngagementScore = (item: CategoryItem) => {
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

interface HeroCategoryItemsProps {
  onInteraction?: () => void;
  externalCategory?: string | null;
  onSelectItem?: (item: SearchItem) => void;
}

export const HeroCategoryItems = ({ onInteraction, externalCategory, onSelectItem }: HeroCategoryItemsProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isRTL = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sync with external category selection
  useEffect(() => {
    if (externalCategory) {
      setActiveCategory(externalCategory);
    }
  }, [externalCategory]);

  const activeCategoryData = useMemo(
    () => categories.find((category) => category.labelKey === activeCategory) ?? null,
    [activeCategory],
  );

  const handleItemClick = (item: CategoryItem) => {
    onInteraction?.();
    navigate(`/entity/${item.id}`);
  };

  const handleCategoryClick = (labelKey: string) => {
    onInteraction?.();
    setActiveCategory(activeCategory === labelKey ? null : labelKey);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getLocalizedName = useCallback(
    (item: CategoryItem) => (isRTL ? item.nameAr : item.nameEn),
    [isRTL],
  );

  const getScrollPosition = (el: HTMLDivElement) => {
    const maxScrollLeft = Math.max(el.scrollWidth - el.clientWidth, 0);
    return el.scrollLeft < 0 ? Math.abs(el.scrollLeft) : el.scrollLeft;
  };

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tolerance = 2;
    const currentScroll = getScrollPosition(el);
    const maxScrollLeft = Math.max(el.scrollWidth - el.clientWidth, 0);

    setCanScrollLeft(currentScroll > tolerance);
    setCanScrollRight(currentScroll < maxScrollLeft - tolerance);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect(); };
  }, [updateScrollState]);

  useEffect(() => {
    if (!activeCategory) return;

    categoryButtonRefs.current[activeCategory]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategory]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.72;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const scrollToEdge = (edge: "start" | "end") => {
    if (categories.length === 0) return;

    const category = edge === "start" ? categories[0] : categories[categories.length - 1];

    categoryButtonRefs.current[category.labelKey]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: edge === "start" ? "start" : "end",
    });
  };

  return (
    <div className="w-full bg-card border-t border-border shadow-lg overflow-x-hidden">
      {/* Category Tabs */}
      <div className="relative flex items-center">
        <button
          onClick={() => scrollToEdge('start')}
          disabled={!canScrollLeft}
          className={cn(
            "p-2 transition-colors border-e border-border shrink-0",
            canScrollLeft ? "hover:bg-secondary/50 text-muted-foreground" : "text-muted-foreground/30 cursor-default"
          )}
          aria-label="Scroll to first category"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            "p-2 md:p-3 transition-colors border-e border-border shrink-0",
            canScrollLeft ? "hover:bg-secondary/50 text-muted-foreground" : "text-muted-foreground/30 cursor-default"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Scrollable Categories */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 md:gap-2 px-2 py-2 md:py-3 w-max">
            {/* Category Buttons */}
            {categories.map((cat) => (
              <button
                key={cat.labelKey}
                ref={(node) => {
                  categoryButtonRefs.current[cat.labelKey] = node;
                }}
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
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={cn(
            "p-2 md:p-3 transition-colors border-s border-border shrink-0",
            canScrollRight ? "hover:bg-secondary/50 text-muted-foreground" : "text-muted-foreground/30 cursor-default"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <button
          onClick={() => scrollToEdge('end')}
          disabled={!canScrollRight}
          className={cn(
            "p-2 transition-colors border-s border-border shrink-0",
            canScrollRight ? "hover:bg-secondary/50 text-muted-foreground" : "text-muted-foreground/30 cursor-default"
          )}
          aria-label="Scroll to last category"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Businesses */}
      {activeCategoryData && (
        <div className="border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t(activeCategoryData.labelKey)}
                </p>
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  {isRTL ? "الكيانات داخل هذه الفئة" : "Businesses in this category"}
                </h3>
              </div>
              <div className="inline-flex w-fit items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {activeCategoryData.items.length.toLocaleString(isRTL ? "ar-EG" : "en-US")} {isRTL ? "كيان" : activeCategoryData.items.length === 1 ? "business" : "businesses"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {activeCategoryData.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group flex w-full flex-col rounded-2xl border border-border bg-card p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14 ring-1 ring-border transition-all group-hover:ring-primary/40">
                      <AvatarImage src={item.avatar} alt={getLocalizedName(item)} />
                      <AvatarFallback className="bg-secondary text-xs font-semibold">
                        {getLocalizedName(item).substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold text-foreground md:text-base">
                          {getLocalizedName(item)}
                        </p>
                        <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-foreground">
                          <Star className={cn("h-3 w-3 fill-current", getRatingColor(item.rating))} />
                          <span className={getRatingColor(item.rating)}>{item.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {item.reviewCount.toLocaleString(isRTL ? "ar-EG" : "en-US")} {isRTL ? "مراجعة" : item.reviewCount === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-secondary/70 px-3 py-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        <span className="text-[11px]">{isRTL ? "Likes" : "Likes"}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{formatNumber(item.likes || 0)}</p>
                    </div>

                    <div className="rounded-xl bg-secondary/70 px-3 py-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Share2 className="h-3 w-3" />
                        <span className="text-[11px]">{isRTL ? "Shares" : "Shares"}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{formatNumber(item.shares || 0)}</p>
                    </div>

                    <div className="rounded-xl bg-secondary/70 px-3 py-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span className="text-[11px]">{isRTL ? "Replies" : "Replies"}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{formatNumber(item.replies || 0)}</p>
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