// @ts-nocheck
import { useState, useMemo } from "react";
import { X, Trophy, Crown, Rocket, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface CompareLaunch {
  id: string;
  project_name: string;
  location_district: string;
  location_compound?: string | null;
  current_price_per_m2?: number | null;
  down_payment_pct?: number | null;
  installment_years?: number | null;
  delivery_date?: string | null;
  total_units?: number;
  units_remaining?: number;
  current_phase?: number;
  status: string;
  is_verified?: boolean;
  business_profiles?: { company_name?: string } | null;
}

interface LaunchComparePanelProps {
  launches: CompareLaunch[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClear: () => void;
  allRatings: any[];
}

const statusLabels: Record<string, string> = {
  reservations_open: "Reservations Open",
  upcoming: "Launching Soon",
  active: "Now Selling",
  sold_out: "Sold Out",
};

function computeR8Score(ratings: any[]) {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, r) => {
    return acc + r.stars_price_fairness + r.stars_developer_transparency + r.stars_payment_terms + r.stars_location_value + r.stars_overall;
  }, 0);
  return sum / (ratings.length * 5);
}

export const LaunchComparePanel = ({ launches, selectedIds, onToggleSelect, onClear, allRatings }: LaunchComparePanelProps) => {
  const [showModal, setShowModal] = useState(false);

  const selected = useMemo(
    () => selectedIds.map((id) => launches.find((l) => l.id === id)).filter(Boolean) as CompareLaunch[],
    [selectedIds, launches]
  );

  if (selectedIds.length === 0) return null;

  const getRatings = (id: string) => allRatings.filter((r: any) => r.launch_id === id);

  // Find best values for highlighting
  const prices = selected.map((l) => l.current_price_per_m2 ? Number(l.current_price_per_m2) : Infinity);
  const bestPrice = Math.min(...prices);
  const downs = selected.map((l) => l.down_payment_pct ? Number(l.down_payment_pct) : Infinity);
  const bestDown = Math.min(...downs);
  const installments = selected.map((l) => l.installment_years ? Number(l.installment_years) : 0);
  const bestInstallment = Math.max(...installments);
  const scores = selected.map((l) => {
    const s = computeR8Score(getRatings(l.id));
    return s !== null ? s * 5 : 0;
  });
  const bestScore = Math.max(...scores);

  // Overall winner: best score with at least 2 ratings
  const overallWinner = selected.reduce<string | null>((best, l, i) => {
    const r = getRatings(l.id);
    if (r.length < 2) return best;
    if (!best) return l.id;
    const bestIdx = selected.findIndex((s) => s.id === best);
    return scores[i] > scores[bestIdx] ? l.id : best;
  }, null);

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 md:bottom-4 start-1/2 -translate-x-1/2 z-40 bg-card border border-border shadow-xl rounded-xl px-4 py-2.5 flex items-center gap-2 max-w-md w-[calc(100%-2rem)]">
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
          {selected.map((l) => (
            <Badge
              key={l.id}
              variant="secondary"
              className="shrink-0 text-[10px] gap-1 pe-1 max-w-[120px] truncate"
            >
              <span className="truncate">{l.project_name.split("—")[0].trim()}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect(l.id); }}
                className="ms-0.5 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Button
          size="sm"
          className="text-xs shrink-0"
          disabled={selectedIds.length < 2}
          onClick={() => setShowModal(true)}
        >
          Compare ({selectedIds.length})
        </Button>
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive shrink-0">
          Clear
        </button>
      </div>

      {/* Comparison Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 pb-2 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Rocket className="w-5 h-5 text-primary" />
              Launch Comparison
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Header cards */}
            <div className={`grid gap-3 ${selected.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {selected.map((l) => {
                const isWinner = l.id === overallWinner;
                return (
                  <div key={l.id} className={`relative bg-secondary/50 rounded-lg p-3 text-center space-y-1 ${isWinner ? "ring-2 ring-accent" : ""}`}>
                    {isWinner && (
                      <div className="absolute -top-2 start-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Crown className="w-3 h-3" /> Best Pick
                      </div>
                    )}
                    <h4 className="font-bold text-sm text-foreground leading-tight mt-1">{l.project_name}</h4>
                    <p className="text-[10px] text-muted-foreground">{l.business_profiles?.company_name || "Developer"}</p>
                    <p className="text-[10px] text-muted-foreground">{l.location_district}{l.location_compound ? ` · ${l.location_compound}` : ""}</p>
                    <Badge variant="outline" className="text-[9px]">{statusLabels[l.status] || l.status}</Badge>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Price per m² */}
              <CompareRow label="Price / m²" values={selected.map((l, i) => {
                const val = l.current_price_per_m2 ? Number(l.current_price_per_m2) : null;
                const isBest = val !== null && val === bestPrice && prices.filter(p => p !== Infinity).length > 1;
                return (
                  <span key={l.id} className={`text-xs font-bold ${isBest ? "text-emerald-600" : "text-foreground"}`}>
                    {val ? `EGP ${val.toLocaleString()}` : "—"}
                    {isBest && <Trophy className="w-3 h-3 inline ms-1 text-emerald-600" />}
                  </span>
                );
              })} cols={selected.length} />

              {/* Down Payment */}
              <CompareRow label="Down Payment" values={selected.map((l) => {
                const val = l.down_payment_pct ? Number(l.down_payment_pct) : null;
                const isBest = val !== null && val === bestDown && downs.filter(d => d !== Infinity).length > 1;
                return (
                  <span key={l.id} className={`text-xs font-bold ${isBest ? "text-emerald-600" : "text-foreground"}`}>
                    {val !== null ? `${val}%` : "—"}
                    {isBest && <Trophy className="w-3 h-3 inline ms-1 text-emerald-600" />}
                  </span>
                );
              })} cols={selected.length} />

              {/* Installment Years */}
              <CompareRow label="Installment" values={selected.map((l) => {
                const val = l.installment_years ? Number(l.installment_years) : null;
                const isBest = val !== null && val === bestInstallment && installments.filter(i => i > 0).length > 1;
                return (
                  <span key={l.id} className={`text-xs font-bold ${isBest ? "text-emerald-600" : "text-foreground"}`}>
                    {val ? `${val} years` : "—"}
                    {isBest && <Trophy className="w-3 h-3 inline ms-1 text-emerald-600" />}
                  </span>
                );
              })} cols={selected.length} />

              {/* Delivery Date */}
              <CompareRow label="Delivery" values={selected.map((l) => (
                <span key={l.id} className="text-xs font-bold text-foreground">
                  {l.delivery_date ? new Date(l.delivery_date).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "—"}
                </span>
              ))} cols={selected.length} />

              {/* Units */}
              <CompareRow label="Units Left" values={selected.map((l) => {
                const pct = l.total_units ? ((l.total_units - (l.units_remaining || 0)) / l.total_units) * 100 : 0;
                return (
                  <div key={l.id} className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">{l.units_remaining ?? "—"} / {l.total_units ?? "—"}</span>
                    {l.total_units ? (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    ) : null}
                  </div>
                );
              })} cols={selected.length} />

              {/* Phase */}
              <CompareRow label="Current Phase" values={selected.map((l) => (
                <span key={l.id} className="text-xs font-bold text-foreground">Phase {l.current_phase || 1}</span>
              ))} cols={selected.length} />

              {/* R8 Score */}
              <CompareRow label="R8 Score" highlight values={selected.map((l, i) => {
                const r = getRatings(l.id);
                const score = computeR8Score(r);
                const isBest = score !== null && (score * 5) === bestScore && scores.filter(s => s > 0).length > 1 && r.length >= 2;
                return (
                  <div key={l.id} className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-black ${isBest ? "text-accent" : "text-foreground"}`}>
                        {score !== null ? (score * 5).toFixed(1) : "—"}
                      </span>
                      {isBest && <Crown className="w-3 h-3 text-accent" />}
                    </div>
                    <div className="flex gap-0.5">
                      {[0,1,2,3,4].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${score && s < Math.round(score * 5) ? "text-accent fill-accent" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{r.length} rating{r.length !== 1 ? "s" : ""}</span>
                  </div>
                );
              })} cols={selected.length} />

              {/* Sub-scores */}
              {["Price Fairness", "Transparency", "Payment Terms", "Location Value", "Overall"].map((label, idx) => {
                const keys = ["stars_price_fairness", "stars_developer_transparency", "stars_payment_terms", "stars_location_value", "stars_overall"];
                return (
                  <CompareRow key={label} label={label} sub values={selected.map((l) => {
                    const r = getRatings(l.id);
                    if (!r.length) return <span key={l.id} className="text-[10px] text-muted-foreground">—</span>;
                    const avg = r.reduce((a: number, rt: any) => a + (rt[keys[idx]] || 0), 0) / r.length;
                    return (
                      <div key={l.id} className="flex items-center gap-1.5 w-full">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${(avg / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-foreground w-5 text-end">{avg.toFixed(1)}</span>
                      </div>
                    );
                  })} cols={selected.length} />
                );
              })}
            </div>

            {/* Summary */}
            {overallWinner && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Based on R8 Launch Score (min 2 ratings)</p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  🏆 {selected.find((l) => l.id === overallWinner)?.project_name} is the top-rated launch
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

function CompareRow({ label, values, cols, highlight, sub }: { label: string; values: React.ReactNode[]; cols: number; highlight?: boolean; sub?: boolean }) {
  return (
    <div className={`grid items-center border-b border-border last:border-b-0 ${highlight ? "bg-accent/5" : sub ? "bg-secondary/20" : ""}`}
      style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}
    >
      <div className={`px-3 py-2 ${sub ? "text-[9px] ps-5" : "text-[10px]"} font-medium text-muted-foreground`}>{label}</div>
      {values.map((v, i) => (
        <div key={i} className="px-2 py-2">{v}</div>
      ))}
    </div>
  );
}
