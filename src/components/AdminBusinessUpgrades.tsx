import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, CheckCircle, Ban, Clock, Search, Building2, FileText, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const AdminBusinessUpgrades = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQ, setSearchQ] = useState("");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from("business_upgrade_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    const rawRequests = (data as any[]) || [];

    // Fetch profile info
    const userIds = [...new Set(rawRequests.map(r => r.user_id))];
    let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = { full_name: p.full_name, email: p.email };
      });
    }

    setRequests(rawRequests.map(r => ({
      ...r,
      _userName: profileMap[r.user_id]?.full_name || null,
      _userEmail: profileMap[r.user_id]?.email || null,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("business_upgrade_requests" as any)
        .update({
          status,
          admin_notes: adminNotes[id] || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq("id", id);
      if (error) throw error;
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter(
    (r) =>
      !searchQ ||
      r.company_name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      r.user_id?.includes(searchQ)
  );

  const statusBadge = (s: string) => {
    switch (s) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]"><Clock className="w-3 h-3 me-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]"><CheckCircle className="w-3 h-3 me-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]"><Ban className="w-3 h-3 me-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-business-border" />
          Business Upgrade Requests
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="ps-9 h-8 text-xs w-48"
            />
          </div>
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="text-xs h-8 capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No {filter !== "all" ? filter : ""} requests found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{req.company_name}</span>
                    {statusBadge(req.status)}
                  </div>
                  {req.description && (
                    <p className="text-xs text-muted-foreground mb-1">{req.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {req._userName || 'Unknown'} {req._userEmail ? `(${req._userEmail})` : ''} • {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                {req.document_url && (
                  <a
                    href={req.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Document
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {req.status === "pending" && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Textarea
                    placeholder="Admin notes (optional)..."
                    value={adminNotes[req.id] || ""}
                    onChange={(e) => setAdminNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="text-xs"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(req.id, "approved")}
                      disabled={actionLoading === req.id}
                      className="gap-1.5 bg-trust-excellent hover:bg-trust-excellent/90 text-white"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(req.id, "rejected")}
                      disabled={actionLoading === req.id}
                      className="gap-1.5"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {req.status !== "pending" && req.admin_notes && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-secondary/50 rounded border border-border">
                  Admin note: {req.admin_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};