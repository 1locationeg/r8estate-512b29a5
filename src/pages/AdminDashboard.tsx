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
  Plus, Trash2, TestTube, ExternalLink, Globe, Image, MessageSquareHeart,
  Bot, PenTool, CreditCard, Receipt, DollarSign, FolderTree, Navigation, Mail, Layout, Briefcase
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

const PERMISSION_LEVELS = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-brand-red/20 text-brand-red', description: 'Full control over all admins and settings' },
  { value: 'admin', label: 'Admin', color: 'bg-brand-red/10 text-brand-red', description: 'Can manage users, settings, and content' },
  { value: 'editor', label: 'Editor', color: 'bg-primary/10 text-primary', description: 'Can edit content but not manage users' },
  { value: 'view_only', label: 'View Only', color: 'bg-secondary text-muted-foreground', description: 'Can only view admin dashboard' },
] as const;

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    roles: string[];
    admin_permission: string | null;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [callerPermission, setCallerPermission] = useState<string | null>(null);

  const isSuperAdmin = callerPermission === 'super_admin';

  const availableRoles: Array<{ value: string; label: string; color: string }> = [
    { value: 'buyer', label: 'Buyer', color: 'bg-accent/20 text-accent-foreground' },
    { value: 'developer', label: 'Developer', color: 'bg-primary/10 text-primary' },
    { value: 'admin', label: 'Admin', color: 'bg-brand-red/10 text-brand-red' },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      if (error) throw error;
      // Handle both old format (array) and new format ({ users, callerPermission })
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers(data?.users || []);
        setCallerPermission(data?.callerPermission || null);
      }
    } catch (err: any) {
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, targetRole: string, action: 'add' | 'remove') => {
    // Only super_admin can add/remove admin role
    if (targetRole === 'admin' && !isSuperAdmin) {
      toast.error('Only the Super Admin can manage admin roles');
      return;
    }
    // Prevent modifying super_admin's own admin role
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.admin_permission === 'super_admin' && targetRole === 'admin' && action === 'remove') {
      toast.error('Cannot remove admin role from Super Admin');
      return;
    }

    setUpdatingId(userId);
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: targetRole as any });
        if (error) throw error;
        // If adding admin role, also add admin_permissions entry
        if (targetRole === 'admin') {
          await supabase.from('admin_permissions' as any).insert({ user_id: userId, permission_level: 'view_only' });
        }
        toast.success(`Role "${targetRole}" added`);
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', targetRole as any);
        if (error) throw error;
        // If removing admin role, also remove admin_permissions entry
        if (targetRole === 'admin') {
          await supabase.from('admin_permissions' as any).delete().eq('user_id', userId);
        }
        toast.success(`Role "${targetRole}" removed`);
      }
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        return {
          ...u,
          roles: action === 'add'
            ? [...u.roles, targetRole]
            : u.roles.filter(r => r !== targetRole),
          admin_permission: targetRole === 'admin'
            ? (action === 'add' ? 'view_only' : null)
            : u.admin_permission,
        };
      }));
    } catch (err: any) {
      toast.error(`Failed to ${action} role: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePermissionChange = async (userId: string, newLevel: string) => {
    if (!isSuperAdmin) {
      toast.error('Only the Super Admin can change permission levels');
      return;
    }
    if (newLevel === 'super_admin') {
      toast.error('There can only be one Super Admin');
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.admin_permission === 'super_admin') {
      toast.error('Cannot change Super Admin permission level');
      return;
    }

    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('admin_permissions' as any)
        .update({ permission_level: newLevel, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) throw error;
      toast.success(`Permission updated to "${newLevel.replace('_', ' ')}"`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, admin_permission: newLevel } : u));
    } catch (err: any) {
      toast.error(`Failed to update permission: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!isSuperAdmin) {
      toast.error('Only the Super Admin can remove admins');
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.admin_permission === 'super_admin') {
      toast.error('Cannot remove the Super Admin');
      return;
    }

    setUpdatingId(userId);
    try {
      // Remove admin role
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin' as any);
      // Remove admin permissions
      await supabase.from('admin_permissions' as any).delete().eq('user_id', userId);
      toast.success('Admin access removed');
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, roles: u.roles.filter(r => r !== 'admin'), admin_permission: null }
        : u
      ));
    } catch (err: any) {
      toast.error(`Failed to remove admin: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.roles.some(r => r.toLowerCase().includes(q))
    );
  });

  const adminUsers = filtered.filter(u => u.roles.includes('admin'));
  const nonAdminUsers = filtered.filter(u => !u.roles.includes('admin'));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <span className="text-sm text-muted-foreground">{users.length} users</span>
      </div>

      {isSuperAdmin && (
        <div className="bg-brand-red/5 border border-brand-red/20 rounded-xl p-3 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-red" />
          <span className="text-xs text-foreground font-medium">You are the Super Admin — you have full control over all admin permissions.</span>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
      </div>

      {/* Admin Team Section */}
      {adminUsers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-red" /> Admin Team ({adminUsers.length})
          </h3>
          <div className="space-y-3">
            {adminUsers.map((u) => {
              const permInfo = PERMISSION_LEVELS.find(p => p.value === u.admin_permission);
              const isMe = u.id === currentUser?.id;
              const isSuperAdminUser = u.admin_permission === 'super_admin';
              const isUpdating = updatingId === u.id;

              return (
                <div key={u.id} className={`bg-card border rounded-xl p-4 transition-all ${isSuperAdminUser ? 'border-brand-red/30 ring-1 ring-brand-red/10' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {u.avatar_url && <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {(u.full_name || u.email || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{u.full_name || 'No name'}</p>
                          {isSuperAdminUser && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-red/20 text-brand-red font-bold uppercase tracking-wider">Super Admin</span>
                          )}
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">You</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    {isSuperAdmin && !isSuperAdminUser && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-brand-red hover:text-brand-red hover:bg-brand-red/10 text-[10px] h-7"
                        disabled={isUpdating}
                        onClick={() => handleRemoveAdmin(u.id)}
                      >
                        <Trash2 className="w-3 h-3 me-1" /> Remove Admin
                      </Button>
                    )}
                  </div>

                  {/* Permission Level */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground font-medium">Permission:</span>
                    {PERMISSION_LEVELS.filter(p => p.value !== 'super_admin').map(p => {
                      const isActive = u.admin_permission === p.value;
                      const canChange = isSuperAdmin && !isSuperAdminUser && !isUpdating;
                      return (
                        <button
                          key={p.value}
                          disabled={!canChange || isSuperAdminUser}
                          onClick={() => canChange && handlePermissionChange(u.id, p.value)}
                          className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                            isActive
                              ? `${p.color} ring-1 ring-current/20`
                              : canChange
                                ? 'bg-secondary/50 text-muted-foreground hover:bg-secondary cursor-pointer'
                                : 'bg-secondary/30 text-muted-foreground/50 cursor-not-allowed'
                          }`}
                          title={p.description}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                    {isSuperAdminUser && (
                      <span className={`text-[10px] px-2 py-1 rounded-md font-medium ${PERMISSION_LEVELS[0].color} ring-1 ring-current/20`}>
                        Super Admin
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Users Table */}
      <h3 className="text-sm font-semibold text-foreground mb-3">All Users ({nonAdminUsers.length})</h3>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Current Roles</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">Joined</th>
                {isSuperAdmin && (
                  <th className="text-end px-4 py-3 text-xs font-semibold text-muted-foreground">Manage Roles</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nonAdminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {u.avatar_url && <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />}
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {(u.full_name || u.email || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.full_name || 'No name'}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">No role</span>
                      )}
                      {u.roles.map(r => {
                        const roleInfo = availableRoles.find(ar => ar.value === r);
                        return (
                          <span key={r} className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${roleInfo?.color || 'bg-secondary text-muted-foreground'}`}>
                            {r}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        {availableRoles.map(ar => {
                          const hasRole = u.roles.includes(ar.value);
                          const isUpdating = updatingId === u.id;
                          return (
                            <Button
                              key={ar.value}
                              size="sm"
                              variant={hasRole ? 'default' : 'outline'}
                              disabled={isUpdating}
                              className="text-[10px] h-7 px-2"
                              onClick={() => handleRoleChange(u.id, ar.value, hasRole ? 'remove' : 'add')}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : hasRole ? (
                                <><CheckCircle className="w-3 h-3 me-0.5" />{ar.label}</>
                              ) : (
                                <><Plus className="w-3 h-3 me-0.5" />{ar.label}</>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
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

const AdminSEO = () => {
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['og_title', 'og_description', 'og_image']);
      if (data) {
        for (const row of data) {
          if (row.key === 'og_title') setOgTitle(row.value);
          if (row.key === 'og_description') setOgDescription(row.value);
          if (row.key === 'og_image') setOgImage(row.value);
        }
      }
      setLoading(false);
    };
    fetchMeta();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updates = [
      { key: 'og_title', value: ogTitle.trim() },
      { key: 'og_description', value: ogDescription.trim() },
      { key: 'og_image', value: ogImage.trim() },
    ];
    let hasError = false;
    for (const u of updates) {
      const { error } = await supabase
        .from('platform_settings')
        .update({ value: u.value, updated_at: new Date().toISOString() } as any)
        .eq('key', u.key);
      if (error) hasError = true;
    }
    setSaving(false);
    if (hasError) toast.error('Failed to save some settings');
    else toast.success('SEO & sharing settings updated! Changes will apply on next page load.');
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">SEO & Link Preview</h2>
      <p className="text-sm text-muted-foreground mb-6">Control how your site appears when shared on WhatsApp, social media, and search engines.</p>

      <div className="max-w-lg space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            placeholder="R8ESTATE - Reviews Always Right"
            maxLength={60}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">{ogTitle.length}/60 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            rows={3}
            maxLength={160}
            placeholder="The reputation platform for off-plan real estate..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{ogDescription.length}/160 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Preview Image URL</label>
          <input
            type="url"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">Recommended: 1200×630px for best results</p>
          {ogImage && (
            <div className="mt-3 border border-border rounded-lg overflow-hidden bg-secondary">
              <img src={ogImage} alt="OG Preview" className="w-full h-auto max-h-48 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <p className="text-xs font-semibold text-muted-foreground px-4 pt-3 pb-1">Link Preview</p>
          {ogImage && <img src={ogImage} alt="" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          <div className="px-4 py-3">
            <p className="text-sm font-bold text-primary truncate">{ogTitle || 'R8ESTATE'}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{ogDescription || 'No description set'}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">meter.r8estate.com</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

const AdminFeedback = () => {
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('guest_feedback' as any)
      .select('*')
      .order('created_at', { ascending: false });
    setFeedbackItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchFeedback(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('guest_feedback' as any).delete().eq('id', id);
    setFeedbackItems((prev) => prev.filter((f) => f.id !== id));
    toast.success('Feedback deleted');
  };

  const avgRating = feedbackItems.length
    ? (feedbackItems.reduce((s, f) => s + f.rating, 0) / feedbackItems.length).toFixed(1)
    : '—';

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Guest Feedback</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{feedbackItems.length}</p>
          <p className="text-xs text-muted-foreground">Total Submissions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{avgRating} <Star className="inline w-4 h-4 text-yellow-400 fill-yellow-400" /></p>
          <p className="text-xs text-muted-foreground">Average Rating</p>
        </div>
      </div>

      {feedbackItems.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No feedback yet.</p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="p-3 font-semibold text-muted-foreground">Date</th>
                <th className="p-3 font-semibold text-muted-foreground">Rating</th>
                <th className="p-3 font-semibold text-muted-foreground">Type</th>
                <th className="p-3 font-semibold text-muted-foreground">Feedback</th>
                <th className="p-3 font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {feedbackItems.map((f) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 text-foreground whitespace-nowrap">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-accent-foreground capitalize">
                      {f.feedback_type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-foreground max-w-xs truncate">{f.feedback}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

// ── Placeholder components for new admin sections ──
const PlaceholderSection = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Icon className="w-6 h-6 text-primary" />
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <p className="text-muted-foreground">This section is coming soon.</p>
    </div>
  </div>
);

const AdminAIReviewer = () => <PlaceholderSection title="AI Reviewer" icon={Bot} />;
const AdminAIReviewWriter = () => <PlaceholderSection title="AI Review Writer" icon={PenTool} />;
const AdminPricing = () => <PlaceholderSection title="Pricing Plans" icon={CreditCard} />;
const AdminSubscriptions = () => <PlaceholderSection title="Subscriptions" icon={Receipt} />;
const AdminTransactions = () => <PlaceholderSection title="Transactions" icon={DollarSign} />;
const AdminCategories = () => <PlaceholderSection title="Categories" icon={FolderTree} />;
const AdminNavigation = () => <PlaceholderSection title="Navigation" icon={Navigation} />;
const AdminNewsletter = () => <PlaceholderSection title="Newsletter" icon={Mail} />;
const AdminSections = () => <PlaceholderSection title="Sections" icon={Layout} />;
const AdminBusiness = () => <PlaceholderSection title="Business" icon={Briefcase} />;

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
    { icon: <Briefcase className="w-4 h-4" />, label: 'Business', path: '/admin/business' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Reviews', path: '/admin/reviews' },
    { icon: <Bot className="w-4 h-4" />, label: 'AI Reviewer', path: '/admin/ai-reviewer' },
    { icon: <PenTool className="w-4 h-4" />, label: 'AI Review Writer', path: '/admin/ai-review-writer' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Spotlight', path: '/admin/spotlight' },
    { icon: <Megaphone className="w-4 h-4" />, label: 'Notifications', path: '/admin/notifications' },
    { icon: <Phone className="w-4 h-4" />, label: 'WhatsApp', path: '/admin/whatsapp' },
    { icon: <CreditCard className="w-4 h-4" />, label: 'Pricing Plans', path: '/admin/pricing' },
    { icon: <Receipt className="w-4 h-4" />, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: <DollarSign className="w-4 h-4" />, label: 'Transactions', path: '/admin/transactions' },
    { icon: <FolderTree className="w-4 h-4" />, label: 'Categories', path: '/admin/categories' },
    { icon: <Navigation className="w-4 h-4" />, label: 'Navigation', path: '/admin/navigation' },
    { icon: <Mail className="w-4 h-4" />, label: 'Newsletter', path: '/admin/newsletter' },
    { icon: <Layout className="w-4 h-4" />, label: 'Sections', path: '/admin/sections' },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <MessageSquareHeart className="w-4 h-4" />, label: 'Feedback', path: '/admin/feedback' },
    { icon: <Globe className="w-4 h-4" />, label: 'SEO & Sharing', path: '/admin/seo' },
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
        <Route path="business" element={<AdminBusiness />} />
        <Route path="reviews" element={<AdminReviewMod />} />
        <Route path="ai-reviewer" element={<AdminAIReviewer />} />
        <Route path="ai-review-writer" element={<AdminAIReviewWriter />} />
        <Route path="spotlight" element={<AdminSpotlight />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="whatsapp" element={<AdminWhatsApp />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="navigation" element={<AdminNavigation />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="sections" element={<AdminSections />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="seo" element={<AdminSEO />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
