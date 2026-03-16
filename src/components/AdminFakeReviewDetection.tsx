import { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, Loader2, Bot, RefreshCw, Trash2, Eye, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useReviewAnalysis, ReviewAnalysis } from "@/hooks/useReviewAnalysis";

interface DBReview {
  id: string;
  author_name: string;
  developer_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
  is_verified: boolean;
}

const AdminFakeReviewDetection = () => {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { analyses, analyzeReviews, loading: analyzing } = useReviewAnalysis();

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, developer_name, rating, comment, created_at, is_verified")
      .order("created_at", { ascending: false })
      .limit(50);
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleScanAll = async () => {
    if (reviews.length === 0) return;
    setScanning(true);
    try {
      await analyzeReviews(
        reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          author_name: r.author_name,
        }))
      );
      toast.success(`Scanned ${reviews.length} reviews`);
    } catch {
      toast.error("Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review removed");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const handleVerifyReview = async (reviewId: string) => {
    const { error } = await supabase.from("reviews").update({ is_verified: true }).eq("id", reviewId);
    if (error) {
      toast.error("Failed to verify");
    } else {
      toast.success("Review verified as legitimate");
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, is_verified: true } : r)));
    }
  };

  const flaggedReviews = reviews.filter((r) => analyses[r.id]?.is_suspicious);
  const cleanReviews = reviews.filter((r) => analyses[r.id] && !analyses[r.id].is_suspicious);
  const unscanned = reviews.filter((r) => !analyses[r.id]);

  const stats = {
    total: reviews.length,
    scanned: Object.keys(analyses).length,
    flagged: flaggedReviews.length,
    clean: cleanReviews.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Fraud Detection
          </h2>
          <p className="text-sm text-muted-foreground">Scan reviews for fake, spam, or suspicious patterns</p>
        </div>
        <Button onClick={handleScanAll} disabled={scanning || analyzing || reviews.length === 0}>
          {scanning || analyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {scanning || analyzing ? "Scanning..." : `Scan All (${reviews.length})`}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Reviews</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-primary">{stats.scanned}</p>
          <p className="text-xs text-muted-foreground">AI Scanned</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-destructive">{stats.flagged}</p>
          <p className="text-xs text-muted-foreground">Flagged</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-trust-excellent">{stats.clean}</p>
          <p className="text-xs text-muted-foreground">Clean</p>
        </Card>
      </div>

      {/* Flagged Reviews Section */}
      {flaggedReviews.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Flagged Reviews ({flaggedReviews.length})
          </h3>
          <div className="space-y-3">
            {flaggedReviews.map((r) => {
              const a = analyses[r.id];
              return (
                <Card key={r.id} className="p-4 border-destructive/30 bg-destructive/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{r.author_name}</span>
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                          🚩 Suspicion: {Math.round((a?.suspicion_score || 0) * 100)}%
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {a?.sentiment || "—"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {r.developer_name || "Unknown"} • {r.rating}/5 • {new Date(r.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-foreground line-clamp-2">{r.comment}</p>
                      {a?.suspicion_reasons && a.suspicion_reasons.length > 0 && (
                        <div className="mt-2 p-2 bg-destructive/5 rounded-lg">
                          <p className="text-[10px] font-medium text-destructive mb-1">Reasons:</p>
                          {a.suspicion_reasons.map((reason, i) => (
                            <p key={i} className="text-[10px] text-muted-foreground">• {reason}</p>
                          ))}
                        </div>
                      )}
                      {a?.insight && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic">💡 {a.insight}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleVerifyReview(r.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDeleteReview(r.id)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Reviews */}
      {cleanReviews.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-trust-excellent flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4" />
            Verified Clean ({cleanReviews.length})
          </h3>
          <div className="space-y-2">
            {cleanReviews.slice(0, 10).map((r) => {
              const a = analyses[r.id];
              return (
                <Card key={r.id} className="p-3 border-trust-excellent/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">{r.author_name}</span>
                        <Badge variant="outline" className="text-[9px] bg-trust-excellent/10 text-trust-excellent border-trust-excellent/30">
                          ✓ Clean
                        </Badge>
                        {a?.themes?.map((theme) => (
                          <Badge key={theme} variant="secondary" className="text-[9px]">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.comment}</p>
                    </div>
                    <span className="text-xs font-medium text-foreground">{r.rating}/5</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Unscanned */}
      {stats.scanned === 0 && (
        <Card className="p-8 text-center border-dashed">
          <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">No reviews scanned yet</p>
          <p className="text-xs text-muted-foreground">Click "Scan All" to run AI fraud detection on all reviews</p>
        </Card>
      )}
    </div>
  );
};

export default AdminFakeReviewDetection;
