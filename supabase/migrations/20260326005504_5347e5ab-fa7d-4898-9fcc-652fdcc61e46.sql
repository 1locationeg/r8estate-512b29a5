
-- Table for business upgrade applications
CREATE TABLE public.business_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  description text,
  document_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.business_upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own requests" ON public.business_upgrade_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON public.business_upgrade_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" ON public.business_upgrade_requests
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to notify user on status change and upgrade role on approval
CREATE OR REPLACE FUNCTION public.notify_upgrade_request_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    -- Notify user
    PERFORM public.create_notification(
      NEW.user_id,
      'review_status',
      CASE NEW.status
        WHEN 'approved' THEN 'Business Upgrade Approved ✅'
        WHEN 'rejected' THEN 'Business Upgrade Rejected ❌'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Your business upgrade request for "' || NEW.company_name || '" has been approved! You now have full business access.'
        WHEN 'rejected' THEN 'Your business upgrade request for "' || NEW.company_name || '" was not approved.' || CASE WHEN NEW.admin_notes IS NOT NULL THEN ' Reason: ' || NEW.admin_notes ELSE '' END
      END,
      jsonb_build_object('request_id', NEW.id, 'status', NEW.status, 'link', '/business')
    );
    
    -- On approval, upgrade user role to business
    IF NEW.status = 'approved' THEN
      DELETE FROM public.user_roles
        WHERE user_id = NEW.user_id
          AND role IN ('user'::app_role, 'buyer'::app_role);
      
      INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, 'business'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_upgrade_request_status_change
  BEFORE UPDATE ON public.business_upgrade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_upgrade_request_status();

-- Storage bucket for upgrade documents
INSERT INTO storage.buckets (id, name, public)
  VALUES ('upgrade-documents', 'upgrade-documents', false)
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload their own docs
CREATE POLICY "Users can upload upgrade docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'upgrade-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own upgrade docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'upgrade-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all upgrade docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'upgrade-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Update the set_my_account_type function to block direct buyer→business upgrades
CREATE OR REPLACE FUNCTION public.set_my_account_type(_account_type text)
  RETURNS app_role
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _target_role public.app_role;
  _current_role public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.has_role(_uid, 'admin') THEN
    RETURN 'admin'::public.app_role;
  END IF;

  _target_role := CASE
    WHEN lower(coalesce(_account_type, '')) IN ('business', 'developer') THEN 'business'::public.app_role
    ELSE 'buyer'::public.app_role
  END;

  -- Block direct upgrade from buyer to business - must go through approval
  _current_role := public.get_user_role(_uid);
  IF _current_role IN ('buyer', 'user') AND _target_role = 'business' THEN
    RAISE EXCEPTION 'Business upgrade requires admin approval. Please submit a business upgrade request.';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = _uid
    AND role IN ('user'::public.app_role, 'buyer'::public.app_role, 'business'::public.app_role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _target_role;
END;
$$;
