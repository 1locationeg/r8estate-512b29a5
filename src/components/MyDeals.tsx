import { useState, useEffect, useCallback } from "react";
import { Loader2, Tag, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { icon: React.ReactNode; variant: "default" | "secondary" | "destructive" }> = {
  pending: { icon: <Clock className="w-3.5 h-3.5" />, variant: "secondary" },
  verified: { icon: <CheckCircle className="w-3.5 h-3.5" />, variant: "default" },
  rejected: { icon: <XCircle className="w-3.5 h-3.5" />, variant: "destructive" },
};

export const MyDeals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setDeals((data as any[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Deals</h2>
          <p className="text-sm text-muted-foreground">Manage your submitted deals and track their status.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/business/submit-deal")}>
          <Plus className="w-4 h-4 mr-1" /> New Deal
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["pending", "verified", "rejected"] as const).map((s) => {
          const cfg = statusConfig[s];
          return (
            <div key={s} className="bg-card border rounded-lg p-3 text-center">
              {cfg.icon}
              <p className="text-2xl font-bold mt-1">{deals.filter(d => d.status === s).length}</p>
              <p className="text-xs text-muted-foreground capitalize">{s}</p>
            </div>
          );
        })}
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tag className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No deals submitted yet.</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate("/business/submit-deal")}>
            Submit your first deal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => {
            const cfg = statusConfig[deal.status] || statusConfig.pending;
            return (
              <div key={deal.id} className="bg-card border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{deal.headline}</h3>
                  <Badge variant={cfg.variant} className="gap-1">
                    {cfg.icon} {deal.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{deal.description}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Type: {deal.deal_type?.replace("_", " ")}</span>
                  {deal.price && <span>Price: EGP {Number(deal.price).toLocaleString()}</span>}
                  {deal.down_payment_percent && <span>Down: {deal.down_payment_percent}%</span>}
                  <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                </div>
                {deal.admin_notes && (
                  <p className="text-xs bg-muted/50 rounded p-2 mt-1">
                    <span className="font-medium">Admin note:</span> {deal.admin_notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDeals;
