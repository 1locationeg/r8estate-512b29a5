import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Upload, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewRichEditor } from '@/components/ReviewRichEditor';

const DEFAULT_DESCRIPTION =
  'R8ESTATE professional trust page — showcasing real client reviews, expertise, achievements, certifications, and trusted off-plan real estate experience.';

type Pro = { slug: string; full_name: string; avatar_url: string | null; cover_url?: string | null };
type Override = {
  id?: string;
  slug: string;
  image_url: string | null;
  title: string | null;
  description: string | null;
  body_html: string | null;
  enabled: boolean;
};

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

function shareUrl(slug: string) {
  return projectId
    ? `https://${projectId}.supabase.co/functions/v1/og-professional?slug=${encodeURIComponent(slug)}`
    : `https://meter.r8estate.com/pro/${slug}`;
}

export default function SharePreviewManager() {
  const [pros, setPros] = useState<Pro[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ pro: Pro; override: Override } | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: proRows }, { data: ovRows }] = await Promise.all([
      supabase.rpc('search_professionals', { _q: '' }),
      supabase.from('og_overrides').select('*'),
    ]);
    setPros((proRows as Pro[]) || []);
    const map: Record<string, Override> = {};
    (ovRows || []).forEach((r: any) => { map[r.slug] = r; });
    setOverrides(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => pros.filter(p => !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())),
    [pros, search],
  );

  const openEditor = (pro: Pro) => {
    const existing = overrides[pro.slug];
    setEditing({
      pro,
      override: existing ?? {
        slug: pro.slug,
        image_url: null,
        title: null,
        description: DEFAULT_DESCRIPTION,
        body_html: null,
        enabled: true,
      },
    });
  };

  const save = async () => {
    if (!editing) return;
    const { override } = editing;
    const { error } = await supabase
      .from('og_overrides')
      .upsert(
        {
          slug: override.slug,
          image_url: override.image_url,
          title: override.title,
          description: override.description,
          body_html: override.body_html,
          enabled: override.enabled,
        },
        { onConflict: 'slug' },
      );
    if (error) { toast.error(error.message); return; }
    toast.success('Share preview saved');
    setEditing(null);
    load();
  };

  const remove = async (slug: string) => {
    if (!confirm('Reset preview to default for this professional?')) return;
    const { error } = await supabase.from('og_overrides').delete().eq('slug', slug);
    if (error) { toast.error(error.message); return; }
    toast.success('Reset to default');
    load();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${editing.pro.slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('og-professional-assets')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from('og-professional-assets').getPublicUrl(path);
    setEditing({ ...editing, override: { ...editing.override, image_url: data.publicUrl } });
    toast.success('Image uploaded');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Trust Page Share Previews</h1>
        <p className="text-sm text-muted-foreground">
          Customize how each professional's <code>/pro/:slug</code> link looks when shared on WhatsApp, LinkedIn, or Facebook.
          By default the cover photo + standard tagline are used. Override below to push offers or marketing campaigns.
        </p>
      </div>

      <Input
        placeholder="Search by name or slug…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((pro) => {
            const ov = overrides[pro.slug];
            return (
              <Card key={pro.slug} className="p-3 flex items-center gap-3">
                {ov?.image_url ? (
                  <img src={ov.image_url} alt="" className="w-16 h-10 object-cover rounded" />
                ) : (
                  <div className="w-16 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{pro.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">/pro/{pro.slug}</div>
                </div>
                <div className="text-xs">
                  {ov ? (
                    <span className={ov.enabled ? 'text-trust-excellent' : 'text-muted-foreground'}>
                      {ov.enabled ? 'Custom · Active' : 'Custom · Off'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Default</span>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => openEditor(pro)}>
                  <Pencil className="w-3 h-3 me-1" /> Edit
                </Button>
                {ov && (
                  <Button size="sm" variant="ghost" onClick={() => remove(pro.slug)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Share Preview — {editing?.pro.full_name}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Enabled</Label>
                  <p className="text-xs text-muted-foreground">Off = falls back to default cover + tagline</p>
                </div>
                <Switch
                  checked={editing.override.enabled}
                  onCheckedChange={(v) => setEditing({ ...editing, override: { ...editing.override, enabled: v } })}
                />
              </div>

              <div>
                <Label>Preview image (recommended 1200×630)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    placeholder="https://… or upload"
                    value={editing.override.image_url ?? ''}
                    onChange={(e) => setEditing({ ...editing, override: { ...editing.override, image_url: e.target.value || null } })}
                  />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                    <Button type="button" variant="outline" size="sm" asChild><span><Upload className="w-3 h-3 me-1" /> Upload</span></Button>
                  </label>
                </div>
                {editing.override.image_url && (
                  <img src={editing.override.image_url} alt="" className="mt-2 max-h-40 rounded border" />
                )}
              </div>

              <div>
                <Label>Title (optional)</Label>
                <Input
                  placeholder={`${editing.pro.full_name} — R8ESTATE Trust Page`}
                  value={editing.override.title ?? ''}
                  onChange={(e) => setEditing({ ...editing, override: { ...editing.override, title: e.target.value || null } })}
                />
              </div>

              <div>
                <Label>Description (short, for WhatsApp/LinkedIn)</Label>
                <Textarea
                  rows={3}
                  value={editing.override.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, override: { ...editing.override, description: e.target.value || null } })}
                />
              </div>

              <div>
                <Label>Rich body (offers, links, formatting)</Label>
                <ReviewRichEditor
                  content={editing.override.body_html ?? ''}
                  onChange={(html) => setEditing({ ...editing, override: { ...editing.override, body_html: html || null } })}
                  placeholder="Add offers, marketing copy, links…"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">Used as fallback description when the short field is empty.</p>
              </div>

              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="text-xs font-medium mb-1">Share URL</div>
                <code className="text-xs break-all">{shareUrl(editing.pro.slug)}</code>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}