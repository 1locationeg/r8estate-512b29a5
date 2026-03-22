import { useState } from "react";
import { X, Scale, Star, ThumbsUp, ThumbsDown, TrendingUp, Minus, TrendingDown, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStarColorClass } from "@/lib/ratingColors";

interface CompareDeal {
  id: string;
  headline: string;
  description: string;
  deal_type: string;
  avg_rating: number;
  rating_count: number;
  valid_until: string | null;
  created_at: string;
  tags: string[];
  price?: number | null;
  down_payment_percent?: number | null;
  business_profiles?: {
    id: string;
    company_name: string | null;
    logo_url: string | null;
    specialties: string[] | null;
  };
  yesVotes?: number;
  noVotes?: number;
}

interface DealComparePanelProps {
  deals: CompareDeal[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClear: () => void;
}

const dealTypeLabels: Record<string, string> = {
  payment_plan: "Payment Plan",
  discount: "Discount",
  early_access: "Early Access",
  exclusive_units: "Exclusive Units",
  other: "Other",
};

function getVerdictLabel(avg: number, count: number) {
  if (count < 3) return { label: "Awaiting", icon: Minus, color: "text-muted-foreground" };
  if (avg >= 4.0) return { label: "Above Market", icon: TrendingUp, color: "text-emerald-600" };
  if (avg >= 2.5) return { label: "Standard", icon: Minus, color: "text-amber-600" };
  return { label: "Below Market", icon: TrendingDown, color: "text-red-600" };
}

export const DealComparePanel = ({ deals, selectedIds, onToggleSelect, onClear }: DealComparePanelProps) => {
  const [showModal, setShowModal] = useState(false);
  const selected = deals.filter((d) => selectedIds.includes(d.id));

  if (selectedIds.length === 0) return null;

  // Find winner by rating (needs at least 3 ratings)
  const qualified = selected.filter((d) => d.rating_count >= 3);
  const winnerId = qualified.length > 0
    ? qualified.reduce((a, b) => (a.avg_rating > b.avg_rating ? a : b)).id
    : null;

  return (
    <>
      {/* Sticky comparison bar */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-primary/20 shadow-sm px-4 py-2 flex items-center gap-2 flex-wrap">
        <Scale className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          Compare ({selectedIds.length}/3)
        </span>
        <div className="flex gap-1 flex-1 flex-wrap">
          {selected.map((d) => (
            <Badge key={d.id} variant="secondary" className="text-[10px] gap-1 pr-1">
              {d.business_profiles?.company_name || "Deal"}
              <button onClick={() => onToggleSelect(d.id)} className="ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Button
          size="sm"
          className="text-xs h-7"
          disabled={selectedIds.length < 2}
          onClick={() => setShowModal(true)}
        >
          Compare Now
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClear}>
          Clear
        </Button>
      </div>

      {/* Comparison Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Deal Comparison
            </DialogTitle>
            <DialogDescription>Side-by-side analysis of selected deals</DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-xs text-muted-foreground font-medium w-28">Metric</th>
                  {selected.map((d) => {
                    const isWinner = d.id === winnerId;
                    return (
                      <th key={d.id} className="text-center py-2 px-2 min-w-[140px]">
                        <div className="flex flex-col items-center gap-1">
                          {isWinner && (
                            <Badge className="bg-accent/20 text-accent-foreground text-[9px] gap-0.5 mb-0.5">
                              <Trophy className="w-3 h-3" /> Best Pick
                            </Badge>
                          )}
                          <Avatar className="h-7 w-7">
                            {d.business_profiles?.logo_url && <AvatarImage src={d.business_profiles.logo_url} />}
                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                              {(d.business_profiles?.company_name || "B")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-foreground leading-tight">
                            {d.business_profiles?.company_name || "Business"}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Deal headline */}
                <tr className="border-b">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Offer</td>
                  {selected.map((d) => (
                    <td key={d.id} className="py-2 px-2 text-center text-xs font-medium text-foreground">
                      {d.headline}
                    </td>
                  ))}
                </tr>

                {/* Type */}
                <tr className="border-b bg-muted/30">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Type</td>
                  {selected.map((d) => (
                    <td key={d.id} className="py-2 px-2 text-center">
                      <Badge variant="outline" className="text-[10px]">
                        {dealTypeLabels[d.deal_type] || d.deal_type}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="border-b">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Price</td>
                  {selected.map((d) => (
                    <td key={d.id} className="py-2 px-2 text-center text-xs font-medium text-foreground">
                      {d.price ? `${Number(d.price).toLocaleString()} EGP` : "—"}
                    </td>
                  ))}
                </tr>

                {/* Down Payment */}
                <tr className="border-b bg-muted/30">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Down Payment</td>
                  {selected.map((d) => {
                    const pct = d.down_payment_percent ? Number(d.down_payment_percent) : null;
                    const bestDown = Math.min(...selected.map((s) => s.down_payment_percent ? Number(s.down_payment_percent) : Infinity));
                    const isBest = pct !== null && pct === bestDown && selected.filter(s => s.down_payment_percent != null).length > 1;
                    return (
                      <td key={d.id} className="py-2 px-2 text-center">
                        {pct !== null ? (
                          <span className={`text-xs font-bold ${isBest ? "text-emerald-600" : "text-foreground"}`}>
                            {pct}%
                            {d.price ? <span className="block text-[10px] font-normal text-muted-foreground">{Math.round(Number(d.price) * pct / 100).toLocaleString()} EGP</span> : null}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Rating */}
                <tr className="border-b">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Rating</td>
                  {selected.map((d) => {
                    const avg = Number(d.avg_rating) || 0;
                    const bestRating = qualified.length > 0
                      ? Math.max(...selected.map((s) => Number(s.avg_rating) || 0))
                      : 0;
                    const isBest = avg === bestRating && avg > 0 && d.rating_count >= 3;
                    return (
                      <td key={d.id} className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(avg) ? getStarColorClass(avg, i) : "text-muted"}`}
                              />
                            ))}
                          </div>
                          <span className={`text-xs font-bold ${isBest ? "text-emerald-600" : "text-foreground"}`}>
                            {avg.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">({d.rating_count})</span>
                      </td>
                    );
                  })}
                </tr>

                {/* AI Verdict */}
                <tr className="border-b bg-muted/30">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Verdict</td>
                  {selected.map((d) => {
                    const v = getVerdictLabel(Number(d.avg_rating) || 0, d.rating_count);
                    const Icon = v.icon;
                    return (
                      <td key={d.id} className="py-2 px-2 text-center">
                        <span className={`text-xs font-semibold flex items-center justify-center gap-1 ${v.color}`}>
                          <Icon className="w-3 h-3" /> {v.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Community vote */}
                <tr className="border-b">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Would Take?</td>
                  {selected.map((d) => {
                    const yes = d.yesVotes || 0;
                    const no = d.noVotes || 0;
                    const total = yes + no;
                    const pct = total > 0 ? Math.round((yes / total) * 100) : 0;
                    return (
                      <td key={d.id} className="py-2 px-2 text-center">
                        {total > 0 ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <ThumbsUp className="w-3 h-3" /> {yes}
                              </span>
                              <span className="text-red-600 flex items-center gap-0.5">
                                <ThumbsDown className="w-3 h-3" /> {no}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold ${pct >= 60 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600"}`}>
                              {pct}% Yes
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No votes</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Valid until */}
                <tr className="border-b bg-muted/30">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Expires</td>
                  {selected.map((d) => (
                    <td key={d.id} className="py-2 px-2 text-center text-xs text-foreground">
                      {d.valid_until
                        ? new Date(d.valid_until).toLocaleDateString()
                        : "No expiry"}
                    </td>
                  ))}
                </tr>

                {/* Tags */}
                <tr className="border-b">
                  <td className="py-2 px-2 text-xs text-muted-foreground">Tags</td>
                  {selected.map((d) => (
                    <td key={d.id} className="py-2 px-2 text-center">
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {d.tags?.length > 0
                          ? d.tags.map((t, i) => (
                              <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0">{t}</Badge>
                            ))
                          : <span className="text-[10px] text-muted-foreground">—</span>
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
