// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2, Plus, Copy, Trash2, Edit, Smartphone, QrCode,
  Activity, ExternalLink, ShieldAlert, Info, Gift
} from 'lucide-react';

const DEST_LABELS: Record<string, string> = {
  profile: 'My Profile',
  review: 'Leave a Review',
  projects: 'My Projects',
  custom: 'Custom URL',
};

const PUBLIC_BASE = (typeof window !== 'undefined' ? window.location.origin : 'https://r8estate.com');

export default function BusinessNFC() {
  const { user } = useAuth();
  const { profile } = useBusinessProfile();
  const businessId = profile?.id;

  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [qrTag, setQrTag] = useState<any | null>(null);

  // form state
  const [label, setLabel] = useState('');
  const [destinationType, setDestinationType] = useState('profile');
  const [customUrl, setCustomUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTags = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from('nfc_tags')
      .select('*')
      .order('created_at', { ascending: false });
    if (businessId) query = query.eq('business_id', businessId);
    else query = query.eq('user_id', user.id);

    const { data, error } = await query;
    if (error) toast.error('Failed to load NFC tags');
    setTags(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTags(); }, [user?.id, businessId]);

  const resetForm = () => {
    setLabel('');
    setDestinationType('profile');
    setCustomUrl('');
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (tag: any) => {
    setEditingId(tag.id);
    setLabel(tag.label || '');
    setDestinationType(tag.destination_type || 'profile');
    setCustomUrl(tag.custom_url || '');
    setCreateOpen(true);
  };

  const validateCustomUrl = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.protocol !== 'https:') return 'Custom URL must use HTTPS.';
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname)) return 'IP addresses are not allowed.';
      const blocked = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'shorturl.at'];
      if (blocked.some(b => u.hostname.includes(b))) return 'URL shorteners are not allowed.';
      return null;
    } catch {
      return 'Invalid URL.';
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!label.trim()) { toast.error('Please enter a label'); return; }
    if (destinationType === 'custom') {
      if (!customUrl.trim()) { toast.error('Please enter the custom URL'); return; }
      const err = validateCustomUrl(customUrl.trim());
      if (err) { toast.error(err); return; }
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('nfc_tags').update({
          label: label.trim(),
          destination_type: destinationType,
          custom_url: destinationType === 'custom' ? customUrl.trim() : null,
        }).eq('id', editingId);
        if (error) throw error;
        toast.success(destinationType === 'custom'
          ? 'Tag updated. Custom URL is awaiting admin approval.'
          : 'Tag updated.');
      } else {
        const { error } = await supabase.from('nfc_tags').insert({
          user_id: user.id,
          business_id: businessId || null,
          label: label.trim(),
          destination_type: destinationType,
          custom_url: destinationType === 'custom' ? customUrl.trim() : null,
        });
        if (error) throw error;
        toast.success(destinationType === 'custom'
          ? 'Tag created. Custom URL is awaiting admin approval.'
          : 'NFC tag created!');
      }
      setCreateOpen(false);
      resetForm();
      fetchTags();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save tag');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (tag: any) => {
    const { error } = await supabase.from('nfc_tags')
      .update({ is_active: !tag.is_active })
      .eq('id', tag.id);
    if (error) toast.error('Failed to update');
    else { toast.success(tag.is_active ? 'Tag paused' : 'Tag activated'); fetchTags(); }
  };

  const deleteTag = async (tag: any) => {
    if (!confirm(`Delete "${tag.label}"? Existing physical chips will stop working.`)) return;
    const { error } = await supabase.from('nfc_tags').delete().eq('id', tag.id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Tag deleted'); fetchTags(); }
  };

  const copyLink = (code: string) => {
    const url = `${PUBLIC_BASE}/n/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  const totalTaps = useMemo(() => tags.reduce((s, t) => s + (t.tap_count || 0), 0), [tags]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary" /> NFC Tags
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Program physical NFC chips & cards that point customers to your trust profile.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" /> New NFC Tag</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Total Tags</div>
          <div className="text-2xl font-bold mt-1">{tags.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Active Tags</div>
          <div className="text-2xl font-bold mt-1">{tags.filter(t => t.is_active && !t.is_blocked).length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Total Taps</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />{totalTaps}
          </div>
        </CardContent></Card>
      </div>

      {/* How it works */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold">How NFC tags work</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>Buy blank NTAG213/215 stickers or cards (~5–10 EGP each, available on Amazon/AliExpress).</li>
                <li>Install the free <strong>NFC Tools</strong> app (iOS/Android).</li>
                <li>Open the app → "Write" → "Add a record" → URL/URI → paste your tag URL.</li>
                <li>Hold the chip to your phone — it's programmed.</li>
                <li>You can change the destination anytime here without reprinting.</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : tags.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No NFC tags yet. Create your first one.</p>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" /> New NFC Tag</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {tags.map(tag => {
            const url = `${PUBLIC_BASE}/n/${tag.tag_code}`;
            return (
              <Card key={tag.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{tag.label}</h3>
                        {tag.issued_by_admin && (
                          <Badge className="bg-primary/10 text-primary border-primary/30 gap-1">
                            <Gift className="w-3 h-3" /> Issued by R8ESTATE
                          </Badge>
                        )}
                        {tag.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                        {!tag.is_active && !tag.is_blocked && <Badge variant="outline">Paused</Badge>}
                        {tag.approval_status === 'pending_approval' && (
                          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300">Pending Approval</Badge>
                        )}
                        {tag.approval_status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Destination: <span className="font-medium">{DEST_LABELS[tag.destination_type]}</span>
                        {tag.destination_type === 'custom' && tag.custom_url && (
                          <span className="ms-1">→ {tag.custom_url}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">{url}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyLink(tag.tag_code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {tag.tap_count} taps
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Switch checked={tag.is_active} onCheckedChange={() => toggleActive(tag)} disabled={tag.is_blocked} />
                      <Button size="sm" variant="outline" onClick={() => setQrTag(tag)}>
                        <QrCode className="w-3 h-3 me-1" /> QR
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(tag)}>
                        <Edit className="w-3 h-3 me-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTag(tag)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit NFC Tag' : 'New NFC Tag'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                placeholder="e.g. Sales office reception, Mostafa's card"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={80}
              />
            </div>
            <div>
              <Label>Destination</Label>
              <Select value={destinationType} onValueChange={setDestinationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">My R8ESTATE Profile</SelectItem>
                  <SelectItem value="review">Leave a Review (frictionless)</SelectItem>
                  <SelectItem value="projects">My Projects Page</SelectItem>
                  <SelectItem value="custom">Custom URL (admin approval)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {destinationType === 'custom' && (
              <div className="space-y-2">
                <Label>Custom URL</Label>
                <Input
                  placeholder="https://example.com/landing"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-yellow-500/10 p-2 rounded">
                  <ShieldAlert className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                  <span>HTTPS only. Custom URLs require admin approval before activation. Visitors will see a confirmation screen before leaving R8ESTATE.</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Modal */}
      <Dialog open={!!qrTag} onOpenChange={(v) => !v && setQrTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code — {qrTag?.label}</DialogTitle>
          </DialogHeader>
          {qrTag && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={`${PUBLIC_BASE}/n/${qrTag.tag_code}`} size={220} />
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">{`${PUBLIC_BASE}/n/${qrTag.tag_code}`}</code>
              <p className="text-xs text-muted-foreground text-center">
                Print this QR alongside the NFC chip so users without NFC can still scan it.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
