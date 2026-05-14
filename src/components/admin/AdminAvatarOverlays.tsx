import { useEffect, useMemo, useState } from 'react';
import { Gift, Image as ImageIcon, Loader2, Plus, Sparkles, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AvatarWithOverlay } from '@/components/AvatarWithOverlay';
import { generateAvatar } from '@/lib/avatarUtils';
import { toast } from 'sonner';
import type { AvatarAudience, AvatarOverlay, AvatarOverlayPosition } from '@/contexts/AvatarOverlayContext';

const audiences: Array<{ value: AvatarAudience; label: string }> = [
  { value: 'all', label: 'All users' },
  { value: 'buyers', label: 'Buyers' },
  { value: 'businesses', label: 'Businesses' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'admins', label: 'Admins' },
];

const positions: Array<{ value: AvatarOverlayPosition; label: string }> = [
  { value: 'bottom-end', label: 'Bottom end' },
  { value: 'bottom-start', label: 'Bottom start' },
  { value: 'top-end', label: 'Top end' },
  { value: 'top-start', label: 'Top start' },
  { value: 'center', label: 'Center' },
];

const blankOverlay = (): Partial<AvatarOverlay> => ({
  name: '',
  icon_url: '',
  audience: 'all',
  position: 'bottom-end',
  size_percent: 38,
  start_at: null,
  end_at: null,
  is_active: true,
});

const toDateInput = (value?: string | null) => value ? new Date(value).toISOString().slice(0, 10) : '';
const fromDateInput = (value: string, endOfDay = false) => value ? `${value}T${endOfDay ? '23:59:59' : '00:00:00'}.000Z` : null;

export default function AdminAvatarOverlays() {
  const [overlays, setOverlays] = useState<AvatarOverlay[]>([]);
  const [draft, setDraft] = useState<Partial<AvatarOverlay>>(blankOverlay());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewOverlay = useMemo(() => ({
    id: draft.id || 'preview',
    name: draft.name || 'Preview',
    icon_url: draft.icon_url || '',
    audience: (draft.audience || 'all') as AvatarAudience,
    position: (draft.position || 'bottom-end') as AvatarOverlayPosition,
    size_percent: Number(draft.size_percent || 38),
    start_at: draft.start_at || null,
    end_at: draft.end_at || null,
    is_active: draft.is_active ?? true,
  }), [draft]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('avatar_overlays')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setOverlays((data || []) as AvatarOverlay[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const uploadIcon = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Choose a PNG, SVG, WEBP, or JPG image'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Icon must be under 2MB'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeName = (draft.name || 'overlay').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'overlay';
      const path = `${safeName}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatar-overlays').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('avatar-overlays').getPublicUrl(path);
      setDraft((prev) => ({ ...prev, icon_url: data.publicUrl }));
      toast.success('Overlay icon uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft.name?.trim()) { toast.error('Add a campaign name'); return; }
    if (!draft.icon_url?.trim()) { toast.error('Upload or paste an icon URL'); return; }
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        icon_url: draft.icon_url.trim(),
        audience: draft.audience || 'all',
        position: draft.position || 'bottom-end',
        size_percent: Math.max(16, Math.min(80, Number(draft.size_percent || 38))),
        start_at: draft.start_at || null,
        end_at: draft.end_at || null,
        is_active: draft.is_active ?? true,
      };
      const query = (supabase as any).from('avatar_overlays');
      const { error } = draft.id ? await query.update(payload).eq('id', draft.id) : await query.insert(payload);
      if (error) throw error;
      toast.success(draft.id ? 'Overlay updated' : 'Overlay created');
      setDraft(blankOverlay());
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (overlay: AvatarOverlay) => {
    if (!confirm(`Delete ${overlay.name}?`)) return;
    const { error } = await (supabase as any).from('avatar_overlays').delete().eq('id', overlay.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Overlay deleted');
    load();
  };

  const toggle = async (overlay: AvatarOverlay, isActive: boolean) => {
    const { error } = await (supabase as any).from('avatar_overlays').update({ is_active: isActive }).eq('id', overlay.id);
    if (error) { toast.error(error.message); return; }
    setOverlays((items) => items.map((item) => item.id === overlay.id ? { ...item, is_active: isActive } : item));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Avatar Overlay Manager</h1>
          <p className="text-sm text-muted-foreground">Run seasonal avatar badges like snow, hearts, launch icons, and trust campaigns.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setDraft(blankOverlay())}>
          <Plus className="h-4 w-4" /> New overlay
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Campaign setup</h2>
              <p className="text-xs text-muted-foreground">Upload a transparent PNG/SVG for best results.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Campaign name</Label>
              <Input value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Christmas snow" />
            </div>

            <div>
              <Label>Icon</Label>
              <div className="mt-1 flex gap-2">
                <Input value={draft.icon_url || ''} onChange={(e) => setDraft({ ...draft, icon_url: e.target.value })} placeholder="https://…" />
                <label className="shrink-0 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadIcon(e.target.files[0])} />
                  <Button type="button" variant="outline" asChild disabled={uploading}>
                    <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Audience</Label>
                <Select value={draft.audience || 'all'} onValueChange={(value) => setDraft({ ...draft, audience: value as AvatarAudience })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{audiences.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Position</Label>
                <Select value={draft.position || 'bottom-end'} onValueChange={(value) => setDraft({ ...draft, position: value as AvatarOverlayPosition })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{positions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Badge size: {draft.size_percent || 38}%</Label>
              <Input type="range" min="16" max="80" value={draft.size_percent || 38} onChange={(e) => setDraft({ ...draft, size_percent: Number(e.target.value) })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input type="date" value={toDateInput(draft.start_at)} onChange={(e) => setDraft({ ...draft, start_at: fromDateInput(e.target.value) })} />
              </div>
              <div>
                <Label>End date</Label>
                <Input type="date" value={toDateInput(draft.end_at)} onChange={(e) => setDraft({ ...draft, end_at: fromDateInput(e.target.value, true) })} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Turn off to hide instantly.</p>
              </div>
              <Switch checked={draft.is_active ?? true} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} />
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
              <AvatarWithOverlay
                src={generateAvatar('R8 Estate', 'reviewer')}
                alt="Overlay preview"
                overlay={previewOverlay}
                className="mx-auto h-24 w-24 rounded-full"
                fallback="R8"
                fallbackClassName="bg-primary text-primary-foreground font-bold"
              />
              <p className="mt-3 text-xs text-muted-foreground">Preview on a user avatar</p>
            </div>

            <Button className="w-full gap-2" onClick={save} disabled={saving || uploading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              {draft.id ? 'Update overlay' : 'Create overlay'}
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading overlays…</div>
          ) : overlays.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              <ImageIcon className="mx-auto mb-2 h-8 w-8" /> No overlay campaigns yet.
            </Card>
          ) : overlays.map((overlay) => (
            <Card key={overlay.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
              <AvatarWithOverlay
                src={generateAvatar(overlay.name, 'reviewer')}
                alt={overlay.name}
                overlay={overlay}
                className="h-16 w-16 rounded-full"
                fallback={overlay.name.charAt(0)}
                fallbackClassName="bg-secondary text-secondary-foreground font-bold"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{overlay.name}</h3>
                  <Badge variant={overlay.is_active ? 'default' : 'secondary'}>{overlay.is_active ? 'Active' : 'Off'}</Badge>
                  <Badge variant="outline">{audiences.find((a) => a.value === overlay.audience)?.label || overlay.audience}</Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {positions.find((p) => p.value === overlay.position)?.label} · {overlay.size_percent}% · {toDateInput(overlay.start_at) || 'Any start'} → {toDateInput(overlay.end_at) || 'No end'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={overlay.is_active} onCheckedChange={(v) => toggle(overlay, v)} />
                <Button variant="outline" size="sm" onClick={() => setDraft({ ...overlay })}>Edit</Button>
                <Button variant="ghost" size="icon" onClick={() => remove(overlay)} aria-label={`Delete ${overlay.name}`}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}