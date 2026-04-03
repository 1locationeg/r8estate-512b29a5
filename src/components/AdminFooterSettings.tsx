import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

const PLATFORMS = ["facebook", "x", "linkedin", "youtube", "instagram", "tiktok", "threads", "pinterest"];

type SocialLink = { platform: string; url: string; enabled: boolean };

const AdminFooterSettings = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "footer_social_links")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try { setLinks(JSON.parse(data.value)); } catch {}
        }
        setLoading(false);
      });
  }, []);

  const addLink = () => {
    const usedPlatforms = links.map((l) => l.platform);
    const next = PLATFORMS.find((p) => !usedPlatforms.includes(p)) || PLATFORMS[0];
    setLinks([...links, { platform: next, url: "", enabled: true }]);
  };

  const updateLink = (i: number, field: keyof SocialLink, value: any) => {
    const updated = [...links];
    (updated[i] as any)[field] = value;
    setLinks(updated);
  };

  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    const jsonValue = JSON.stringify(links);

    const { data: existing } = await supabase
      .from("platform_settings")
      .select("id")
      .eq("key", "footer_social_links")
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("platform_settings")
        .update({ value: jsonValue, updated_at: new Date().toISOString() })
        .eq("key", "footer_social_links"));
    } else {
      ({ error } = await supabase
        .from("platform_settings")
        .insert({ key: "footer_social_links", value: jsonValue }));
    }

    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Footer social links saved!");
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Footer Social Links</h2>
          <p className="text-sm text-muted-foreground">Manage social media icons shown in the website footer.</p>
        </div>
        <Button onClick={addLink} size="sm" variant="outline">
          <Plus className="w-4 h-4 me-1" /> Add
        </Button>
      </div>

      {links.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No social links configured yet. Click "Add" to get started.</p>
      )}

      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <select
              value={link.platform}
              onChange={(e) => updateLink(i, "platform", e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1.5 text-sm text-foreground min-w-[120px]"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <Input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            <Switch
              checked={link.enabled}
              onCheckedChange={(v) => updateLink(i, "enabled", v)}
            />
            <Button variant="ghost" size="icon" onClick={() => removeLink(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Save className="w-4 h-4 me-2" />}
        Save Changes
      </Button>
    </div>
  );
};

export default AdminFooterSettings;
