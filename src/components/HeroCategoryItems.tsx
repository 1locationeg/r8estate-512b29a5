import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Trophy, Heart, Share2, MessageCircle, TrendingUp, Rocket, LayoutGrid, Smartphone, BarChart3, Globe, Users, CalendarDays, Tv, Scale, DollarSign, GraduationCap, Gavel, Landmark, FlaskConical, Receipt, Building2, Key, Link, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ItemDetailSection } from "./ItemDetailSection";
import { type SearchItem, type SearchCategory, getSearchIndex } from "@/data/searchIndex";

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
      { id: "studio", nameEn: "Studio", nameAr: "ستوديو", avatar: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 156, likes: 342, shares: 89, replies: 45, launchDate: "2025-01-15", trendScore: 78 },
      { id: "twin-house", nameEn: "Twin House", nameAr: "توين هاوس", avatar: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 89, likes: 234, shares: 56, replies: 23, launchDate: "2024-11-20", trendScore: 65 },
      { id: "villa", nameEn: "Villa", nameAr: "فيلا", avatar: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop", rating: 4.7, reviewCount: 234, likes: 567, shares: 145, replies: 89, launchDate: "2024-06-10", trendScore: 92 },
      { id: "chalet", nameEn: "Chalet", nameAr: "شاليه", avatar: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 178, likes: 289, shares: 67, replies: 34, launchDate: "2025-02-01", trendScore: 88 },
      { id: "penthouse", nameEn: "Penthouse", nameAr: "بنتهاوس", avatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop", rating: 4.8, reviewCount: 67, likes: 456, shares: 123, replies: 67, launchDate: "2025-01-28", trendScore: 95 },
      { id: "loft", nameEn: "Loft", nameAr: "لوفت", avatar: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 45, likes: 123, shares: 34, replies: 12, launchDate: "2024-12-05", trendScore: 42 },
      { id: "office", nameEn: "Office", nameAr: "مكتب", avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 112, likes: 234, shares: 56, replies: 28, launchDate: "2024-09-15", trendScore: 71 },
      { id: "retail", nameEn: "Retail", nameAr: "محل تجاري", avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop", rating: 4.0, reviewCount: 98, likes: 167, shares: 45, replies: 19, launchDate: "2024-10-22", trendScore: 55 },
    ],
  },
  {
    icon: <Smartphone className="w-4 h-4 text-accent" />,
    labelKey: "categories.apps",
    items: [
      { id: "nawy", nameEn: "Nawy App", nameAr: "تطبيق ناوي", avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 1250, likes: 3456, shares: 890, replies: 456, launchDate: "2024-03-10", trendScore: 97 },
      { id: "farida", nameEn: "Farida", nameAr: "فريدة", avatar: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-08-15", trendScore: 82 },
      { id: "byit", nameEn: "Byit", nameAr: "بايت", avatar: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 543, likes: 1234, shares: 345, replies: 123, launchDate: "2025-01-05", trendScore: 91 },
      { id: "broker-zone", nameEn: "Broker Zone", nameAr: "بروكر زون", avatar: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 321, likes: 876, shares: 234, replies: 89, launchDate: "2024-11-01", trendScore: 68 },
    ],
  },
  {
    icon: <BarChart3 className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.shares",
    items: [
      { id: "orascom", nameEn: "Orascom Development", nameAr: "أوراسكوم للتنمية", avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 456, likes: 1234, shares: 345, replies: 167, launchDate: "2023-05-01", trendScore: 60 },
      { id: "talaat", nameEn: "Talaat Moustafa", nameAr: "طلعت مصطفى", avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 678, likes: 1567, shares: 456, replies: 234, launchDate: "2023-01-15", trendScore: 85 },
      { id: "palm-hills", nameEn: "Palm Hills", nameAr: "بالم هيلز", avatar: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 345, likes: 987, shares: 234, replies: 123, launchDate: "2024-02-20", trendScore: 73 },
      { id: "sodic", nameEn: "SODIC", nameAr: "سوديك", avatar: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 234, likes: 654, shares: 167, replies: 89, launchDate: "2024-07-10", trendScore: 67 },
    ],
  },
  {
    icon: <Globe className="w-4 h-4 text-primary" />,
    labelKey: "categories.platforms",
    items: [
      { id: "aqarmap", nameEn: "Aqarmap", nameAr: "عقار ماب", avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 2340, likes: 5678, shares: 1234, replies: 567, launchDate: "2022-01-01", trendScore: 88 },
      { id: "dubizzle", nameEn: "Dubizzle", nameAr: "دوبيزل", avatar: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 1876, likes: 4567, shares: 987, replies: 456, launchDate: "2021-06-15", trendScore: 79 },
      { id: "property-finder", nameEn: "Property Finder", nameAr: "بروبرتي فايندر", avatar: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 3210, likes: 7890, shares: 1567, replies: 789, launchDate: "2020-03-20", trendScore: 96 },
      { id: "property-sorted", nameEn: "Property Sorted", nameAr: "بروبرتي سورتد", avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 567, likes: 1234, shares: 345, replies: 167, launchDate: "2024-12-01", trendScore: 74 },
    ],
  },
  {
    icon: <Users className="w-4 h-4 text-accent" />,
    labelKey: "categories.brokers",
    items: [
      { id: "the-address", nameEn: "The Address", nameAr: "ذا أدرس", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.7, reviewCount: 456, likes: 1234, shares: 345, replies: 167, launchDate: "2023-04-10", trendScore: 81 },
      { id: "bold-routes", nameEn: "Bold Routes", nameAr: "بولد روتس", avatar: "https://randomuser.me/api/portraits/men/45.jpg", rating: 4.4, reviewCount: 234, likes: 567, shares: 134, replies: 67, launchDate: "2024-06-20", trendScore: 72 },
      { id: "remax", nameEn: "RE/MAX", nameAr: "ري/ماكس", avatar: "https://randomuser.me/api/portraits/men/67.jpg", rating: 4.5, reviewCount: 1230, likes: 3456, shares: 789, replies: 345, launchDate: "2019-01-01", trendScore: 83 },
      { id: "red", nameEn: "RED", nameAr: "ريد", avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-09-15", trendScore: 76 },
      { id: "coldwell", nameEn: "Coldwell Banker", nameAr: "كولدويل بانكر", avatar: "https://randomuser.me/api/portraits/men/22.jpg", rating: 4.6, reviewCount: 1567, likes: 4567, shares: 987, replies: 456, launchDate: "2020-05-01", trendScore: 89 },
      { id: "nawy-partners", nameEn: "Nawy Partners", nameAr: "شركاء ناوي", avatar: "https://randomuser.me/api/portraits/women/28.jpg", rating: 4.2, reviewCount: 345, likes: 876, shares: 234, replies: 123, launchDate: "2024-10-05", trendScore: 70 },
    ],
  },
  {
    icon: <CalendarDays className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.exhibitions",
    items: [
      { id: "cityscape", nameEn: "Cityscape", nameAr: "سيتي سكيب", avatar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop", rating: 4.8, reviewCount: 3456, likes: 8901, shares: 2345, replies: 1234, launchDate: "2024-04-15", trendScore: 99 },
      { id: "red-expo", nameEn: "RED Expo", nameAr: "ريد إكسبو", avatar: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2024-09-20", trendScore: 86 },
      { id: "al-ahram", nameEn: "Al-Ahram Expo", nameAr: "معرض الأهرام", avatar: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567, launchDate: "2024-02-10", trendScore: 77 },
      { id: "the-real-estate", nameEn: "The Real Estate", nameAr: "ذا ريل إستيت", avatar: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 987, likes: 2345, shares: 567, replies: 234, launchDate: "2025-01-20", trendScore: 93 },
    ],
  },
  {
    icon: <Tv className="w-4 h-4 text-primary" />,
    labelKey: "categories.channels",
    items: [
      { id: "property-insider", nameEn: "Property Insider", nameAr: "بروبرتي إنسايدر", avatar: "https://randomuser.me/api/portraits/men/52.jpg", rating: 4.6, reviewCount: 5678, likes: 12345, shares: 3456, replies: 1567, launchDate: "2022-08-01", trendScore: 94 },
      { id: "podcast-aqary", nameEn: "Podcast Aqary", nameAr: "بودكاست عقاري", avatar: "https://randomuser.me/api/portraits/men/36.jpg", rating: 4.4, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567, launchDate: "2023-11-15", trendScore: 84 },
      { id: "bait-sameh", nameEn: "Bait Sameh", nameAr: "بيت سامح", avatar: "https://randomuser.me/api/portraits/men/41.jpg", rating: 4.7, reviewCount: 4567, likes: 9876, shares: 2345, replies: 1234, launchDate: "2023-06-01", trendScore: 91 },
    ],
  },
  {
    icon: <Scale className="w-4 h-4 text-accent" />,
    labelKey: "categories.lawFirms",
    items: [
      { id: "diyaa-eldin", nameEn: "Diyaa Eldin", nameAr: "ضياء الدين", avatar: "https://randomuser.me/api/portraits/men/55.jpg", rating: 4.6, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-03-01", trendScore: 80 },
      { id: "mashoralaw", nameEn: "Mashoralaw", nameAr: "مشورة للمحاماة", avatar: "https://randomuser.me/api/portraits/men/60.jpg", rating: 4.4, reviewCount: 654, likes: 1876, shares: 432, replies: 189, launchDate: "2024-01-15", trendScore: 75 },
      { id: "partners-law", nameEn: "Partners Law", nameAr: "بارتنرز لو", avatar: "https://randomuser.me/api/portraits/men/48.jpg", rating: 4.5, reviewCount: 543, likes: 1567, shares: 389, replies: 156, launchDate: "2024-05-20", trendScore: 72 },
      { id: "adsero", nameEn: "ADSERO", nameAr: "أدسيرو", avatar: "https://randomuser.me/api/portraits/men/38.jpg", rating: 4.7, reviewCount: 987, likes: 2876, shares: 678, replies: 312, launchDate: "2023-09-10", trendScore: 86 },
    ],
  },
  {
    icon: <DollarSign className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.valuation",
    items: [
      { id: "jll-val", nameEn: "JLL Valuation", nameAr: "جيه إل إل للتقييم", avatar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-06-01", trendScore: 82 },
      { id: "cbre-val", nameEn: "CBRE Valuation", nameAr: "سي بي آر إي للتقييم", avatar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 654, likes: 1876, shares: 432, replies: 189, launchDate: "2024-01-15", trendScore: 75 },
      { id: "savills-val", nameEn: "Savills", nameAr: "سافيلز", avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 543, likes: 1567, shares: 389, replies: 156, launchDate: "2024-05-20", trendScore: 70 },
    ],
  },
  {
    icon: <GraduationCap className="w-4 h-4 text-primary" />,
    labelKey: "categories.training",
    items: [
      { id: "reidin-academy", nameEn: "REIDIN Academy", nameAr: "أكاديمية ريدن", avatar: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop", rating: 4.7, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-09-10", trendScore: 88 },
      { id: "mim-academy", nameEn: "MIM Academy", nameAr: "أكاديمية ميم", avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-03-01", trendScore: 80 },
      { id: "proptech-school", nameEn: "PropTech School", nameAr: "مدرسة بروبتك", avatar: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 456, likes: 1234, shares: 345, replies: 167, launchDate: "2024-08-15", trendScore: 72 },
    ],
  },
  {
    icon: <Gavel className="w-4 h-4 text-accent" />,
    labelKey: "categories.auctions",
    items: [
      { id: "auction-house", nameEn: "Auction House Egypt", nameAr: "دار المزادات مصر", avatar: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 567, likes: 1567, shares: 389, replies: 156, launchDate: "2024-01-20", trendScore: 76 },
      { id: "emirates-auction", nameEn: "Emirates Auction", nameAr: "مزادات الإمارات", avatar: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 987, likes: 2876, shares: 678, replies: 312, launchDate: "2023-05-10", trendScore: 84 },
      { id: "al-mal-auction", nameEn: "Al Mal Auctions", nameAr: "المال للمزادات", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 345, likes: 876, shares: 234, replies: 123, launchDate: "2024-07-01", trendScore: 65 },
    ],
  },
  {
    icon: <Landmark className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.mortgage",
    items: [
      { id: "nbe-mortgage", nameEn: "NBE Mortgage", nameAr: "تمويل البنك الأهلي", avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 2345, likes: 5678, shares: 1234, replies: 567, launchDate: "2022-01-01", trendScore: 79 },
      { id: "cib-mortgage", nameEn: "CIB Home Loans", nameAr: "تمويل سي آي بي", avatar: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1876, likes: 4567, shares: 987, replies: 456, launchDate: "2022-06-15", trendScore: 85 },
      { id: "arab-bank-mortgage", nameEn: "Arab Bank Mortgage", nameAr: "تمويل البنك العربي", avatar: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 987, likes: 2345, shares: 567, replies: 234, launchDate: "2023-03-20", trendScore: 68 },
    ],
  },
  {
    icon: <FlaskConical className="w-4 h-4 text-primary" />,
    labelKey: "categories.research",
    items: [
      { id: "jll-research", nameEn: "JLL Research", nameAr: "أبحاث جيه إل إل", avatar: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop", rating: 4.7, reviewCount: 1567, likes: 4321, shares: 987, replies: 456, launchDate: "2023-01-01", trendScore: 90 },
      { id: "knight-frank", nameEn: "Knight Frank", nameAr: "نايت فرانك", avatar: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-04-15", trendScore: 83 },
      { id: "cushman", nameEn: "Cushman & Wakefield", nameAr: "كوشمان آند ويكفيلد", avatar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-02-01", trendScore: 77 },
    ],
  },
  {
    icon: <Receipt className="w-4 h-4 text-accent" />,
    labelKey: "categories.tax",
    items: [
      { id: "pwc-tax", nameEn: "PwC Tax Advisory", nameAr: "بي دبليو سي للضرائب", avatar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 987, likes: 2876, shares: 678, replies: 312, launchDate: "2023-01-10", trendScore: 81 },
      { id: "kpmg-tax", nameEn: "KPMG Tax", nameAr: "كي بي إم جي للضرائب", avatar: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 765, likes: 2134, shares: 543, replies: 234, launchDate: "2023-06-20", trendScore: 74 },
      { id: "ey-tax", nameEn: "EY Tax Services", nameAr: "إي واي للضرائب", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 654, likes: 1876, shares: 432, replies: 189, launchDate: "2024-01-05", trendScore: 70 },
    ],
  },
  {
    icon: <Building2 className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.management",
    items: [
      { id: "cbre-mgmt", nameEn: "CBRE Management", nameAr: "سي بي آر إي للإدارة", avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-03-01", trendScore: 84 },
      { id: "hill-intl", nameEn: "Hill International", nameAr: "هيل إنترناشيونال", avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2023-08-15", trendScore: 76 },
      { id: "emaar-fm", nameEn: "Emaar FM", nameAr: "إعمار لإدارة المرافق", avatar: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 1567, likes: 4567, shares: 987, replies: 456, launchDate: "2022-11-01", trendScore: 87 },
    ],
  },
  {
    icon: <Key className="w-4 h-4 text-primary" />,
    labelKey: "categories.leasing",
    items: [
      { id: "better-home", nameEn: "Better Home", nameAr: "بيتر هوم", avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 2340, likes: 5678, shares: 1234, replies: 567, launchDate: "2022-05-01", trendScore: 82 },
      { id: "allsopp", nameEn: "Allsopp & Allsopp", nameAr: "ألسوب آند ألسوب", avatar: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop", rating: 4.6, reviewCount: 1876, likes: 4567, shares: 987, replies: 456, launchDate: "2021-09-15", trendScore: 86 },
      { id: "cluttons", nameEn: "Cluttons", nameAr: "كلاتونز", avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 987, likes: 2345, shares: 567, replies: 234, launchDate: "2023-07-01", trendScore: 71 },
    ],
  },
  {
    icon: <Link className="w-4 h-4 text-accent" />,
    labelKey: "categories.blockchain",
    items: [
      { id: "propy", nameEn: "Propy", nameAr: "بروبي", avatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop", rating: 4.3, reviewCount: 567, likes: 1567, shares: 389, replies: 156, launchDate: "2024-02-10", trendScore: 91 },
      { id: "realtoken", nameEn: "RealToken", nameAr: "ريل توكن", avatar: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=100&h=100&fit=crop", rating: 4.1, reviewCount: 345, likes: 987, shares: 234, replies: 123, launchDate: "2024-06-01", trendScore: 88 },
      { id: "brickblock", nameEn: "Brickblock", nameAr: "بريك بلوك", avatar: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=100&h=100&fit=crop", rating: 4.0, reviewCount: 234, likes: 654, shares: 167, replies: 89, launchDate: "2024-09-15", trendScore: 79 },
    ],
  },
  {
    icon: <MapPin className="w-4 h-4 text-brand-red" />,
    labelKey: "categories.lands",
    items: [
      { id: "nuca", nameEn: "NUCA", nameAr: "هيئة المجتمعات العمرانية", avatar: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&h=100&fit=crop", rating: 4.2, reviewCount: 3456, likes: 8901, shares: 2345, replies: 1234, launchDate: "2022-01-01", trendScore: 80 },
      { id: "nakheel-lands", nameEn: "Nakheel Lands", nameAr: "نخيل للأراضي", avatar: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=100&h=100&fit=crop", rating: 4.5, reviewCount: 1234, likes: 3456, shares: 789, replies: 345, launchDate: "2023-04-01", trendScore: 77 },
      { id: "aldar-lands", nameEn: "Aldar Lands", nameAr: "الدار للأراضي", avatar: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=100&h=100&fit=crop", rating: 4.4, reviewCount: 876, likes: 2345, shares: 567, replies: 234, launchDate: "2024-01-10", trendScore: 73 },
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const isRTL = i18n.language === "ar";

  // Sync with external category selection
  useEffect(() => {
    if (externalCategory) {
      setActiveCategory(externalCategory);
      setSelectedItem(null);
    }
  }, [externalCategory]);

  // Convert CategoryItem to SearchItem for detail view
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

  const handleItemClick = (item: CategoryItem, catKey?: string) => {
    onInteraction?.();
    const category = categoryToSearchCategory(catKey || '');
    const searchIndex = getSearchIndex();
    const indexItem = searchIndex.find(si => si.id === item.id && si.category === category)
      || searchIndex.find(si => si.id === item.id)
      || searchIndex.find(si => si.name.toLowerCase().includes(item.nameEn.toLowerCase()) && si.category === category);
    const resolvedItem = indexItem || {
      id: item.id,
      name: isRTL ? item.nameAr : item.nameEn,
      category,
      subtitle: catKey ? t(catKey) : undefined,
      image: item.avatar,
      rating: item.rating,
      reviewCount: item.reviewCount,
    } as SearchItem;
    
    if (onSelectItem) {
      onSelectItem(resolvedItem);
    } else {
      setSelectedItem(resolvedItem);
    }
  };

  const handleCategoryClick = (labelKey: string) => {
    onInteraction?.();
    setActiveCategory(activeCategory === labelKey ? null : labelKey);
    setSelectedItem(null);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tolerance = 2;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - tolerance);
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

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-card border-t border-border shadow-lg overflow-x-hidden">
      {/* Category Tabs */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
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
      </div>

      {/* Category Items Dropdown */}
      {!selectedItem && activeCategory && (
        <div className="border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {categories
                .find((c) => c.labelKey === activeCategory)
                ?.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item, activeCategory || undefined)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
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

      {/* Item Detail Section (Trustpilot-style) */}
      {selectedItem && (
        <div className="border-t border-border">
          <ItemDetailSection
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </div>
      )}
    </div>
  );
};