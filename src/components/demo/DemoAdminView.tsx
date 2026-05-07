import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BarChart3, MessageSquareHeart, Users, Building2, Briefcase, Shield,
  UserCheck, MessageSquare, ShieldCheck, AlertTriangle, Receipt, Tag, Rocket, ShieldAlert,
  Flag, Bot, PenTool, Zap, Sparkles, FolderTree, Navigation, Layout, Search, Code,
  TrendingUp, Link as LinkIcon, Smartphone, Megaphone, Phone, Mail, Gift, CreditCard,
  DollarSign, Globe, Activity, Timer, ScanSearch, Settings, Server,
} from "lucide-react";
import { toast } from "sonner";
import { DemoShell, DemoPlaceholder, type DemoNavGroup } from "./DemoShell";

const block = () => toast.info("Admin actions are disabled in demo →", {
  action: { label: "Sign up", onClick: () => (window.location.href = "/auth") },
});

function Overview() {
  return (
    <div className="space-y-4">
      <Card data-tour="admin-hero" className="p-5 bg-gradient-to-br from-rose-600/10 via-background to-amber-500/10 border-rose-600/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Admin Console</p>
            <h2 className="text-2xl font-bold">Platform Health</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs">All systems operational</span>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-2xl font-bold text-rose-700">+248 new users</p>
          </div>
        </div>
      </Card>

      <div data-tour="admin-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Users", v: "38,412", i: Users, c: "text-blue-500" },
          { l: "Businesses", v: "1,524", i: Building2, c: "text-emerald-500" },
          { l: "Reviews", v: "84,201", i: MessageSquare, c: "text-amber-500" },
          { l: "Pending Mod", v: "47", i: ShieldAlert, c: "text-rose-500" },
        ].map((k) => (
          <Card key={k.l} className="p-3">
            <k.i className={`w-5 h-5 ${k.c}`} />
            <p className="text-2xl font-bold mt-1">{k.v}</p>
            <p className="text-xs text-muted-foreground">{k.l}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card data-tour="admin-verifications" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-600" /> Verification Queue</h3>
            <Badge variant="secondary">12 pending</Badge>
          </div>
          <div className="space-y-2">
            {[
              { n: "Ahmed Saeed — Buyer KYC", t: "National ID + selfie" },
              { n: "Sara Mahmoud — Buyer KYC", t: "National ID submitted" },
              { n: "Madinet Masr — Business", t: "Commercial license" },
            ].map((v) => (
              <div key={v.n} className="flex items-center justify-between p-2 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-sm">{v.n}</p>
                  <p className="text-xs text-muted-foreground">{v.t}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={block}>Reject</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={block}>Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card data-tour="admin-flagged" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><Flag className="w-4 h-4 text-rose-600" /> AI-Flagged Reviews</h3>
            <Badge variant="destructive">8 flagged</Badge>
          </div>
          <div className="space-y-2">
            {[
              { t: "Suspected fake — duplicate IP cluster", r: "Palm Hills" },
              { t: "Profanity detected — auto-masked", r: "Mountain View" },
              { t: "Competitor smear pattern detected", r: "Tatweer Misr" },
            ].map((f) => (
              <div key={f.t} className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/5">
                <p className="text-sm font-semibold">{f.t}</p>
                <p className="text-xs text-muted-foreground">on {f.r}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const groups: DemoNavGroup[] = [
  {
    label: "Overview",
    items: [
      { key: "overview", label: "Dashboard", icon: LayoutDashboard, content: <Overview /> },
      { key: "analytics", label: "Analytics", icon: BarChart3, content: <DemoPlaceholder title="Platform Analytics" lines={["Daily/Weekly/Monthly active users.","Funnel: visit → signup → review.","Revenue, retention cohorts, churn."]} /> },
      { key: "feedback", label: "Feedback", icon: MessageSquareHeart, content: <DemoPlaceholder title="User Feedback" lines={["Site experience ratings & open feedback from buyers and businesses."]} /> },
    ],
  },
  {
    label: "Users & Businesses",
    items: [
      { key: "users", label: "Users", icon: Users, content: <DemoPlaceholder title="Users" lines={["Search, filter by role, suspend, reset, impersonate (audited)."]} /> },
      { key: "developers", label: "Developers", icon: Building2, content: <DemoPlaceholder title="Developers" lines={["1,524 listed developers. Verify, edit, merge duplicates."]} /> },
      { key: "business", label: "Business", icon: Briefcase, content: <DemoPlaceholder title="Business Profiles" lines={["Manage all business profiles and sub-businesses."]} /> },
      { key: "claims", label: "Claims", icon: Shield, content: <DemoPlaceholder title="Profile Claims" lines={["Approve / reject claims from businesses requesting ownership."]} /> },
      { key: "upgrades", label: "Upgrade Requests", icon: UserCheck, content: <DemoPlaceholder title="Plan Upgrades" lines={["Review upgrade requests to Silver / Gold / Platinum plans."]} /> },
    ],
  },
  {
    label: "Reviews & Moderation",
    items: [
      { key: "reviews", label: "Reviews", icon: MessageSquare, badge: "47", content: <DemoPlaceholder title="Review Moderation" lines={["Approve, reject, edit, or escalate reviews."]} /> },
      { key: "moderation", label: "Moderation Queue", icon: Shield, content: <DemoPlaceholder title="Queue" lines={["AI pre-screened items needing human judgment."]} /> },
      { key: "guest-reviews", label: "Guest Reviews", icon: UserCheck, content: <DemoPlaceholder title="Guest Reviews" lines={["Reviews from unverified guests — held until verified."]} /> },
      { key: "rev-verify", label: "Reviewer Verification", icon: ShieldCheck, content: <DemoPlaceholder title="Reviewer Verification" lines={["3-tier KYC review: Email, Phone, National ID."]} /> },
      { key: "fraud", label: "Fraud Detection", icon: AlertTriangle, content: <DemoPlaceholder title="Fraud Detection" lines={["IP clusters, device fingerprints, semantic similarity."]} /> },
      { key: "receipts", label: "Receipt Verification", icon: Receipt, content: <DemoPlaceholder title="Receipts" lines={["Verify purchase contracts & receipts for verified-buyer badge."]} /> },
      { key: "deal-mod", label: "Deal Moderation", icon: Tag, content: <DemoPlaceholder title="Deal Moderation" lines={["Approve developer deal submissions before going live."]} /> },
      { key: "launch-mod", label: "Launch Moderation", icon: Rocket, content: <DemoPlaceholder title="Launch Moderation" lines={["Approve off-plan launch announcements."]} /> },
      { key: "comm-guard", label: "Community Guard", icon: ShieldAlert, content: <DemoPlaceholder title="Community Guard" lines={["AI-moderated community posts and replies."]} /> },
      { key: "reports", label: "Content Reports", icon: Flag, content: <DemoPlaceholder title="Content Reports" lines={["User-reported content with reason and context."]} /> },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { key: "ai-rev", label: "AI Reviewer", icon: Bot, content: <DemoPlaceholder title="AI Reviewer" lines={["AI-assisted review evaluation & sentiment scoring."]} /> },
      { key: "ai-write", label: "AI Review Writer", icon: PenTool, content: <DemoPlaceholder title="AI Review Writer" lines={["Help users write better reviews from rough notes."]} /> },
      { key: "ai-usage", label: "AI Usage", icon: Zap, content: <DemoPlaceholder title="AI Usage" lines={["Token counts, costs, and per-feature usage breakdown."]} /> },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "spotlight", label: "Spotlight", icon: Sparkles, content: <DemoPlaceholder title="Featured Spotlight" lines={["Curate the homepage Featured Identity Spotlight."]} /> },
      { key: "categories", label: "Categories", icon: FolderTree, content: <DemoPlaceholder title="Categories" lines={["Manage 18 segments and 27 property types."]} /> },
      { key: "navigation", label: "Navigation", icon: Navigation, content: <DemoPlaceholder title="Navigation" lines={["Edit top nav, footer, and bottom-nav links."]} /> },
      { key: "sections", label: "Sections", icon: Layout, content: <DemoPlaceholder title="Homepage Sections" lines={["Toggle and reorder homepage sections."]} /> },
      { key: "search-phrases", label: "Search Phrases", icon: Search, content: <DemoPlaceholder title="Search Phrases" lines={["Curate suggested searches in the hero search bar."]} /> },
      { key: "widgets", label: "Widgets", icon: Code, content: <DemoPlaceholder title="Widgets" lines={["Manage embeddable trust widgets and analytics."]} /> },
      { key: "upsell", label: "Upsell Teaser", icon: TrendingUp, content: <DemoPlaceholder title="Upsell Teaser" lines={["Configure blurred trend lines that drive Pro upgrades."]} /> },
      { key: "smart-links", label: "Smart Links", icon: LinkIcon, content: <DemoPlaceholder title="Smart Links" lines={["meter.r8estate.com short links and OG metadata."]} /> },
      { key: "nfc", label: "NFC Tags", icon: Smartphone, content: <DemoPlaceholder title="NFC Tags" lines={["Issue and track physical NFC review tags."]} /> },
    ],
  },
  {
    label: "Communications",
    items: [
      { key: "messaging", label: "Messages", icon: MessageSquare, content: <DemoPlaceholder title="Messaging" lines={["Internal admin messaging and broadcasts."]} /> },
      { key: "notifications", label: "Notifications", icon: Megaphone, content: <DemoPlaceholder title="Notifications" lines={["Send platform-wide push & in-app notifications."]} /> },
      { key: "whatsapp", label: "WhatsApp", icon: Phone, content: <DemoPlaceholder title="WhatsApp" lines={["Templates, opt-ins, and delivery analytics."]} /> },
      { key: "newsletter", label: "Newsletter", icon: Mail, content: <DemoPlaceholder title="Newsletter" lines={["Compose and schedule newsletters."]} /> },
      { key: "welcome", label: "Welcome Message", icon: Gift, content: <DemoPlaceholder title="Welcome Message" lines={["Edit the auto-push sent on signup."]} /> },
    ],
  },
  {
    label: "Finance",
    items: [
      { key: "pricing", label: "Pricing Plans", icon: CreditCard, content: <DemoPlaceholder title="Pricing" lines={["Define plans, prices, features, trial periods."]} /> },
      { key: "subs", label: "Subscriptions", icon: Receipt, content: <DemoPlaceholder title="Subscriptions" lines={["Active, past-due, cancelled subscriptions."]} /> },
      { key: "txn", label: "Transactions", icon: DollarSign, content: <DemoPlaceholder title="Transactions" lines={["Stripe & Paddle transactions, refunds, payouts."]} /> },
      { key: "referrals", label: "Referrals", icon: Gift, content: <DemoPlaceholder title="Referrals" lines={["Track Insight Credits awarded and redeemed."]} /> },
    ],
  },
  {
    label: "Settings",
    items: [
      { key: "seo", label: "SEO & Sharing", icon: Globe, content: <DemoPlaceholder title="SEO" lines={["Meta titles, descriptions, OG images per route."]} /> },
      { key: "tracking", label: "Tracking", icon: Activity, content: <DemoPlaceholder title="Tracking" lines={["GA4, Meta Pixel, TikTok Pixel — GDPR-gated."]} /> },
      { key: "guest-timer", label: "Guest Timer", icon: Timer, content: <DemoPlaceholder title="Guest Timer" lines={["3-minute preview timer for unauthenticated visitors."]} /> },
      { key: "truth-check", label: "Truth-Check", icon: ScanSearch, content: <DemoPlaceholder title="Truth-Check" lines={["AI integrity scan settings and review-checking thresholds."]} /> },
      { key: "settings", label: "Settings", icon: Settings, content: <DemoPlaceholder title="Platform Settings" lines={["Branding, languages, registration slots, feature flags."]} /> },
    ],
  },
];

export function DemoAdminView() {
  return (
    <DemoShell
      portalLabel="Admin"
      portalAccent="admin"
      user={{ name: "Admin Console", subtitle: "Platform operator" }}
      groups={groups}
      defaultKey="overview"
      sidebarTourId="admin-sidebar"
    />
  );
}
