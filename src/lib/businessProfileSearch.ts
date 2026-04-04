import type { SearchItem } from "@/data/searchIndex";

export interface PublicBusinessProfileSearchRow {
  id: string;
  company_name: string | null;
  location: string | null;
  logo_url: string | null;
  website: string | null;
  specialties: string[] | null;
  year_established: number | null;
  description: string | null;
}

const DEFAULT_BUSINESS_TRUST_SCORE = 78;

export function mapPublicBusinessProfileToSearchItem(
  profile: PublicBusinessProfileSearchRow,
): SearchItem {
  const websiteLabel = profile.website
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return {
    id: profile.id,
    name: profile.company_name?.trim() || "Business profile",
    category: "developers",
    subtitle: profile.location?.trim() || websiteLabel || "Verified business profile",
    image: profile.logo_url || undefined,
    meta: {
      dynamicBusinessProfile: true,
      trustScore: DEFAULT_BUSINESS_TRUST_SCORE,
      verified: true,
      location: profile.location ?? undefined,
      website: profile.website ?? undefined,
      specialties: profile.specialties ?? [],
      yearEstablished: profile.year_established ?? undefined,
      description: profile.description ?? undefined,
    },
  };
}