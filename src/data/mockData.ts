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
}

export type ReviewerTier = "gold" | "silver" | "bronze";

export interface Review {
  id: string;
  developerId: string;
  author: string;
  avatar?: string;
  profileVerified: boolean;
  tier: ReviewerTier;
  rating: number;
  date: string;
  project: string;
  comment: string;
  verified: boolean;
  developerReply?: {
    author: string;
    date: string;
    comment: string;
  };
}

export const developers: Developer[] = [
  {
    id: "emaar",
    name: "Emaar Properties",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
    rating: 4.8,
    reviewCount: 1247,
    trustScore: 96,
    verified: true,
    projectsCompleted: 145,
    location: "Dubai, UAE",
    specialties: ["Luxury Residential", "Mixed-Use", "Commercial"],
    sentimentScore: 8.7,
    isClaimed: false,
  },
  {
    id: "damac",
    name: "Damac Properties",
    logo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop",
    rating: 4.6,
    reviewCount: 892,
    trustScore: 92,
    verified: true,
    projectsCompleted: 98,
    location: "Dubai, UAE",
    specialties: ["Luxury Villas", "High-Rise", "Golf Communities"],
    sentimentScore: 7.9,
    isClaimed: false,
  },
  {
    id: "meraas",
    name: "Meraas Holding",
    logo: "https://images.unsplash.com/photo-1464938050520-ef2571ea41d2?w=100&h=100&fit=crop",
    rating: 4.7,
    reviewCount: 634,
    trustScore: 94,
    verified: true,
    projectsCompleted: 67,
    location: "Dubai, UAE",
    specialties: ["Waterfront", "Lifestyle", "Entertainment"],
    sentimentScore: 8.3,
    isClaimed: false,
  },
  {
    id: "dubai-properties",
    name: "Dubai Properties",
    logo: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop",
    rating: 4.5,
    reviewCount: 523,
    trustScore: 89,
    verified: true,
    projectsCompleted: 112,
    location: "Dubai, UAE",
    specialties: ["Residential", "Community Development", "Retail"],
    sentimentScore: 7.5,
    isClaimed: false,
  },
  {
    id: "nakheel",
    name: "Nakheel",
    logo: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=100&h=100&fit=crop",
    rating: 4.4,
    reviewCount: 789,
    trustScore: 87,
    verified: true,
    projectsCompleted: 86,
    location: "Dubai, UAE",
    specialties: ["Iconic Projects", "Islands", "Master Communities"],
    sentimentScore: 7.2,
    isClaimed: false,
  },
  {
    id: "sobha",
    name: "Sobha Realty",
    logo: "https://images.unsplash.com/photo-1565363887715-ae45c0c03dfe?w=100&h=100&fit=crop",
    rating: 4.7,
    reviewCount: 456,
    trustScore: 91,
    verified: true,
    projectsCompleted: 54,
    location: "Dubai, UAE",
    specialties: ["Premium Residential", "Luxury Apartments", "Quality Craftsmanship"],
    sentimentScore: 8.1,
    isClaimed: false,
  },
  {
    id: "aldar",
    name: "Aldar Properties",
    logo: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop",
    rating: 4.6,
    reviewCount: 612,
    trustScore: 90,
    verified: true,
    projectsCompleted: 78,
    location: "Abu Dhabi, UAE",
    specialties: ["Mixed-Use", "Residential Communities", "Commercial"],
    sentimentScore: 7.8,
    isClaimed: false,
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
}

export const projects: Project[] = [
  {
    id: "dubai-creek-harbour",
    name: "Dubai Creek Harbour",
    developerId: "emaar",
    location: "Dubai Creek",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop",
    unitTypes: ["1BR", "2BR", "3BR+"],
    priceRange: "AED 1.2M - 5M"
  },
  {
    id: "arabian-ranches-3",
    name: "Arabian Ranches III",
    developerId: "emaar",
    location: "Dubai Land",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop",
    unitTypes: ["3BR+", "Villa"],
    priceRange: "AED 2.5M - 8M"
  },
  {
    id: "dubai-hills-estate",
    name: "Dubai Hills Estate",
    developerId: "emaar",
    location: "Dubai Hills",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop",
    unitTypes: ["Studio", "1BR", "2BR", "3BR+"],
    priceRange: "AED 800K - 6M"
  },
  {
    id: "damac-hills-2",
    name: "DAMAC Hills 2",
    developerId: "damac",
    location: "DAMAC Hills",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&h=100&fit=crop",
    unitTypes: ["2BR", "3BR+", "Villa"],
    priceRange: "AED 1M - 4M"
  },
  {
    id: "damac-lagoons",
    name: "DAMAC Lagoons",
    developerId: "damac",
    location: "DAMAC South",
    status: "Pre-Launch",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop",
    unitTypes: ["Villa", "Townhouse"],
    priceRange: "AED 1.5M - 6M"
  },
  {
    id: "palm-jumeirah",
    name: "Palm Jumeirah",
    developerId: "nakheel",
    location: "Palm Jumeirah",
    status: "Occupied",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=100&h=100&fit=crop",
    unitTypes: ["1BR", "2BR", "3BR+", "Villa"],
    priceRange: "AED 2M - 50M"
  },
  {
    id: "bluewaters-residences",
    name: "Bluewaters Residences",
    developerId: "meraas",
    location: "Bluewaters Island",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop",
    unitTypes: ["1BR", "2BR", "3BR+"],
    priceRange: "AED 1.8M - 8M"
  },
  {
    id: "yas-island",
    name: "Yas Island",
    developerId: "aldar",
    location: "Abu Dhabi",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop",
    unitTypes: ["Studio", "1BR", "2BR", "3BR+"],
    priceRange: "AED 600K - 4M"
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
  { id: "downtown-dubai", name: "Downtown Dubai", region: "Dubai", projectCount: 45 },
  { id: "dubai-marina", name: "Dubai Marina", region: "Dubai", projectCount: 78 },
  { id: "palm-jumeirah", name: "Palm Jumeirah", region: "Dubai", projectCount: 32 },
  { id: "dubai-creek", name: "Dubai Creek", region: "Dubai", projectCount: 28 },
  { id: "jbr", name: "Jumeirah Beach Residence", region: "Dubai", projectCount: 24 },
  { id: "business-bay", name: "Business Bay", region: "Dubai", projectCount: 56 },
  { id: "dubai-hills", name: "Dubai Hills", region: "Dubai", projectCount: 18 },
  { id: "yas-island", name: "Yas Island", region: "Abu Dhabi", projectCount: 22 },
  { id: "saadiyat-island", name: "Saadiyat Island", region: "Abu Dhabi", projectCount: 15 },
  { id: "al-reem-island", name: "Al Reem Island", region: "Abu Dhabi", projectCount: 34 }
];

// Brokerages data
export interface Brokerage {
  id: string;
  name: string;
  logo?: string;
  specialty: string;
  agentCount: number;
}

export const brokerages: Brokerage[] = [
  { id: "allsopp-allsopp", name: "Allsopp & Allsopp", specialty: "Premium Properties", agentCount: 150 },
  { id: "betterhomes", name: "Better Homes", specialty: "Residential & Commercial", agentCount: 200 },
  { id: "driven-properties", name: "Driven Properties", specialty: "Luxury Real Estate", agentCount: 80 },
  { id: "fam-properties", name: "Fäm Properties", specialty: "Off-Plan Specialists", agentCount: 120 },
  { id: "haus-haus", name: "haus & haus", specialty: "Dubai Property Experts", agentCount: 95 }
];

// Apps/Platforms data
export interface App {
  id: string;
  name: string;
  type: string;
  icon?: string;
  rating: number;
  downloads: string;
}

export const apps: App[] = [
  { id: "bayut", name: "Bayut", type: "Property Portal", rating: 4.6, downloads: "1M+" },
  { id: "property-finder", name: "Property Finder", type: "Property Portal", rating: 4.5, downloads: "500K+" },
  { id: "dubizzle", name: "Dubizzle Property", type: "Marketplace", rating: 4.3, downloads: "2M+" },
  { id: "zoom-property", name: "Zoom Property", type: "Property Portal", rating: 4.2, downloads: "100K+" }
];

// Unit types
export interface UnitType {
  id: string;
  name: string;
  description: string;
  averagePrice: string;
}

export const unitTypes: UnitType[] = [
  { id: "studio", name: "Studio", description: "Single room units", averagePrice: "AED 400K - 800K" },
  { id: "1br", name: "1 Bedroom", description: "One bedroom apartments", averagePrice: "AED 600K - 1.5M" },
  { id: "2br", name: "2 Bedrooms", description: "Two bedroom apartments", averagePrice: "AED 900K - 2.5M" },
  { id: "3br", name: "3+ Bedrooms", description: "Three or more bedrooms", averagePrice: "AED 1.5M - 5M" },
  { id: "villa", name: "Villa", description: "Standalone villas", averagePrice: "AED 2M - 15M" },
  { id: "townhouse", name: "Townhouse", description: "Townhouse units", averagePrice: "AED 1.5M - 6M" },
  { id: "penthouse", name: "Penthouse", description: "Luxury penthouses", averagePrice: "AED 5M - 50M" },
  { id: "commercial", name: "Commercial", description: "Office & retail spaces", averagePrice: "AED 500K - 10M" }
];

// Categories for navigation
export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: "units", name: "UNITS", icon: "🗄️", count: 8 },
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
    developerId: "emaar",
    author: "Ahmed Al-Rashid",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-15",
    project: "Dubai Creek Harbour",
    comment: "Exceptional quality and timely delivery. The attention to detail in the finishing is outstanding. Highly recommend for serious investors.",
    verified: true,
    developerReply: {
      author: "Emaar Properties Team",
      date: "2024-01-16",
      comment: "Thank you for your kind words, Ahmed! We're delighted to hear about your positive experience at Dubai Creek Harbour. Your satisfaction is our priority.",
    },
  },
  {
    id: "2",
    developerId: "emaar",
    author: "Sarah Thompson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "silver",
    rating: 4,
    date: "2024-01-10",
    project: "Arabian Ranches III",
    comment: "Great community facilities and excellent location. Minor delays in handover but overall satisfied with the purchase.",
    verified: true,
    developerReply: {
      author: "Emaar Properties Team",
      date: "2024-01-11",
      comment: "Thank you for your feedback, Sarah. We apologize for the minor delays and are continuously working to improve our delivery timelines.",
    },
  },
  {
    id: "3",
    developerId: "emaar",
    author: "Mohammed Hassan",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "bronze",
    rating: 5,
    date: "2024-01-05",
    project: "Dubai Hills Estate",
    comment: "Premium development with world-class amenities. The ROI has exceeded expectations. Professional team throughout.",
    verified: true,
  },
  {
    id: "4",
    developerId: "damac",
    author: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-18",
    project: "DAMAC Hills 2",
    comment: "Stunning architecture and thoughtful design. The branded residences concept is executed brilliantly. Very happy with the investment.",
    verified: true,
    developerReply: {
      author: "DAMAC Properties",
      date: "2024-01-19",
      comment: "Thank you, Elena! We're thrilled you appreciate our branded residences concept. Welcome to the DAMAC family!",
    },
  },
  {
    id: "5",
    developerId: "damac",
    author: "James Mitchell",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "bronze",
    rating: 4,
    date: "2024-01-12",
    project: "DAMAC Lagoons",
    comment: "Innovative concept with beautiful water features. Construction quality is solid. Customer service could be more responsive.",
    verified: true,
  },
  {
    id: "6",
    developerId: "damac",
    author: "Fatima Al-Mansoori",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "silver",
    rating: 5,
    date: "2024-01-08",
    project: "Cavalli Tower",
    comment: "Luxury at its finest. The branded collaboration adds significant value. Premium finishes and excellent location.",
    verified: true,
  },
  {
    id: "7",
    developerId: "meraas",
    author: "David Chen",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-20",
    project: "Bluewaters Residences",
    comment: "Exceptional waterfront living with unbeatable views. The resort-style amenities are world-class. Worth every dirham.",
    verified: true,
  },
  {
    id: "8",
    developerId: "meraas",
    author: "Layla Ahmed",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "silver",
    rating: 4,
    date: "2024-01-14",
    project: "City Walk",
    comment: "Vibrant community with great retail and dining. Perfect for young professionals. Slightly higher service charges but justified.",
    verified: true,
  },
  {
    id: "9",
    developerId: "meraas",
    author: "Robert Williams",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "bronze",
    rating: 5,
    date: "2024-01-09",
    project: "La Mer",
    comment: "Beach living redefined. The lifestyle offering is unmatched in Dubai. Excellent build quality and community atmosphere.",
    verified: true,
  },
  {
    id: "10",
    developerId: "dubai-properties",
    author: "Aisha Ibrahim",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 4,
    date: "2024-01-17",
    project: "Villanova",
    comment: "Family-friendly community with excellent schools nearby. Good value for money. Construction timelines were accurate.",
    verified: true,
  },
  {
    id: "11",
    developerId: "dubai-properties",
    author: "Marco Rossi",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "silver",
    rating: 5,
    date: "2024-01-11",
    project: "Jumeirah Beach Residence",
    comment: "Prime beachfront location with great rental yields. Professional handover process. Very satisfied investor.",
    verified: true,
  },
  {
    id: "12",
    developerId: "dubai-properties",
    author: "Noor Al-Said",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "bronze",
    rating: 4,
    date: "2024-01-06",
    project: "Mudon",
    comment: "Peaceful community with good connectivity. Ideal for families. Amenities continue to improve over time.",
    verified: true,
  },
  {
    id: "13",
    developerId: "nakheel",
    author: "Thomas Anderson",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-19",
    project: "Palm Jumeirah",
    comment: "Iconic address that speaks for itself. Prestige and luxury combined. Excellent appreciation over the years.",
    verified: true,
  },
  {
    id: "14",
    developerId: "nakheel",
    author: "Hiba Khalil",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "silver",
    rating: 4,
    date: "2024-01-13",
    project: "The Gardens",
    comment: "Well-maintained community with mature landscaping. Great for families. Some units need modernization but overall solid investment.",
    verified: true,
  },
  {
    id: "15",
    developerId: "nakheel",
    author: "Alexander Petrov",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "bronze",
    rating: 4,
    date: "2024-01-07",
    project: "Dragon City",
    comment: "Unique concept with good commercial potential. Strategic location near airport. Growing community with good prospects.",
    verified: true,
  },
];
