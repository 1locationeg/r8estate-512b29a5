import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, CheckCircle, XCircle, ExternalLink, ShieldCheck, Clock, User,
} from "lucide-react";
import { toast } from "sonner";

interface Verification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  social_url: string | null;
  document_url: string | null;
  selfie_url: string | null;
  id_document_url: string | null;
  admin_notes: string | null;
  created_at: string;
  profile?: { full_name: string | null; email: string | null; facebook_url: string | null; linkedin_url: string | null };
}

const AdminReviewerVerification = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("reviewer_verifications" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for each verification
      const userIds = [...new Set((data as any[]).map((v: any) => v.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, facebook_url, linkedin_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setVerifications(
        (data as any[]).map((v: any) => ({
          ...v,
          profile: profileMap.get(v.user_id) || null,
        }))
      );
    } catch (err) {
      console.error("Fetch verifications error:", err);
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const handleAction = async (id: string, userId: string, action: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("reviewer_verifications" as any)
        .update({
          status: action,
          admin_notes: notes[id] || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // If approved, update the profile
      if (action === "approved") {
        if (v.verification_type === 'kyc') {
          await supabase
            .from("profiles")
            .update({ kyc_verified: true, identity_verified: true } as any)
            .eq("user_id", userId);
        } else {
          await supabase
            .from("profiles")
            .update({ identity_verified: true })
            .eq("user_id", userId);
        }

        // Update all reviews by this user
        const newLevel = v.verification_type === 'kyc' ? 'kyc' : 'identity';
        await supabase
          .from("reviews")
          .update({ verification_level: newLevel })
          .eq("user_id", userId)
          .eq("verification_level", "none");
      }

      toast.success(`Verification ${action}`);
      fetchVerifications();
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Failed to update verification");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="w-3 h-3 me-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-trust-excellent border-trust-excellent/30 bg-trust-excellent/10"><CheckCircle className="w-3 h-3 me-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10"><XCircle className="w-3 h-3 me-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Reviewer Verification
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve identity verification requests from reviewers
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {filter !== "all" ? filter : ""} verification requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <div key={v.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {v.profile?.full_name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.profile?.email}</p>
                  </div>
                </div>
                {statusBadge(v.status)}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 mb-3">
                {v.social_url && (
                  <a
                    href={v.social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] text-xs font-medium hover:bg-[#1877F2]/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Social Profile
                  </a>
                )}
                {v.profile?.facebook_url && (
                  <a
                    href={v.profile.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] text-xs font-medium hover:bg-[#1877F2]/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Facebook
                  </a>
                )}
                {v.profile?.linkedin_url && (
                  <a
                    href={v.profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-medium hover:bg-[#0A66C2]/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
                {v.document_url && (
                  <a
                    href={v.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Document
                  </a>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                Type: <span className="font-medium text-foreground capitalize">{v.verification_type}</span>
                {" • "}
                Submitted: {new Date(v.created_at).toLocaleDateString()}
              </p>

              {/* Admin Actions */}
              {v.status === "pending" && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <Textarea
                    placeholder="Admin notes (optional)..."
                    value={notes[v.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [v.id]: e.target.value })}
                    className="text-sm h-16"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(v.id, v.user_id, "approved")}
                      disabled={actionLoading === v.id}
                      className="bg-trust-excellent hover:bg-trust-excellent/90 text-white"
                    >
                      {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin me-1" /> : <CheckCircle className="w-3 h-3 me-1" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(v.id, v.user_id, "rejected")}
                      disabled={actionLoading === v.id}
                    >
                      <XCircle className="w-3 h-3 me-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {v.admin_notes && v.status !== "pending" && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                  <span className="font-medium">Admin notes:</span> {v.admin_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewerVerification;
