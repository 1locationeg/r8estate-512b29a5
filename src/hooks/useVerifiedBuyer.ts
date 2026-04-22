import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a given user is a "Verified Buyer" via:
 * 1. An approved receipt submission (Tier 2), OR
 * 2. An approved reviewer verification — social/kyc (Tier 1/3)
 *
 * Also exposes `hasContractVerified` — true when the user has at least one
 * approved receipt with an authenticity_score >= 75 and a recognized
 * contract document type. Used to show the gold "Contract Verified" chip.
 */
export function useVerifiedBuyer(userId: string | undefined | null) {
  const [isVerified, setIsVerified] = useState(false);
  const [hasContractVerified, setHasContractVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsVerified(false);
      setHasContractVerified(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    Promise.all([
      supabase
        .from("receipt_submissions")
        .select("id, authenticity_score, document_type")
        .eq("user_id", userId)
        .eq("status", "approved")
        .limit(20),
      supabase
        .from("reviewer_verifications")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "approved")
        .limit(1),
    ]).then(([receipts, verifications]) => {
      if (!cancelled) {
        const receiptRows = (receipts.data ?? []) as any[];
        const hasReceipt = receiptRows.length > 0;
        const hasVerification = (verifications.data?.length ?? 0) > 0;
        const contractVerified = receiptRows.some(
          (r) =>
            (r.authenticity_score ?? 0) >= 75 &&
            ["reservation_form", "payment_receipt", "sale_contract"].includes(r.document_type ?? ""),
        );
        setIsVerified(hasReceipt || hasVerification);
        setHasContractVerified(contractVerified);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [userId]);

  return { isVerified, hasContractVerified, isLoading };
}
