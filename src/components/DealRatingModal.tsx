import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DisclaimerCheckbox } from "@/components/DisclaimerCheckbox";

interface DealRatingModalProps {
  dealId: string;
  dealHeadline: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DealRatingModal = ({ dealId, dealHeadline, open, onClose, onSuccess }: DealRatingModalProps) => {
  const { user } = useAuth();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!user || stars === 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("deal_ratings" as any).insert({
        deal_id: dealId,
        user_id: user.id,
        stars,
        review_text: reviewText.trim() || null,
        is_verified_buyer: isVerifiedBuyer,
      } as any);
      if (error) {
        if (error.code === "23505") {
          toast.error("You've already rated this deal");
        } else {
          throw error;
        }
      } else {
        toast.success("Rating submitted!");
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const displayStars = hovered || stars;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this deal</DialogTitle>
          <DialogDescription className="text-xs line-clamp-1">{dealHeadline}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stars */}
          <div className="flex items-center justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setStars(s)}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    s <= displayStars ? "fill-accent text-accent" : "text-muted"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="What did you think of this offer? (optional)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
            rows={3}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="verified-buyer"
              checked={isVerifiedBuyer}
              onCheckedChange={(v) => setIsVerifiedBuyer(!!v)}
            />
            <Label htmlFor="verified-buyer" className="text-sm">
              I am a verified buyer / I used this service
            </Label>
          </div>

          <Button
            className="w-full"
            disabled={stars === 0 || loading}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Your review helps other buyers make better decisions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
