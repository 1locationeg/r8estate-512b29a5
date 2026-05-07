import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, ArrowRight, Sparkles, Copy, Share2, Gift } from "lucide-react";
import { toast } from "sonner";
import { DemoBuyerView } from "@/components/demo/DemoBuyerView";
import { DemoBusinessView } from "@/components/demo/DemoBusinessView";
import { DemoAdminView } from "@/components/demo/DemoAdminView";
import { DemoTour, type TourStep } from "@/components/demo/DemoTour";

type Role = "buyer" | "business" | "admin";

const TOURS: Record<Role, TourStep[]> = {
  buyer: [
    { selector: '[data-tour="buyer-sidebar"]', title: "Buyer Navigation", body: "Switch sections — overview, reviews, alerts, achievements, community, and more. All read-only." },
    { selector: '[data-tour="buyer-hero"]', title: "Your Buyer Profile", body: "Track your tier, points, and journey to becoming an Elite Reviewer." },
    { selector: '[data-tour="buyer-kpis"]', title: "Activity at a Glance", body: "Followed developers, saved projects, and earned credits live here." },
    { selector: '[data-tour="buyer-insights"]', title: "AI Trust Insights", body: "We notify you when a developer's score changes or a verified review matches your interests." },
    { selector: '[data-tour="buyer-actions"]', title: "Quick Actions", body: "Write reviews, compare developers, scan contracts, and watch live deals." },
    { selector: '[data-tour="buyer-followed"]', title: "Followed Developers", body: "Stay close to the developers you're considering. We track every signal." },
  ],
  business: [
    { selector: '[data-tour="biz-sidebar"]', title: "Business Navigation", body: "Profile, reviews inbox, projects, deals, launches, widgets, NFC tags — manage your reputation end-to-end." },
    { selector: '[data-tour="biz-hero"]', title: "Your Business Profile", body: "Verified status, plan, and live trust score — all in one place." },
    { selector: '[data-tour="biz-kpis"]', title: "Reputation KPIs", body: "Reviews, leads, profile views, and trust score trend at a glance." },
    { selector: '[data-tour="biz-reviews"]', title: "Reviews Inbox", body: "Reply to verified buyers. Contract-verified reviews carry 10× the weight in your trust score." },
    { selector: '[data-tour="biz-upgrade"]', title: "Pro Insights", body: "Unlock competitor benchmarking, AI sentiment analysis, and lead scoring." },
  ],
  admin: [
    { selector: '[data-tour="admin-sidebar"]', title: "Admin Navigation", body: "8 grouped sections covering users, moderation, AI tools, content, communications, finance, and settings." },
    { selector: '[data-tour="admin-hero"]', title: "Admin Console", body: "Real-time platform health, sync status, and incident view." },
    { selector: '[data-tour="admin-kpis"]', title: "Platform KPIs", body: "Users, businesses, reviews, and pending moderation flags." },
    { selector: '[data-tour="admin-verifications"]', title: "Verification Queue", body: "Approve or reject buyer KYC and business license submissions." },
    { selector: '[data-tour="admin-flagged"]', title: "Flagged Content", body: "AI-flagged reviews and comments queued for human review." },
  ],
};

export default function Demo() {
  const [role, setRole] = useState<Role>("buyer");
  const [tourOpen, setTourOpen] = useState(false);

  const demoUrl = typeof window !== "undefined"
    ? `${window.location.origin}/demo`
    : "https://meter.r8estate.com/demo";
  // Referral link — earns Insight Credits when the invitee signs up via /demo
  const referralUrl = `${demoUrl}?ref=demo-share`;

  const copyLink = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${label} copied!`, { description: url });
    } catch {
      toast.error("Couldn't copy. Long-press to copy manually.", { description: url });
    }
  };

  const shareLink = async (url: string, title: string) => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text: "Explore R8ESTATE — the trust platform for Egyptian real estate.", url });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink(url, "Link");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header banner */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground border-b border-primary/30 shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-base flex items-center gap-2">
                R8ESTATE Live Demo
                <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 text-[10px]">READ-ONLY</Badge>
              </p>
              <p className="text-xs opacity-80 hidden sm:block">Explore Buyer, Business, and Admin experiences. No sign-up required.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => copyLink(demoUrl, "Demo link")} title="Copy demo link">
              <Copy className="w-3.5 h-3.5 me-1" /> <span className="hidden sm:inline">Copy link</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => shareLink(demoUrl, "R8ESTATE Live Demo")} title="Share demo">
              <Share2 className="w-3.5 h-3.5 me-1" /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setTourOpen(true)}>
              <Play className="w-3.5 h-3.5 me-1" /> Take Tour
            </Button>
            <Button size="sm" asChild className="bg-amber-400 text-amber-950 hover:bg-amber-300">
              <Link to="/auth">Sign Up Free <ArrowRight className="w-3.5 h-3.5 ms-1" /></Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3" /> Interactive product preview
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">See R8ESTATE through every role's eyes</h1>
          <p className="text-sm text-muted-foreground">
            Switch between Buyer, Business, and Admin to discover the dashboard, journey, and tools each role uses. Click <strong>Take Tour</strong> for a guided walkthrough.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={role} onValueChange={(v) => { setRole(v as Role); setTourOpen(false); }}>
          <TabsList className="grid grid-cols-3 w-full max-w-xl mx-auto h-auto p-1">
            <TabsTrigger value="buyer" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              👤 Buyer
            </TabsTrigger>
            <TabsTrigger value="business" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🏢 Business
            </TabsTrigger>
            <TabsTrigger value="admin" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🛡️ Admin
            </TabsTrigger>
          </TabsList>

          <div className="mt-5 pb-12">
            <TabsContent value="buyer"><DemoBuyerView /></TabsContent>
            <TabsContent value="business"><DemoBusinessView /></TabsContent>
            <TabsContent value="admin"><DemoAdminView /></TabsContent>
          </div>
        </Tabs>

        {/* Bottom CTA */}
        <div className="border-t border-border/50 pt-6 pb-12 text-center">
          {/* Referral block — earn Insight Credits */}
          <div className="max-w-xl mx-auto mb-8 rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-white p-5 text-start">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Share &amp; earn Insight Credits</p>
                <p className="text-xs text-muted-foreground">You and your friend both get rewarded when they sign up.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                readOnly
                value={referralUrl}
                className="flex-1 min-w-0 text-xs px-3 py-2 rounded-lg border border-border bg-background font-mono"
                onFocus={(e) => e.currentTarget.select()}
              />
              <Button size="sm" variant="outline" onClick={() => copyLink(referralUrl, "Referral link")}>
                <Copy className="w-3.5 h-3.5 me-1" /> Copy
              </Button>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => shareLink(referralUrl, "Join me on R8ESTATE")}>
                <Share2 className="w-3.5 h-3.5 me-1" /> Share
              </Button>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2">Ready to use the real platform?</h2>
          <p className="text-sm text-muted-foreground mb-4">Free to start. No credit card required.</p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link to="/auth">Get Started <ArrowRight className="w-4 h-4 ms-1" /></Link>
          </Button>
        </div>
      </div>

      <DemoTour steps={TOURS[role]} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}