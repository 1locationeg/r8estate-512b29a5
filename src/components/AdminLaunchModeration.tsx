import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Loader2, Search, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const AdminLaunchModeration = () => {
  const { user } = useAuth();
  const [launches, setLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchLaunches = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("launches")
      .select("*, business_profiles(company_name, logo_url)")
      .order("created_at", { ascending: false });
    setLaunches((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLaunches(); }, [fetchLaunches]);

  const handleModerate = async (launchId: string, action: "verify" | "reject") => {
    if (!user) return;
    setProcessing(launchId);

    const updates: any = {
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: notes[launchId] || null,
    };

    if (action === "verify") {
      updates.is_verified = true;
      updates.status = "active";
    } else {
      updates.is_verified = false;
      updates.status = "upcoming";
    }

    const { error } = await supabase
      .from("launches")
      .update(updates)
      .eq("id", launchId);

    if (error) toast.error(error.message);
    else {
      toast.success(`Launch ${action === "verify" ? "verified" : "rejected"}`);
      fetchLaunches();
    }
    setProcessing(null);
  };

  // Filter: "pending" = not verified & not reviewed, "verified" = is_verified, "rejected" = reviewed but not verified
  const filtered = launches.filter((l) => {
    if (tab === "pending" && (l.is_verified || l.reviewed_by)) return false;
    if (tab === "verified" && !l.is_verified) return false;
    if (tab === "rejected" && (!l.reviewed_by || l.is_verified)) return false;
    if (search && !l.project_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: launches.filter((l) => !l.is_verified && !l.reviewed_by).length,
    verified: launches.filter((l) => l.is_verified).length,
    rejected: launches.filter((l) => l.reviewed_by && !l.is_verified).length,
  };

  const statusLabel = (l: any) => {
    if (l.is_verified) return "verified";
    if (l.reviewed_by) return "rejected";
    return "pending";
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Launch Moderation</h2>
        <p className="text-sm text-muted-foreground">Review and verify developer launches before they go live.</p>
      </div>

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

      <Input placeholder="Search launches..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No launches found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((launch) => {
            const st = statusLabel(launch);
            return (
              <div key={launch.id} className="bg-card border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">{launch.project_name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {launch.business_profiles?.company_name || "Unknown Developer"} · {launch.location_district} · {launch.launch_type?.replace("_", " ")} · {new Date(launch.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={st === "verified" ? "default" : st === "rejected" ? "destructive" : "secondary"}>
                    {st}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Price/m²</span>
                    <p className="font-semibold">EGP {launch.current_price_per_m2?.toLocaleString() || "N/A"}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Down Payment</span>
                    <p className="font-semibold">{launch.down_payment_pct || "N/A"}%</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Units</span>
                    <p className="font-semibold">{launch.units_remaining}/{launch.total_units}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-semibold capitalize">{launch.status?.replace("_", " ")}</p>
                  </div>
                </div>

                {st === "pending" && (
                  <div className="space-y-2 pt-2 border-t">
                    <Textarea
                      placeholder="Admin notes (optional)..."
                      value={notes[launch.id] || ""}
                      onChange={(e) => setNotes({ ...notes, [launch.id]: e.target.value })}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleModerate(launch.id, "verify")}
                        disabled={processing === launch.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="w-3.5 h-3.5 me-1" /> Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleModerate(launch.id, "reject")}
                        disabled={processing === launch.id}
                      >
                        <XCircle className="w-3.5 h-3.5 me-1" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminLaunchModeration;
