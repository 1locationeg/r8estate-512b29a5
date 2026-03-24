import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { showCoinToast } from "@/components/CoinEarnedToast";

export function useSavedItem(itemId: string, itemType: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .eq("item_type", itemType)
      .maybeSingle()
      .then(({ data }) => setIsSaved(!!data));
  }, [user, itemId, itemType]);

  const toggle = useCallback(
    async (itemName: string, itemImage?: string | null) => {
      if (!user) return;
      setLoading(true);
      if (isSaved) {
        await supabase
          .from("saved_items")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", itemId)
          .eq("item_type", itemType);
        setIsSaved(false);
        toast({ title: "Removed", description: `${itemName} removed from saved.` });
      } else {
        await supabase.from("saved_items").insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
          item_name: itemName,
          item_image: itemImage || null,
        });
        setIsSaved(true);
        toast({ title: "Saved!", description: `${itemName} added to your saved items.` });
        showCoinToast('project_save');
      }
      setLoading(false);
    },
    [user, itemId, itemType, isSaved, toast]
  );

  return { isSaved, toggle, loading };
}

export function useFollowBusiness(businessId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("followed_businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data));
  }, [user, businessId]);

  const toggle = useCallback(
    async (businessName: string) => {
      if (!user) return;
      setLoading(true);
      if (isFollowing) {
        await supabase
          .from("followed_businesses")
          .delete()
          .eq("user_id", user.id)
          .eq("business_id", businessId);
        setIsFollowing(false);
        toast({ title: "Unfollowed", description: `You unfollowed ${businessName}.` });
      } else {
        await supabase.from("followed_businesses").insert({
          user_id: user.id,
          business_id: businessId,
          business_name: businessName,
        });
        setIsFollowing(true);
        toast({ title: "Following!", description: `You're now following ${businessName}.` });
      }
      setLoading(false);
    },
    [user, businessId, isFollowing, toast]
  );

  return { isFollowing, toggle, loading };
}
