import { useState, useEffect } from "react";
import { Tag, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DealCard } from "@/components/DealCard";
import { supabase } from "@/integrations/supabase/client";

const dealTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "payment_plan", label: "Payment Plans" },
  { value: "discount", label: "Discounts" },
  { value: "early_access", label: "Early Access" },
  { value: "exclusive_units", label: "Exclusive Units" },
];

const sortOptions = [
  { value: "top", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "most_reviewed", label: "Most Reviewed" },
];

const DealWatch = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealType, setDealType] = useState("all");
  const [sort, setSort] = useState("top");
  const [search, setSearch] = useState("");

  const fetchDeals = async () => {
    setLoading(true);
    let query = supabase
      .from("deals" as any)
      .select("*, business_profiles(id, company_name, logo_url, specialties)")
      .eq("status", "verified");

    if (dealType !== "all") {
      query = query.eq("deal_type", dealType);
    }

    if (sort === "top") query = query.order("avg_rating", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("rating_count", { ascending: false });

    const { data } = await query;
    setDeals((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDeals(); }, [dealType, sort]);

  const filtered = search
    ? deals.filter((d) => d.headline?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase()))
    : deals;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Deal Watch</h1>
            <Badge className="bg-accent/20 text-accent-foreground border-accent text-[10px]">Beta</Badge>
          </div>
          <p className="text-sm text-muted-foreground">The market's best offers — rated by buyers</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dealTypeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Tag className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-foreground">No deals yet</h3>
            <p className="text-sm text-muted-foreground">Check back soon — businesses are submitting their best offers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((deal) => (
              <DealCard key={deal.id} deal={deal} onRated={fetchDeals} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealWatch;
