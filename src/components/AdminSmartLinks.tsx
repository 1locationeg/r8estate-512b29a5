// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, ExternalLink, Trash2, BarChart3, Copy, ArrowLeft, Loader2, Link as LinkIcon, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

type SmartLink = {
  id: string;
  slug: string;
  destination_url: string;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  is_active: boolean;
  created_at: string;
  click_count?: number;
};

type LinkClick = {
  id: string;
  clicked_at: string;
  referrer_url: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent-foreground))', 'hsl(var(--muted-foreground))'];

const AdminSmartLinks = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<SmartLink | null>(null);
  const [clicks, setClicks] = useState<LinkClick[]>([]);
  const [clicksLoading, setClicksLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ slug: '', destination_url: '', og_title: '', og_description: '', og_image: '' });

  const fetchLinks = async () => {
    setLoading(true);
    const { data: linksData } = await supabase.from('smart_links').select('*').order('created_at', { ascending: false });
    if (linksData) {
      // Get click counts
      const linkIds = linksData.map((l: any) => l.id);
      const withCounts = await Promise.all(
        linksData.map(async (link: any) => {
          const { count } = await supabase.from('link_clicks').select('*', { count: 'exact', head: true }).eq('link_id', link.id);
          return { ...link, click_count: count || 0 };
        })
      );
      setLinks(withCounts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleCreate = async () => {
    if (!form.slug || !form.destination_url) { toast.error('Slug and destination URL are required'); return; }
    setCreating(true);
    const { error } = await supabase.from('smart_links').insert({
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      destination_url: form.destination_url,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      created_by: user?.id,
    });
    if (error) { toast.error(error.message); } else {
      toast.success('Smart Link created');
      setForm({ slug: '', destination_url: '', og_title: '', og_description: '', og_image: '' });
      setDialogOpen(false);
      fetchLinks();
    }
    setCreating(false);
  };

  const toggleActive = async (link: SmartLink) => {
    await supabase.from('smart_links').update({ is_active: !link.is_active }).eq('id', link.id);
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l));
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this smart link and all its click data?')) return;
    await supabase.from('smart_links').delete().eq('id', id);
    toast.success('Link deleted');
    setLinks(prev => prev.filter(l => l.id !== id));
    if (selectedLink?.id === id) setSelectedLink(null);
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/go/${slug}`);
    toast.success('Link copied!');
  };

  // Analytics detail view
  const openAnalytics = async (link: SmartLink) => {
    setSelectedLink(link);
    setClicksLoading(true);
    const { data } = await supabase
      .from('link_clicks')
      .select('*')
      .eq('link_id', link.id)
      .order('clicked_at', { ascending: false })
      .limit(500);
    setClicks(data || []);
    setClicksLoading(false);
  };

  // Chart data
  const clicksOverTime = useMemo(() => {
    if (!clicks.length) return [];
    const counts: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      counts[d.toISOString().slice(0, 10)] = 0;
    }
    clicks.forEach(c => {
      const day = c.clicked_at.slice(0, 10);
      if (counts[day] !== undefined) counts[day]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [clicks]);

  const deviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    clicks.forEach(c => { const t = c.device_type || 'unknown'; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [clicks]);

  const topReferrers = useMemo(() => {
    const map: Record<string, number> = {};
    clicks.forEach(c => {
      const r = c.referrer_url ? new URL(c.referrer_url).hostname : 'Direct';
      map[r] = (map[r] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([source, count]) => ({ source, count }));
  }, [clicks]);

  const browserBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    clicks.forEach(c => { const b = c.browser || 'Unknown'; map[b] = (map[b] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [clicks]);

  const deviceIcon = (type: string) => {
    if (type === 'mobile') return <Smartphone className="w-3.5 h-3.5" />;
    if (type === 'tablet') return <Tablet className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  if (selectedLink) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedLink(null)}>
            <ArrowLeft className="w-4 h-4 me-1" /> Back
          </Button>
          <h2 className="text-lg font-bold text-foreground">/{selectedLink.slug}</h2>
          <Badge variant={selectedLink.is_active ? 'default' : 'secondary'}>
            {selectedLink.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{clicks.length}</p>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{topReferrers.length}</p>
            <p className="text-xs text-muted-foreground">Unique Sources</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{deviceBreakdown.find(d => d.name === 'mobile')?.value || 0}</p>
            <p className="text-xs text-muted-foreground">Mobile Clicks</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{deviceBreakdown.find(d => d.name === 'desktop')?.value || 0}</p>
            <p className="text-xs text-muted-foreground">Desktop Clicks</p>
          </CardContent></Card>
        </div>

        {clicksLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : clicks.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No clicks yet</CardContent></Card>
        ) : (
          <>
            {/* Clicks over time */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Clicks Over Last 30 Days</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clicksOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={28} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Device breakdown */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Device Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {deviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top referrers */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Top Referrers</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {topReferrers.map(r => (
                      <div key={r.source} className="flex justify-between items-center">
                        <span className="text-xs text-foreground truncate max-w-[200px]">{r.source}</span>
                        <Badge variant="secondary" className="text-xs">{r.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Browser breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Browser Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {browserBreakdown.map(b => (
                    <Badge key={b.name} variant="outline" className="text-xs">{b.name}: {b.count}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent clicks */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Clicks</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Browser</TableHead>
                        <TableHead>Referrer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clicks.slice(0, 50).map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(c.clicked_at).toLocaleString()}</TableCell>
                          <TableCell><div className="flex items-center gap-1.5 text-xs">{deviceIcon(c.device_type || 'desktop')}{c.device_type}</div></TableCell>
                          <TableCell className="text-xs">{c.browser || '—'}</TableCell>
                          <TableCell className="text-xs truncate max-w-[200px]">{c.referrer_url || 'Direct'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* SEO Preview */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Social Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden max-w-md">
                  {selectedLink.og_image && (
                    <img src={selectedLink.og_image} alt="" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground">{selectedLink.og_title || selectedLink.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedLink.og_description || selectedLink.destination_url}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{window.location.host}/go/{selectedLink.slug}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Smart Links</h2>
          <p className="text-xs text-muted-foreground">Create trackable links with custom social previews</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 me-1" /> Create Link</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Smart Link</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground">Slug *</label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">{window.location.host}/go/</span>
                  <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="spring-promo" className="flex-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Destination URL *</label>
                <Input value={form.destination_url} onChange={e => setForm(p => ({ ...p, destination_url: e.target.value }))} placeholder="https://example.com" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">OG Title</label>
                <Input value={form.og_title} onChange={e => setForm(p => ({ ...p, og_title: e.target.value }))} placeholder="Social preview title" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">OG Description</label>
                <Textarea value={form.og_description} onChange={e => setForm(p => ({ ...p, og_description: e.target.value }))} placeholder="Social preview description" className="mt-1" rows={2} />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">OG Image URL</label>
                <Input value={form.og_image} onChange={e => setForm(p => ({ ...p, og_image: e.target.value }))} placeholder="https://..." className="mt-1" />
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : null} Create Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : links.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No smart links yet. Create your first one!</CardContent></Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map(link => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <button onClick={() => openAnalytics(link)} className="text-xs font-medium text-primary hover:underline">/go/{link.slug}</button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{link.destination_url}</TableCell>
                    <TableCell><Badge variant="secondary">{link.click_count}</Badge></TableCell>
                    <TableCell>
                      <Switch checked={link.is_active} onCheckedChange={() => toggleActive(link)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(link.slug)} title="Copy link">
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAnalytics(link)} title="Analytics">
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLink(link.id)} title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminSmartLinks;
