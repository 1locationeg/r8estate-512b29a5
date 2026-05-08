import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

export type DemoSection = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  content: ReactNode;
};

export type DemoNavGroup = {
  label: string;
  items: DemoSection[];
};

type Accent = "primary" | "business" | "admin";

const ACCENT_CLASSES: Record<Accent, { avatar: string; activeBg: string; activeText: string; activeBorder: string; iconText: string }> = {
  primary: {
    avatar: "bg-primary",
    activeBg: "bg-primary/10",
    activeText: "text-primary",
    activeBorder: "border-primary",
    iconText: "text-primary",
  },
  business: {
    avatar: "bg-emerald-600",
    activeBg: "bg-emerald-600/10",
    activeText: "text-emerald-700",
    activeBorder: "border-emerald-600",
    iconText: "text-emerald-700",
  },
  admin: {
    avatar: "bg-indigo-600",
    activeBg: "bg-indigo-600/10",
    activeText: "text-indigo-700",
    activeBorder: "border-indigo-600",
    iconText: "text-indigo-700",
  },
};

interface Props {
  portalLabel: string;
  portalAccent: Accent;
  user: { name: string; subtitle: string; avatar?: string };
  groups: DemoNavGroup[];
  defaultKey?: string;
  sidebarTourId?: string;
}

export function DemoShell({ portalLabel, portalAccent, user, groups, defaultKey, sidebarTourId }: Props) {
  const allItems = groups.flatMap((g) => g.items);
  const [active, setActive] = useState<string>(defaultKey || allItems[0]?.key);

  const activeItem = allItems.find((i) => i.key === active) || allItems[0];
  const ac = ACCENT_CLASSES[portalAccent];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
      {/* Sidebar */}
      <aside data-tour={sidebarTourId} className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-3">
          {/* Portal header */}
          <div className="flex items-center gap-2 px-2 pb-2 mb-2 border-b border-border">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", ac.avatar)}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.subtitle}</p>
            </div>
            <Badge variant="outline" className="text-[9px]">{portalLabel}</Badge>
          </div>

          {/* Demo notice */}
          <div className="px-2 pb-2 mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Eye className="w-3 h-3" /> Click any item — read-only preview
          </div>

          {/* Groups */}
          <nav className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pe-1">
            {groups.map((g) => (
              <div key={g.label}>
                {groups.length > 1 && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">{g.label}</p>
                )}
                <div className="space-y-0.5">
                  {g.items.map((item) => {
                    const isActive = item.key === active;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActive(item.key)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-start transition-all border-s-2",
                          isActive
                            ? cn(ac.activeBg, ac.activeText, ac.activeBorder)
                            : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="h-4 px-1 text-[9px]">{item.badge}</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </Card>
      </aside>

      {/* Active section */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{portalLabel} dashboard</p>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <activeItem.icon className={cn("w-5 h-5", ac.iconText)} />
              {activeItem.label}
            </h2>
          </div>
          <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 text-[10px]">PREVIEW</Badge>
        </div>
        <div key={activeItem.key}>{activeItem.content}</div>
      </div>
    </div>
  );
}

/* Mock dashboard panel: KPI strip + activity list, populated from `lines` */
export function DemoPlaceholder({ title, lines }: { title: string; lines: string[] }) {
  const seed = title.length;
  const kpis = [
    { l: "This week", v: 12 + (seed * 3) % 80, c: "text-primary" },
    { l: "Total", v: (140 + seed * 17).toLocaleString(), c: "text-emerald-600" },
    { l: "Pending", v: 1 + (seed % 9), c: "text-amber-600" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k) => (
          <Card key={k.l} className="p-3">
            <p className={cn("text-xl font-bold", k.c)}>{k.v}</p>
            <p className="text-[11px] text-muted-foreground">{k.l}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">{title}</h3>
          <Badge variant="outline" className="text-[10px]">{lines.length} items</Badge>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                {i + 1}
              </div>
              <p className="flex-1 text-sm">{l}</p>
              <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">Live</Badge>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-[11px] text-muted-foreground text-center">Read-only preview. Sign up free to interact.</p>
    </div>
  );
}
