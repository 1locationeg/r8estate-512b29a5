import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlphaReportModalProps {
  entityId: string;
  entityName: string;
  trigger?: React.ReactNode;
}

export const AlphaReportModal = ({ entityId, entityName, trigger }: AlphaReportModalProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("alpha_report_leads").insert({
        email,
        phone: phone || null,
        entity_id: entityId,
        entity_name: entityName,
        source: "entity_page",
      });
      if (error) throw error;
      toast.success(
        isRTL
          ? "تم! سنرسل التقرير الكامل إلى بريدك خلال دقائق."
          : "Done! Your full Alpha Report is on its way to your inbox."
      );
      setOpen(false);
      setEmail("");
      setPhone("");
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <FileText className="w-4 h-4" />
            {isRTL ? "حمّل تقرير ألفا الكامل" : "Download Full Alpha Report"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {isRTL ? `تقرير ألفا — ${entityName}` : `Alpha Report — ${entityName}`}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? "تقرير شامل من 12 صفحة: تاريخ التسليم، القوة المالية، التحليل القانوني، ومقارنة مع المنافسين."
              : "A 12-page deep-dive: delivery history, financial strength, legal posture, and head-to-head comparison vs competitors."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="alpha-email">{isRTL ? "البريد الإلكتروني" : "Email"} *</Label>
            <Input
              id="alpha-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alpha-phone">{isRTL ? "رقم الهاتف (اختياري)" : "Phone (optional)"}</Label>
            <Input
              id="alpha-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 1XX XXX XXXX"
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={submitting || !email}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isRTL ? "جارٍ الإرسال..." : "Sending..."}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {isRTL ? "احصل على التقرير" : "Get the Report"}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {isRTL
              ? "بإرسالك، توافق على شروط الخدمة وسياسة الخصوصية."
              : "By submitting, you agree to our Terms and Privacy Policy."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
