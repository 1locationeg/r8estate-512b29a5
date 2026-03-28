import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a given user has at least one approved receipt submission
 * (i.e. is a "Verified Buyer").
 */
export function useVerifiedBuyer(userId: string | undefined | null) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsVerified(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    supabase
      .from("receipt_submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "approved")
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) {
          setIsVerified((data?.length ?? 0) > 0);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [userId]);

  return { isVerified, isLoading };
}
