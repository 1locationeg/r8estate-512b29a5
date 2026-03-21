
-- Create business claims table
CREATE TABLE public.business_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_profile_id uuid REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_mock_id text,
  document_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- Users can insert their own claims
CREATE POLICY "Users can insert own claims"
  ON public.business_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON public.business_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all claims
CREATE POLICY "Admins can manage all claims"
  ON public.business_claims FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_business_claims_updated_at
  BEFORE UPDATE ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notify user on claim status change
CREATE OR REPLACE FUNCTION public.notify_claim_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'review_status',
      CASE NEW.status
        WHEN 'approved' THEN 'Business Claim Approved ✅'
        WHEN 'rejected' THEN 'Business Claim Rejected ❌'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Your claim for "' || NEW.business_name || '" has been approved. You can now manage this business profile.'
        WHEN 'rejected' THEN 'Your claim for "' || NEW.business_name || '" was not approved.' || CASE WHEN NEW.admin_notes IS NOT NULL THEN ' Reason: ' || NEW.admin_notes ELSE '' END
      END,
      jsonb_build_object('claim_id', NEW.id, 'status', NEW.status, 'business_name', NEW.business_name, 'link', '/business')
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_claim_status_change
  AFTER UPDATE OF status ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_claim_status_change();
