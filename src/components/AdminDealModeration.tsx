import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Loader2, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const AdminDealModeration = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("deals" as any)
      .select("*, business_profiles(company_name, logo_url)")
      .order("created_at", { ascending: false });
    setDeals((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleModerate = async (dealId: string, status: "verified" | "rejected") => {
    if (!user) return;
    setProcessing(dealId);
    const { error } = await supabase
      .from("deals" as any)
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes[dealId] || null,
      } as any)
      .eq("id", dealId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Deal ${status === "verified" ? "verified" : "rejected"}`);
      fetchDeals();
    }
    setProcessing(null);
  };

  const filtered = deals.filter((d) => {
    if (tab !== "all" && d.status !== tab) return false;
    if (search && !d.headline?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: deals.filter((d) => d.status === "pending").length,
    verified: deals.filter((d) => d.status === "verified").length,
    rejected: deals.filter((d) => d.status === "rejected").length,
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Deal Moderation</h2>
        <p className="text-sm text-muted-foreground">Review and verify business deals before they go live.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto" />
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
          <p className="text-2xl font-bold mt-1">{stats.verified}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <XCircle className="w-5 h-5 text-destructive mx-auto" />
          <p className="text-2xl font-bold mt-1">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </div>
      </div>

      <Input placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No deals found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((deal) => (
            <div key={deal.id} className="bg-card border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">{deal.headline}</h3>
                  <p className="text-xs text-muted-foreground">
                    {deal.business_profiles?.company_name || "Unknown"} · {deal.deal_type?.replace("_", " ")} · {new Date(deal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={deal.status === "verified" ? "default" : deal.status === "rejected" ? "destructive" : "secondary"}>
                  {deal.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{deal.description}</p>
              {deal.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {deal.tags.map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}

              {deal.status === "pending" && (
                <div className="space-y-2 pt-2 border-t">
                  <Textarea
                    placeholder="Admin notes (optional)..."
                    value={notes[deal.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [deal.id]: e.target.value })}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleModerate(deal.id, "verified")}
                      disabled={processing === deal.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-3.5 h-3.5 me-1" /> Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModerate(deal.id, "rejected")}
                      disabled={processing === deal.id}
                    >
                      <XCircle className="w-3.5 h-3.5 me-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDealModeration;
