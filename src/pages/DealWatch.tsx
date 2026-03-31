import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag, Search, Loader2, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DealCard } from "@/components/DealCard";
import { DealComparePanel } from "@/components/DealComparePanel";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { supabase } from "@/integrations/supabase/client";

const DealWatch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealType, setDealType] = useState("all");
  const [sort, setSort] = useState("top");
  const [search, setSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [voteData, setVoteData] = useState<Record<string, { yes: number; no: number }>>({});

  const dealTypeOptions = [
    { value: "all", label: t("dealWatch.allTypes", "All Types") },
    { value: "payment_plan", label: t("dealWatch.paymentPlans", "Payment Plans") },
    { value: "discount", label: t("dealWatch.discounts", "Discounts") },
    { value: "early_access", label: t("dealWatch.earlyAccess", "Early Access") },
    { value: "exclusive_units", label: t("dealWatch.exclusiveUnits", "Exclusive Units") },
  ];

  const sortOptions = [
    { value: "top", label: t("dealWatch.topRated", "Top Rated") },
    { value: "newest", label: t("dealWatch.newest", "Newest") },
    { value: "most_reviewed", label: t("dealWatch.mostReviewed", "Most Reviewed") },
  ];

  const fetchDeals = async () => {
    setLoading(true);
    let query = supabase.from("deals" as any).select("*, business_profiles(id, company_name, logo_url, specialties)").eq("status", "verified");
    if (dealType !== "all") query = query.eq("deal_type", dealType);
    if (sort === "top") query = query.order("avg_rating", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("rating_count", { ascending: false });

    const { data } = await query;
    const dealsList = (data as any[]) || [];
    setDeals(dealsList);
    setLoading(false);

    if (dealsList.length > 0) {
      const ids = dealsList.map((d: any) => d.id);
      const { data: votes } = await supabase.from("deal_votes" as any).select("deal_id, vote").in("deal_id", ids) as any;
      if (votes) {
        const map: Record<string, { yes: number; no: number }> = {};
        votes.forEach((v: any) => {
          if (!map[v.deal_id]) map[v.deal_id] = { yes: 0, no: 0 };
          if (v.vote) map[v.deal_id].yes++; else map[v.deal_id].no++;
        });
        setVoteData(map);
      }
    }
  };

  useEffect(() => { fetchDeals(); }, [dealType, sort]);

  const filtered = search ? deals.filter((d) => d.headline?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase())) : deals;

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const enrichedDeals = filtered.map((d) => ({ ...d, yesVotes: voteData[d.id]?.yes || 0, noVotes: voteData[d.id]?.no || 0 }));

  return (
    <StationPageWrapper className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20 space-y-5">
        <PageHeader
          title={t("dealWatch.title", "Deal Watch")}
          breadcrumbs={[{ label: t("dealWatch.title", "Deal Watch") }]}
          rightSlot={<Badge className="bg-accent/20 text-accent-foreground border-accent text-[10px]">{t("dealWatch.beta")}</Badge>}
        />
        <p className="text-sm text-muted-foreground">{t("dealWatch.description")}</p>

        <div className="flex flex-wrap gap-2">
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{dealTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{sortOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant={compareMode ? "default" : "outline"} size="sm" className="h-9 text-xs gap-1" onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareIds([]); }}>
            <Scale className="w-3.5 h-3.5" />{compareMode ? t("dealWatch.exitCompare") : t("dealWatch.compareDeals")}
          </Button>
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute start-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("dealWatch.searchDeals")} className="ps-8 h-9 text-xs" />
          </div>
        </div>

        {compareMode && <DealComparePanel deals={enrichedDeals} selectedIds={compareIds} onToggleSelect={toggleCompare} onClear={() => setCompareIds([])} />}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Tag className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-foreground">{t("dealWatch.noDeals")}</h3>
            <p className="text-sm text-muted-foreground">{t("dealWatch.noDealsDesc")}</p>
          </div>
        ) : (
          <div className="space-y-4">{filtered.map((deal) => <DealCard key={deal.id} deal={deal} onRated={fetchDeals} compareMode={compareMode} isSelected={compareIds.includes(deal.id)} onToggleCompare={toggleCompare} />)}</div>
        )}
      </div>
    </div>
  );
};

export default DealWatch;