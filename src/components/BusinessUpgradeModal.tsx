import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Upload, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BusinessUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BusinessUpgradeModal = ({ open, onOpenChange }: BusinessUpgradeModalProps) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !open) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("business_upgrade_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch upgrade requests:", error);
          setExistingRequest(null);
          setLoading(false);
          return;
        }
        const latest = (data as any[])?.[0];
        if (latest && latest.status === "pending") {
          setExistingRequest(latest);
        } else {
          setExistingRequest(null);
        }
        setLoading(false);
      });
  }, [user, open]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }
    if (!file) {
      toast.error("Please upload a trade license or verification document");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload document
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("upgrade-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("upgrade-documents")
        .getPublicUrl(filePath);

      // Insert request
      const { error } = await supabase
        .from("business_upgrade_requests")
        .insert({
          user_id: user.id,
          company_name: companyName.trim(),
          description: description.trim() || null,
          document_url: urlData.publicUrl,
          status: "pending",
        });
      if (error) throw error;

      toast.success("Business upgrade request submitted! You'll be notified once reviewed.");
      onOpenChange(false);
      setCompanyName("");
      setDescription("");
      setFile(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-500", label: "Pending Review" },
    approved: { icon: CheckCircle2, color: "text-trust-excellent", label: "Approved" },
    rejected: { icon: XCircle, color: "text-destructive", label: "Rejected" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Upgrade to Business Account
          </DialogTitle>
          <DialogDescription>
            Submit your company details and a verification document for admin review.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : existingRequest ? (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const sc = statusConfig[existingRequest.status] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <>
                      <Icon className={`w-4 h-4 ${sc.color}`} />
                      <Badge variant="secondary" className="text-xs">{sc.label}</Badge>
                    </>
                  );
                })()}
              </div>
              <p className="text-sm font-medium text-foreground">{existingRequest.company_name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted {new Date(existingRequest.created_at).toLocaleDateString()}
              </p>
              {existingRequest.admin_notes && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded border border-border">
                  Admin note: {existingRequest.admin_notes}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Your request is being reviewed. You'll receive a notification once it's processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name" className="text-sm font-medium">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g. Palm Hills Developments"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your business..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Trade License / Verification Document *</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  id="upgrade-doc"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="upgrade-doc" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  {file ? (
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">PDF, JPG, PNG (max 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !companyName.trim() || !file}
              className="w-full gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Your request will be reviewed by our team. You'll be notified once approved.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};