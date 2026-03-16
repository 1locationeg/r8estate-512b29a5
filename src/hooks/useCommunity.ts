import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { trackBuyerEngagement } from "@/lib/trackBuyerEngagement";

export type CommunityPostCategory = 'discussion' | 'question' | 'tip' | 'experience' | 'poll';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: CommunityPostCategory;
  developer_id: string | null;
  upvotes: number;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  user_voted?: boolean;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  parent_reply_id: string | null;
  upvotes: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  user_voted?: boolean;
  children?: CommunityReply[];
}

export function useCommunityPosts(category?: CommunityPostCategory, sortBy: 'trending' | 'newest' | 'discussed' = 'newest', developerId?: string) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("community_posts").select("*");

    if (category) {
      query = query.eq("category", category);
    }

    if (developerId) {
      query = query.eq("developer_id", developerId);
    }

    if (sortBy === 'newest') {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === 'discussed') {
      query = query.order("reply_count", { ascending: false });
    } else {
      query = query.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
    }

    query = query.limit(50);

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } else {
      // Enrich with author info
      const userIds = [...new Set((data || []).map((p: any) => p.user_id))];
      let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]));
        }
      }

      // Check user votes
      let votedPostIds: Set<string> = new Set();
      if (user) {
        const postIds = (data || []).map((p: any) => p.id);
        if (postIds.length > 0) {
          const { data: votes } = await supabase
            .from("community_votes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds);
          if (votes) {
            votedPostIds = new Set(votes.map((v: any) => v.post_id));
          }
        }
      }

      setPosts(
        (data || []).map((p: any) => ({
          ...p,
          author_name: profileMap[p.user_id]?.full_name || "Anonymous",
          author_avatar: profileMap[p.user_id]?.avatar_url || undefined,
          user_voted: votedPostIds.has(p.id),
        }))
      );
    }
    setLoading(false);
  }, [category, sortBy, user, developerId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("community-posts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}

export function useCommunityPost(postId: string | null) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPost = useCallback(async () => {
    if (!postId) { setPost(null); setReplies([]); setLoading(false); return; }
    setLoading(true);

    const { data: postData } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (!postData) { setPost(null); setLoading(false); return; }

    // Author info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", postData.user_id)
      .single();

    // Check vote
    let userVoted = false;
    if (user) {
      const { data: vote } = await supabase
        .from("community_votes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();
      userVoted = !!vote;
    }

    setPost({
      ...postData,
      author_name: profile?.full_name || "Anonymous",
      author_avatar: profile?.avatar_url || undefined,
      user_voted: userVoted,
    } as CommunityPost);

    // Fetch replies
    const { data: repliesData } = await supabase
      .from("community_replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (repliesData && repliesData.length > 0) {
      const replyUserIds = [...new Set(repliesData.map((r: any) => r.user_id))];
      const { data: replyProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", replyUserIds);
      const profileMap = Object.fromEntries((replyProfiles || []).map((p: any) => [p.user_id, p]));

      let votedReplyIds: Set<string> = new Set();
      if (user) {
        const replyIds = repliesData.map((r: any) => r.id);
        const { data: votes } = await supabase
          .from("community_votes")
          .select("reply_id")
          .eq("user_id", user.id)
          .in("reply_id", replyIds);
        if (votes) votedReplyIds = new Set(votes.map((v: any) => v.reply_id));
      }

      const enriched: CommunityReply[] = repliesData.map((r: any) => ({
        ...r,
        author_name: profileMap[r.user_id]?.full_name || "Anonymous",
        author_avatar: profileMap[r.user_id]?.avatar_url || undefined,
        user_voted: votedReplyIds.has(r.id),
      }));

      // Build tree (1 level nesting)
      const topLevel = enriched.filter(r => !r.parent_reply_id);
      const nested = enriched.filter(r => r.parent_reply_id);
      topLevel.forEach(r => {
        r.children = nested.filter(n => n.parent_reply_id === r.id);
      });
      setReplies(topLevel);
    } else {
      setReplies([]);
    }

    setLoading(false);
  }, [postId, user]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  useEffect(() => {
    if (!postId) return;
    const channel = supabase
      .channel(`community-post-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_replies", filter: `post_id=eq.${postId}` }, () => {
        fetchPost();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId, fetchPost]);

  return { post, replies, loading, refetch: fetchPost };
}

export function useCommunityActions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const createPost = async (title: string, body: string, category: CommunityPostCategory, developerId?: string) => {
    if (!user) { toast({ title: "Sign in required", description: "Please sign in to post.", variant: "destructive" }); return null; }
    const { data, error } = await supabase
      .from("community_posts")
      .insert({ user_id: user.id, title, body, category, developer_id: developerId || null })
      .select()
      .single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return null; }
    // Track engagement for gamification
    trackBuyerEngagement(user.id, 'community_posts');
    return data;
  };

  const createReply = async (postId: string, body: string, parentReplyId?: string) => {
    if (!user) { toast({ title: "Sign in required", description: "Please sign in to reply.", variant: "destructive" }); return null; }
    const { data, error } = await supabase
      .from("community_replies")
      .insert({ post_id: postId, user_id: user.id, body, parent_reply_id: parentReplyId || null })
      .select()
      .single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return null; }
    return data;
  };

  const toggleVote = async (postId?: string, replyId?: string) => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }

    // Check existing vote
    let query = supabase.from("community_votes").select("id").eq("user_id", user.id);
    if (postId) query = query.eq("post_id", postId);
    if (replyId) query = query.eq("reply_id", replyId);
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      await supabase.from("community_votes").delete().eq("id", existing.id);
      // Decrement upvotes
      if (postId) {
        const { data: post } = await supabase.from("community_posts").select("upvotes").eq("id", postId).single();
        if (post) await supabase.from("community_posts").update({ upvotes: Math.max(0, post.upvotes - 1) }).eq("id", postId);
      }
      if (replyId) {
        const { data: reply } = await supabase.from("community_replies").select("upvotes").eq("id", replyId).single();
        if (reply) await supabase.from("community_replies").update({ upvotes: Math.max(0, reply.upvotes - 1) }).eq("id", replyId);
      }
    } else {
      const insertData: any = { user_id: user.id, vote_type: "up" };
      if (postId) insertData.post_id = postId;
      if (replyId) insertData.reply_id = replyId;
      await supabase.from("community_votes").insert(insertData);
      // Increment upvotes
      if (postId) {
        const { data: post } = await supabase.from("community_posts").select("upvotes").eq("id", postId).single();
        if (post) await supabase.from("community_posts").update({ upvotes: post.upvotes + 1 }).eq("id", postId);
      }
      if (replyId) {
        const { data: reply } = await supabase.from("community_replies").select("upvotes").eq("id", replyId).single();
        if (reply) await supabase.from("community_replies").update({ upvotes: reply.upvotes + 1 }).eq("id", replyId);
      }
    }
  };

  return { createPost, createReply, toggleVote };
}
