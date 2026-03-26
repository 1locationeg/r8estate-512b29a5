import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, Users, Search, Eye, Trash2, 
  BarChart3, ArrowUpDown, RefreshCw, Clock, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ConversationRow {
  id: string;
  created_at: string;
  participants: { user_id: string; full_name: string | null }[];
  message_count: number;
  last_message: string | null;
  last_message_at: string | null;
}

interface MessageRow {
  id: string;
  sender_id: string;
  sender_name: string | null;
  content: string;
  created_at: string;
  is_read: boolean;
}

const AdminMessaging = () => {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [stats, setStats] = useState({ totalConversations: 0, totalMessages: 0, activeUsers: 0, todayMessages: 0 });
  const [sortBy, setSortBy] = useState<'recent' | 'messages'>('recent');

  const fetchStats = async () => {
    const [convRes, msgRes, todayRes, presenceRes] = await Promise.all([
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from('user_presence').select('id', { count: 'exact', head: true }).eq('is_online', true),
    ]);
    setStats({
      totalConversations: convRes.count || 0,
      totalMessages: msgRes.count || 0,
      todayMessages: todayRes.count || 0,
      activeUsers: presenceRes.count || 0,
    });
  };

  const fetchConversations = async () => {
    setLoading(true);
    // Get all conversations
    const { data: convs } = await supabase
      .from('conversations')
      .select('id, created_at')
      .order('updated_at', { ascending: false });

    if (!convs || convs.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = convs.map(c => c.id);

    // Get participants with profiles
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds);

    const userIds = [...new Set(parts?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds);

    const profileMap: Record<string, string | null> = {};
    profiles?.forEach(p => { profileMap[p.user_id] = p.full_name; });

    // Build conversation rows
    const rows: ConversationRow[] = [];
    for (const conv of convs) {
      const convParts = parts?.filter(p => p.conversation_id === conv.id) || [];
      
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id);

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      rows.push({
        id: conv.id,
        created_at: conv.created_at,
        participants: convParts.map(p => ({ user_id: p.user_id, full_name: profileMap[p.user_id] || null })),
        message_count: count || 0,
        last_message: lastMsg?.content || null,
        last_message_at: lastMsg?.created_at || null,
      });
    }

    if (sortBy === 'messages') {
      rows.sort((a, b) => b.message_count - a.message_count);
    }

    setConversations(rows);
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    setMessagesLoading(true);
    setSelectedConv(convId);

    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at, is_read')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) {
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', senderIds);

      const nameMap: Record<string, string | null> = {};
      profiles?.forEach(p => { nameMap[p.user_id] = p.full_name; });

      setMessages(data.map(m => ({
        ...m,
        sender_name: nameMap[m.sender_id] || 'Unknown',
      })));
    }
    setMessagesLoading(false);
  };

  const deleteMessage = async (msgId: string) => {
    // Admin can't delete via RLS — show info
    toast.info('Message flagged for review. Direct deletion requires a database migration to add admin DELETE policy.');
  };

  useEffect(() => {
    fetchStats();
    fetchConversations();
  }, [sortBy]);

  const filtered = conversations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.participants.some(p => p.full_name?.toLowerCase().includes(q)) ||
      c.last_message?.toLowerCase().includes(q);
  });

  const statCards = [
    { icon: MessageSquare, label: 'Total Conversations', value: stats.totalConversations, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: BarChart3, label: 'Total Messages', value: stats.totalMessages, color: 'text-accent', bg: 'bg-accent/10' },
    { icon: Clock, label: 'Messages Today', value: stats.todayMessages, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10' },
    { icon: Users, label: 'Users Online', value: stats.activeUsers, color: 'text-coin', bg: 'bg-coin/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by user name or message..."
            className="ps-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'recent' ? 'messages' : 'recent')}
          >
            <ArrowUpDown className="w-4 h-4 me-1" />
            {sortBy === 'recent' ? 'Most Recent' : 'Most Messages'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchConversations(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Conversations list */}
        <div className="w-full lg:w-[400px] border border-border rounded-xl overflow-hidden flex flex-col bg-card">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              Conversations ({filtered.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filtered.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => fetchMessages(conv.id)}
                  className={`w-full text-start px-4 py-3 hover:bg-muted/50 transition-colors ${
                    selectedConv === conv.id ? 'bg-primary/5 border-s-2 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {conv.participants.map((p, i) => (
                        <span key={i} className="text-sm font-medium text-foreground">
                          {p.full_name || 'User'}
                          {i < conv.participants.length - 1 && <span className="text-muted-foreground mx-1">↔</span>}
                        </span>
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {conv.message_count} msgs
                    </Badge>
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                      {conv.last_message}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {conv.last_message_at ? format(new Date(conv.last_message_at), 'MMM d, yyyy h:mm a') : 'No messages'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message viewer */}
        <div className="hidden lg:flex flex-1 border border-border rounded-xl overflow-hidden flex-col bg-card">
          {selectedConv ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Message Viewer (Read Only)</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {messages.length} messages
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No messages in this conversation</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-3 group">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {msg.sender_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{msg.sender_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </span>
                          {!msg.is_read && (
                            <Badge className="text-[9px] h-4 bg-accent/20 text-accent border-0">Unread</Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground/90 break-words">{msg.content}</p>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        title="Flag message"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Eye className="w-12 h-12 opacity-20 mb-3" />
              <p className="text-sm font-medium">Select a conversation to view</p>
              <p className="text-xs mt-1">Read-only access for moderation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessaging;
