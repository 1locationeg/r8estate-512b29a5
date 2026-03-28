import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, ShieldAlert, ShieldCheck, EyeOff, Eye, Search, MessageSquare, Scan, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface CommunityPostRow {
  id: string;
  title: string;
  body: string;
  category: string;
  user_id: string;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
  moderation_status: string;
  moderation_flags: any;
  upvotes: number;
  reply_count: number;
  author_name?: string;
}

const AdminCommunityModeration = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    // Fetch posts
    const { data: postsData, error } = await supabase
      .from('community_posts')
      .select('id, title, body, category, user_id, created_at, is_pinned, upvotes, reply_count, is_hidden, moderation_status, moderation_flags')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load community posts');
      console.error(error);
      setLoading(false);
      return;
    }

    const rawPosts = (postsData as any[]) || [];

    // Fetch author names
    const userIds = [...new Set(rawPosts.map(p => p.user_id))];
    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = p.full_name || p.email?.split('@')[0] || 'User';
      });
    }

    setPosts(rawPosts.map(p => ({ ...p, author_name: profileMap[p.user_id] || 'Unknown' })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const runAIScan = async (post: CommunityPostRow) => {
    setScanningId(post.id);
    try {
      const { data, error } = await supabase.functions.invoke('review-integrity-check', {
        body: { review_text: `${post.title}\n${post.body}`, rating: null, content_type: 'post' },
      });
      if (error) throw error;

      const flags = data as any;
      let newStatus = 'clean';
      let shouldHide = false;
      let flaggedAt: string | null = null;

      if (flags.suspicion_score > 80) {
        newStatus = 'flagged';
        shouldHide = true;
      } else if (flags.suspicion_score > 50) {
        newStatus = 'warning';
        flaggedAt = new Date().toISOString();
      }

      await supabase
        .from('community_posts')
        .update({
          moderation_flags: flags,
          moderation_status: newStatus,
          is_hidden: shouldHide || post.is_hidden,
          ...(flaggedAt ? { flagged_at: flaggedAt } : {}),
        } as any)
        .eq('id', post.id);

      toast.success(`Post scanned — ${newStatus}${shouldHide ? ' (auto-hidden)' : flaggedAt ? ' (100min grace period)' : ''}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error('AI scan failed');
    } finally {
      setScanningId(null);
    }
  };

  const scanAllUnscanned = async () => {
    const unscanned = posts.filter(p => p.moderation_status === 'clean' && !p.moderation_flags);
    if (unscanned.length === 0) {
      toast.info('No unscanned posts found');
      return;
    }
    setScanningAll(true);
    let scanned = 0;
    for (const post of unscanned) {
      try {
        const { data } = await supabase.functions.invoke('review-integrity-check', {
          body: { review_text: `${post.title}\n${post.body}`, rating: null, content_type: 'post' },
        });
        const flags = data as any;
        let newStatus = 'clean';
        let shouldHide = false;
        let flaggedAt: string | null = null;

        if (flags.suspicion_score > 80) {
          newStatus = 'flagged';
          shouldHide = true;
        } else if (flags.suspicion_score > 50) {
          newStatus = 'warning';
          flaggedAt = new Date().toISOString();
        }

        await supabase
          .from('community_posts')
          .update({
            moderation_flags: flags,
            moderation_status: newStatus,
            is_hidden: shouldHide || post.is_hidden,
            ...(flaggedAt ? { flagged_at: flaggedAt } : {}),
          } as any)
          .eq('id', post.id);
        scanned++;
      } catch {
        // continue scanning others
      }
    }
    toast.success(`Scanned ${scanned}/${unscanned.length} posts`);
    fetchPosts();
    setScanningAll(false);
  };

  const restorePost = async (postId: string) => {
    setTogglingId(postId);
    const { error } = await supabase
      .from('community_posts')
      .update({ is_hidden: false, moderation_status: 'clean', flagged_at: null } as any)
      .eq('id', postId);
    if (error) {
      toast.error('Failed to restore post');
    } else {
      toast.success('Post restored to clean status');
      fetchPosts();
    }
    setTogglingId(null);
  };

  const toggleHidden = async (postId: string, currentlyHidden: boolean) => {
    setTogglingId(postId);
    const { error } = await supabase
      .from('community_posts')
      .update({ is_hidden: !currentlyHidden } as any)
      .eq('id', postId);
    if (error) {
      toast.error('Failed to update post visibility');
    } else {
      toast.success(currentlyHidden ? 'Post restored' : 'Post hidden');
      fetchPosts();
    }
    setTogglingId(null);
  };

  const filtered = posts.filter(p => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'flagged' && p.moderation_status === 'flagged') ||
      (activeTab === 'warning' && p.moderation_status === 'warning') ||
      (activeTab === 'hidden' && p.is_hidden) ||
      (activeTab === 'clean' && p.moderation_status === 'clean' && !p.is_hidden);
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.author_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: posts.length,
    flagged: posts.filter(p => p.moderation_status === 'flagged').length,
    warning: posts.filter(p => p.moderation_status === 'warning').length,
    hidden: posts.filter(p => p.is_hidden).length,
    unscanned: posts.filter(p => p.moderation_status === 'clean' && !p.moderation_flags).length,
  };

  const statusColor = (status: string) => {
    if (status === 'flagged') return 'destructive';
    if (status === 'warning') return 'secondary';
    return 'default';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Community Moderation</h2>
          <p className="text-sm text-muted-foreground">AI-powered content guard for community posts</p>
        </div>
        <Button
          onClick={scanAllUnscanned}
          disabled={scanningAll || stats.unscanned === 0}
          className="gap-2"
        >
          {scanningAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
          Scan All ({stats.unscanned})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-center">
            <ShieldAlert className="w-5 h-5 text-destructive mx-auto mb-1" />
            <div className="text-2xl font-bold text-destructive">{stats.flagged}</div>
            <div className="text-xs text-muted-foreground">Flagged</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-600">{stats.warning}</div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/20 bg-muted/30">
          <CardContent className="p-4 text-center">
            <EyeOff className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <div className="text-2xl font-bold text-muted-foreground">{stats.hidden}</div>
            <div className="text-xs text-muted-foreground">Hidden</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{stats.total - stats.flagged - stats.warning}</div>
            <div className="text-xs text-muted-foreground">Clean</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts by title, body, or author..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full ps-10 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="flagged" className="flex-1">🚨 Flagged ({stats.flagged})</TabsTrigger>
          <TabsTrigger value="warning" className="flex-1">⚠️ Warning ({stats.warning})</TabsTrigger>
          <TabsTrigger value="hidden" className="flex-1">Hidden ({stats.hidden})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No posts found</p>
            </div>
          ) : (
            filtered.map(post => {
              const flags = post.moderation_flags as any;
              return (
                <Card key={post.id} className={`overflow-hidden ${post.is_hidden ? 'opacity-60' : ''} ${post.moderation_status === 'flagged' ? 'border-destructive/40' : post.moderation_status === 'warning' ? 'border-amber-500/40' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-sm text-foreground">{post.author_name}</span>
                          <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
                          <Badge variant={statusColor(post.moderation_status)} className="text-xs capitalize">
                            {post.moderation_status}
                          </Badge>
                          {post.is_hidden && <Badge variant="secondary" className="text-xs"><EyeOff className="w-3 h-3 me-1" />Hidden</Badge>}
                          {post.is_pinned && <Badge variant="outline" className="text-xs">📌 Pinned</Badge>}
                        </div>

                        {/* Title & body */}
                        <p className="text-sm font-semibold text-foreground mb-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.body}</p>

                        {/* AI Flags */}
                        {flags && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-foreground">AI Score:</span>
                              <span className={`text-xs font-bold ${flags.suspicion_score > 80 ? 'text-destructive' : flags.suspicion_score > 50 ? 'text-amber-600' : 'text-green-600'}`}>
                                {flags.suspicion_score}/100
                              </span>
                              {flags.violation_type && flags.violation_type !== 'none' && (
                                <Badge variant="destructive" className="text-xs capitalize">{flags.violation_type.replace('_', ' ')}</Badge>
                              )}
                              {flags.severity && flags.severity !== 'low' && (
                                <Badge variant="secondary" className="text-xs capitalize">Severity: {flags.severity}</Badge>
                              )}
                            </div>
                            {flags.flags && flags.flags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {flags.flags.map((f: string, i: number) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{f}</span>
                                ))}
                              </div>
                            )}
                            {flags.suggestion && (
                              <p className="text-xs text-muted-foreground italic">{flags.suggestion}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>👍 {post.upvotes}</span>
                          <span>💬 {post.reply_count}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runAIScan(post)}
                          disabled={scanningId === post.id}
                          className="gap-1"
                        >
                          {scanningId === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
                          Scan
                        </Button>
                        <Button
                          size="sm"
                          variant={post.is_hidden ? 'default' : 'destructive'}
                          onClick={() => toggleHidden(post.id, post.is_hidden)}
                          disabled={togglingId === post.id}
                          className="gap-1"
                        >
                          {togglingId === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : post.is_hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {post.is_hidden ? 'Show' : 'Hide'}
                        </Button>
                        {(post.moderation_status === 'flagged' || post.moderation_status === 'warning') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restorePost(post.id)}
                            disabled={togglingId === post.id}
                            className="gap-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCommunityModeration;
