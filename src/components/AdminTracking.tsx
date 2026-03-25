import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface TrackerDef {
  enabledKey: string;
  idKey: string;
  label: string;
  description: string;
  idPlaceholder: string;
  idLabel: string;
  icon: React.ReactNode;
  color: string;
}

const TRACKER_DEFS: TrackerDef[] = [
  {
    enabledKey: "ga4_enabled",
    idKey: "ga4_id",
    label: "Google Analytics 4",
    description: "Page views, events, and audience analytics",
    idPlaceholder: "G-XXXXXXXXXX",
    idLabel: "Measurement ID",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-orange-500",
  },
  {
    enabledKey: "meta_pixel_enabled",
    idKey: "meta_pixel_id",
    label: "Meta Pixel",
    description: "Facebook & Instagram ad conversion tracking",
    idPlaceholder: "123456789012345",
    idLabel: "Pixel ID",
    icon: <Eye className="w-5 h-5" />,
    color: "text-blue-500",
  },
  {
    enabledKey: "hotjar_enabled",
    idKey: "hotjar_id",
    label: "Hotjar",
    description: "Heatmaps, recordings, and feedback polls",
    idPlaceholder: "1234567",
    idLabel: "Site ID",
    icon: <Activity className="w-5 h-5" />,
    color: "text-red-500",
  },
  {
    enabledKey: "clarity_enabled",
    idKey: "clarity_id",
    label: "Microsoft Clarity",
    description: "Free session replays & heatmaps",
    idPlaceholder: "abcdefghij",
    idLabel: "Project ID",
    icon: <Eye className="w-5 h-5" />,
    color: "text-purple-500",
  },
  {
    enabledKey: "mouseflow_enabled",
    idKey: "mouseflow_id",
    label: "Mouseflow",
    description: "Session replay & heatmap tracking",
    idPlaceholder: "d6662369-8cb2-4b3a-89c0-c6cc59cc07f3",
    idLabel: "Project ID",
    icon: <Activity className="w-5 h-5" />,
    color: "text-green-500",
  },
];

export const AdminTracking = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const keys = TRACKER_DEFS.flatMap((t) => [t.enabledKey, t.idKey]);
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", keys);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => (map[r.key] = r.value));
        setSettings(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const upsert = async (key: string, value: string) => {
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key, value }, { onConflict: "key" });
    if (error) {
      toast.error("Failed to save");
      return false;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
    return true;
  };

  const toggleTracker = async (def: TrackerDef, val: boolean) => {
    setSaving(def.enabledKey);
    const ok = await upsert(def.enabledKey, val ? "true" : "false");
    if (ok) toast.success(val ? `${def.label} enabled` : `${def.label} disabled`);
    setSaving(null);
  };

  const saveId = async (def: TrackerDef, id: string) => {
    setSaving(def.idKey);
    const ok = await upsert(def.idKey, id);
    if (ok) toast.success(`${def.label} ID saved`);
    setSaving(null);
  };

  const removeTracker = async (def: TrackerDef) => {
    setSaving(def.enabledKey);
    await supabase.from("platform_settings").delete().eq("key", def.enabledKey);
    await supabase.from("platform_settings").delete().eq("key", def.idKey);
    setSettings((prev) => {
      const next = { ...prev };
      delete next[def.enabledKey];
      delete next[def.idKey];
      return next;
    });
    toast.success(`${def.label} removed`);
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Tracking & Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Manage all tracking scripts from one place. Changes take effect on next page load.
        </p>
      </div>

      <div className="grid gap-4">
        {TRACKER_DEFS.map((def) => {
          const enabled = settings[def.enabledKey] === "true";
          const currentId = settings[def.idKey] || "";

          return (
            <Card key={def.enabledKey}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className={def.color}>{def.icon}</span>
                    {def.label}
                    {enabled && currentId && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-600">ACTIVE</Badge>
                    )}
                    {enabled && !currentId && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">NO ID SET</Badge>
                    )}
                  </CardTitle>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(val) => toggleTracker(def, val)}
                    disabled={saving === def.enabledKey}
                  />
                </div>
                <CardDescription className="text-xs">{def.description}</CardDescription>
              </CardHeader>
              {enabled && (
                <CardContent className="pt-0 space-y-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">{def.idLabel}</Label>
                      <Input
                        placeholder={def.idPlaceholder}
                        value={currentId}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, [def.idKey]: e.target.value }))
                        }
                        className="h-8 text-sm font-mono"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={saving === def.idKey}
                      onClick={() => saveId(def, currentId)}
                    >
                      {saving === def.idKey ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive text-xs h-7 px-2"
                    onClick={() => removeTracker(def)}
                  >
                    <Trash2 className="w-3 h-3 me-1" />
                    Remove
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTracking;
