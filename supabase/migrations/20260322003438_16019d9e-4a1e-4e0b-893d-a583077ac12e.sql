
-- Deal type enum
CREATE TYPE public.deal_type AS ENUM ('payment_plan', 'discount', 'early_access', 'exclusive_units', 'other');

-- Deal status enum  
CREATE TYPE public.deal_status AS ENUM ('pending', 'verified', 'rejected');

-- Deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  headline text NOT NULL,
  description text NOT NULL,
  deal_type deal_type NOT NULL DEFAULT 'other',
  valid_until date,
  tags text[] DEFAULT '{}',
  status deal_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  avg_rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Deal ratings table (one rating per user per deal)
CREATE TABLE public.deal_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  stars integer NOT NULL,
  review_text text,
  is_verified_buyer boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verified deals" ON public.deals FOR SELECT TO anon, authenticated USING (status = 'verified');
CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending deals" ON public.deals FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can manage all deals" ON public.deals FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- RLS on deal_ratings
ALTER TABLE public.deal_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read deal ratings" ON public.deal_ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert own ratings" ON public.deal_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.deal_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all ratings" ON public.deal_ratings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Trigger: update avg_rating on deals when rating inserted/updated/deleted
CREATE OR REPLACE FUNCTION public.update_deal_rating_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.deals SET
    avg_rating = (SELECT COALESCE(AVG(stars), 0) FROM public.deal_ratings WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)),
    rating_count = (SELECT COUNT(*) FROM public.deal_ratings WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER on_deal_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.deal_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_deal_rating_stats();

-- Trigger: notify business when deal status changes
CREATE OR REPLACE FUNCTION public.notify_deal_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('verified', 'rejected') THEN
    PERFORM public.create_notification(
      NEW.user_id, 'review_status',
      CASE NEW.status WHEN 'verified' THEN 'Deal Verified ✅' WHEN 'rejected' THEN 'Deal Not Approved ❌' END,
      CASE NEW.status
        WHEN 'verified' THEN 'Your deal "' || LEFT(NEW.headline, 50) || '" is now live on Deal Watch.'
        WHEN 'rejected' THEN 'Your deal "' || LEFT(NEW.headline, 50) || '" was not approved.' || CASE WHEN NEW.admin_notes IS NOT NULL THEN ' Reason: ' || NEW.admin_notes ELSE '' END
      END,
      jsonb_build_object('deal_id', NEW.id, 'status', NEW.status, 'link', '/deal-watch')
    );
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_deal_status_change
  AFTER UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.notify_deal_status_change();

-- Validation trigger for stars (instead of CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_deal_rating_stars()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stars < 1 OR NEW.stars > 5 THEN
    RAISE EXCEPTION 'Stars must be between 1 and 5';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER validate_deal_rating_stars_trigger
  BEFORE INSERT OR UPDATE ON public.deal_ratings
  FOR EACH ROW EXECUTE FUNCTION public.validate_deal_rating_stars();
