import { useState } from "react";
import { Send, Copy, Check, MessageSquare, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { developers } from "@/data/mockData";

export const WhatsAppReviewRequest = () => {
  const { profile } = useAuth();
  const { profile: bizProfile } = useBusinessProfile();
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [copied, setCopied] = useState(false);

  const businessName = bizProfile?.company_name || profile?.full_name || developers[0]?.name || "Our Business";
  const developerId = developers[0]?.id || "dev-1";

  // Build a review link with developer pre-filled
  const reviewUrl = `${window.location.origin}/reviews?developer=${encodeURIComponent(developerId)}&writeReview=true`;

  const defaultMessage = `Hi ${buyerName || "there"}! Thank you for choosing ${businessName}. We'd love to hear about your experience — your feedback helps others make informed decisions.\n\nPlease leave a quick review here:\n${reviewUrl}\n\nThank you! 🙏`;

  const [customMessage, setCustomMessage] = useState("");

  const message = customMessage || defaultMessage;

  const cleanPhone = buyerPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : "";

  const handleSendWhatsApp = () => {
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error("Please enter a valid phone number with country code");
      return;
    }
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      toast.success("Review link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Request a Review via WhatsApp</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send your buyers a personalized review link through WhatsApp
        </p>
      </div>

      {/* Review Link */}
      <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" /> Your Review Link
        </Label>
        <div className="flex gap-2">
          <Input value={reviewUrl} readOnly className="text-xs bg-background" />
          <Button variant="outline" size="icon" onClick={handleCopyLink} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Share this link anywhere — it opens the review form for your business
        </p>
      </div>

      {/* Buyer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="buyerName" className="text-sm">Buyer Name (optional)</Label>
          <Input
            id="buyerName"
            placeholder="e.g. Ahmed"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buyerPhone" className="text-sm">Buyer Phone (with country code)</Label>
          <Input
            id="buyerPhone"
            type="tel"
            placeholder="e.g. 201012345678"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            maxLength={20}
          />
        </div>
      </div>

      {/* Custom Message */}
      <div className="space-y-1.5">
        <Label className="text-sm">Message Preview</Label>
        <Textarea
          rows={6}
          value={customMessage || defaultMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="text-sm"
        />
        {customMessage && (
          <button
            onClick={() => setCustomMessage("")}
            className="text-xs text-primary hover:underline"
          >
            Reset to default message
          </button>
        )}
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSendWhatsApp}
        disabled={!cleanPhone || cleanPhone.length < 8}
        className="w-full sm:w-auto bg-[#25D366] hover:bg-[#25D366]/90 text-white"
        size="lg"
      >
        <Send className="w-4 h-4 me-2" />
        Send via WhatsApp
      </Button>

      {/* Recent requests - placeholder for future */}
      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
          <MessageSquare className="w-4 h-4" /> Tips
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Include the country code (e.g. 20 for Egypt, 971 for UAE)</li>
          <li>Send shortly after a positive interaction for best results</li>
          <li>Personalize the message with the buyer's name</li>
          <li>Reviews go through moderation before appearing publicly</li>
        </ul>
      </div>
    </div>
  );
};
