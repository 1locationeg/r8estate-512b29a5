import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToMessagesRead } from '@/lib/messageReadEvents';

export const useMessageUnreadCount = () => { // v2
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { data: participants, error } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (error || !participants?.length) {
      setUnreadCount(0);
      return;
    }

    const counts = await Promise.all(
      participants.map(async (participant) => {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', participant.conversation_id)
          .neq('sender_id', user.id)
          .gt('created_at', participant.last_read_at || '1970-01-01');

        return count || 0;
      })
    );

    setUnreadCount(counts.reduce((sum, count) => sum + count, 0));
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;
    return subscribeToMessagesRead(fetchUnreadCount);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`message-unread-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
};
