import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { emitMessagesRead, subscribeToMessagesRead } from '@/lib/messageReadEvents';

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data: myParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (!myParts || myParts.length === 0) {
      setConversations([]);
      setTotalUnread(0);
      setLoading(false);
      return;
    }

    const convIds = myParts.map((p) => p.conversation_id);
    const lastReadMap: Record<string, string> = {};
    myParts.forEach((p) => {
      lastReadMap[p.conversation_id] = p.last_read_at || '1970-01-01';
    });

    const { data: otherParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds)
      .neq('user_id', user.id);

    if (!otherParts) {
      setLoading(false);
      return;
    }

    const otherUserIds = [...new Set(otherParts.map((p) => p.user_id))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .in('user_id', otherUserIds);

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    profiles?.forEach((p) => {
      profileMap[p.user_id] = p;
    });

    const convList: Conversation[] = [];
    let totalU = 0;

    for (const convId of convIds) {
      const otherPart = otherParts.find((p) => p.conversation_id === convId);
      if (!otherPart) continue;

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id)
        .gt('created_at', lastReadMap[convId]);

      const unread = count || 0;
      totalU += unread;

      const prof = profileMap[otherPart.user_id];
      convList.push({
        id: convId,
        other_user_id: otherPart.user_id,
        other_user_name: prof?.full_name || 'User',
        other_user_avatar: prof?.avatar_url || null,
        last_message: lastMsg?.content || null,
        last_message_at: lastMsg?.created_at || null,
        unread_count: unread,
      });
    }

    convList.sort((a, b) => {
      const ta = a.last_message_at || '1970-01-01';
      const tb = b.last_message_at || '1970-01-01';
      return tb.localeCompare(ta);
    });

    setConversations(convList);
    setTotalUnread(totalU);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!user) return;
    return subscribeToMessagesRead(fetchConversations);
  }, [user, fetchConversations]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('conversations-refresh')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  const startConversation = useCallback(
    async (otherUserId: string) => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('find_or_create_conversation', {
        _other_user_id: otherUserId,
      });
      if (error) {
        console.error(error);
        return null;
      }
      await fetchConversations();
      return data as string;
    },
    [user, fetchConversations]
  );

  return { conversations, loading, totalUnread, startConversation, refetch: fetchConversations };
};

export const useChatMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const markConversationAsRead = useCallback(async () => {
    if (!conversationId || !user) return;

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (!error) {
      emitMessagesRead();
    }
  }, [conversationId, user]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) return;
    setLoading(true);

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages((data as Message[]) || []);
    setLoading(false);
    await markConversationAsRead();
  }, [conversationId, user, markConversationAsRead]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId || !user) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          await markConversationAsRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, markConversationAsRead]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !user || !content.trim()) return;
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      });
    },
    [conversationId, user]
  );

  return { messages, loading, sendMessage };
};
