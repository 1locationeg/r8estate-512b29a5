import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Loader2, LayoutDashboard, Users, Building2, MessageSquare, 
  Shield, Settings, BarChart3, AlertTriangle, CheckCircle, 
  Ban, Eye, TrendingUp, Star, Sparkles, Megaphone, Phone, 
  Plus, Trash2, TestTube, ExternalLink
} from 'lucide-react';
import { developers, reviews } from '@/data/mockData';
import { getRatingColorClass } from '@/lib/ratingColors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminOverview = () => {
  const stats = [
    { icon: Users, label: 'Total Users', value: '12,847', status: 'success' as const },
    { icon: Building2, label: 'Verified Developers', value: '156', status: 'success' as const },
    { icon: MessageSquare, label: 'Pending Reviews', value: '23', status: 'warning' as const },
    { icon: AlertTriangle, label: 'Flagged Content', value: '5', status: 'error' as const },
  ];

  const statusColors = {
    success: { bg: 'bg-trust-excellent/10', text: 'text-trust-excellent' },
    warning: { bg: 'bg-accent/20', text: 'text-accent' },
    error: { bg: 'bg-brand-red/10', text: 'text-brand-red' },
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${statusColors[s.status].bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${statusColors[s.status].text}`} />
              </div>
              {s.status === 'success' && <CheckCircle className="w-4 h-4 text-trust-excellent" />}
              {s.status === 'warning' && <AlertTriangle className="w-4 h-4 text-accent" />}
              {s.status === 'error' && <AlertTriangle className="w-4 h-4 text-brand-red" />}
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <h3 className="text-lg font-semibold text-foreground mb-3">Pending Actions</h3>
      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-6">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">23 reviews pending moderation</p>
              <p className="text-xs text-muted-foreground">Flagged by users or system</p>
            </div>
          </div>
          <Button size="sm">Review</Button>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">7 developers awaiting verification</p>
              <p className="text-xs text-muted-foreground">New registration requests</p>
            </div>
          </div>
          <Button size="sm">Verify</Button>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-brand-red" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">5 flagged content items</p>
              <p className="text-xs text-muted-foreground">Reported for policy violations</p>
            </div>
          </div>
          <Button size="sm" variant="destructive">Review</Button>
        </div>
      </div>

      {/* Platform Activity */}
      <h3 className="text-lg font-semibold text-foreground mb-3">Recent Platform Activity</h3>
      <div className="bg-card border border-border rounded-xl p-6 h-48 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Activity charts coming soon</p>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const mockUsers = [
    { name: 'Ahmed Mostafa', email: 'ahmed@example.com', role: 'buyer', status: 'active', joined: '2024-01-15' },
    { name: 'Sara Mahmoud', email: 'sara@example.com', role: 'buyer', status: 'active', joined: '2024-01-10' },
    { name: 'Palm Hills Developments', email: 'admin@palmhills.com', role: 'developer', status: 'active', joined: '2023-06-01' },
    { name: 'Mohammed Hassan', email: 'mohammed@example.com', role: 'buyer', status: 'suspended', joined: '2024-01-05' },
    { name: 'Emaar Misr', email: 'admin@emaarmisr.com', role: 'developer', status: 'active', joined: '2023-07-01' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">User Management</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Joined</th>
                <th className="text-end px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((u) => (
                <tr key={u.email} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{u.name[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      u.role === 'developer' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      u.status === 'active' ? 'bg-trust-excellent/10 text-trust-excellent' : 'bg-brand-red/10 text-brand-red'
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost"><Eye className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost"><Ban className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDevelopers = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Developer Verification</h2>
    <div className="space-y-3">
      {developers.map((d) => (
        <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
              <img src={d.logo} alt={d.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-sm">{d.name}</p>
                {d.verified && <CheckCircle className="w-3.5 h-3.5 text-trust-excellent" />}
              </div>
              <p className="text-xs text-muted-foreground">{d.location} · {d.projectsCompleted} projects</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 me-3">
              <Star className={`w-3.5 h-3.5 ${getRatingColorClass(d.rating)}`} />
              <span className="text-sm font-bold text-foreground">{d.rating}</span>
            </div>
            {d.verified ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-trust-excellent/10 text-trust-excellent font-medium">Verified</span>
            ) : (
              <Button size="sm">Verify</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminReviewMod = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Review Moderation</h2>
    <div className="space-y-4">
      {reviews.slice(0, 6).map((r) => (
        <div key={r.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {r.avatar && <img src={r.avatar} alt={r.author} className="w-full h-full object-cover rounded-full" />}
                <AvatarFallback className="text-[10px]">{r.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{r.author}</p>
                <p className="text-[10px] text-muted-foreground">{r.project} · {r.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < r.rating ? getRatingColorClass(r.rating) : 'text-muted'}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{r.comment}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-trust-excellent hover:bg-trust-excellent/90 text-white"><CheckCircle className="w-3 h-3 me-1" /> Approve</Button>
            <Button size="sm" variant="destructive"><Ban className="w-3 h-3 me-1" /> Reject</Button>
            <Button size="sm" variant="outline"><Eye className="w-3 h-3 me-1" /> Flag</Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminAnalytics = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Platform Analytics</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'New Users (30d)', value: '1,247', icon: Users },
        { label: 'Reviews (30d)', value: '89', icon: MessageSquare },
        { label: 'Page Views', value: '45.2K', icon: Eye },
        { label: 'Growth Rate', value: '+12.5%', icon: TrendingUp },
      ].map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4">
          <s.icon className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
    <div className="bg-card border border-border rounded-xl p-8 h-64 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Detailed analytics coming soon</p>
      </div>
    </div>
  </div>
);

const AdminSpotlight = () => {
  const [featuredId, setFeaturedId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await supabase
        .from('platform_settings' as any)
        .select('value')
        .eq('key', 'featured_developer_id')
        .single() as { data: { value: string } | null };
      if (data?.value) setFeaturedId(data.value);
    };
    fetchSetting();
  }, []);

  const handleSave = async (devId: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('platform_settings' as any)
      .update({ value: devId, updated_at: new Date().toISOString() } as any)
      .eq('key', 'featured_developer_id');
    setSaving(false);
    if (error) {
      toast.error('Failed to update spotlight');
    } else {
      setFeaturedId(devId);
      toast.success('Spotlight updated successfully');
    }
  };

  const currentDev = developers.find(d => d.id === featuredId);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Spotlight Identity</h2>
      <p className="text-sm text-muted-foreground mb-6">Choose which developer is featured as the Spotlight Identity ad on the homepage.</p>

      {currentDev && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
            <img src={currentDev.logo} alt={currentDev.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Currently Featured</p>
            <p className="text-lg font-bold text-foreground truncate">{currentDev.name}</p>
          </div>
          <Sparkles className="w-5 h-5 text-accent shrink-0" />
        </div>
      )}

      <div className="space-y-3">
        {developers.map((d) => {
          const isActive = d.id === featuredId;
          return (
            <div key={d.id} className={`bg-card border rounded-xl p-4 flex items-center justify-between transition-all ${isActive ? 'border-accent ring-1 ring-accent/30' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden">
                  <img src={d.logo} alt={d.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.location} · Rating: {d.rating}</p>
                </div>
              </div>
              {isActive ? (
                <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-medium">Active</span>
              ) : (
                <Button size="sm" variant="outline" disabled={saving} onClick={() => handleSave(d.id)}>
                  Set as Spotlight
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    setSending(true);
    const { error } = await supabase.rpc('broadcast_notification' as any, {
      _type: 'announcement',
      _title: title.trim(),
      _message: message.trim(),
      _metadata: {},
    });
    setSending(false);
    if (error) {
      toast.error('Failed to send notification');
    } else {
      toast.success('Notification sent to all users!');
      setTitle('');
      setMessage('');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Send Notification</h2>
      <p className="text-sm text-muted-foreground mb-6">Broadcast an announcement to all platform users.</p>

      <div className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Feature Available!"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write your notification message..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <Button onClick={handleBroadcast} disabled={sending || !title.trim() || !message.trim()}>
          {sending ? 'Sending...' : 'Send to All Users'}
        </Button>
      </div>
    </div>
  );
};

const AdminWhatsApp = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [newReply, setNewReply] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: settings } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'whatsapp_quick_replies']);
      if (settings) {
        for (const row of settings) {
          if (row.key === 'whatsapp_number') setWhatsappNumber(row.value);
          if (row.key === 'whatsapp_quick_replies') {
            try { setQuickReplies(JSON.parse(row.value)); } catch {}
          }
        }
      }
      const { data: leadsData } = await supabase
        .from('whatsapp_leads' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) as { data: any[] | null };
      setLeads(leadsData || []);
      setLoadingLeads(false);
    };
    fetchAll();
  }, []);

  const saveNumber = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: whatsappNumber.trim(), updated_at: new Date().toISOString() } as any)
      .eq('key', 'whatsapp_number');
    setSaving(false);
    if (error) toast.error('Failed to save'); else toast.success('WhatsApp number updated');
  };

  const saveReplies = async (replies: string[]) => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: JSON.stringify(replies), updated_at: new Date().toISOString() } as any)
      .eq('key', 'whatsapp_quick_replies');
    if (error) toast.error('Failed to save replies'); else toast.success('Quick replies updated');
  };

  const addReply = () => {
    if (!newReply.trim()) return;
    const updated = [...quickReplies, newReply.trim()];
    setQuickReplies(updated);
    setNewReply('');
    saveReplies(updated);
  };

  const removeReply = (index: number) => {
    const updated = quickReplies.filter((_, i) => i !== index);
    setQuickReplies(updated);
    saveReplies(updated);
  };

  const testWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent('Test message from R8Estate admin')}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">WhatsApp Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">Configure the WhatsApp chat widget and view collected leads.</p>
      </div>

      {/* WhatsApp Number */}
      <div className="max-w-lg">
        <h3 className="text-sm font-semibold text-foreground mb-3">WhatsApp Number</h3>
        <div className="flex gap-2">
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+201XXXXXXXXX"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button onClick={saveNumber} disabled={saving} size="sm">
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={testWhatsApp} variant="outline" size="sm">
            <TestTube className="w-3.5 h-3.5 me-1" /> Test
          </Button>
        </div>
      </div>

      {/* Quick Replies */}
      <div className="max-w-lg">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Replies</h3>
        <div className="space-y-2 mb-3">
          {quickReplies.map((reply, i) => (
            <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <span className="text-sm text-foreground flex-1">{reply}</span>
              <button onClick={() => removeReply(i)} className="text-muted-foreground hover:text-brand-red transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Add a quick reply..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => e.key === 'Enter' && addReply()}
            maxLength={200}
          />
          <Button onClick={addReply} size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5 me-1" /> Add
          </Button>
        </div>
      </div>

      {/* Leads */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Collected Leads ({leads.length})</h3>
        {loadingLeads ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads collected yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Phone</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Message</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="text-end px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.name}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{lead.phone}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{lead.message || '-'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminSettings = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Platform Settings</h2>
    <div className="max-w-lg space-y-4">
      {[
        { title: 'Auto-approve reviews', desc: 'Automatically approve reviews from verified users' },
        { title: 'Email notifications', desc: 'Send email alerts for flagged content' },
        { title: 'Maintenance mode', desc: 'Put the platform in maintenance mode' },
      ].map((s) => (
        <div key={s.title} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
          <div className="w-10 h-6 bg-secondary rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full absolute top-1 left-1" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'admin') {
        navigate(role === 'developer' ? '/developer' : '/buyer');
      }
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user || role !== 'admin') return null;

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/admin' },
    { icon: <Users className="w-4 h-4" />, label: 'Users', path: '/admin/users' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Developers', path: '/admin/developers' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Reviews', path: '/admin/reviews' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Spotlight', path: '/admin/spotlight' },
    { icon: <Megaphone className="w-4 h-4" />, label: 'Notifications', path: '/admin/notifications' },
    { icon: <Phone className="w-4 h-4" />, label: 'WhatsApp', path: '/admin/whatsapp' },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      breadcrumb="Admin > Dashboard"
      sidebarProps={{
        navItems,
        portalLabel: 'Admin',
      }}
    >
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="developers" element={<AdminDevelopers />} />
        <Route path="reviews" element={<AdminReviewMod />} />
        <Route path="spotlight" element={<AdminSpotlight />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="whatsapp" element={<AdminWhatsApp />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
