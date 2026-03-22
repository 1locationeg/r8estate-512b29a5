// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Search, Loader2, Filter, GitCompare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LaunchCard } from "@/components/LaunchCard";
import { LaunchRatingModal } from "@/components/LaunchRatingModal";
import { LaunchComparePanel } from "@/components/LaunchComparePanel";
import { BrandLogo } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) { toast.info("You can compare up to 3 launches"); return prev; }
      return [...prev, id];
    });
  };

  // Fallback dummy launches for demo
  const dummyLaunches = [
    {
      id: "demo-1",
      business_id: "demo-biz-1",
      project_name: "Ora Towers — ZED East",
      location_district: "New Cairo",
      location_compound: "Mostakbal City",
      launch_type: "new_project",
      reservation_date: "2026-02-01",
      launch_date: "2026-04-15",
      delivery_date: "2028-12-01",
      status: "reservations_open",
      total_units: 120,
      units_remaining: 78,
      current_phase: 1,
      current_price_per_m2: 45000,
      down_payment_pct: 10,
      installment_years: 8,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo",
      business_profiles: { id: "demo-biz-1", company_name: "Ora Developers", logo_url: null, specialties: ["Residential"] },
    },
    {
      id: "demo-2",
      business_id: "demo-biz-2",
      project_name: "Sodic East — Villette Phase 3",
      location_district: "New Cairo",
      location_compound: "Villette",
      launch_type: "new_phase",
      reservation_date: "2026-03-01",
      launch_date: "2026-05-01",
      delivery_date: "2029-06-01",
      status: "upcoming",
      total_units: 80,
      units_remaining: 80,
      current_phase: 3,
      current_price_per_m2: 52000,
      down_payment_pct: 15,
      installment_years: 7,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo",
      business_profiles: { id: "demo-biz-2", company_name: "Sodic", logo_url: null, specialties: ["Mixed Use"] },
    },
    {
      id: "demo-3",
      business_id: "demo-biz-3",
      project_name: "Palm Hills — Badya Phase 5",
      location_district: "6th of October",
      location_compound: "Badya",
      launch_type: "new_phase",
      reservation_date: "2026-01-15",
      launch_date: "2026-03-10",
      delivery_date: "2028-09-01",
      status: "active",
      total_units: 200,
      units_remaining: 42,
      current_phase: 5,
      current_price_per_m2: 38000,
      down_payment_pct: 5,
      installment_years: 10,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo",
      business_profiles: { id: "demo-biz-3", company_name: "Palm Hills Developments", logo_url: null, specialties: ["Residential", "Commercial"] },
    },
    {
      id: "demo-4",
      business_id: "demo-biz-4",
      project_name: "Mountain View — iCity October",
      location_district: "6th of October",
      location_compound: "iCity",
      launch_type: "new_project",
      reservation_date: "2025-11-01",
      launch_date: "2026-01-20",
      delivery_date: "2028-03-01",
      status: "sold_out",
      total_units: 150,
      units_remaining: 0,
      current_phase: 2,
      current_price_per_m2: 55000,
      down_payment_pct: 10,
      installment_years: 8,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo",
      business_profiles: { id: "demo-biz-4", company_name: "Mountain View", logo_url: null, specialties: ["Residential"] },
    },
    {
      id: "demo-5",
      business_id: "demo-biz-5",
      project_name: "Tatweer Misr — IL Monte Galala",
      location_district: "North Coast",
      location_compound: "Ain Sokhna",
      launch_type: "relaunch",
      reservation_date: "2026-03-15",
      launch_date: "2026-06-01",
      delivery_date: "2029-12-01",
      status: "reservations_open",
      total_units: 95,
      units_remaining: 63,
      current_phase: 1,
      current_price_per_m2: 62000,
      down_payment_pct: 20,
      installment_years: 6,
      is_verified: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo",
      business_profiles: { id: "demo-biz-5", company_name: "Tatweer Misr", logo_url: null, specialties: ["Luxury"] },
    },
  ];

  const dummyPhases = [
    { id: "dp-1", launch_id: "demo-1", phase_number: 1, price_per_m2: 45000, started_at: "2026-02-01", units_in_phase: 120 },
    { id: "dp-2a", launch_id: "demo-2", phase_number: 1, price_per_m2: 40000, started_at: "2025-01-01", units_in_phase: 80 },
    { id: "dp-2b", launch_id: "demo-2", phase_number: 2, price_per_m2: 46000, started_at: "2025-09-01", units_in_phase: 80 },
    { id: "dp-2c", launch_id: "demo-2", phase_number: 3, price_per_m2: 52000, started_at: "2026-03-01", units_in_phase: 80 },
    { id: "dp-3a", launch_id: "demo-3", phase_number: 1, price_per_m2: 28000, started_at: "2024-06-01", units_in_phase: 200 },
    { id: "dp-3b", launch_id: "demo-3", phase_number: 2, price_per_m2: 30000, started_at: "2024-12-01", units_in_phase: 200 },
    { id: "dp-3c", launch_id: "demo-3", phase_number: 3, price_per_m2: 32500, started_at: "2025-04-01", units_in_phase: 200 },
    { id: "dp-3d", launch_id: "demo-3", phase_number: 4, price_per_m2: 35000, started_at: "2025-10-01", units_in_phase: 200 },
    { id: "dp-3e", launch_id: "demo-3", phase_number: 5, price_per_m2: 38000, started_at: "2026-03-01", units_in_phase: 200 },
    { id: "dp-4a", launch_id: "demo-4", phase_number: 1, price_per_m2: 48000, started_at: "2025-11-01", units_in_phase: 150 },
    { id: "dp-4b", launch_id: "demo-4", phase_number: 2, price_per_m2: 55000, started_at: "2026-01-20", units_in_phase: 150 },
  ];

  const dummyRatings = [
    { id: "dr-1a", launch_id: "demo-1", user_id: "u1", stars_price_fairness: 4, stars_developer_transparency: 5, stars_payment_terms: 4, stars_location_value: 5, stars_overall: 4, review_text: "Great location, fair price for Mostakbal City", buyer_verified: true, buyer_type: "reserver", created_at: new Date().toISOString() },
    { id: "dr-1b", launch_id: "demo-1", user_id: "u2", stars_price_fairness: 3, stars_developer_transparency: 4, stars_payment_terms: 5, stars_location_value: 4, stars_overall: 4, review_text: null, buyer_verified: false, buyer_type: "attendee", created_at: new Date().toISOString() },
    { id: "dr-1c", launch_id: "demo-1", user_id: "u3", stars_price_fairness: 5, stars_developer_transparency: 4, stars_payment_terms: 4, stars_location_value: 5, stars_overall: 5, review_text: "Best launch I've attended this year", buyer_verified: true, buyer_type: "purchaser", created_at: new Date().toISOString() },
    { id: "dr-3a", launch_id: "demo-3", user_id: "u1", stars_price_fairness: 5, stars_developer_transparency: 4, stars_payment_terms: 5, stars_location_value: 3, stars_overall: 4, review_text: "Amazing payment plan — 5% down is unbeatable", buyer_verified: true, buyer_type: "purchaser", created_at: new Date().toISOString() },
    { id: "dr-3b", launch_id: "demo-3", user_id: "u4", stars_price_fairness: 4, stars_developer_transparency: 3, stars_payment_terms: 5, stars_location_value: 3, stars_overall: 3, review_text: null, buyer_verified: false, buyer_type: "observer", created_at: new Date().toISOString() },
    { id: "dr-4a", launch_id: "demo-4", user_id: "u2", stars_price_fairness: 2, stars_developer_transparency: 3, stars_payment_terms: 3, stars_location_value: 4, stars_overall: 3, review_text: "Price jumped too fast between phases", buyer_verified: true, buyer_type: "reserver", created_at: new Date().toISOString() },
  ];

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

    // Use dummy data if DB is empty
    if (list.length === 0) {
      const dummyFiltered = verifiedOnly ? dummyLaunches.filter(l => l.is_verified) : dummyLaunches;
      setLaunches(dummyFiltered);
      setAllPhases(dummyPhases);
      setAllRatings(dummyRatings);
      setStats({
        active: dummyFiltered.filter(l => l.status !== "sold_out").length,
        thisMonth: dummyFiltered.length,
        totalRatings: dummyRatings.length,
      });
      // Populate businesses dropdown from dummy
      setBusinesses(dummyLaunches.map(l => ({ id: l.business_id, company_name: l.business_profiles.company_name })));
      setLoading(false);
      return;
    }

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
                isSelected={compareIds.includes(launch.id)}
                onToggleCompare={toggleCompare}
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
