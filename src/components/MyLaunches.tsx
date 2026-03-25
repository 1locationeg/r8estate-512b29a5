import { useState, useEffect, useCallback } from "react";
import { Loader2, Rocket, CheckCircle, Clock, XCircle, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
  upcoming: { variant: "secondary" },
  reservations_open: { variant: "outline" },
  active: { variant: "default" },
  sold_out: { variant: "destructive" },
};

export const MyLaunches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [launches, setLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ units_remaining: number; current_price_per_m2: number; current_phase: number }>({ units_remaining: 0, current_price_per_m2: 0, current_phase: 1 });

  const fetchLaunches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("launches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setLaunches((data as any[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLaunches(); }, [fetchLaunches]);

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from("launches")
      .update({
        units_remaining: editValues.units_remaining,
        current_price_per_m2: editValues.current_price_per_m2,
        current_phase: editValues.current_phase,
      })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Launch updated");
      setEditingId(null);
      fetchLaunches();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Launches</h2>
          <p className="text-sm text-muted-foreground">Manage your submitted launches and update phase info.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/business/submit-launch")}>
          <Plus className="w-4 h-4 me-1" /> New Launch
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
          <p className="text-2xl font-bold mt-1">{launches.filter(l => l.is_verified).length}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto" />
          <p className="text-2xl font-bold mt-1">{launches.filter(l => !l.is_verified).length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      {launches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Rocket className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No launches submitted yet.</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate("/business/submit-launch")}>
            Submit your first launch
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {launches.map((launch) => {
            const cfg = statusConfig[launch.status] || statusConfig.upcoming;
            const isEditing = editingId === launch.id;
            return (
              <div key={launch.id} className="bg-card border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">{launch.project_name}</h3>
                    {launch.is_verified && <Badge variant="default" className="text-[10px]">Verified</Badge>}
                  </div>
                  <Badge variant={cfg.variant} className="capitalize">
                    {launch.status?.replace("_", " ")}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Location</span>
                    <p className="font-semibold">{launch.location_district}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Price/m²</span>
                    <p className="font-semibold">EGP {launch.current_price_per_m2?.toLocaleString() || "N/A"}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Units</span>
                    <p className="font-semibold">{launch.units_remaining}/{launch.total_units}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Phase</span>
                    <p className="font-semibold">{launch.current_phase}</p>
                  </div>
                </div>

                {launch.admin_notes && (
                  <p className="text-xs bg-muted/50 rounded p-2">
                    <span className="font-medium">Admin note:</span> {launch.admin_notes}
                  </p>
                )}

                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Units Remaining</label>
                        <Input type="number" value={editValues.units_remaining} onChange={(e) => setEditValues(v => ({ ...v, units_remaining: Number(e.target.value) }))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Price/m²</label>
                        <Input type="number" value={editValues.current_price_per_m2} onChange={(e) => setEditValues(v => ({ ...v, current_price_per_m2: Number(e.target.value) }))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Phase</label>
                        <Input type="number" value={editValues.current_phase} onChange={(e) => setEditValues(v => ({ ...v, current_phase: Number(e.target.value) }))} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(launch.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingId(launch.id);
                      setEditValues({
                        units_remaining: launch.units_remaining || 0,
                        current_price_per_m2: launch.current_price_per_m2 || 0,
                        current_phase: launch.current_phase || 1,
                      });
                    }}>
                      <Edit2 className="w-3.5 h-3.5 me-1" /> Update Phase Info
                    </Button>
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

export default MyLaunches;
