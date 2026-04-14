// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Search, Star, ChevronLeft, ChevronRight, LayoutGrid, List,
  SlidersHorizontal, Building2, Plus, ShieldCheck, Globe, ArrowUpDown,
} from "lucide-react";

interface BusinessWithStats {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  description: string | null;
  location: string | null;
  website: string | null;
  categories: string[];
  year_established: number | null;
  created_at: string;
  avgRating: number;
  reviewCount: number;
}

const ITEMS_PER_PAGE = 12;

import { BUSINESS_CATEGORIES } from "@/data/businessCategories";

const CATEGORY_OPTIONS = BUSINESS_CATEGORIES.map(c => c.label);

const RATING_OPTIONS = [
  { label: "Excellent", min: 4.5, stars: 5 },
  { label: "Great", min: 3.5, stars: 4 },
  { label: "Average", min: 2.5, stars: 3 },
  { label: "Fair", min: 1.5, stars: 2 },
  { label: "Poor", min: 0, stars: 1 },
];

const POPULAR_CATEGORIES = [
  "Real Estate Developers", "Property Apps", "Brokers", "Interior Design", "Legal Services",
];

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={s <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

function BusinessCard({ biz }: { biz: BusinessWithStats }) {
  const navigate = useNavigate();
  const domain = biz.website?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => navigate(`/entity/${biz.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {biz.logo_url ? (
            <img
              src={biz.logo_url}
              alt={biz.company_name || ""}
              className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-business/50 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-business-border" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-business-border transition-colors">
              {biz.company_name || "Unnamed Business"}
            </h3>
            {domain && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Globe className="w-3 h-3 shrink-0" />
                {domain}
              </p>
            )}
          </div>
          {biz.reviewCount > 0 && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StarDisplay rating={biz.avgRating} />
          <span className="text-sm font-medium text-foreground">{biz.avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({biz.reviewCount} reviews)</span>
        </div>

        {biz.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{biz.description}</p>
        )}

        {biz.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {biz.categories.slice(0, 2).map((c) => (
              <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">{c}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilterSidebar({
  search, setSearch,
  selectedCategories, toggleCategory,
  minRating, setMinRating,
}: {
  search: string; setSearch: (v: string) => void;
  selectedCategories: string[]; toggleCategory: (c: string) => void;
  minRating: number | null; setMinRating: (v: number | null) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Rating</label>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.stars}
              onClick={() => setMinRating(minRating === opt.min ? null : opt.min)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                minRating === opt.min ? "bg-business/50 text-business-border" : "hover:bg-accent text-foreground"
              }`}
            >
              <StarDisplay rating={opt.stars} size={12} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Categories</label>
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <span className="text-foreground">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      {(search || selectedCategories.length > 0 || minRating !== null) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => { setSearch(""); setMinRating(null); selectedCategories.forEach(toggleCategory); }}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}

const Businesses = () => {
  const { user, profile, role } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<BusinessWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("best-rating");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      const { data: profiles } = await supabase
        .from("business_profiles")
        .select("id, company_name, logo_url, description, location, website, categories, year_established, created_at");

      if (!profiles || profiles.length === 0) { setLoading(false); return; }

      const { data: reviews } = await supabase
        .from("reviews")
        .select("developer_id, rating");

      const reviewMap: Record<string, { sum: number; count: number }> = {};
      (reviews || []).forEach((r) => {
        if (!reviewMap[r.developer_id]) reviewMap[r.developer_id] = { sum: 0, count: 0 };
        reviewMap[r.developer_id].sum += r.rating;
        reviewMap[r.developer_id].count += 1;
      });

      const mapped: BusinessWithStats[] = profiles.map((p) => {
        const stats = reviewMap[p.id] || { sum: 0, count: 0 };
        return {
          id: p.id,
          company_name: p.company_name,
          logo_url: p.logo_url,
          description: p.description,
          location: p.location,
          website: p.website,
          categories: p.categories || [],
          year_established: p.year_established,
          created_at: p.created_at,
          avgRating: stats.count > 0 ? stats.sum / stats.count : 0,
          reviewCount: stats.count,
        };
      });

      setBusinesses(mapped);
      setLoading(false);
    };
    fetchBusinesses();
  }, []);

  const filtered = useMemo(() => {
    let list = [...businesses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.company_name?.toLowerCase().includes(q));
    }
    if (selectedCategories.length > 0) {
      list = list.filter((b) =>
        b.categories.some((c) => selectedCategories.some((sc) => c.toLowerCase().includes(sc.toLowerCase())))
      );
    }
    if (minRating !== null) {
      list = list.filter((b) => b.avgRating >= minRating);
    }

    switch (sortBy) {
      case "best-rating": list.sort((a, b) => b.avgRating - a.avgRating); break;
      case "most-reviews": list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "newest": list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case "a-z": list.sort((a, b) => (a.company_name || "").localeCompare(b.company_name || "")); break;
    }

    return list;
  }, [businesses, search, selectedCategories, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const sidebarContent = (
    <FilterSidebar
      search={search} setSearch={(v) => { setSearch(v); setPage(1); }}
      selectedCategories={selectedCategories} toggleCategory={toggleCategory}
      minRating={minRating} setMinRating={(v) => { setMinRating(v); setPage(1); }}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        userMode="buyers"
        onSwitchToBusinessView={() => {}}
        onSwitchToBuyerView={() => {}}
        togglePulse={false}
        onSignOut={() => {}}
        getDashboardRoute={() => "/buyer"}
      />

      <PageHeader
        title="Explore Trusted Businesses"
        subtitle="Browse verified real estate businesses, read reviews, and find the right partner for your needs."
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <aside className="w-64 shrink-0">
              <div className="sticky top-24 border border-border rounded-lg p-4 bg-card">
                {sidebarContent}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                {isMobile && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-6">
                      <h2 className="text-lg font-semibold mb-4">Filters</h2>
                      {sidebarContent}
                    </SheetContent>
                  </Sheet>
                )}
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filtered.length}</span> businesses found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-rating">Best Rating</SelectItem>
                    <SelectItem value="most-reviews">Most Reviews</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="a-z">A – Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:flex border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-business-border text-white" : "bg-card text-muted-foreground hover:bg-accent"}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-business-border text-white" : "bg-card text-muted-foreground hover:bg-accent"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid / List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Building2 className="w-12 h-12 mx-auto text-business-border/40" />
                <p className="text-muted-foreground">No businesses match your filters.</p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setMinRating(null); setSelectedCategories([]); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }>
                {paginated.map((biz) => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline" size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-1 text-muted-foreground">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="icon"
                        onClick={() => setPage(p as number)}
                        className="w-9 h-9"
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline" size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Add Business CTA */}
            <Card className="mt-8 border-dashed">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="font-semibold text-foreground">Can't find a business?</h3>
                  <p className="text-sm text-muted-foreground">Add it to R8Estate and be the first to review it.</p>
                </div>
                <Button onClick={() => navigate("/auth")} className="shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add Business
                </Button>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CATEGORIES.map((cat) => (
                  <Link key={cat} to="/categories">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                      {cat}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Businesses;
