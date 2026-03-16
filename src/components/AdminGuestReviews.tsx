import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2, Search, CheckCircle, Ban, Star, UserCheck, Clock, Trash2, Share2,
} from "lucide-react";
import { getRatingColorClass } from "@/lib/ratingColors";
import { ReviewToSocialModal } from "@/components/ReviewToSocialModal";

interface GuestReview {
  id: string;
  guest_name: string;
  guest_email: string | null;
  developer_id: string;
  developer_name: string | null;
  rating: number;
  title: string | null;
  comment: string;
  experience_type: string | null;
  is_claimed: boolean;
  claimed_by: string | null;
  created_at: string;
}

const AdminGuestReviews = () => {
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unclaimed" | "claimed">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [socialReview, setSocialReview] = useState<{ author: string; rating: number; comment: string; project?: string } | null>(null);
  const [socialBizName, setSocialBizName] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("guest_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load guest reviews");
    else setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (review: GuestReview) => {
    // Copy to main reviews table as a verified guest review
    const { error: insertErr } = await supabase.from("reviews").insert({
      developer_id: review.developer_id,
      developer_name: review.developer_name,
      author_name: review.guest_name,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      experience_type: review.experience_type,
      user_id: review.claimed_by || "00000000-0000-0000-0000-000000000000",
      is_verified: false,
      is_anonymous: false,
    });
    if (insertErr) {
      toast.error("Failed to approve review");
      return;
    }
    // Delete from guest_reviews
    await supabase.from("guest_reviews").delete().eq("id", review.id);
    toast.success("Guest review approved and published");
    fetchReviews();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("guest_reviews").delete().eq("id", deleteId);
    if (error) toast.error("Failed to delete review");
    else {
      toast.success("Guest review rejected and deleted");
      fetchReviews();
    }
    setDeleteId(null);
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      !search ||
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      (r.developer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.guest_email || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "claimed" && r.is_claimed) ||
      (filter === "unclaimed" && !r.is_claimed);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reviews.length,
    unclaimed: reviews.filter((r) => !r.is_claimed).length,
    claimed: reviews.filter((r) => r.is_claimed).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Guest Review Moderation</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Star, color: "text-primary" },
          { label: "Unclaimed", value: stats.unclaimed, icon: Clock, color: "text-warning" },
          { label: "Claimed", value: stats.claimed, icon: CheckCircle, color: "text-verified" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, developer, comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "unclaimed", "claimed"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No guest reviews found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden md:table-cell">Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{r.guest_name}</p>
                        {r.guest_email && (
                          <p className="text-xs text-muted-foreground">{r.guest_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.developer_name || r.developer_id}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getRatingColorClass(r.rating)}`}>
                        {r.rating}/5
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                      {r.comment}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_claimed ? "default" : "secondary"}>
                        {r.is_claimed ? "Claimed" : "Unclaimed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-verified hover:text-verified"
                          onClick={() => handleApprove(r)}
                          title="Approve & publish"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(r.id)}
                          title="Reject & delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Guest Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this guest review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reject & Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGuestReviews;
