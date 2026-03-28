import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReportButtonProps {
  contentType: "post" | "reply" | "comment" | "review" | "review_reply";
  contentId: string;
  size?: "sm" | "default";
  className?: string;
}

const REASONS = [
  { value: "spam", labelKey: "report.spam" },
  { value: "harassment", labelKey: "report.harassment" },
  { value: "misinformation", labelKey: "report.misinformation" },
  { value: "inappropriate", labelKey: "report.inappropriate" },
  { value: "defamation", labelKey: "report.defamation" },
  { value: "other", labelKey: "report.other" },
] as const;

export const ReportButton = ({ contentType, contentId, size = "sm", className = "" }: ReportButtonProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;
    setSubmitting(true);
    try {
      // Check for duplicate
      const { data: existing } = await (supabase.from("content_reports") as any)
        .select("id")
        .eq("reporter_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .maybeSingle();

      if (existing) {
        toast({ title: t("report.alreadyReported", "Already reported"), description: t("report.alreadyReportedDesc", "You've already reported this content.") });
        setOpen(false);
        return;
      }

      const { error } = await (supabase.from("content_reports") as any).insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason,
        details: details.trim() || null,
      });

      if (error) throw error;
      toast({ title: t("report.thanks", "Thanks for reporting"), description: t("report.thanksDesc", "We'll review this content shortly.") });
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (err: any) {
      toast({ title: t("common.error", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: t("common.signIn", "Sign in required"), variant: "destructive" });
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors ${className}`}
        title={t("report.flag", "Report")}
      >
        <Flag className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm" onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-base">{t("report.title", "Why are you reporting this?")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-start ${
                    reason === r.value
                      ? "bg-destructive/10 border-destructive/40 text-destructive"
                      : "bg-secondary/50 border-border text-foreground hover:border-destructive/30"
                  }`}
                >
                  {t(r.labelKey, r.value)}
                </button>
              ))}
            </div>
            <Textarea
              placeholder={t("report.detailsPlaceholder", "Add more details (optional)...")}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[60px] text-sm"
              maxLength={500}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                {t("common.close", "Cancel")}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSubmit}
                disabled={!reason || submitting}
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin me-1" /> : <Flag className="w-3.5 h-3.5 me-1" />}
                {t("report.submit", "Report")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
