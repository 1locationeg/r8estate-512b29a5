import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, ArrowRight, Sparkles, Copy, Share2, Gift, User, Building2, Shield, Check } from "lucide-react";
import { toast } from "sonner";
import { DemoBuyerView } from "@/components/demo/DemoBuyerView";
import { DemoBusinessView } from "@/components/demo/DemoBusinessView";
import { DemoAdminView } from "@/components/demo/DemoAdminView";
import { DemoTour, type TourStep } from "@/components/demo/DemoTour";

type Role = "buyer" | "business" | "admin";

const ROLE_META: Record<Role, {
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  title: string;
  hero: string;
  subtitle: string;
  perks: string[];
  // tailwind classes — must be static for JIT to pick up
  card: string;
  cardActive: string;
  iconWrap: string;
  badge: string;
  glow: string;
  pageTint: string;
}> = {
  buyer: {
    icon: User,
    emoji: "👤",
    title: "I'm a Buyer",
    hero: "You're the hero — make every pound count.",
    subtitle: "Verified reviews, AI trust insights, and contract checks built for you.",
    perks: ["Compare developers", "Earn Insight Credits", "Scan contracts in 30s"],
    card: "border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:border-primary/40",
    cardActive: "border-primary bg-gradient-to-br from-primary/15 to-primary/5 ring-2 ring-primary/30",
    iconWrap: "bg-primary text-primary-foreground",
    badge: "bg-primary/10 text-primary",
    glow: "shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.4)]",
    pageTint: "from-primary/5 via-background to-background",
  },
  business: {
    icon: Building2,
    emoji: "🏢",
    title: "I'm a Business",
    hero: "Own your reputation. Win more buyers.",
    subtitle: "Verified reviews inbox, trust analytics, lead pipeline, and embeddable widgets.",
    perks: ["Reply to verified buyers", "Track trust score live", "Embed widgets anywhere"],
    card: "border-emerald-600/20 bg-gradient-to-br from-emerald-50 to-background hover:border-emerald-600/40",
    cardActive: "border-emerald-600 bg-gradient-to-br from-emerald-600/15 to-emerald-50 ring-2 ring-emerald-600/30",
    iconWrap: "bg-emerald-600 text-white",
    badge: "bg-emerald-600/10 text-emerald-700",
    glow: "shadow-[0_8px_30px_-6px_rgba(5,150,105,0.4)]",
    pageTint: "from-emerald-600/5 via-background to-background",
  },
  admin: {
    icon: Shield,
    emoji: "🛡️",
    title: "I'm an Admin",
    hero: "Steer the platform. Protect the trust.",
    subtitle: "Moderation queues, AI fraud detection, finance, and platform-wide controls.",
    perks: ["Approve KYC & claims", "AI-flagged fraud queue", "Run the trust engine"],
    card: "border-rose-600/20 bg-gradient-to-br from-rose-50 to-background hover:border-rose-600/40",
    cardActive: "border-rose-600 bg-gradient-to-br from-rose-600/15 to-rose-50 ring-2 ring-rose-600/30",
    iconWrap: "bg-rose-600 text-white",
    badge: "bg-rose-600/10 text-rose-700",
    glow: "shadow-[0_8px_30px_-6px_rgba(225,29,72,0.4)]",
    pageTint: "from-rose-600/5 via-background to-background",
  },
};

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
  const meta = ROLE_META[role];

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
    <div className={`min-h-screen bg-gradient-to-b ${meta.pageTint} transition-colors duration-500`}>
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
            <Sparkles className="w-3 h-3" /> Step into the role
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Pick who you are. Live the dashboard.</h1>
          <p className="text-sm text-muted-foreground">
            Each role gets its own colors, tools, and journey. Choose yours to feel the platform from the inside.
          </p>
        </div>

        {/* Role hero cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const m = ROLE_META[r];
            const Icon = m.icon;
            const isActive = role === r;
            return (
              <button
                key={r}
                onClick={() => { setRole(r); setTourOpen(false); }}
                className={`text-start p-4 rounded-2xl border-2 transition-all duration-300 ${isActive ? `${m.cardActive} ${m.glow} scale-[1.02]` : `${m.card} hover:scale-[1.01]`}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${m.iconWrap}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-base">{m.title}</p>
                      {isActive && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badge} flex items-center gap-1`}>
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.subtitle}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {m.perks.map((p) => (
                    <li key={p} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className={`w-1 h-1 rounded-full ${m.iconWrap}`} /> {p}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Active-role hero banner — makes the user feel like the hero */}
        <div key={role} className={`mb-5 rounded-2xl border-2 p-5 md:p-6 animate-fade-in ${meta.cardActive} ${meta.glow}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${meta.iconWrap}`}>
              <meta.icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${meta.badge} inline-block px-2 py-0.5 rounded mb-1`}>
                You are now: {meta.emoji} {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
              <h2 className="text-xl md:text-2xl font-bold leading-tight">{meta.hero}</h2>
              <p className="text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
            </div>
            <Button size="sm" onClick={() => setTourOpen(true)} variant="outline" className="border-2">
              <Play className="w-3.5 h-3.5 me-1" /> Tour this role
            </Button>
          </div>
        </div>

        {/* Active role view */}
        <div key={`view-${role}`} className="animate-fade-in pb-12">
          {role === "buyer" && <DemoBuyerView />}
          {role === "business" && <DemoBusinessView />}
          {role === "admin" && <DemoAdminView />}
        </div>

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