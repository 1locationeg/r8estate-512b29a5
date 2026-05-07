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

interface Props {
  portalLabel: string;
  portalAccent: string; // e.g. "primary" | "amber-500" | "emerald-500"
  user: { name: string; subtitle: string; avatar?: string };
  groups: DemoNavGroup[];
  defaultKey?: string;
  sidebarTourId?: string;
}

export function DemoShell({ portalLabel, portalAccent, user, groups, defaultKey, sidebarTourId }: Props) {
  const allItems = groups.flatMap((g) => g.items);
  const [active, setActive] = useState<string>(defaultKey || allItems[0]?.key);

  const activeItem = allItems.find((i) => i.key === active) || allItems[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
      {/* Sidebar */}
      <aside data-tour={sidebarTourId} className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-3">
          {/* Portal header */}
          <div className="flex items-center gap-2 px-2 pb-2 mb-2 border-b border-border">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", `bg-${portalAccent}`)}>
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
                            ? `bg-${portalAccent}/10 text-${portalAccent} border-${portalAccent}`
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
              <activeItem.icon className={cn("w-5 h-5", `text-${portalAccent}`)} />
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

/* Helper: simple placeholder panel for sections we haven't deeply mocked */
export function DemoPlaceholder({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {lines.map((l, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            {l}
          </li>
        ))}
      </ul>
      <div className="pt-2 text-xs text-muted-foreground border-t border-border">
        This is a read-only preview. Sign up free to use the full feature.
      </div>
    </Card>
  );
}
