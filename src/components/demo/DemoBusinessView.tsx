import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Star, MessageSquare, TrendingUp, BarChart3, Users, Eye, Crown, Reply, Globe } from "lucide-react";
import { toast } from "sonner";

const block = () => toast.info("Sign up free to manage your business →", { action: { label: "Sign up", onClick: () => (window.location.href = "/auth") } });

export function DemoBusinessView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      <aside className="hidden lg:block">
        <Card className="p-3 space-y-1 sticky top-24">
          {[
            { icon: TrendingUp, label: "Overview", active: true },
            { icon: Star, label: "Reviews Inbox" },
            { icon: Reply, label: "Reply Center" },
            { icon: BarChart3, label: "Trust Analytics" },
            { icon: Users, label: "Lead Inbox" },
            { icon: Globe, label: "Widgets" },
            { icon: Building2, label: "Sub-Businesses" },
            { icon: Crown, label: "Upgrade Plan" },
          ].map((it) => (
            <button key={it.label} onClick={block} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-start transition ${it.active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
              <it.icon className="w-4 h-4" />{it.label}
            </button>
          ))}
        </Card>
      </aside>

      <div className="space-y-4 min-w-0">
        <Card data-tour="biz-hero" className="p-5 bg-gradient-to-br from-primary/10 via-background to-amber-500/10 border-primary/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Palm Hills Developments</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600">Verified</Badge>
                  <Badge variant="outline">Pro Plan</Badge>
                  <span className="flex items-center gap-1 text-amber-500 font-bold text-sm"><Star className="w-4 h-4 fill-amber-500" /> 4.6 / 5</span>
                </div>
              </div>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">Profile completeness</p>
              <div className="w-44"><Progress value={85} className="h-2 mt-1" /></div>
              <p className="text-xs mt-1 font-semibold">85% — add 2 more projects</p>
            </div>
          </div>
        </Card>

        <div data-tour="biz-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Reviews", value: "1,240", icon: Star, c: "text-amber-500" },
            { label: "New Leads", value: "38", icon: Users, c: "text-emerald-500" },
            { label: "Profile Views", value: "12.4k", icon: Eye, c: "text-blue-500" },
            { label: "Trust Score", value: "82", icon: TrendingUp, c: "text-primary" },
          ].map((k) => (
            <Card key={k.label} className="p-3">
              <k.icon className={`w-5 h-5 ${k.c}`} />
              <p className="text-2xl font-bold mt-1">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </Card>
          ))}
        </div>

        <Card data-tour="biz-reviews" className="p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Recent Reviews</h3>
          <div className="space-y-3">
            {[
              { u: "Ahmed H.", s: 5, t: "Smooth handover, exactly on schedule. Truly impressed.", v: true },
              { u: "Sara M.", s: 3, t: "Finishing quality dropped vs the showroom unit.", v: true },
              { u: "Khaled R.", s: 5, t: "Great communication from sales team throughout.", v: false },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{r.u}</p>
                    {r.v && <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">Contract Verified</Badge>}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: r.s }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-500" />)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.t}</p>
                <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs" onClick={block}><Reply className="w-3 h-3 me-1" /> Reply</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card data-tour="biz-upgrade" className="p-4 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-primary/5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /> Unlock Pro Insights</h3>
              <p className="text-sm text-muted-foreground mt-1">See competitor trust trends, AI sentiment breakdowns, and lead scoring.</p>
            </div>
            <Button onClick={block} className="bg-amber-500 hover:bg-amber-600 text-white">Upgrade</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}