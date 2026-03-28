import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a given user is a "Verified Buyer" via:
 * 1. An approved receipt submission (Tier 2), OR
 * 2. An approved reviewer verification — social/kyc (Tier 1/3)
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

    Promise.all([
      supabase
        .from("receipt_submissions")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "approved")
        .limit(1),
      supabase
        .from("reviewer_verifications")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "approved")
        .limit(1),
    ]).then(([receipts, verifications]) => {
      if (!cancelled) {
        const hasReceipt = (receipts.data?.length ?? 0) > 0;
        const hasVerification = (verifications.data?.length ?? 0) > 0;
        setIsVerified(hasReceipt || hasVerification);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [userId]);

  return { isVerified, isLoading };
}
