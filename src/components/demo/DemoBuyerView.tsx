import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Bookmark, Trophy, Bell, MessageSquare, TrendingUp, Shield, FileCheck, Users } from "lucide-react";
import { toast } from "sonner";

const block = () => toast.info("Sign up free to use this on the real platform →", { action: { label: "Sign up", onClick: () => (window.location.href = "/auth") } });

export function DemoBuyerView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <Card className="p-3 space-y-1 sticky top-24">
          {[
            { icon: TrendingUp, label: "Overview", active: true },
            { icon: Heart, label: "Followed Developers" },
            { icon: Bookmark, label: "Saved Projects" },
            { icon: Star, label: "My Reviews" },
            { icon: Trophy, label: "Rewards & Tier" },
            { icon: Bell, label: "Notifications" },
            { icon: MessageSquare, label: "Messages" },
            { icon: FileCheck, label: "Contract Check" },
          ].map((it) => (
            <button
              key={it.label}
              data-tour={`buyer-nav-${it.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              onClick={block}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-start transition ${
                it.active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
              }`}
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </button>
          ))}
        </Card>
      </aside>

      <div className="space-y-4 min-w-0">
        {/* Hero */}
        <Card data-tour="buyer-hero" className="p-5 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h2 className="text-2xl font-bold">Ahmed Hassan</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-amber-500 hover:bg-amber-500">🥈 Silver Reviewer</Badge>
                <Badge variant="outline">3 reviews</Badge>
                <Badge variant="outline">2,450 pts</Badge>
              </div>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">Journey progress</p>
              <div className="w-40">
                <Progress value={65} className="h-2 mt-1" />
              </div>
              <p className="text-xs mt-1 font-semibold">65% to Gold</p>
            </div>
          </div>
        </Card>

        {/* KPI cards */}
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

        {/* Trust insights */}
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

        {/* Quick actions */}
        <Card data-tour="buyer-actions" className="p-4">
          <h3 className="font-bold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Write a Review", "Compare Developers", "Contract Check", "Deal Watch"].map((a) => (
              <Button key={a} variant="outline" onClick={block}>{a}</Button>
            ))}
          </div>
        </Card>

        {/* Followed list */}
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
    </div>
  );
}