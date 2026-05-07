import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, Star, AlertTriangle, ShieldCheck, FileText, BarChart3, Activity, Flag, Settings } from "lucide-react";
import { toast } from "sonner";

const block = () => toast.info("Sign up free — admin actions are protected →", { action: { label: "Sign up", onClick: () => (window.location.href = "/auth") } });

export function DemoAdminView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      <aside className="hidden lg:block">
        <Card className="p-3 space-y-1 sticky top-24">
          {[
            { icon: BarChart3, label: "Overview", active: true },
            { icon: Users, label: "Users" },
            { icon: Building2, label: "Businesses" },
            { icon: ShieldCheck, label: "Verifications" },
            { icon: Flag, label: "Flagged Content" },
            { icon: Star, label: "Reviews Moderation" },
            { icon: FileText, label: "Audit Logs" },
            { icon: Settings, label: "Platform Settings" },
          ].map((it) => (
            <button key={it.label} onClick={block} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-start transition ${it.active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
              <it.icon className="w-4 h-4" />{it.label}
            </button>
          ))}
        </Card>
      </aside>

      <div className="space-y-4 min-w-0">
        <Card data-tour="admin-hero" className="p-5 bg-gradient-to-br from-primary/10 via-background to-rose-500/10 border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Admin Console</p>
              <h2 className="text-2xl font-bold">Platform Health</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-600 hover:bg-emerald-600 flex items-center gap-1"><Activity className="w-3 h-3" /> All systems healthy</Badge>
                <Badge variant="outline">Last sync 2m ago</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div data-tour="admin-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: "24,812", icon: Users, c: "text-blue-500" },
            { label: "Businesses", value: "1,540", icon: Building2, c: "text-primary" },
            { label: "Reviews", value: "48,210", icon: Star, c: "text-amber-500" },
            { label: "Pending Flags", value: "17", icon: AlertTriangle, c: "text-rose-500" },
          ].map((k) => (
            <Card key={k.label} className="p-3">
              <k.icon className={`w-5 h-5 ${k.c}`} />
              <p className="text-2xl font-bold mt-1">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </Card>
          ))}
        </div>

        <Card data-tour="admin-verifications" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verification Queue</h3>
            <Badge variant="secondary">8 pending</Badge>
          </div>
          <div className="space-y-2">
            {[
              { u: "Mona Adel", t: "Buyer KYC — Tier 2", time: "12m ago" },
              { u: "SODIC Egypt", t: "Business — License upload", time: "1h ago" },
              { u: "Ali Mostafa", t: "Buyer KYC — Tier 1", time: "3h ago" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <p className="font-semibold text-sm">{r.u}</p>
                  <p className="text-xs text-muted-foreground">{r.t} · {r.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={block}>Reject</Button>
                  <Button size="sm" onClick={block}>Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card data-tour="admin-flagged" className="p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-rose-500" /> Flagged Content</h3>
          <div className="space-y-2">
            {[
              { t: "Review on Mountain View flagged: profanity", sev: "high" },
              { t: "Comment in Community flagged: spam link", sev: "med" },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <p className="text-sm">{f.t}</p>
                <Badge className={f.sev === "high" ? "bg-rose-600 hover:bg-rose-600" : "bg-amber-500 hover:bg-amber-500"}>{f.sev}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}