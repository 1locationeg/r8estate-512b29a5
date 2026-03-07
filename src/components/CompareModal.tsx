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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star, Search, ArrowLeftRight, Building2, Home, MapPin, Users,
  Smartphone, LayoutGrid, Building, FolderOpen, Download, CheckCircle2,
  Plus, X, Filter, Trophy, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareMenu } from "./ShareMenu";
import { getRatingColorClass } from "@/lib/ratingColors";
import { performSearch, type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { reviews as allReviews } from "@/data/mockData";
import { downloadComparisonReport } from "@/lib/generateComparisonReport";

interface CompareModalProps {
  item: SearchItem | null;
  open: boolean;
  onClose: () => void;
}

const MAX_ITEMS = 5;

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

type Scores = ReturnType<typeof generateScores>;

export const CompareModal = ({ item, open, onClose }: CompareModalProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [compareItems, setCompareItems] = useState<SearchItem[]>([]);
  const [activeMetrics, setActiveMetrics] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allItems = useMemo(() => item ? [item, ...compareItems] : [], [item, compareItems]);

  const allScores = useMemo(() => {
    const map = new Map<string, Scores>();
    allItems.forEach(it => map.set(it.id, generateScores(it)));
    return map;
  }, [allItems]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !item) return [];
    const results = performSearch(searchQuery, 10);
    const existingIds = new Set(allItems.map(i => i.id));
    return results.items.filter(r => !existingIds.has(r.id));
  }, [searchQuery, item, allItems]);

  const metricsCategory = item ? (['developers', 'projects', 'locations', 'apps', 'units', 'brokers'].includes(item.category) ? item.category : 'default') : 'default';
  const metricKeys = item ? getCategoryMetricKeys(item.category) : [];

  // Active metrics (filtered or all)
  const visibleMetrics = activeMetrics.length > 0 ? metricKeys.filter(k => activeMetrics.includes(k)) : metricKeys;

  const handleClose = () => {
    setSearchQuery("");
    setCompareItems([]);
    setActiveMetrics([]);
    setShowFilters(false);
    onClose();
  };

  const handleAddItem = (selected: SearchItem) => {
    setCompareItems(prev => [...prev, selected]);
    setSearchQuery("");
  };

  const handleRemoveItem = (id: string) => {
    setCompareItems(prev => prev.filter(i => i.id !== id));
  };

  // Find winner for a metric across all items
  const toggleMetric = (key: string) => {
    setActiveMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const getMetricWinner = (key: string): string | null => {
    let best = -1;
    let winnerId: string | null = null;
    allItems.forEach(it => {
      const s = allScores.get(it.id)?.categoryScores[key] || 0;
      if (s > best) { best = s; winnerId = it.id; }
    });
    return winnerId;
  };

  // Overall winner by trust score
  const overallWinner = useMemo(() => {
    let best = -1;
    let winner: SearchItem | null = null;
    allItems.forEach(it => {
      const s = allScores.get(it.id)?.trustScore || 0;
      if (s > best) { best = s; winner = it; }
    });
    return winner;
  }, [allItems, allScores]);

  // "Best by your priorities" — who wins the most filtered metrics
  const priorityWinner = useMemo(() => {
    if (visibleMetrics.length === 0 || allItems.length < 2) return null;
    const wins = new Map<string, number>();
    allItems.forEach(it => wins.set(it.id, 0));
    visibleMetrics.forEach(key => {
      const wId = getMetricWinner(key);
      if (wId) wins.set(wId, (wins.get(wId) || 0) + 1);
    });
    let bestId = allItems[0].id;
    let bestWins = 0;
    wins.forEach((w, id) => { if (w > bestWins) { bestWins = w; bestId = id; } });
    return allItems.find(it => it.id === bestId) || null;
  }, [allItems, allScores, visibleMetrics]);

  const gridCols = allItems.length <= 2 ? 'grid-cols-2' : allItems.length === 3 ? 'grid-cols-3' : allItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5';
  const showAddPanel = compareItems.length === 0;

  if (!item) return null;

  const getGaugeColor = (score: number) => {
    if (score >= 66) return 'text-trust-excellent';
    if (score >= 50) return 'text-trust-good';
    return 'text-trust-fair';
  };

  const renderMiniGauge = (score: number, size: number = 70) => (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${score * 2.64} 264`} className={getGaugeColor(score)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-base font-bold", getGaugeColor(score))}>{score}</span>
      </div>
    </div>
  );

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3 h-3", s <= Math.round(rating) ? `fill-current ${getRatingColorClass(rating)}` : "text-secondary")} />
      ))}
      <span className={cn("text-xs font-bold ms-1", getRatingColorClass(rating))}>{rating.toFixed(1)}</span>
    </div>
  );

  if (showAddPanel) {
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

          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1 border border-border rounded-lg">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleAddItem(result)}
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

  // ============ Comparison View ============
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            {t("compare.resultTitle")}
            <Badge variant="secondary" className="ms-2">{allItems.length} {t("compare.items")}</Badge>
          </DialogTitle>
          <DialogDescription>{t("compare.resultDescription")}</DialogDescription>
        </DialogHeader>

        {/* Item header cards */}
        <div className={cn("grid gap-3", gridCols)}>
          {allItems.map((it, idx) => {
            const scores = allScores.get(it.id);
            const isFirst = idx === 0;
            const isWinner = overallWinner?.id === it.id;
            return (
              <div key={it.id} className={cn(
                "text-center space-y-2 p-3 rounded-xl relative",
                isWinner ? "bg-primary/5 border-2 border-primary/30" : "bg-secondary/20 border border-border"
              )}>
                {isWinner && allItems.length > 1 && (
                  <div className="absolute -top-2.5 start-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] gap-1 px-2">
                      <Crown className="w-3 h-3" /> {t("compare.leader")}
                    </Badge>
                  </div>
                )}
                {!isFirst && (
                  <button
                    onClick={() => handleRemoveItem(it.id)}
                    className="absolute top-1 end-1 p-1 rounded-full hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-11 h-11 rounded-xl object-cover mx-auto" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mx-auto">{categoryIcons[it.category]}</div>
                )}
                <p className="font-bold text-xs truncate">{it.name}</p>
                {renderMiniGauge(scores?.trustScore || 0, 60)}
                {renderStars(scores?.rating || 0)}
              </div>
            );
          })}

          {/* Add more button */}
          {allItems.length < MAX_ITEMS && (
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors">
              <div className="relative w-full mb-2">
                <Search className="absolute start-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("compare.addMore")}
                  className="ps-8 h-8 text-xs"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="w-full max-h-40 overflow-y-auto space-y-0.5 border border-border rounded-md">
                  {searchResults.slice(0, 5).map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleAddItem(result)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-secondary/50 transition-colors text-start"
                    >
                      <Plus className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs font-medium truncate">{result.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {!searchQuery.trim() && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> {t("compare.addItem")}
                </p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Metric Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">{t("trustInsights.categoryBreakdown")}</h3>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-3.5 h-3.5" />
              {t("compare.filterMetrics")}
              {activeMetrics.length > 0 && (
                <Badge variant="secondary" className="ms-1 h-4 px-1.5 text-[10px]">{activeMetrics.length}</Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-secondary/20 rounded-lg">
              <p className="w-full text-xs text-muted-foreground mb-1">{t("compare.selectPriorities")}</p>
              {metricKeys.map((key) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors",
                    activeMetrics.includes(key)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <Checkbox
                    checked={activeMetrics.includes(key)}
                    onCheckedChange={() => toggleMetric(key)}
                    className="w-3.5 h-3.5"
                  />
                  {t(`categoryMetrics.${metricsCategory}.${key}`)}
                </label>
              ))}
              {activeMetrics.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveMetrics([])}>
                  {t("compare.clearFilters")}
                </Button>
              )}
            </div>
          )}

          {/* Priority winner banner */}
          {activeMetrics.length > 0 && priorityWinner && allItems.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-bold">{priorityWinner.name}</span>{" "}
                {t("compare.bestByPriorities")}
              </p>
            </div>
          )}

          {/* Multi-column metric table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-start text-xs text-muted-foreground font-medium pb-2 pe-3 min-w-[120px]">{t("compare.metric")}</th>
                  {allItems.map(it => (
                    <th key={it.id} className="text-center text-xs font-medium pb-2 px-2 min-w-[80px] truncate">{it.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleMetrics.map((key) => {
                  const winnerId = getMetricWinner(key);
                  return (
                    <tr key={key} className="border-t border-border">
                      <td className="py-2.5 pe-3 text-xs font-medium text-muted-foreground">
                        {t(`categoryMetrics.${metricsCategory}.${key}`)}
                      </td>
                      {allItems.map(it => {
                        const score = allScores.get(it.id)?.categoryScores[key] || 0;
                        const isWinner = winnerId === it.id && allItems.length > 1;
                        return (
                          <td key={it.id} className="py-2.5 px-2">
                            <div className="space-y-1">
                              <div className="text-center">
                                <span className={cn(
                                  "text-xs font-bold",
                                  isWinner ? "text-trust-excellent" : "text-foreground"
                                )}>
                                  {score}%
                                  {isWinner && " ★"}
                                </span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    isWinner ? "bg-trust-excellent" : "bg-primary/60"
                                  )}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Trust Score row */}
                <tr className="border-t-2 border-primary/20">
                  <td className="py-2.5 pe-3 text-xs font-bold text-foreground">{t("developers.trustScore")}</td>
                  {allItems.map(it => {
                    const score = allScores.get(it.id)?.trustScore || 0;
                    const isWinner = overallWinner?.id === it.id && allItems.length > 1;
                    return (
                      <td key={it.id} className="py-2.5 px-2 text-center">
                        <span className={cn("text-sm font-bold", isWinner ? "text-trust-excellent" : getGaugeColor(score))}>
                          {score}
                          {isWinner && " 🏆"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Reviews Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-sm">{t("compare.recentReviews")}</h3>
          <div className={cn("grid gap-3", gridCols)}>
            {allItems.map((it) => {
              const itemReviews = allReviews.filter(r => r.developerId === it.id).slice(0, 2);
              return (
                <div key={it.id} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground truncate">{it.name}</p>
                  {itemReviews.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic">{t("compare.noReviews")}</p>
                  ) : (
                    itemReviews.map((rev) => (
                      <div key={rev.id} className="bg-secondary/20 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={rev.avatar} />
                            <AvatarFallback className="text-[8px]">{rev.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-medium truncate">{rev.author}</span>
                          {rev.verified && <CheckCircle2 className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("w-2.5 h-2.5", s <= rev.rating ? `fill-current ${getRatingColorClass(rev.rating)}` : "text-secondary")} />
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{rev.comment}</p>
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
          {overallWinner && allItems.length > 1 && (
            <p className="text-sm text-muted-foreground">
              {t("compare.multiWinnerMessage", {
                winner: overallWinner.name,
                score: allScores.get(overallWinner.id)?.trustScore || 0,
                count: allItems.length
              })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCompareItems([])}>
            {t("compare.changeSelection")}
          </Button>
          <div className="flex items-center gap-2">
            <ShareMenu
              title={t("share.shareComparison", { itemA: allItems.map(i => i.name).join(", "), itemB: "" })}
              description={`Comparing ${allItems.length} items`}
              variant="outline"
              size="sm"
              iconOnly={false}
            />
            {allItems.length === 2 && (
              <Button
                size="sm"
                onClick={() => {
                  const scoresA = allScores.get(allItems[0].id);
                  const scoresB = allScores.get(allItems[1].id);
                  if (scoresA && scoresB) {
                    const metricLabels: Record<string, string> = {};
                    metricKeys.forEach(key => {
                      metricLabels[key] = t(`categoryMetrics.${metricsCategory}.${key}`);
                    });
                    downloadComparisonReport({
                      itemA: allItems[0],
                      itemB: allItems[1],
                      scoresA,
                      scoresB,
                      metricLabels,
                    });
                  }
                }}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {t("compare.downloadReport")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
