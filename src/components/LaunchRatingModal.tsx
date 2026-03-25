// @ts-nocheck
import { useState } from "react";
import { Star, Loader2, Rocket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DisclaimerCheckbox } from "@/components/DisclaimerCheckbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaunchRatingModalProps {
  launchId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const subScoreFields = [
  { key: "stars_price_fairness", label: "Price fairness at launch" },
  { key: "stars_developer_transparency", label: "Developer transparency" },
  { key: "stars_payment_terms", label: "Payment plan quality" },
  { key: "stars_location_value", label: "Location and project value" },
  { key: "stars_overall", label: "Overall launch experience" },
];

export const LaunchRatingModal = ({ launchId, projectName, open, onClose, onSuccess }: LaunchRatingModalProps) => {
  const { user } = useAuth();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState("");
  const [isReserver, setIsReserver] = useState(false);
  const [isPurchaser, setIsPurchaser] = useState(false);
  const [isAttendee, setIsAttendee] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const allScored = subScoreFields.every((f) => scores[f.key] >= 1);

  const getBuyerType = () => {
    if (isPurchaser) return "purchaser";
    if (isReserver) return "reserver";
    if (isAttendee) return "attendee";
    return "observer";
  };

  const handleSubmit = async () => {
    if (!user || !allScored || !disclaimerAgreed) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("launch_ratings" as any).insert({
        launch_id: launchId,
        user_id: user.id,
        stars_price_fairness: scores.stars_price_fairness,
        stars_developer_transparency: scores.stars_developer_transparency,
        stars_payment_terms: scores.stars_payment_terms,
        stars_location_value: scores.stars_location_value,
        stars_overall: scores.stars_overall,
        review_text: reviewText.trim() || null,
        buyer_verified: isReserver || isPurchaser,
        buyer_type: getBuyerType(),
      } as any);
      if (error) {
        if (error.code === "23505") {
          toast.error("You've already rated this launch");
        } else throw error;
        return;
      }
      toast.success("Rating submitted!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Rate this launch
          </DialogTitle>
          <DialogDescription>{projectName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sub-scores */}
          {subScoreFields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs">{field.label}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHovered((h) => ({ ...h, [field.key]: s }))}
                    onMouseLeave={() => setHovered((h) => ({ ...h, [field.key]: 0 }))}
                    onClick={() => setScores((sc) => ({ ...sc, [field.key]: s }))}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        s <= (hovered[field.key] || scores[field.key] || 0)
                          ? "text-accent fill-accent"
                          : "text-muted"
                      }`}
                    />
                  </button>
                ))}
                {scores[field.key] && (
                  <span className="text-xs font-bold text-foreground ms-1">{scores[field.key]}/5</span>
                )}
              </div>
            </div>
          ))}

          {/* Review text */}
          <div>
            <Label className="text-xs">Share your experience (optional)</Label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
              placeholder="Tell others about this launch..."
              rows={3}
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">{reviewText.length}/500</p>
          </div>

          {/* Buyer type checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="reserver" checked={isReserver} onCheckedChange={(v) => setIsReserver(!!v)} />
              <Label htmlFor="reserver" className="text-xs">I submitted a reservation deposit</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="purchaser" checked={isPurchaser} onCheckedChange={(v) => setIsPurchaser(!!v)} />
              <Label htmlFor="purchaser" className="text-xs">I purchased a unit at this launch</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="attendee" checked={isAttendee} onCheckedChange={(v) => setIsAttendee(!!v)} />
              <Label htmlFor="attendee" className="text-xs">I attended the launch event</Label>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground bg-secondary/50 rounded p-2">
            Your rating is more trusted when verified. R8ESTATE may request proof of reservation.
          </p>

          <DisclaimerCheckbox checked={disclaimerAgreed} onCheckedChange={setDisclaimerAgreed} />

          <Button
            onClick={handleSubmit}
            disabled={loading || !allScored || !disclaimerAgreed}
            className="w-full"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin me-2" /> Submitting...</> : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
