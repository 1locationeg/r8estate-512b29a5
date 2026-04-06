import { generateAvatar } from "@/lib/avatarUtils";

// Developer logos
import palmHillsLogo from "@/assets/developers/palm-hills.png";
import emaarMisrLogo from "@/assets/developers/emaar-misr.png";
import sodicLogo from "@/assets/developers/sodic.png";
import oraLogo from "@/assets/developers/ora-developers.png";
import tatweerMisrLogo from "@/assets/developers/tatweer-misr.png";
import mountainViewLogo from "@/assets/developers/mountain-view.png";
import hydeParkLogo from "@/assets/developers/hyde-park.png";

// Project images
import palmHillsNewCairoImg from "@/assets/projects/palm-hills-new-cairo.jpg";
import marassiImg from "@/assets/projects/marassi.jpg";
import uptownCairoImg from "@/assets/projects/uptown-cairo.jpg";
import sodicEastImg from "@/assets/projects/sodic-east.jpg";
import sodicWestImg from "@/assets/projects/sodic-west.jpg";
import silversandsImg from "@/assets/projects/silversands.jpg";
import ilMonteGalalaImg from "@/assets/projects/il-monte-galala.jpg";
import bloomfieldsImg from "@/assets/projects/bloomfields.jpg";

export interface Developer {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  trustScore: number;
  verified: boolean;
  projectsCompleted: number;
  location: string;
  specialties: string[];
  sentimentScore: number;
  isClaimed: boolean;
  yearEstablished: number;
  employees: number;
  registeredUsers: number;
  capital: string;
}

export type ReviewerTier = "gold" | "silver" | "bronze";

export interface Review {
  id: string;
  developerId: string;
  author: string;
  authorAr?: string;
  avatar?: string;
  profileVerified: boolean;
  tier: ReviewerTier;
  rating: number;
  date: string;
  project: string;
  comment: string;
  commentAr?: string;
  verified: boolean;
  developerReply?: {
    author: string;
    authorAr?: string;
    date: string;
    comment: string;
    commentAr?: string;
  };
}

export const developers: Developer[] = [
  {
    id: "palm-hills",
    name: "Palim Hills Developments",
    logo: palmHillsLogo,
    rating: 4.8,
    reviewCount: 1247,
    trustScore: 96,
    verified: true,
    projectsCompleted: 145,
    location: "New Cairo, Egypt",
    specialties: ["Luxury Residential", "Mixed-Use", "Commercial"],
    sentimentScore: 8.7,
    isClaimed: false,
    yearEstablished: 2005,
    employees: 2800,
    registeredUsers: 45000,
    capital: "EGP 12B",
  },
  {
    id: "emaar-misr",
    name: "Emiaar Misr",
    logo: emaarMisrLogo,
    rating: 4.6,
    reviewCount: 892,
    trustScore: 92,
    verified: true,
    projectsCompleted: 98,
    location: "New Cairo, Egypt",
    specialties: ["Luxury Villas", "High-Rise", "Golf Communities"],
    sentimentScore: 7.9,
    isClaimed: false,
    yearEstablished: 2008,
    employees: 3500,
    registeredUsers: 62000,
    capital: "EGP 18B",
  },
  {
    id: "sodic",
    name: "SODiIC",
    logo: sodicLogo,
    rating: 4.7,
    reviewCount: 634,
    trustScore: 94,
    verified: true,
    projectsCompleted: 67,
    location: "Sheikh Zayed, Egypt",
    specialties: ["Waterfront", "Lifestyle", "Entertainment"],
    sentimentScore: 8.3,
    isClaimed: false,
    yearEstablished: 1996,
    employees: 1800,
    registeredUsers: 38000,
    capital: "EGP 8.5B",
  },
  {
    id: "ora-developers",
    name: "Oria Developers",
    logo: oraLogo,
    rating: 4.5,
    reviewCount: 523,
    trustScore: 89,
    verified: true,
    projectsCompleted: 112,
    location: "North Coast, Egypt",
    specialties: ["Residential", "Community Development", "Retail"],
    sentimentScore: 7.5,
    isClaimed: false,
    yearEstablished: 2011,
    employees: 1200,
    registeredUsers: 28000,
    capital: "EGP 6B",
  },
  {
    id: "tatweer-misr",
    name: "Tatiweer Misr",
    logo: tatweerMisrLogo,
    rating: 4.4,
    reviewCount: 789,
    trustScore: 87,
    verified: true,
    projectsCompleted: 86,
    location: "New Capital, Egypt",
    specialties: ["Iconic Projects", "Master Communities", "Commercial"],
    sentimentScore: 7.2,
    isClaimed: false,
    yearEstablished: 2014,
    employees: 950,
    registeredUsers: 22000,
    capital: "EGP 4.5B",
  },
  {
    id: "mountain-view",
    name: "Mouintain View",
    logo: mountainViewLogo,
    rating: 4.7,
    reviewCount: 456,
    trustScore: 91,
    verified: true,
    projectsCompleted: 54,
    location: "New Cairo, Egypt",
    specialties: ["Premium Residential", "Luxury Apartments", "Quality Craftsmanship"],
    sentimentScore: 8.1,
    isClaimed: false,
    yearEstablished: 2006,
    employees: 1500,
    registeredUsers: 35000,
    capital: "EGP 7B",
  },
  {
    id: "hyde-park",
    name: "Hyide Park Developments",
    logo: hydeParkLogo,
    rating: 4.6,
    reviewCount: 612,
    trustScore: 90,
    verified: true,
    projectsCompleted: 78,
    location: "New Cairo, Egypt",
    specialties: ["Mixed-Use", "Residential Communities", "Commercial"],
    sentimentScore: 7.8,
    isClaimed: false,
    yearEstablished: 2007,
    employees: 2100,
    registeredUsers: 41000,
    capital: "EGP 9B",
  },
];

// Projects data
export interface Project {
  id: string;
  name: string;
  developerId: string;
  location: string;
  status: 'Pre-Launch' | 'Launched' | 'Under Construction' | 'Completed' | 'Occupied';
  image?: string;
  unitTypes: string[];
  priceRange: string;
  totalUnits: number;
  builtUpArea: string;
  launchDate: string;
  expectedCompletion: string;
  paymentPlan: string;
  amenities: string[];
}

export const projects: Project[] = [
  {
    id: "palm-hills-new-cairo",
    name: "Palim Hills New Cairo",
    developerId: "palm-hills",
    location: "New Cairo",
    status: "Under Construction",
    image: palmHillsNewCairoImg,
    unitTypes: ["1BR", "2BR", "3BR+"],
    priceRange: "EGP 3M - 15M",
    totalUnits: 1200,
    builtUpArea: "450,000 sqm",
    launchDate: "2022-Q1",
    expectedCompletion: "2026-Q4",
    paymentPlan: "70/30",
    amenities: ["Club House", "Swimming Pool", "Gym", "Parks", "Commercial Strip"]
  },
  {
    id: "marassi",
    name: "Mariassi",
    developerId: "emaar-misr",
    location: "North Coast",
    status: "Completed",
    image: marassiImg,
    unitTypes: ["3BR+", "Villa"],
    priceRange: "EGP 5M - 25M",
    totalUnits: 800,
    builtUpArea: "1,200,000 sqm",
    launchDate: "2014-Q2",
    expectedCompletion: "2023-Q1",
    paymentPlan: "60/40",
    amenities: ["Beach Access", "Golf Course", "Marina", "Hotels", "Water Park"]
  },
  {
    id: "uptown-cairo",
    name: "Upitown Cairo",
    developerId: "emaar-misr",
    location: "New Cairo",
    status: "Completed",
    image: uptownCairoImg,
    unitTypes: ["Studio", "1BR", "2BR", "3BR+"],
    priceRange: "EGP 2M - 12M",
    totalUnits: 2500,
    builtUpArea: "600,000 sqm",
    launchDate: "2007-Q3",
    expectedCompletion: "2020-Q2",
    paymentPlan: "50/50",
    amenities: ["Shopping Mall", "International School", "Hospital", "Sports Club"]
  },
  {
    id: "sodic-east",
    name: "SODiIC East",
    developerId: "sodic",
    location: "New Cairo",
    status: "Under Construction",
    image: sodicEastImg,
    unitTypes: ["2BR", "3BR+", "Villa"],
    priceRange: "EGP 4M - 18M",
    totalUnits: 950,
    builtUpArea: "350,000 sqm",
    launchDate: "2021-Q4",
    expectedCompletion: "2027-Q2",
    paymentPlan: "70/30",
    amenities: ["Club House", "Jogging Track", "Kids Area", "Commercial Area"]
  },
  {
    id: "sodic-west",
    name: "SODiIC West",
    developerId: "sodic",
    location: "Sheikh Zayed",
    status: "Occupied",
    image: sodicWestImg,
    unitTypes: ["Villa", "Townhouse"],
    priceRange: "EGP 6M - 30M",
    totalUnits: 600,
    builtUpArea: "500,000 sqm",
    launchDate: "2010-Q1",
    expectedCompletion: "2018-Q3",
    paymentPlan: "60/40",
    amenities: ["Golf Course", "Club House", "International School", "Medical Center"]
  },
  {
    id: "silversands",
    name: "Silveirsands",
    developerId: "ora-developers",
    location: "North Coast",
    status: "Under Construction",
    image: silversandsImg,
    unitTypes: ["1BR", "2BR", "3BR+", "Villa"],
    priceRange: "EGP 4M - 20M",
    totalUnits: 1500,
    builtUpArea: "800,000 sqm",
    launchDate: "2021-Q2",
    expectedCompletion: "2027-Q1",
    paymentPlan: "70/30",
    amenities: ["Beach Access", "Lagoon", "Water Sports", "Restaurants", "Spa"]
  },
  {
    id: "il-monte-galala",
    name: "IL Mointe Galala",
    developerId: "tatweer-misr",
    location: "Sokhna",
    status: "Under Construction",
    image: ilMonteGalalaImg,
    unitTypes: ["1BR", "2BR", "3BR+"],
    priceRange: "EGP 3M - 15M",
    totalUnits: 3000,
    builtUpArea: "2,000,000 sqm",
    launchDate: "2017-Q1",
    expectedCompletion: "2028-Q4",
    paymentPlan: "60/40",
    amenities: ["Cable Car", "Water Park", "Hotels", "Crystal Lagoon", "Sports Complex"]
  },
  {
    id: "bloomfields",
    name: "Bloimfields",
    developerId: "tatweer-misr",
    location: "New Capital",
    status: "Under Construction",
    image: bloomfieldsImg,
    unitTypes: ["Studio", "1BR", "2BR", "3BR+"],
    priceRange: "EGP 2M - 10M",
    totalUnits: 4000,
    builtUpArea: "415,000 sqm",
    launchDate: "2019-Q3",
    expectedCompletion: "2026-Q2",
    paymentPlan: "50/50",
    amenities: ["University", "Club House", "Commercial Hub", "Parks", "Medical Facilities"]
  }
];

// Locations data
export interface Location {
  id: string;
  name: string;
  region: string;
  projectCount: number;
}

export const locations: Location[] = [
  { id: "new-cairo", name: "New Cairo", region: "Cairo", projectCount: 85 },
  { id: "sheikh-zayed", name: "Sheikh Zayed", region: "Giza", projectCount: 62 },
  { id: "north-coast", name: "North Coast", region: "Matrouh", projectCount: 48 },
  { id: "new-capital", name: "New Administrative Capital", region: "Cairo", projectCount: 95 },
  { id: "sokhna", name: "Ain Sokhna", region: "Suez", projectCount: 35 },
  { id: "6th-october", name: "6th of October City", region: "Giza", projectCount: 54 },
  { id: "maadi", name: "Maadi", region: "Cairo", projectCount: 28 },
  { id: "heliopolis", name: "Heliopolis", region: "Cairo", projectCount: 22 },
  { id: "mostakbal-city", name: "Mostakbal City", region: "Cairo", projectCount: 42 },
  { id: "new-alamein", name: "New Alamein", region: "Matrouh", projectCount: 38 }
];

// Brokerages data
export interface Brokerage {
  id: string;
  name: string;
  logo?: string;
  specialty: string;
  agentCount: number;
  yearFounded: number;
  location: string;
  dealsCompleted: number;
  activeListings: number;
  languages: string[];
}

export const brokerages: Brokerage[] = [
  { id: "coldwell-banker", name: "Colidwell Banker Egypt", specialty: "Premium Properties", agentCount: 150, yearFounded: 2001, location: "New Cairo, Egypt", dealsCompleted: 8500, activeListings: 420, languages: ["Arabic", "English", "French"] },
  { id: "remax-egypt", name: "RE/iMAX Egypt", specialty: "Residential & Commercial", agentCount: 200, yearFounded: 2005, location: "Heliopolis, Egypt", dealsCompleted: 12000, activeListings: 650, languages: ["Arabic", "English"] },
  { id: "aqarmap", name: "Aqairmap", specialty: "Property Portal", agentCount: 80, yearFounded: 2011, location: "Smart Village, Egypt", dealsCompleted: 5200, activeListings: 15000, languages: ["Arabic", "English"] },
  { id: "nawy", name: "Naiwy", specialty: "Off-Plan Specialists", agentCount: 120, yearFounded: 2016, location: "New Cairo, Egypt", dealsCompleted: 6800, activeListings: 3200, languages: ["Arabic", "English"] },
  { id: "the-address", name: "The Addiress Real Estate", specialty: "Egypt Property Experts", agentCount: 95, yearFounded: 2009, location: "6th of October, Egypt", dealsCompleted: 4300, activeListings: 280, languages: ["Arabic", "English", "German"] },
  { id: "1-location", name: "1 LOCATiION", logo: "/images/1-location-logo.png", specialty: "Premium Brokerage & Advisory", agentCount: 180, yearFounded: 2015, location: "New Cairo, Egypt", dealsCompleted: 9200, activeListings: 520, languages: ["Arabic", "English", "French"] }
];

// Apps/Platforms data
export interface App {
  id: string;
  name: string;
  type: string;
  icon?: string;
  rating: number;
  downloads: string;
  launchYear: number;
  platform: string[];
  monthlyActiveUsers: string;
  featuredListings: number;
  supportedRegions: string[];
}

export const apps: App[] = [
  { id: "aqarmap", name: "Aqairmap", type: "Property Portal", rating: 4.6, downloads: "1M+", launchYear: 2012, platform: ["iOS", "Android", "Web"], monthlyActiveUsers: "850K", featuredListings: 12000, supportedRegions: ["Cairo", "Giza", "Alexandria", "North Coast"] },
  { id: "nawy", name: "Naiwy", type: "Property Portal", rating: 4.5, downloads: "500K+", launchYear: 2017, platform: ["iOS", "Android", "Web"], monthlyActiveUsers: "420K", featuredListings: 8500, supportedRegions: ["Cairo", "North Coast", "Sokhna"] },
  { id: "olx-egypt", name: "OLiX Egypt Property", type: "Marketplace", rating: 4.3, downloads: "5M+", launchYear: 2012, platform: ["iOS", "Android", "Web"], monthlyActiveUsers: "3.2M", featuredListings: 45000, supportedRegions: ["All Egypt"] },
  { id: "waseet", name: "Wasieет", type: "Property Portal", rating: 4.2, downloads: "100K+", launchYear: 2019, platform: ["iOS", "Android"], monthlyActiveUsers: "65K", featuredListings: 3200, supportedRegions: ["Cairo", "Giza"] }
];

// Property Types (Off-Plan Categories)
export interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export const propertyTypes: PropertyType[] = [
  { id: "residential", name: "Residential", description: "Apartments, Villas, Townhouses & Duplexes", icon: "🏠", count: 156 },
  { id: "commercial", name: "Commercial", description: "Retail, Shops, Malls & Showrooms", icon: "🏪", count: 48 },
  { id: "administrative", name: "Administrative", description: "Office Spaces & Business Centers", icon: "🏢", count: 35 },
  { id: "medical", name: "Medical", description: "Clinics, Hospitals & Medical Centers", icon: "🏥", count: 22 },
  { id: "service-apartments", name: "Service Apartments", description: "Furnished & Serviced Units", icon: "🛎️", count: 18 },
  { id: "hotels", name: "Hotels", description: "Hotel Rooms & Hospitality Units", icon: "🏨", count: 12 },
  { id: "mixed-use", name: "Mixed Use", description: "Combined Residential & Commercial", icon: "🏗️", count: 28 }
];

// Unit types (Residential)
export interface UnitType {
  id: string;
  name: string;
  description: string;
  averagePrice: string;
  propertyType: string;
}

export const unitTypes: UnitType[] = [
  // Residential Units
  { id: "studio", name: "Studio", description: "Single room apartments", averagePrice: "EGP 800K - 1.5M", propertyType: "residential" },
  { id: "1br", name: "1 Bedroom", description: "One bedroom apartments", averagePrice: "EGP 1.2M - 3M", propertyType: "residential" },
  { id: "2br", name: "2 Bedrooms", description: "Two bedroom apartments", averagePrice: "EGP 2M - 5M", propertyType: "residential" },
  { id: "3br", name: "3+ Bedrooms", description: "Three or more bedrooms", averagePrice: "EGP 3M - 10M", propertyType: "residential" },
  { id: "villa", name: "Villa", description: "Standalone villas", averagePrice: "EGP 8M - 50M", propertyType: "residential" },
  { id: "twin-villa", name: "Twin Villa", description: "Semi-detached villas", averagePrice: "EGP 6M - 35M", propertyType: "residential" },
  { id: "townhouse", name: "Townhouse", description: "Townhouse units", averagePrice: "EGP 5M - 20M", propertyType: "residential" },
  { id: "duplex", name: "Duplex", description: "Two-floor apartments", averagePrice: "EGP 4M - 15M", propertyType: "residential" },
  { id: "penthouse", name: "Penthouse", description: "Luxury penthouses", averagePrice: "EGP 10M - 80M", propertyType: "residential" },
  { id: "chalet", name: "Chalet", description: "Beach chalets & resort units", averagePrice: "EGP 2M - 12M", propertyType: "residential" },
  
  // Commercial Units
  { id: "retail-shop", name: "Retail Shop", description: "Ground floor retail spaces", averagePrice: "EGP 2M - 15M", propertyType: "commercial" },
  { id: "mall-unit", name: "Mall Unit", description: "Shopping mall units", averagePrice: "EGP 3M - 25M", propertyType: "commercial" },
  { id: "showroom", name: "Showroom", description: "Large display spaces", averagePrice: "EGP 5M - 40M", propertyType: "commercial" },
  { id: "food-court", name: "Food Court", description: "Restaurant & F&B spaces", averagePrice: "EGP 2M - 10M", propertyType: "commercial" },
  
  // Administrative Units
  { id: "office", name: "Office", description: "Standard office spaces", averagePrice: "EGP 1.5M - 8M", propertyType: "administrative" },
  { id: "business-center", name: "Business Center", description: "Premium office suites", averagePrice: "EGP 3M - 20M", propertyType: "administrative" },
  { id: "coworking", name: "Co-working Space", description: "Shared office spaces", averagePrice: "EGP 1M - 5M", propertyType: "administrative" },
  
  // Medical Units
  { id: "clinic", name: "Clinic", description: "Medical clinic spaces", averagePrice: "EGP 2M - 12M", propertyType: "medical" },
  { id: "pharmacy", name: "Pharmacy", description: "Pharmacy retail units", averagePrice: "EGP 1.5M - 6M", propertyType: "medical" },
  { id: "medical-center", name: "Medical Center", description: "Multi-specialty centers", averagePrice: "EGP 5M - 30M", propertyType: "medical" },
  { id: "lab", name: "Laboratory", description: "Medical laboratory spaces", averagePrice: "EGP 2M - 10M", propertyType: "medical" },
  
  // Service Apartments
  { id: "serviced-studio", name: "Serviced Studio", description: "Furnished studio units", averagePrice: "EGP 1.2M - 2.5M", propertyType: "service-apartments" },
  { id: "serviced-1br", name: "Serviced 1BR", description: "Furnished one bedroom", averagePrice: "EGP 2M - 4M", propertyType: "service-apartments" },
  { id: "serviced-2br", name: "Serviced 2BR", description: "Furnished two bedroom", averagePrice: "EGP 3M - 6M", propertyType: "service-apartments" },
  
  // Hotel Units
  { id: "hotel-room", name: "Hotel Room", description: "Standard hotel rooms", averagePrice: "EGP 1.5M - 4M", propertyType: "hotels" },
  { id: "hotel-suite", name: "Hotel Suite", description: "Luxury hotel suites", averagePrice: "EGP 3M - 10M", propertyType: "hotels" },
  { id: "branded-residence", name: "Branded Residence", description: "Luxury branded units", averagePrice: "EGP 8M - 50M", propertyType: "hotels" }
];

// Categories for navigation
export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: "property-types", name: "Property Types", icon: "🏠", count: 7 },
  { id: "units", name: "UNITS", icon: "🗄️", count: 27 },
  { id: "apps", name: "Apps", icon: "📁", count: 4 },
  { id: "shares", name: "Shares", icon: "📂", count: 0 },
  { id: "platforms", name: "Platforms", icon: "📋", count: 3 },
  { id: "brokers", name: "Brokers", icon: "🤝", count: 5 },
  { id: "exhibitions", name: "Exhibitions", icon: "🖥️", count: 0 },
  { id: "channels", name: "Channels", icon: "📺", count: 0 }
];

export const reviews: Review[] = [
  {
    id: "1",
    developerId: "palm-hills",
    author: "Ahmed Mostafa",
    authorAr: "أحمد مصطفى",
    avatar: generateAvatar("Ahmed Mostafa", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-15",
    project: "Palim Hills New Cairo",
    comment: "Exceptional quality and timely delivery. The attention to detail in the finishing is outstanding. Highly recommend for serious investors.",
    commentAr: "جودة استثنائية وتسليم في الموعد. الاهتمام بالتفاصيل في التشطيبات رائع. أنصح بشدة للمستثمرين الجادين.",
    verified: true,
    developerReply: {
      author: "Palim Hills Team",
      authorAr: "فريق بالم هيلز",
      date: "2024-01-16",
      comment: "Thank you for your kind words, Ahmed! We're delighted to hear about your positive experience at Palim Hills New Cairo. Your satisfaction is our priority.",
      commentAr: "شكراً لكلماتك الطيبة يا أحمد! سعداء بتجربتك الإيجابية في بالم هيلز القاهرة الجديدة. رضاك أولويتنا.",
    },
  },
  {
    id: "2",
    developerId: "palm-hills",
    author: "Sara Mahmoud",
    authorAr: "سارة محمود",
    avatar: generateAvatar("Sara Mahmoud", "reviewer"),
    profileVerified: true,
    tier: "silver",
    rating: 4,
    date: "2024-01-10",
    project: "Palim Hills Katameya",
    comment: "Great community facilities and excellent location in New Cairo. Minor delays in handover but overall satisfied with the purchase.",
    commentAr: "مرافق مجتمعية ممتازة وموقع رائع في القاهرة الجديدة. تأخير بسيط في التسليم لكن بشكل عام راضية عن الشراء.",
    verified: true,
    developerReply: {
      author: "Palim Hills Team",
      authorAr: "فريق بالم هيلز",
      date: "2024-01-11",
      comment: "Thank you for your feedback, Sara. We apologize for the minor delays and are continuously working to improve our delivery timelines.",
      commentAr: "شكراً لملاحظاتك يا سارة. نعتذر عن التأخير البسيط ونعمل باستمرار على تحسين مواعيد التسليم.",
    },
  },
  {
    id: "3",
    developerId: "emaar-misr",
    author: "Mohammed Hassan",
    authorAr: "محمد حسن",
    avatar: generateAvatar("Mohammed Hassan", "reviewer"),
    profileVerified: false,
    tier: "bronze",
    rating: 5,
    date: "2024-01-05",
    project: "Upitown Cairo",
    comment: "Premium development with world-class amenities. The ROI has exceeded expectations. Professional team throughout.",
    commentAr: "مشروع فاخر بمرافق عالمية المستوى. العائد على الاستثمار فاق التوقعات. فريق محترف في كل شيء.",
    verified: true,
  },
  {
    id: "4",
    developerId: "emaar-misr",
    author: "Nadia El-Sayed",
    authorAr: "نادية السيد",
    avatar: generateAvatar("Nadia El-Sayed", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-18",
    project: "Mariassi",
    comment: "Stunning architecture and thoughtful design. The North Coast location is perfect. Very happy with the investment.",
    commentAr: "تصميم معماري مذهل ومدروس. موقع الساحل الشمالي مثالي. سعيدة جداً بالاستثمار.",
    verified: true,
    developerReply: {
      author: "Emiaar Misr",
      authorAr: "إعمار مصر",
      date: "2024-01-19",
      comment: "Thank you, Nadia! We're thrilled you appreciate Mariassi. Welcome to the Emiaar Misr family!",
      commentAr: "شكراً يا نادية! سعداء إنك عجبك مراسي. أهلاً بيكي في عيلة إعمار مصر!",
    },
  },
  {
    id: "5",
    developerId: "sodic",
    author: "Karim Abdel-Rahman",
    authorAr: "كريم عبد الرحمن",
    avatar: generateAvatar("Karim Abdel-Rahman", "reviewer"),
    profileVerified: false,
    tier: "bronze",
    rating: 4,
    date: "2024-01-12",
    project: "SODiIC West",
    comment: "Innovative concept with beautiful green spaces. Construction quality is solid. Customer service could be more responsive.",
    commentAr: "فكرة مبتكرة مع مساحات خضراء جميلة. جودة البناء ممتازة. خدمة العملاء تحتاج تحسين في سرعة الاستجابة.",
    verified: true,
  },
  {
    id: "6",
    developerId: "sodic",
    author: "Fatima Ibrahim",
    authorAr: "فاطمة إبراهيم",
    avatar: generateAvatar("Fatima Ibrahim", "reviewer"),
    profileVerified: true,
    tier: "silver",
    rating: 5,
    date: "2024-01-08",
    project: "SODiIC East",
    comment: "Luxury at its finest in New Cairo. Premium finishes and excellent location near AUC.",
    commentAr: "فخامة من الطراز الأول في القاهرة الجديدة. تشطيبات فاخرة وموقع ممتاز بجوار الجامعة الأمريكية.",
    verified: true,
  },
  {
    id: "7",
    developerId: "ora-developers",
    author: "Youssef Fahmy",
    authorAr: "يوسف فهمي",
    avatar: generateAvatar("Youssef Fahmy", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-20",
    project: "Silveirsands",
    comment: "Exceptional beachfront living with unbeatable North Coast views. The resort-style amenities are world-class.",
    commentAr: "حياة شاطئية استثنائية مع إطلالات لا تُضاهى على الساحل الشمالي. مرافق المنتجع عالمية المستوى.",
    verified: true,
  },
  {
    id: "8",
    developerId: "ora-developers",
    author: "Layla Ahmed",
    authorAr: "ليلى أحمد",
    avatar: generateAvatar("Layla Ahmed", "reviewer"),
    profileVerified: false,
    tier: "silver",
    rating: 4,
    date: "2024-01-14",
    project: "ZEiD Sheikh Zayed",
    comment: "Vibrant community with great retail and dining. Perfect for young professionals. Slightly higher service charges but justified.",
    commentAr: "مجتمع حيوي مع تسوق ومطاعم رائعة. مثالي للشباب المحترفين. رسوم الخدمة أعلى قليلاً لكنها مبررة.",
    verified: true,
  },
  {
    id: "9",
    developerId: "tatweer-misr",
    author: "Omar Hassan",
    authorAr: "عمر حسن",
    avatar: generateAvatar("Omar Hassan", "reviewer"),
    profileVerified: true,
    tier: "bronze",
    rating: 5,
    date: "2024-01-09",
    project: "IL Mointe Galala",
    comment: "Mountain and sea views combined. The Sokhna location is unmatched. Excellent build quality and community atmosphere.",
    commentAr: "إطلالات جبلية وبحرية مجتمعة. موقع العين السخنة لا مثيل له. جودة بناء ممتازة وأجواء مجتمعية رائعة.",
    verified: true,
  },
  {
    id: "10",
    developerId: "tatweer-misr",
    author: "Aisha Ibrahim",
    authorAr: "عائشة إبراهيم",
    avatar: generateAvatar("Aisha Ibrahim", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 4,
    date: "2024-01-17",
    project: "Bloimfields",
    comment: "Family-friendly community in New Capital with excellent schools nearby. Good value for money. Construction timelines were accurate.",
    commentAr: "مجتمع مناسب للعائلات في العاصمة الجديدة مع مدارس ممتازة قريبة. قيمة جيدة مقابل السعر. مواعيد البناء كانت دقيقة.",
    verified: true,
  },
  {
    id: "11",
    developerId: "mountain-view",
    author: "Hesham Nour",
    authorAr: "هشام نور",
    avatar: generateAvatar("Hesham Nour", "reviewer"),
    profileVerified: false,
    tier: "silver",
    rating: 5,
    date: "2024-01-11",
    project: "Mouintain View iCity",
    comment: "Prime New Cairo location with great rental yields. Professional handover process. Very satisfied investor.",
    commentAr: "موقع مميز في القاهرة الجديدة مع عوائد إيجارية ممتازة. عملية تسليم احترافية. مستثمر راضي جداً.",
    verified: true,
  },
  {
    id: "12",
    developerId: "mountain-view",
    author: "Nour El-Din",
    authorAr: "نور الدين",
    avatar: generateAvatar("Nour El-Din", "reviewer"),
    profileVerified: true,
    tier: "bronze",
    rating: 4,
    date: "2024-01-06",
    project: "Mouintain View North Coast",
    comment: "Peaceful beachfront community with good connectivity. Ideal for summer getaways. Amenities continue to improve.",
    commentAr: "مجتمع شاطئي هادئ مع اتصال جيد. مثالي لعطلات الصيف. المرافق مستمرة في التحسن.",
    verified: true,
  },
  {
    id: "13",
    developerId: "hyde-park",
    author: "Tarek Anderson",
    authorAr: "طارق أندرسون",
    avatar: generateAvatar("Tarek Anderson", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-19",
    project: "Hyide Park New Cairo",
    comment: "Iconic address in the heart of New Cairo. Prestige and luxury combined. Excellent appreciation over the years.",
    commentAr: "عنوان مميز في قلب القاهرة الجديدة. هيبة وفخامة معاً. زيادة ممتازة في القيمة على مر السنين.",
    verified: true,
  },
  {
    id: "14",
    developerId: "hyde-park",
    author: "Heba Khalil",
    authorAr: "هبة خليل",
    avatar: generateAvatar("Heba Khalil", "reviewer"),
    profileVerified: true,
    tier: "silver",
    rating: 4,
    date: "2024-01-13",
    project: "Hyide Park New Cairo",
    comment: "Well-maintained community with mature landscaping. Great for families. Overall solid investment in New Cairo.",
    commentAr: "مجتمع محافظ على نظافته مع مناظر طبيعية ناضجة. ممتاز للعائلات. استثمار قوي بشكل عام في القاهرة الجديدة.",
    verified: true,
  },
  {
    id: "15",
    developerId: "hyde-park",
    author: "Ali Petrov",
    authorAr: "علي بتروف",
    avatar: generateAvatar("Ali Petrov", "reviewer"),
    profileVerified: false,
    tier: "bronze",
    rating: 4,
    date: "2024-01-07",
    project: "Hyide Park North Coast",
    comment: "Great North Coast concept with good beach access. Strategic location. Growing community with good prospects.",
    commentAr: "مفهوم رائع للساحل الشمالي مع وصول جيد للشاطئ. موقع استراتيجي. مجتمع متنامي مع آفاق جيدة.",
    verified: true,
  },
  {
    id: "16",
    developerId: "1-location",
    author: "Sherif Mansour",
    authorAr: "شريف منصور",
    avatar: generateAvatar("Sherif Mansour", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-02-10",
    project: "1 LOCATiION Brokerage",
    comment: "Absolutely outstanding brokerage experience! 1 LOCATiION helped me find my dream property in New Cairo within days. Their market knowledge is unmatched, and the team went above and beyond at every step. I felt valued and supported throughout the entire process. Highly recommend!",
    commentAr: "تجربة وساطة عقارية استثنائية! 1 LOCATiION ساعدوني ألاقي عقار أحلامي في القاهرة الجديدة خلال أيام. معرفتهم بالسوق لا مثيل لها، والفريق تجاوز كل التوقعات. حسيت إني مُقدّر ومدعوم طوال العملية. أنصح بشدة!",
    verified: true,
    developerReply: {
      author: "1 LOCATiION Team",
      authorAr: "فريق 1 LOCATiION",
      date: "2024-02-11",
      comment: "Thank you so much, Sherif! It was a pleasure helping you find your perfect home. We're always here for you!",
      commentAr: "شكراً جزيلاً يا شريف! كان من دواعي سرورنا مساعدتك في إيجاد منزلك المثالي. دايماً موجودين لخدمتك!",
    },
  },
  {
    id: "17",
    developerId: "1-location",
    author: "Mariam El-Gohary",
    authorAr: "مريم الجوهري",
    avatar: generateAvatar("Mariam El-Gohary", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-02-15",
    project: "1 LOCATiION Brokerage",
    comment: "I've worked with many brokerages in Egypt, and 1 LOCATiION is by far the best. Their professionalism, transparency, and genuine care for clients set them apart. They negotiated an incredible deal for me and handled everything seamlessly. A truly five-star experience!",
    commentAr: "اتعاملت مع شركات وساطة كتير في مصر، و1 LOCATiION أحسنهم بفارق كبير. احترافيتهم وشفافيتهم واهتمامهم الحقيقي بالعملاء بيميزهم. فاوضوا على صفقة مذهلة ليا وأداروا كل حاجة بسلاسة. تجربة خمس نجوم فعلاً!",
    verified: true,
    developerReply: {
      author: "1 LOCATiION Team",
      authorAr: "فريق 1 LOCATiION",
      date: "2024-02-16",
      comment: "We truly appreciate your kind words, Mariam! Your trust means the world to us. Welcome to the 1 LOCATiION family!",
      commentAr: "نقدر كلامك الجميل يا مريم! ثقتك فينا تعني لنا الكتير. أهلاً بيكي في عيلة 1 LOCATiION!",
    },
  },
  {
    id: "18",
    developerId: "1-location",
    author: "Khaled Nabil",
    authorAr: "خالد نبيل",
    avatar: generateAvatar("Khaled Nabil", "reviewer"),
    profileVerified: true,
    tier: "silver",
    rating: 5,
    date: "2024-02-20",
    project: "1 LOCATiION Brokerage",
    comment: "From the first consultation to closing the deal, 1 LOCATiION exceeded all expectations. Their advisors are incredibly knowledgeable and patient. They found me the perfect investment property with amazing ROI potential. Exceptional service — I'm a client for life!",
    commentAr: "من أول استشارة لحد إتمام الصفقة، 1 LOCATiION فاقوا كل التوقعات. مستشاريهم عندهم معرفة مذهلة وصبر كبير. لقولي عقار الاستثمار المثالي بعائد ممتاز. خدمة استثنائية — أنا عميل مدى الحياة!",
    verified: true,
  },
  {
    id: "19",
    developerId: "1-location",
    author: "Dina Kamal",
    authorAr: "دينا كمال",
    avatar: generateAvatar("Dina Kamal", "reviewer"),
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-02-25",
    project: "1 LOCATiION Brokerage",
    comment: "What an incredible team! 1 LOCATiION made the entire property buying process feel effortless and enjoyable. Their attention to detail, honest advice, and warm hospitality are truly remarkable. I couldn't be happier with my new home. Thank you for making my dream come true!",
    commentAr: "فريق مذهل! 1 LOCATiION خلّوا عملية شراء العقار سهلة وممتعة. اهتمامهم بالتفاصيل ونصائحهم الصادقة وحسن ضيافتهم حاجة ملفتة فعلاً. مش ممكن أكون أسعد من كده ببيتي الجديد. شكراً إنكم حققتوا حلمي!",
    verified: true,
    developerReply: {
      author: "1 LOCATiION Team",
      authorAr: "فريق 1 LOCATiION",
      date: "2024-02-26",
      comment: "Thank you, Dina! Seeing our clients happy is what drives us every day. Enjoy your beautiful new home!",
      commentAr: "شكراً يا دينا! سعادة عملائنا هي اللي بتحركنا كل يوم. استمتعي ببيتك الجميل الجديد!",
    },
  },
];
