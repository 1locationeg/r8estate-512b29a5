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
    id: "palm-hills",
    name: "Palm Hills Developments",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
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
    name: "Emaar Misr",
    logo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop",
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
    name: "SODIC",
    logo: "https://images.unsplash.com/photo-1464938050520-ef2571ea41d2?w=100&h=100&fit=crop",
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
    name: "Ora Developers",
    logo: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop",
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
    name: "Tatweer Misr",
    logo: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=100&h=100&fit=crop",
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
    name: "Mountain View",
    logo: "https://images.unsplash.com/photo-1565363887715-ae45c0c03dfe?w=100&h=100&fit=crop",
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
    name: "Hyde Park Developments",
    logo: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop",
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
    name: "Palm Hills New Cairo",
    developerId: "palm-hills",
    location: "New Cairo",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop",
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
    name: "Marassi",
    developerId: "emaar-misr",
    location: "North Coast",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop",
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
    name: "Uptown Cairo",
    developerId: "emaar-misr",
    location: "New Cairo",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop",
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
    name: "SODIC East",
    developerId: "sodic",
    location: "New Cairo",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&h=100&fit=crop",
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
    name: "SODIC West",
    developerId: "sodic",
    location: "Sheikh Zayed",
    status: "Occupied",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop",
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
    name: "Silversands",
    developerId: "ora-developers",
    location: "North Coast",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=100&h=100&fit=crop",
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
    name: "IL Monte Galala",
    developerId: "tatweer-misr",
    location: "Sokhna",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop",
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
    name: "Bloomfields",
    developerId: "tatweer-misr",
    location: "New Capital",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop",
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
}

export const brokerages: Brokerage[] = [
  { id: "coldwell-banker", name: "Coldwell Banker Egypt", specialty: "Premium Properties", agentCount: 150 },
  { id: "remax-egypt", name: "RE/MAX Egypt", specialty: "Residential & Commercial", agentCount: 200 },
  { id: "aqarmap", name: "Aqarmap", specialty: "Property Portal", agentCount: 80 },
  { id: "nawy", name: "Nawy", specialty: "Off-Plan Specialists", agentCount: 120 },
  { id: "the-address", name: "The Address Real Estate", specialty: "Egypt Property Experts", agentCount: 95 }
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
  { id: "aqarmap", name: "Aqarmap", type: "Property Portal", rating: 4.6, downloads: "1M+" },
  { id: "nawy", name: "Nawy", type: "Property Portal", rating: 4.5, downloads: "500K+" },
  { id: "olx-egypt", name: "OLX Egypt Property", type: "Marketplace", rating: 4.3, downloads: "5M+" },
  { id: "waseet", name: "Waseet", type: "Property Portal", rating: 4.2, downloads: "100K+" }
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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-15",
    project: "Palm Hills New Cairo",
    comment: "Exceptional quality and timely delivery. The attention to detail in the finishing is outstanding. Highly recommend for serious investors.",
    verified: true,
    developerReply: {
      author: "Palm Hills Team",
      date: "2024-01-16",
      comment: "Thank you for your kind words, Ahmed! We're delighted to hear about your positive experience at Palm Hills New Cairo. Your satisfaction is our priority.",
    },
  },
  {
    id: "2",
    developerId: "palm-hills",
    author: "Sara Mahmoud",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "silver",
    rating: 4,
    date: "2024-01-10",
    project: "Palm Hills Katameya",
    comment: "Great community facilities and excellent location in New Cairo. Minor delays in handover but overall satisfied with the purchase.",
    verified: true,
    developerReply: {
      author: "Palm Hills Team",
      date: "2024-01-11",
      comment: "Thank you for your feedback, Sara. We apologize for the minor delays and are continuously working to improve our delivery timelines.",
    },
  },
  {
    id: "3",
    developerId: "emaar-misr",
    author: "Mohammed Hassan",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "bronze",
    rating: 5,
    date: "2024-01-05",
    project: "Uptown Cairo",
    comment: "Premium development with world-class amenities. The ROI has exceeded expectations. Professional team throughout.",
    verified: true,
  },
  {
    id: "4",
    developerId: "emaar-misr",
    author: "Nadia El-Sayed",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-18",
    project: "Marassi",
    comment: "Stunning architecture and thoughtful design. The North Coast location is perfect. Very happy with the investment.",
    verified: true,
    developerReply: {
      author: "Emaar Misr",
      date: "2024-01-19",
      comment: "Thank you, Nadia! We're thrilled you appreciate Marassi. Welcome to the Emaar Misr family!",
    },
  },
  {
    id: "5",
    developerId: "sodic",
    author: "Karim Abdel-Rahman",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "bronze",
    rating: 4,
    date: "2024-01-12",
    project: "SODIC West",
    comment: "Innovative concept with beautiful green spaces. Construction quality is solid. Customer service could be more responsive.",
    verified: true,
  },
  {
    id: "6",
    developerId: "sodic",
    author: "Fatima Ibrahim",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "silver",
    rating: 5,
    date: "2024-01-08",
    project: "SODIC East",
    comment: "Luxury at its finest in New Cairo. Premium finishes and excellent location near AUC.",
    verified: true,
  },
  {
    id: "7",
    developerId: "ora-developers",
    author: "Youssef Fahmy",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-20",
    project: "Silversands",
    comment: "Exceptional beachfront living with unbeatable North Coast views. The resort-style amenities are world-class.",
    verified: true,
  },
  {
    id: "8",
    developerId: "ora-developers",
    author: "Layla Ahmed",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "silver",
    rating: 4,
    date: "2024-01-14",
    project: "ZED Sheikh Zayed",
    comment: "Vibrant community with great retail and dining. Perfect for young professionals. Slightly higher service charges but justified.",
    verified: true,
  },
  {
    id: "9",
    developerId: "tatweer-misr",
    author: "Omar Hassan",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "bronze",
    rating: 5,
    date: "2024-01-09",
    project: "IL Monte Galala",
    comment: "Mountain and sea views combined. The Sokhna location is unmatched. Excellent build quality and community atmosphere.",
    verified: true,
  },
  {
    id: "10",
    developerId: "tatweer-misr",
    author: "Aisha Ibrahim",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 4,
    date: "2024-01-17",
    project: "Bloomfields",
    comment: "Family-friendly community in New Capital with excellent schools nearby. Good value for money. Construction timelines were accurate.",
    verified: true,
  },
  {
    id: "11",
    developerId: "mountain-view",
    author: "Hesham Nour",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "silver",
    rating: 5,
    date: "2024-01-11",
    project: "Mountain View iCity",
    comment: "Prime New Cairo location with great rental yields. Professional handover process. Very satisfied investor.",
    verified: true,
  },
  {
    id: "12",
    developerId: "mountain-view",
    author: "Nour El-Din",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "bronze",
    rating: 4,
    date: "2024-01-06",
    project: "Mountain View North Coast",
    comment: "Peaceful beachfront community with good connectivity. Ideal for summer getaways. Amenities continue to improve.",
    verified: true,
  },
  {
    id: "13",
    developerId: "hyde-park",
    author: "Tarek Anderson",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "gold",
    rating: 5,
    date: "2024-01-19",
    project: "Hyde Park New Cairo",
    comment: "Iconic address in the heart of New Cairo. Prestige and luxury combined. Excellent appreciation over the years.",
    verified: true,
  },
  {
    id: "14",
    developerId: "hyde-park",
    author: "Heba Khalil",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    profileVerified: true,
    tier: "silver",
    rating: 4,
    date: "2024-01-13",
    project: "Hyde Park New Cairo",
    comment: "Well-maintained community with mature landscaping. Great for families. Overall solid investment in New Cairo.",
    verified: true,
  },
  {
    id: "15",
    developerId: "hyde-park",
    author: "Ali Petrov",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop&crop=face",
    profileVerified: false,
    tier: "bronze",
    rating: 4,
    date: "2024-01-07",
    project: "Hyde Park North Coast",
    comment: "Great North Coast concept with good beach access. Strategic location. Growing community with good prospects.",
    verified: true,
  },
];
