export type ProfessionalSocial = {
  platform: 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'x' | 'website';
  handle: string;
  url: string;
  followers?: number;
  verified?: boolean;
};

export type ProReview = {
  id: string;
  author: string;
  authorRole: string;
  rating: number;
  date: string;
  dealType: string;
  title: string;
  body: string;
  verified: boolean;
};

export type ProExperience = {
  role: string;
  company: string;
  companySlug?: string;
  start: string;
  end?: string;
  highlights: string[];
};

export type ProCertificate = {
  name: string;
  issuer: string;
  year: number;
  verified: boolean;
};

export type ProSkill = { name: string; endorsements: number };

export type ProPortfolioItem = {
  title: string;
  developer: string;
  developerSlug?: string;
  year: number;
  type: string;
  thumbnail?: string;
};

export type ProAward = { title: string; issuer: string; year: number };

export type ProEducation = { school: string; degree: string; year: number };

export type ProFAQ = { q: string; a: string };

export type ProfessionalProfile = {
  slug: string;
  name: string;
  headline: string;
  avatar?: string;
  cover?: string;
  location: string;
  yearsExperience: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  trustScore: number;
  responseTime: string;
  dealsClosed: number;
  bio: string;
  specialties: string[];
  verified: boolean;
  tier: { name: string; emoji: string };
  affiliation?: { company: string; role: string; slug?: string };
  socials: ProfessionalSocial[];
  experience: ProExperience[];
  reviews: ProReview[];
  ratingBreakdown: { stars: number; count: number }[];
  skills: ProSkill[];
  portfolio: ProPortfolioItem[];
  certificates: ProCertificate[];
  education: ProEducation[];
  awards: ProAward[];
  faqs: ProFAQ[];
};

export const mockProfessionals: Record<string, ProfessionalProfile> = {
  'ahmed-hassan': {
    slug: 'ahmed-hassan',
    name: 'Ahmed Hassan',
    headline: 'Senior Off-Plan Sales Consultant · New Cairo & North Coast',
    location: 'New Cairo, Egypt',
    yearsExperience: 9,
    languages: ['Arabic', 'English'],
    rating: 4.9,
    reviewCount: 87,
    trustScore: 94,
    responseTime: '< 2h',
    dealsClosed: 142,
    verified: true,
    tier: { name: 'Elite Pro', emoji: '👑' },
    bio: "9 years helping Egyptian and GCC families pick safe off-plan investments in New Cairo, the North Coast, and the New Capital. I focus on delivery-record-first developers, transparent payment plans, and post-handover support. No pressure, no inflated promises — just the numbers.",
    specialties: ['Off-Plan Advisory', 'New Cairo', 'North Coast', 'Investor Relations', 'Payment Plan Structuring'],
    affiliation: { company: 'Coldwell Banker Egypt', role: 'Senior Consultant' },
    socials: [
      { platform: 'linkedin', handle: 'ahmedhassan', url: 'https://linkedin.com/in/ahmedhassan', verified: true },
      { platform: 'instagram', handle: '@ahmed.offplan', url: '#', followers: 18400, verified: true },
      { platform: 'youtube', handle: 'Ahmed Off-Plan', url: '#', followers: 7600 },
      { platform: 'tiktok', handle: '@ahmed.realestate', url: '#', followers: 22300 },
      { platform: 'facebook', handle: 'Ahmed Hassan Realty', url: '#' },
      { platform: 'website', handle: 'ahmedhassan.eg', url: '#' },
    ],
    experience: [
      { role: 'Senior Sales Consultant', company: 'Coldwell Banker Egypt', start: '2022', highlights: ['Closed EGP 480M in off-plan volume', 'Top 3 broker in New Cairo region 2024'] },
      { role: 'Sales Team Lead', company: 'Connect Homes', start: '2019', end: '2022', highlights: ['Built and led a 12-agent off-plan team', 'Launched the Mostakbal City vertical'] },
      { role: 'Property Consultant', company: 'Nawy', start: '2016', end: '2019', highlights: ['90+ closed deals across SODIC, Palm Hills, Mountain View'] },
    ],
    reviews: [
      { id: 'r1', author: 'Mona K.', authorRole: 'Apartment buyer · SODIC East', rating: 5, date: '2 weeks ago', dealType: 'Apartment · 4.2M EGP', title: 'Honest about delivery risk, saved us a bad deal', body: 'Ahmed walked us through three developers and was the only one who openly compared their delivery records. He talked us out of a "discounted" unit that turned out to be from a project with delays. Closed instead on a SODIC unit with a clear handover schedule.', verified: true },
      { id: 'r2', author: 'Hossam A.', authorRole: 'Investor · 3 units', rating: 5, date: '1 month ago', dealType: 'Portfolio · 11M EGP', title: 'Best payment-plan structuring I\'ve seen', body: 'I had a budget and a timeline. Ahmed structured three units across two developers so the installments never overlapped my cash crunch months. Very rare to find this level of financial thinking from a sales agent.', verified: true },
      { id: 'r3', author: 'Sara M.', authorRole: 'First-time buyer', rating: 5, date: '2 months ago', dealType: 'Apartment · 3.1M EGP', title: 'Patient with a nervous first-time buyer', body: 'Took 4 months and 12 viewings. Never pressured me once. Even helped me read the contract before signing.', verified: true },
      { id: 'r4', author: 'Karim L.', authorRole: 'Buyer · North Coast', rating: 4, date: '3 months ago', dealType: 'Chalet · 6.8M EGP', title: 'Solid recommendation, would use again', body: 'Good network with North Coast developers. One small hiccup with paperwork timing but Ahmed fixed it within a day.', verified: true },
    ],
    ratingBreakdown: [
      { stars: 5, count: 76 },
      { stars: 4, count: 9 },
      { stars: 3, count: 2 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
    skills: [
      { name: 'Off-Plan Advisory', endorsements: 64 },
      { name: 'Payment Plan Structuring', endorsements: 48 },
      { name: 'Contract Review', endorsements: 31 },
      { name: 'New Cairo Market', endorsements: 57 },
      { name: 'North Coast Market', endorsements: 42 },
      { name: 'Investor Relations', endorsements: 38 },
      { name: 'Negotiation', endorsements: 51 },
    ],
    portfolio: [
      { title: 'Eastown Residences', developer: 'SODIC', year: 2024, type: 'Apartment' },
      { title: 'Hacienda Bay', developer: 'Palm Hills', year: 2024, type: 'Chalet' },
      { title: 'Mountain View iCity', developer: 'Mountain View', year: 2023, type: 'Townhouse' },
      { title: 'Mostakbal City Phase 2', developer: 'Tatweer Misr', year: 2023, type: 'Apartment' },
      { title: 'Marassi North Coast', developer: 'Emaar Misr', year: 2022, type: 'Chalet' },
      { title: 'Stone Residence', developer: 'Roya Developments', year: 2022, type: 'Villa' },
    ],
    certificates: [
      { name: 'RERA Certified Broker', issuer: 'Egyptian Financial Regulatory Authority', year: 2023, verified: true },
      { name: 'Certified Negotiation Expert (CNE)', issuer: 'Real Estate Negotiation Institute', year: 2022, verified: true },
      { name: 'Off-Plan Investment Specialist', issuer: 'Cairo Real Estate Academy', year: 2021, verified: true },
    ],
    education: [
      { school: 'American University in Cairo', degree: 'BSc Business Administration', year: 2015 },
      { school: 'AUC Executive Education', degree: 'Real Estate Investment Analysis', year: 2020 },
    ],
    awards: [
      { title: 'Top 10 Off-Plan Brokers Egypt', issuer: 'Real Estate Egypt Awards', year: 2024 },
      { title: 'Customer Excellence Award', issuer: 'Coldwell Banker Egypt', year: 2023 },
    ],
    faqs: [
      { q: 'Do you charge buyers a commission?', a: 'No. My commission is paid by the developer. There is no extra cost to you as a buyer.' },
      { q: 'Can you help if I\'m based outside Egypt?', a: 'Yes. Roughly 30% of my clients are GCC-based Egyptians and expats. Full remote process: video tours, contract review, and signing via authorised representative.' },
      { q: 'What if I want to resell before handover?', a: 'I help structure assignment-friendly contracts and have a network for secondary off-plan resale. We can plan the exit upfront.' },
    ],
  },
};

export const getMockProfessional = (slug: string): ProfessionalProfile | null =>
  mockProfessionals[slug] ?? null;