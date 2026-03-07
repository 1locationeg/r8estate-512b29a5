import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Search, ArrowLeftRight, Building2, Home, MapPin, Users, Smartphone, LayoutGrid, Building, FolderOpen, Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { ShareMenu } from "./ShareMenu";
import { getRatingColorClass } from "@/lib/ratingColors";
import { performSearch, getSearchIndex, type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { reviews as allReviews } from "@/data/mockData";
import { downloadComparisonReport } from "@/lib/generateComparisonReport";

interface CompareModalProps {
  item: SearchItem | null;
  open: boolean;
  onClose: () => void;
}

const categoryIcons: Record<SearchCategory, React.ReactNode> = {
  developers: <Building2 className="w-5 h-5" />,
  projects: <Home className="w-5 h-5" />,
  locations: <MapPin className="w-5 h-5" />,
  brokers: <Users className="w-5 h-5" />,
  apps: <Smartphone className="w-5 h-5" />,
  units: <LayoutGrid className="w-5 h-5" />,
  'property-types': <Building className="w-5 h-5" />,
  categories: <FolderOpen className="w-5 h-5" />,
  reviews: <Star className="w-5 h-5" />
};

const getCategoryMetricKeys = (category: SearchCategory): string[] => {
  switch (category) {
    case 'developers': return ['delivery', 'quality', 'financial', 'support'];
    case 'projects': return ['progress', 'location', 'price', 'amenities'];
    case 'locations': return ['demand', 'infrastructure', 'potential', 'safety'];
    case 'apps': return ['usability', 'performance', 'features', 'support'];
    case 'units': return ['demand', 'roi', 'space', 'resale'];
    case 'brokers': return ['success', 'response', 'knowledge', 'negotiation'];
    default: return ['quality', 'reliability', 'value', 'satisfaction'];
  }
};

const generateScores = (item: SearchItem) => {
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
    hash = hash & hash;
  }
  const trustScore = item.meta?.trustScore ? item.meta.trustScore as number : 55 + Math.abs(hash % 40);
  const rating = item.rating || (3 + Math.abs(hash % 20) / 10);
  const keys = getCategoryMetricKeys(item.category);
  const categoryScores: Record<string, number> = {};
  keys.forEach((key, idx) => {
    const variance = ((hash >> (idx * 4)) % 30) - 15;
    categoryScores[key] = Math.max(30, Math.min(95, (55 + Math.abs(hash % 40)) + variance));
  });
  return { trustScore, rating, categoryScores, metricKeys: keys };
};

export const CompareModal = ({ item, open, onClose }: CompareModalProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [compareItem, setCompareItem] = useState<SearchItem | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !item) return [];
    const results = performSearch(searchQuery, 10);
    return results.items.filter(r => r.id !== item.id);
  }, [searchQuery, item]);

  const itemScores = useMemo(() => item ? generateScores(item) : null, [item]);
  const compareScores = useMemo(() => compareItem ? generateScores(compareItem) : null, [compareItem]);

  const metricsCategory = item ? (['developers', 'projects', 'locations', 'apps', 'units', 'brokers'].includes(item.category) ? item.category : 'default') : 'default';

  const handleClose = () => {
    setSearchQuery("");
    setCompareItem(null);
    onClose();
  };

  const handleSelectCompare = (selected: SearchItem) => {
    setCompareItem(selected);
    setSearchQuery("");
  };

  if (!item) return null;

  const getGaugeColor = (score: number) => {
    if (score >= 66) return 'text-trust-excellent';
    if (score >= 50) return 'text-trust-good';
    return 'text-trust-fair';
  };

  const renderMiniGauge = (score: number, size: number = 80) => (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${score * 2.64} 264`} className={getGaugeColor(score)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-lg font-bold", getGaugeColor(score))}>{score}</span>
      </div>
    </div>
  );

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-4 h-4", s <= Math.round(rating) ? `fill-current ${getRatingColorClass(rating)}` : "text-secondary")} />
      ))}
      <span className={cn("text-sm font-bold ms-1", getRatingColorClass(rating))}>{rating.toFixed(1)}</span>
    </div>
  );

  // Selection step
  if (!compareItem) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              {t("compare.selectTitle")}
            </DialogTitle>
            <DialogDescription>{t("compare.selectDescription", { name: item.name })}</DialogDescription>
          </DialogHeader>

          {/* Current item preview */}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">{categoryIcons[item.category]}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <Badge variant="secondary" className="text-xs">{t(`search.${item.category}`)}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="text-lg">❓</span>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("compare.searchPlaceholder")}
              className="ps-9"
              autoFocus
            />
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1 border border-border rounded-lg">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectCompare(result)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-start"
                >
                  {result.image ? (
                    <img src={result.image} alt={result.name} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">{categoryIcons[result.category]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.name}</p>
                    {result.subtitle && <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{t(`search.${result.category}`)}</Badge>
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">{t("search.noResults")}</p>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Comparison view
  const metricKeys = itemScores?.metricKeys || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            {t("compare.resultTitle")}
          </DialogTitle>
          <DialogDescription>{t("compare.resultDescription")}</DialogDescription>
        </DialogHeader>

        {/* Side by side header */}
        <div className="grid grid-cols-2 gap-4">
          {[item, compareItem].map((it, idx) => {
            const scores = idx === 0 ? itemScores : compareScores;
            return (
              <div key={it.id} className="text-center space-y-3 p-4 bg-secondary/20 rounded-xl">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-14 h-14 rounded-xl object-cover mx-auto" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto">{categoryIcons[it.category]}</div>
                )}
                <div>
                  <p className="font-bold text-sm truncate">{it.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{t(`search.${it.category}`)}</Badge>
                </div>
                <div className="flex justify-center">{renderMiniGauge(scores?.trustScore || 0)}</div>
                <div className="flex justify-center">{renderStars(scores?.rating || 0)}</div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Metric comparison bars */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{t("trustInsights.categoryBreakdown")}</h3>
          {metricKeys.map((key) => {
            const scoreA = itemScores?.categoryScores[key] || 0;
            const scoreB = compareScores?.categoryScores[key] || 0;
            const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';
            return (
              <div key={key} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t(`categoryMetrics.${metricsCategory}.${key}`)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span className={cn("font-bold", winner === 'A' ? 'text-trust-excellent' : '')}>{scoreA}%</span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", winner === 'A' ? 'bg-trust-excellent' : 'bg-primary/60')}
                        style={{ width: `${scoreA}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate">{compareItem.name}</span>
                      <span className={cn("font-bold", winner === 'B' ? 'text-trust-excellent' : '')}>{scoreB}%</span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", winner === 'B' ? 'bg-trust-excellent' : 'bg-primary/60')}
                        style={{ width: `${scoreB}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Reviews Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{t("compare.recentReviews")}</h3>
          <div className="grid grid-cols-2 gap-4">
            {[item, compareItem].map((it) => {
              const itemReviews = allReviews.filter(r => r.developerId === it.id).slice(0, 3);
              return (
                <div key={it.id} className="space-y-3">
                  <p className="text-sm font-semibold text-foreground truncate">{it.name}</p>
                  {itemReviews.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t("compare.noReviews")}</p>
                  ) : (
                    itemReviews.map((rev) => (
                      <div key={rev.id} className="bg-secondary/20 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={rev.avatar} />
                            <AvatarFallback className="text-[10px]">{rev.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate">{rev.author}</span>
                          {rev.verified && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5 flex-shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {t("compare.verifiedBuyer")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("w-3 h-3", s <= rev.rating ? `fill-current ${getRatingColorClass(rev.rating)}` : "text-secondary")} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{rev.comment}</p>
                        <p className="text-[10px] text-muted-foreground/60">{rev.project} • {new Date(rev.date).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="bg-secondary/20 rounded-xl p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">{t("compare.summary")}</p>
          {itemScores && compareScores && (
            <p className="text-sm text-muted-foreground">
              {itemScores.trustScore > compareScores.trustScore
                ? t("compare.winnerMessage", { winner: item.name, score: itemScores.trustScore, loser: compareItem.name, loserScore: compareScores.trustScore })
                : itemScores.trustScore < compareScores.trustScore
                  ? t("compare.winnerMessage", { winner: compareItem.name, score: compareScores.trustScore, loser: item.name, loserScore: itemScores.trustScore })
                  : t("compare.tieMessage", { scoreA: item.name, scoreB: compareItem.name })}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setCompareItem(null)}>{t("compare.changeSelection")}</Button>
          <div className="flex items-center gap-2">
            <ShareMenu
              title={t("share.shareComparison", { itemA: item.name, itemB: compareItem.name })}
              description={`Trust Score: ${itemScores?.trustScore} vs ${compareScores?.trustScore}`}
              variant="outline"
              size="sm"
              iconOnly={false}
            />
            <Button
              onClick={() => {
                if (itemScores && compareScores) {
                  const metricLabels: Record<string, string> = {};
                  metricKeys.forEach(key => {
                    metricLabels[key] = t(`categoryMetrics.${metricsCategory}.${key}`);
                  });
                  downloadComparisonReport({
                    itemA: item,
                    itemB: compareItem,
                    scoresA: itemScores,
                    scoresB: compareScores,
                    metricLabels,
                  });
                }
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {t("compare.downloadReport")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
