import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Star, Bookmark, Gift, Award, Trophy, MessageSquare, Users,
  Shield, Settings, User, Heart, Bell, FileCheck, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { DemoShell, DemoPlaceholder, type DemoNavGroup } from "./DemoShell";

const block = () => toast.info("Sign up free to use this on the real platform →", {
  action: { label: "Sign up", onClick: () => (window.location.href = "/auth") },
});

function Overview() {
  return (
    <div className="space-y-4">
      <Card data-tour="buyer-hero" className="p-5 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h2 className="text-2xl font-bold">Ahmed Hassan</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className="bg-amber-500 hover:bg-amber-500">🥈 Silver Reviewer</Badge>
              <Badge variant="outline">3 reviews</Badge>
              <Badge variant="outline">2,450 pts</Badge>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">Journey progress</p>
            <div className="w-40"><Progress value={65} className="h-2 mt-1" /></div>
            <p className="text-xs mt-1 font-semibold">65% to Gold</p>
          </div>
        </div>
      </Card>

      <div data-tour="buyer-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Followed", value: "12", icon: Heart, c: "text-rose-500" },
          { label: "Saved", value: "8", icon: Bookmark, c: "text-blue-500" },
          { label: "Reviews", value: "3", icon: Star, c: "text-amber-500" },
          { label: "Insight Credits", value: "5", icon: Trophy, c: "text-emerald-500" },
        ].map((k) => (
          <Card key={k.label} className="p-3">
            <k.icon className={`w-5 h-5 ${k.c}`} />
            <p className="text-2xl font-bold mt-1">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      <Card data-tour="buyer-insights" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Trust Insights</h3>
          <Badge variant="secondary">AI</Badge>
        </div>
        <div className="space-y-2">
          {[
            { t: "Palm Hills dropped 0.3 in trust score this week", c: "border-amber-500/40 bg-amber-500/5" },
            { t: "New verified review on Mountain View matches your interests", c: "border-emerald-500/40 bg-emerald-500/5" },
            { t: "3 followed developers launched off-plan projects", c: "border-blue-500/40 bg-blue-500/5" },
          ].map((i) => (
            <div key={i.t} className={`p-3 rounded-lg border ${i.c} text-sm`}>{i.t}</div>
          ))}
        </div>
      </Card>

      <Card data-tour="buyer-actions" className="p-4">
        <h3 className="font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Write a Review", "Compare Developers", "Contract Check", "Deal Watch"].map((a) => (
            <Button key={a} variant="outline" onClick={block}>{a}</Button>
          ))}
        </div>
      </Card>

      <Card data-tour="buyer-followed" className="p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Followed Developers</h3>
        <div className="space-y-2">
          {[
            { n: "Palm Hills Developments", s: 4.6, r: 1240 },
            { n: "Mountain View", s: 4.4, r: 982 },
            { n: "Tatweer Misr", s: 4.2, r: 671 },
          ].map((d) => (
            <div key={d.n} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
              <div>
                <p className="font-semibold text-sm">{d.n}</p>
                <p className="text-xs text-muted-foreground">{d.r} reviews</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500" /> {d.s}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MyReviews() {
  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-bold">My Reviews (3)</h3>
      {[
        { dev: "Palm Hills Developments", r: 5, t: "Smooth handover, transparent pricing." },
        { dev: "Mountain View", r: 4, t: "Great location but minor delays in finishing." },
        { dev: "Tatweer Misr", r: 3, t: "Quality OK, communication needs improvement." },
      ].map((rev) => (
        <div key={rev.dev} className="p-3 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{rev.dev}</p>
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < rev.r ? "fill-amber-500 text-amber-500" : "text-muted"}`} />
            ))}</div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{rev.t}</p>
        </div>
      ))}
    </Card>
  );
}

const groups: DemoNavGroup[] = [
  {
    label: "Main",
    items: [
      { key: "overview", label: "Dashboard", icon: LayoutDashboard, content: <Overview /> },
      { key: "reviews", label: "My Reviews", icon: Star, badge: "3", content: <MyReviews /> },
      { key: "alerts", label: "Search Alerts", icon: Bookmark, content: <DemoPlaceholder title="Saved Searches" lines={["You have 2 active alerts.","'3-bedroom in New Cairo, under 8M EGP' — 4 new matches.","'Off-plan in North Coast' — 1 new launch."]} /> },
      { key: "referrals", label: "Invite Friends", icon: Gift, content: <DemoPlaceholder title="Referral Program" lines={["Invite friends — both of you earn Insight Credits when they verify.","Your referral link: r8estate.com/r/ahmed42","2 friends joined so far → +50 credits earned."]} /> },
      { key: "achievements", label: "Achievements", icon: Award, content: <DemoPlaceholder title="Badges & Tier Progress" lines={["🥈 Silver Reviewer — unlocked","🔍 Truth Seeker — wrote 3 verified reviews","🤝 Community Voice — 65% to Gold tier"]} /> },
      { key: "leaderboard", label: "Leaderboard", icon: Trophy, content: <DemoPlaceholder title="Weekly Leaderboard" lines={["You are ranked #14 this week.","Top 10 reviewers earn bonus credits every Monday.","Beat 'Mona K.' (+85 pts) to climb to #13."]} /> },
    ],
  },
  {
    label: "Communication",
    items: [
      { key: "messages", label: "Messages", icon: MessageSquare, badge: "2", content: <DemoPlaceholder title="Inbox" lines={["Palm Hills Developments — 'Thanks for your verified review.'","Mountain View — 'Your unit handover is scheduled.'"]} /> },
      { key: "community", label: "Community", icon: Users, content: <DemoPlaceholder title="Community Feed" lines={["Discussion: 'Best off-plan deals in 2026?'","Question: 'How do I verify a contract?'","Tip: '5 red flags in developer brochures.'"]} /> },
      { key: "notifications", label: "Notifications", icon: Bell, content: <DemoPlaceholder title="Notifications" lines={["Trust score alert: Palm Hills -0.3","New reply on your review","Verification approved"]} /> },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "verification", label: "Verification", icon: Shield, content: <DemoPlaceholder title="Buyer Verification" lines={["Tier 1: Email — verified","Tier 2: Phone — verified","Tier 3: National ID — pending review"]} /> },
      { key: "contract", label: "Contract Check", icon: FileCheck, content: <DemoPlaceholder title="Contract Check" lines={["Upload a contract PDF — AI flags risky clauses in 30s.","Detects: hidden fees, delivery delays, refund traps.","2 of your contracts scanned this month."]} /> },
      { key: "prefs", label: "Notification Prefs", icon: Settings, content: <DemoPlaceholder title="Preferences" lines={["Email digest — Weekly","Push notifications — Enabled","WhatsApp alerts — Disabled"]} /> },
      { key: "settings", label: "Account Details", icon: User, content: <DemoPlaceholder title="Account" lines={["Name, email, phone, password, language preference (EN/AR)."]} /> },
    ],
  },
];

export function DemoBuyerView() {
  return (
    <DemoShell
      portalLabel="Buyer"
      portalAccent="primary"
      user={{ name: "Ahmed Hassan", subtitle: "🥈 Silver · 2,450 pts" }}
      groups={groups}
      defaultKey="overview"
      sidebarTourId="buyer-sidebar"
    />
  );
}
