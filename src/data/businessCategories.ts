// Single source of truth for all business categories.
// Maps to category labelKeys used across the platform (HeroCategoryItems, BrowseCategoriesGrid, etc.)
// When a new category is added here, it will automatically appear in:
//   - Admin user detail (business category picker)
//   - Businesses directory page (filter sidebar)

export const BUSINESS_CATEGORIES = [
  { value: "developers", label: "Developers" },
  { value: "units", label: "Units" },
  { value: "apps", label: "Apps" },
  { value: "shares", label: "Shares" },
  { value: "platforms", label: "Platforms" },
  { value: "brokers", label: "Brokers" },
  { value: "exhibitions", label: "Exhibitions" },
  { value: "channels", label: "Channels" },
  { value: "law-firms", label: "Law Firms" },
  { value: "valuation", label: "Valuation" },
  { value: "training", label: "Training" },
  { value: "auctions", label: "Auctions" },
  { value: "mortgage", label: "Mortgage" },
  { value: "research", label: "Research" },
  { value: "tax", label: "Tax" },
  { value: "management", label: "Management" },
  { value: "leasing", label: "Leasing" },
  { value: "blockchain", label: "Blockchain" },
  { value: "lands", label: "Lands" },
] as const;

export type BusinessCategoryValue = (typeof BUSINESS_CATEGORIES)[number]["value"];
