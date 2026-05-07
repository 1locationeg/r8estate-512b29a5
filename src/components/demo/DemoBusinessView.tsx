import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, Building2, Star, Phone, MapPin, Trophy, Tag, Rocket,
  Code, Smartphone, MessageSquare, Users, Bell, Settings, TrendingUp, Eye, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { DemoShell, DemoPlaceholder, type DemoNavGroup } from "./DemoShell";

const block = () => toast.info("Sign up free to manage your business →", {
  action: { label: "Claim profile", onClick: () => (window.location.href = "/auth") },
});

function Overview() {
  return (
    <div className="space-y-4">
      <Card data-tour="biz-hero" className="p-5 bg-gradient-to-br from-emerald-600/10 via-background to-amber-500/10 border-emerald-600/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">PH</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Palm Hills Developments</h2>
                <Badge className="bg-emerald-600 hover:bg-emerald-600">Verified</Badge>
                <Badge variant="outline" className="border-amber-500 text-amber-700">Silver Plan</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">New Cairo · Est. 2005 · 2,800 employees</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">Trust Score</p>
            <p className="text-3xl font-bold text-emerald-700">4.8</p>
            <p className="text-xs text-emerald-600">↑ 0.3 this month</p>
          </div>
        </div>
      </Card>

      <div data-tour="biz-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Reviews", v: "1,247", i: Star, c: "text-amber-500" },
          { l: "Profile Views", v: "7.0K", i: Eye, c: "text-blue-500" },
          { l: "Leads", v: "84", i: TrendingUp, c: "text-emerald-500" },
          { l: "Avg. Rating", v: "4.8", i: Crown, c: "text-rose-500" },
        ].map((k) => (
          <Card key={k.l} className="p-3">
            <k.i className={`w-5 h-5 ${k.c}`} />
            <p className="text-2xl font-bold mt-1">{k.v}</p>
            <p className="text-xs text-muted-foreground">{k.l}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-bold mb-2">Profile Completion</h3>
        <Progress value={91} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">91% complete — finish to earn the Profile Pioneer badge.</p>
      </Card>

      <Card data-tour="biz-reviews" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Latest Reviews</h3>
          <Button size="sm" variant="ghost" onClick={block}>View All</Button>
        </div>
        <div className="space-y-2">
          {[
            { n: "Ahmed Mostafa", r: 5, t: "Smooth handover, transparent pricing.", v: true },
            { n: "Sara Mahmoud", r: 4, t: "Great location, minor finishing delays." },
            { n: "Omar Yasser", r: 5, t: "Highly recommend. Sales team was honest." },
          ].map((rev) => (
            <div key={rev.n} className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{rev.n}</p>
                  {rev.v && <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[9px]">Verified Buyer</Badge>}
                </div>
                <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rev.r ? "fill-amber-500 text-amber-500" : "text-muted"}`} />
                ))}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{rev.t}</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={block}>Reply</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card data-tour="biz-upgrade" className="p-4 border-amber-500/40 bg-gradient-to-br from-amber-50 to-white">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" />
          <div className="flex-1">
            <h3 className="font-bold">Unlock Pro Insights</h3>
            <p className="text-xs text-muted-foreground">Competitor benchmarks · AI sentiment · Lead scoring · Custom widgets</p>
          </div>
          <Button onClick={block} className="bg-amber-500 hover:bg-amber-600">Upgrade</Button>
        </div>
      </Card>
    </div>
  );
}

const groups: DemoNavGroup[] = [
  {
    label: "Main",
    items: [
      { key: "overview", label: "Dashboard", icon: LayoutDashboard, content: <Overview /> },
      { key: "profile", label: "Business Profile", icon: Building2, content: <DemoPlaceholder title="Business Profile Editor" lines={["Edit logo, cover, description, categories, locations, employees, certificates, and gallery."]} /> },
      { key: "reviews", label: "Reviews Inbox", icon: Star, badge: "12", content: <DemoPlaceholder title="Reviews Inbox" lines={["Filter by rating, verified status, sentiment.","Reply directly — verified-buyer reviews carry 10× weight on your trust score.","Export reviews as PDF."]} /> },
      { key: "request", label: "Request Review", icon: Phone, content: <DemoPlaceholder title="WhatsApp Review Requests" lines={["Send personalized review-request links to past buyers.","Track open & completion rates.","+25 credits per verified review collected."]} /> },
      { key: "projects", label: "Projects", icon: MapPin, content: <DemoPlaceholder title="Your Projects" lines={["Manage all listed compounds & launches.","Each project has its own reviews, gallery, and trust score."]} /> },
    ],
  },
  {
    label: "Growth",
    items: [
      { key: "rewards", label: "Rewards & Badges", icon: Trophy, content: <DemoPlaceholder title="Gamification" lines={["Earn coins for completing profile, replying to reviews, posting in community.","Unlock tiers: Bronze → Silver → Gold → Platinum."]} /> },
      { key: "leaderboard", label: "Leaderboard", icon: Trophy, content: <DemoPlaceholder title="Developers Leaderboard" lines={["Ranked weekly by Trust Score, Verified Reviews, and Reply Rate.","You're #7 in New Cairo developers this week."]} /> },
      { key: "deals", label: "My Deals", icon: Tag, content: <DemoPlaceholder title="Deals" lines={["Submit limited-time offers — featured on Deal Watch.","Track views, saves, and lead conversions per deal."]} /> },
      { key: "launches", label: "My Launches", icon: Rocket, content: <DemoPlaceholder title="Launches" lines={["Announce off-plan launches with countdown timers.","Followers get instant push notifications."]} /> },
      { key: "widgets", label: "Trust Widgets", icon: Code, content: <DemoPlaceholder title="Embeddable Widgets" lines={["Copy 1 line of HTML to embed your trust score on your site.","5 variants: badge, carousel, hero, mini-card, leaderboard rank."]} /> },
      { key: "nfc", label: "NFC Tags", icon: Smartphone, content: <DemoPlaceholder title="NFC Review Tags" lines={["Order physical NFC tags for sales offices.","Buyers tap their phone → instant verified review form."]} /> },
    ],
  },
  {
    label: "Communication",
    items: [
      { key: "messages", label: "Messages", icon: MessageSquare, badge: "5", content: <DemoPlaceholder title="Lead Inbox" lines={["Direct messages from interested buyers.","Mark leads as: New / Contacted / Won / Lost."]} /> },
      { key: "community", label: "Community", icon: Users, content: <DemoPlaceholder title="Community" lines={["Reply to questions, post launches & expertise.","Verified developer replies are highlighted."]} /> },
      { key: "notifications", label: "Notifications", icon: Bell, content: <DemoPlaceholder title="Notifications" lines={["New reviews, new leads, mentions in community."]} /> },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "prefs", label: "Notification Preferences", icon: Settings, content: <DemoPlaceholder title="Preferences" lines={["Email, push, WhatsApp — choose channels per event type."]} /> },
      { key: "settings", label: "Account Details", icon: Settings, content: <DemoPlaceholder title="Account" lines={["Plan, billing, team members, API keys, language preference."]} /> },
    ],
  },
];

export function DemoBusinessView() {
  return (
    <DemoShell
      portalLabel="Business"
      portalAccent="business"
      user={{ name: "Palm Hills Developments", subtitle: "Verified · 1,247 reviews" }}
      groups={groups}
      defaultKey="overview"
      sidebarTourId="biz-sidebar"
    />
  );
}
