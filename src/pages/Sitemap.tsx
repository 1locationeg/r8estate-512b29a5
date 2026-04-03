import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";
import { getSearchIndex, type SearchCategory } from "@/data/searchIndex";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Download, Map, Globe, ExternalLink } from "lucide-react";

const BASE_URL = "https://meter.r8estate.com";

interface StaticPage {
  name: string;
  path: string;
}

const STATIC_PAGES: StaticPage[] = [
  { name: "Home", path: "/" },
  { name: "Authentication", path: "/auth" },
  { name: "Reviews", path: "/reviews" },
  { name: "Directory", path: "/directory" },
  { name: "Community", path: "/community" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Rewards", path: "/rewards" },
  { name: "Deal Watch", path: "/deal-watch" },
  { name: "Launch Watch", path: "/launch-watch" },
  { name: "Categories", path: "/categories" },
  { name: "Messages", path: "/messages" },
  { name: "Install App", path: "/install" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Insights", path: "/insights" },
  { name: "Sitemap", path: "/sitemap" },
];

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  developers: "Developers",
  projects: "Projects",
  locations: "Locations",
  brokers: "Brokers",
  apps: "Apps",
  units: "Unit Types",
  "property-types": "Property Types",
  categories: "Categories",
  reviews: "Reviews",
};

function generateXml(staticPages: StaticPage[], grouped: Record<string, { name: string; path: string }[]>) {
  const urls: string[] = [];
  const add = (loc: string, priority: string, changefreq: string) => {
    urls.push(`  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
  };

  for (const page of staticPages) {
    add(`${BASE_URL}${page.path}`, page.path === "/" ? "1.0" : "0.8", "weekly");
  }

  for (const items of Object.values(grouped)) {
    for (const item of items) {
      add(`${BASE_URL}${item.path}`, "0.6", "monthly");
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
}

const CollapsibleSection = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <span className="font-medium text-foreground flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {title}
        </span>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{count}</span>
      </button>
      {open && <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">{children}</div>}
    </div>
  );
};

const Sitemap = () => {
  const { t } = useTranslation();
  const index = getSearchIndex();

  const grouped: Record<string, { name: string; path: string }[]> = {};
  for (const item of index) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push({ name: item.name, path: `/entity/${item.id}` });
  }

  const handleDownload = () => {
    const xml = generateXml(STATIC_PAGES, grouped);
    const blob = new Blob([xml], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Map className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sitemap</h1>
              <p className="text-sm text-muted-foreground">All pages and entities on R8ESTATE</p>
            </div>
          </div>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download XML
          </Button>
        </div>

        <div className="space-y-4">
          {/* Static Pages */}
          <CollapsibleSection title="Pages" count={STATIC_PAGES.length}>
            {STATIC_PAGES.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className="flex items-center gap-2 text-sm text-primary hover:underline py-1"
              >
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                {page.name}
              </Link>
            ))}
          </CollapsibleSection>

          {/* Entity Groups */}
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const items = grouped[key];
            if (!items || items.length === 0) return null;
            return (
              <CollapsibleSection key={key} title={label} count={items.length}>
                {items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-2 text-sm text-primary hover:underline py-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.name}
                  </Link>
                ))}
              </CollapsibleSection>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;
