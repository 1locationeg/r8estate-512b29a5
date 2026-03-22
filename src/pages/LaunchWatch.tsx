// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Search, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LaunchCard } from "@/components/LaunchCard";
import { LaunchRatingModal } from "@/components/LaunchRatingModal";
import { BrandLogo } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "reservations_open", label: "Reservations Open" },
  { value: "upcoming", label: "Launching Soon" },
  { value: "active", label: "Active" },
  { value: "sold_out", label: "Sold Out" },
];

const districtOptions = [
  { value: "all", label: "All Locations" },
  { value: "New Cairo", label: "New Cairo" },
  { value: "Sheikh Zayed", label: "Sheikh Zayed" },
  { value: "6th of October", label: "6th of October" },
  { value: "North Coast", label: "North Coast" },
  { value: "Mostakbal City", label: "Mostakbal City" },
  { value: "New Capital", label: "New Capital" },
  { value: "Other", label: "Other" },
];

const sortOptions = [
  { value: "score", label: "R8 Score" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "units", label: "Units Remaining" },
  { value: "delivery", label: "Delivery Date" },
  { value: "newest", label: "Newest" },
];

const LaunchWatch = () => {
  const navigate = useNavigate();
  const [launches, setLaunches] = useState<any[]>([]);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [allPhases, setAllPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [district, setDistrict] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessFilter, setBusinessFilter] = useState("all");
  const [ratingLaunchId, setRatingLaunchId] = useState<string | null>(null);
  const [stats, setStats] = useState({ active: 0, thisMonth: 0, totalRatings: 0 });

  const fetchData = async () => {
    setLoading(true);

    // Fetch launches
    let query = supabase
      .from("launches" as any)
      .select("*, business_profiles(id, company_name, logo_url, specialties)")
      .order("created_at", { ascending: false });

    if (verifiedOnly) query = query.eq("is_verified", true);

    const { data: launchData } = await query;
    const list = (launchData as any[]) || [];
    setLaunches(list);

    // Fetch all ratings for these launches
    if (list.length > 0) {
      const ids = list.map((l: any) => l.id);
      const { data: ratings } = await supabase
        .from("launch_ratings" as any)
        .select("*")
        .in("launch_id", ids) as any;
      setAllRatings(ratings || []);

      const { data: phases } = await supabase
        .from("launch_phases" as any)
        .select("*")
        .in("launch_id", ids) as any;
      setAllPhases(phases || []);
    }

    // Fetch businesses for filter dropdown
    const { data: biz } = await supabase
      .from("business_profiles")
      .select("id, company_name")
      .order("company_name");
    setBusinesses(biz || []);

    // Stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    setStats({
      active: list.filter((l: any) => l.status !== "sold_out").length,
      thisMonth: list.filter((l: any) => l.created_at >= monthStart).length,
      totalRatings: allRatings?.length || 0,
    });

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [verifiedOnly]);

  // Update stats after ratings load
  useEffect(() => {
    setStats((s) => ({ ...s, totalRatings: allRatings.length }));
  }, [allRatings]);

  // Apply filters
  let filtered = [...launches];
  if (statusFilter !== "all") filtered = filtered.filter((l) => l.status === statusFilter);
  if (district !== "all") filtered = filtered.filter((l) => l.location_district === district);
  if (businessFilter !== "all") filtered = filtered.filter((l) => l.business_id === businessFilter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((l) =>
      l.project_name?.toLowerCase().includes(q) ||
      l.location_district?.toLowerCase().includes(q) ||
      l.location_compound?.toLowerCase().includes(q) ||
      l.business_profiles?.company_name?.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sort === "price_asc") filtered.sort((a, b) => (a.current_price_per_m2 || Infinity) - (b.current_price_per_m2 || Infinity));
  else if (sort === "units") filtered.sort((a, b) => (b.units_remaining || 0) - (a.units_remaining || 0));
  else if (sort === "delivery") filtered.sort((a, b) => (a.delivery_date || "9999").localeCompare(b.delivery_date || "9999"));
  else if (sort === "newest") filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const ratingLaunch = launches.find((l) => l.id === ratingLaunchId);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20 space-y-5">
        {/* Header */}
        <div className="space-y-2">
          <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity" aria-label="Return to home">
            <BrandLogo size="hero" />
          </button>
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Launch Watch</h1>
            <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Active off-plan launches — tracked, rated, and compared</p>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="font-bold text-foreground">{stats.active}</span>
              <span className="text-muted-foreground">Active launches</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-foreground">{stats.thisMonth}</span>
              <span className="text-muted-foreground">This month</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-foreground">{stats.totalRatings}</span>
              <span className="text-muted-foreground">Buyer ratings</span>
            </span>
          </div>
        </div>

        {/* Status pill tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === sf.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {districtOptions.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Developer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Developers</SelectItem>
              {businesses.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.company_name || "Unnamed"}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5 ml-auto">
            <Switch id="verified" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
            <Label htmlFor="verified" className="text-[10px] text-muted-foreground cursor-pointer">Verified only</Label>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search launches..."
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Rocket className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-foreground">No launches yet</h3>
            <p className="text-sm text-muted-foreground">Check back soon — developers are submitting their latest launches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((launch) => (
              <LaunchCard
                key={launch.id}
                launch={launch}
                phases={allPhases.filter((p: any) => p.launch_id === launch.id)}
                ratings={allRatings.filter((r: any) => r.launch_id === launch.id)}
                onRate={() => setRatingLaunchId(launch.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingLaunchId && ratingLaunch && (
        <LaunchRatingModal
          launchId={ratingLaunchId}
          projectName={ratingLaunch.project_name}
          open={!!ratingLaunchId}
          onClose={() => setRatingLaunchId(null)}
          onSuccess={() => { setRatingLaunchId(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default LaunchWatch;
