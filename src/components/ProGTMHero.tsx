import { useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck, ArrowRight, Trophy, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pro GTM concentrated hero block — visible when admin enables the pro_*
 * sections in /admin/sections. Replaces the generic spotlight with a
 * professional-first claim-your-trust-page pitch.
 */
export function ProGTMHero() {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-10 shadow-elegant">
      <div className="absolute inset-0 pointer-events-none opacity-40 [background:radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_60%)]" />

      <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            For Real Estate Professionals — Founder Member access
          </div>

          <h2 className="heading-section text-2xl md:text-4xl font-bold leading-tight">
            Your reputation is your best asset.<br />
            <span className="text-primary">Claim your verified Trust Page.</span>
          </h2>

          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            LinkedIn shows your history. R8ESTATE proves your results — verified
            deals, real client reviews, area ranking. One link replaces every
            PDF, screenshot and WhatsApp pitch.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => navigate("/auth?intent=claim_pro")}
              className="gap-2"
            >
              Claim my Trust Page
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/portfolio")}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Find a top-rated Pro
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-verified" />
              Verified deals
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Real client reviews
            </span>
            <span className="inline-flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              Top 1% area ranking
            </span>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="aspect-[4/5] rounded-2xl border border-border bg-card/80 backdrop-blur p-5 shadow-elegant relative">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
              Sample Trust Page
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div className="flex-1">
                <div className="font-semibold text-sm">Your Name, Verified Pro</div>
                <div className="flex items-center gap-1 text-xs">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-muted-foreground ms-1">4.9 · 87 reviews</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/60">
                <div className="text-base font-bold">112</div>
                <div className="text-[10px] text-muted-foreground">Deals</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/60">
                <div className="text-base font-bold">#3</div>
                <div className="text-[10px] text-muted-foreground">New Cairo</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/60">
                <div className="text-base font-bold">5y</div>
                <div className="text-[10px] text-muted-foreground">Verified</div>
              </div>
            </div>
            <div className="mt-4 text-[11px] text-muted-foreground italic">
              "She closed our deal in 6 days — full transparency."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}