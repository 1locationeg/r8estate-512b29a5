import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface ReactionSummary {
  emoji: string;
  count: number;
  user_reacted: boolean;
}

export function useReactions(targetId: string | undefined, targetType: 'post' | 'reply') {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);

    const column = targetType === 'post' ? 'post_id' : 'reply_id';
    const { data, error } = await supabase
      .from('community_reactions')
      .select('emoji, user_id')
      .eq(column, targetId);

    if (error) {
      console.error('Error fetching reactions:', error);
      setLoading(false);
      return;
    }

    // Aggregate
    const map = new Map<string, { count: number; user_reacted: boolean }>();
    for (const row of data || []) {
      const existing = map.get(row.emoji) || { count: 0, user_reacted: false };
      existing.count++;
      if (row.user_id === user?.id) existing.user_reacted = true;
      map.set(row.emoji, existing);
    }

    const result: ReactionSummary[] = [];
    for (const [emoji, info] of map) {
      result.push({ emoji, ...info });
    }
    // Sort by count desc
    result.sort((a, b) => b.count - a.count);
    setReactions(result);
    setLoading(false);
  }, [targetId, targetType, user?.id]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggleReaction = async (emoji: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to react.", variant: "destructive" });
      return;
    }
    if (!targetId) return;

    const column = targetType === 'post' ? 'post_id' : 'reply_id';
    const existing = reactions.find(r => r.emoji === emoji && r.user_reacted);

    if (existing) {
      // Remove reaction
      await supabase
        .from('community_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq(column, targetId)
        .eq('emoji', emoji);
    } else {
      // Add reaction
      const insertData = {
        user_id: user.id,
        emoji,
        ...(targetType === 'post' ? { post_id: targetId } : { reply_id: targetId }),
      };
      await supabase.from('community_reactions').insert([insertData]);
    }

    fetchReactions();
  };

  return { reactions, toggleReaction, loading, refetch: fetchReactions };
}

// Bulk fetch for a list of posts (feed optimization)
export function useBulkReactions(postIds: string[]) {
  const { user } = useAuth();
  const [reactionsMap, setReactionsMap] = useState<Record<string, ReactionSummary[]>>({});

  useEffect(() => {
    if (!postIds.length) return;

    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('community_reactions')
        .select('emoji, user_id, post_id')
        .in('post_id', postIds);

      if (error || !data) return;

      const map: Record<string, Map<string, { count: number; user_reacted: boolean }>> = {};
      for (const row of data) {
        if (!row.post_id) continue;
        if (!map[row.post_id]) map[row.post_id] = new Map();
        const emojiMap = map[row.post_id];
        const existing = emojiMap.get(row.emoji) || { count: 0, user_reacted: false };
        existing.count++;
        if (row.user_id === user?.id) existing.user_reacted = true;
        emojiMap.set(row.emoji, existing);
      }

      const result: Record<string, ReactionSummary[]> = {};
      for (const [postId, emojiMap] of Object.entries(map)) {
        result[postId] = Array.from(emojiMap.entries())
          .map(([emoji, info]) => ({ emoji, ...info }))
          .sort((a, b) => b.count - a.count);
      }
      setReactionsMap(result);
    };

    fetchAll();
  }, [postIds.join(','), user?.id]);

  return reactionsMap;
}
