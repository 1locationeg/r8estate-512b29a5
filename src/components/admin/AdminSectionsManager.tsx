import { useEffect, useMemo, useState } from "react";
import { Layout, Loader2, Eye, EyeOff, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { HomepageSection } from "@/hooks/useHomepageSections";

const PHASES = [
  { value: "always", label: "Always on" },
  { value: "pro_gtm", label: "Phase 1 — Pro GTM" },
  { value: "phase_2", label: "Phase 2" },
  { value: "phase_3", label: "Phase 3" },
];

const AUDIENCES = [
  { value: "all", label: "All" },
  { value: "professional", label: "Professionals" },
  { value: "buyer", label: "Buyers" },
  { value: "business", label: "Businesses" },
];

export default function AdminSectionsManager() {
  const [rows, setRows] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [presetBusy, setPresetBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as HomepageSection[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRow = async (row: HomepageSection, patch: Partial<HomepageSection>) => {
    setSavingKey(row.key);
    const { error } = await supabase
      .from("homepage_sections")
      .update(patch)
      .eq("id", row.id);
    setSavingKey(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
  };

  const applyPreset = async (preset: "pro_gtm" | "buyer_default" | "full_launch") => {
    setPresetBusy(preset);
    let updates: Array<{ id: string; is_visible: boolean }> = [];
    if (preset === "pro_gtm") {
      updates = rows.map((r) => ({
        id: r.id,
        is_visible: r.phase === "pro_gtm" || r.phase === "always",
      }));
    } else if (preset === "buyer_default") {
      updates = rows.map((r) => ({
        id: r.id,
        is_visible: r.phase !== "pro_gtm" && r.phase !== "phase_3",
      }));
    } else {
      updates = rows.map((r) => ({ id: r.id, is_visible: true }));
    }
    for (const u of updates) {
      await supabase.from("homepage_sections").update({ is_visible: u.is_visible }).eq("id", u.id);
    }
    setPresetBusy(null);
    toast.success(`Applied ${preset.replace("_", " ")} preset`);
    load();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, HomepageSection[]>();
    for (const r of rows) {
      if (!map.has(r.phase)) map.set(r.phase, []);
      map.get(r.phase)!.push(r);
    }
    return map;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layout className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Homepage Sections</h1>
          <p className="text-sm text-muted-foreground">
            Toggle sections on or off as you cascade your go-to-market phases.
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">Quick presets</div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!!presetBusy}
            onClick={() => applyPreset("pro_gtm")}
          >
            {presetBusy === "pro_gtm" && <Loader2 className="w-3 h-3 me-2 animate-spin" />}
            Pro GTM only
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!presetBusy}
            onClick={() => applyPreset("buyer_default")}
          >
            Buyer default
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!presetBusy}
            onClick={() => applyPreset("full_launch")}
          >
            Full launch (all on)
          </Button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="ms-auto text-xs text-primary hover:underline self-center"
          >
            Preview homepage →
          </a>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin me-2" /> Loading sections…
        </div>
      ) : (
        <div className="space-y-6">
          {PHASES.map((phase) => {
            const items = grouped.get(phase.value) ?? [];
            if (!items.length) return null;
            return (
              <Card key={phase.value} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{phase.label}</div>
                  <Badge variant="outline">{items.length} sections</Badge>
                </div>
                <div className="divide-y">
                  {items.map((row) => (
                    <div key={row.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        {row.is_visible ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{row.label}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{row.key}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Audience</Label>
                        <Select
                          value={row.audience}
                          onValueChange={(v) => updateRow(row, { audience: v })}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIENCES.map((a) => (
                              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Order</Label>
                        <Input
                          type="number"
                          className="h-8 w-20"
                          value={row.sort_order}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, sort_order: Number(e.target.value) } : r,
                              ),
                            )
                          }
                          onBlur={(e) =>
                            updateRow(row, { sort_order: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div className="flex items-center gap-2 ms-auto">
                        <Switch
                          checked={row.is_visible}
                          onCheckedChange={(checked) => updateRow(row, { is_visible: checked })}
                          disabled={savingKey === row.key}
                        />
                        <span className="text-xs w-16">
                          {row.is_visible ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
        <div className="font-semibold text-foreground flex items-center gap-1">
          <Save className="w-3 h-3" /> Tips
        </div>
        <div>• Changes are saved instantly and propagate live to every visitor.</div>
        <div>• "Pro GTM only" preset hides every Buyer section so the home page becomes a landing page for Real Estate Professionals.</div>
        <div>• Re-enable Phase 2 / Phase 3 sections after the first 100 Founder Members claim their Trust Page.</div>
      </Card>
    </div>
  );
}