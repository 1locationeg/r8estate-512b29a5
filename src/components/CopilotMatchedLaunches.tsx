import { useEffect, useState } from "react";
import { Rocket, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MatchedLaunch {
  id: string;
  project_name: string;
  location_district: string;
  current_price_per_m2: number | null;
  units_remaining: number;
  total_units: number;
}

export const CopilotMatchedLaunches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [launches, setLaunches] = useState<MatchedLaunch[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("launches")
        .select("id, project_name, location_district, current_price_per_m2, units_remaining, total_units")
        .in("status", ["reservations_open", "upcoming"])
        .order("created_at", { ascending: false })
        .limit(6);
      setLaunches(data || []);
    };
    fetch();
  }, [user]);

  if (!launches.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Matched Launches</h3>
        </div>
        <button onClick={() => navigate("/launch-watch")} className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {launches.map(l => (
          <div key={l.id} className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/launch-watch")}>
            <p className="text-sm font-semibold text-foreground truncate">{l.project_name}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{l.location_district}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              {l.current_price_per_m2 && (
                <span className="text-xs font-bold text-primary">EGP {l.current_price_per_m2.toLocaleString()}/m²</span>
              )}
              <span className="text-[10px] text-muted-foreground">{l.units_remaining}/{l.total_units} units</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
