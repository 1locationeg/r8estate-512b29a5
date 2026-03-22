import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AdminMouseflow = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "mouseflow_enabled")
        .maybeSingle();
      setEnabled(data?.value === "true");
      setLoading(false);
    };
    fetch();
  }, []);

  const toggle = async (val: boolean) => {
    setEnabled(val);
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key: "mouseflow_enabled", value: val ? "true" : "false" }, { onConflict: "key" });
    if (error) {
      toast.error("Failed to update");
      setEnabled(!val);
    } else {
      toast.success(val ? "Mouseflow enabled — tracking active on next page load" : "Mouseflow disabled");
    }
  };

  const remove = async () => {
    await supabase.from("platform_settings").delete().eq("key", "mouseflow_enabled");
    setEnabled(false);
    toast.success("Mouseflow tracking removed");
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Mouseflow Analytics
        </CardTitle>
        <CardDescription>
          Session replay & heatmap tracking. Toggle on/off without code changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="mf-toggle" className="font-medium">Enable Mouseflow Tracking</Label>
          <Switch id="mf-toggle" checked={enabled} onCheckedChange={toggle} />
        </div>
        <p className="text-xs text-muted-foreground">
          When enabled, Mouseflow records user sessions for analysis. Changes take effect on the next page load.
        </p>
        <Button variant="outline" size="sm" className="text-destructive" onClick={remove}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Remove Mouseflow entirely
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminMouseflow;
