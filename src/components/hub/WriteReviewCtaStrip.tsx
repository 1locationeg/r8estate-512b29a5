import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewModal } from "@/components/WriteReviewModal";

export const WriteReviewCtaStrip = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="mt-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 md:p-8 text-center">
        <PenSquare className="w-8 h-8 text-primary mx-auto mb-3" />
        <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 max-w-xl mx-auto">
          {isRTL
            ? "اشتريت من قبل؟ مراجعتك بتحمي 1,000+ مشتري بعدك."
            : "Already a buyer? Your review protects 1,000+ next buyers."}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          {isRTL
            ? "شارك تجربتك الحقيقية وكسب نقاط مكافآت."
            : "Share your real experience and earn reward points."}
        </p>
        <Button size="lg" onClick={() => setOpen(true)}>
          {isRTL ? "اكتب مراجعتك" : "Write your review"}
        </Button>
      </section>
      <WriteReviewModal open={open} onOpenChange={setOpen} />
    </>
  );
};