
-- 1. Review Replies table (business replies to reviews)
CREATE TABLE public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read review replies" ON public.review_replies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Business users can insert own replies" ON public.review_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON public.review_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.review_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all review replies" ON public.review_replies FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Trigger: notify reviewer when business replies
CREATE OR REPLACE FUNCTION public.notify_review_reply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _review record;
  _replier_name text;
BEGIN
  SELECT * INTO _review FROM public.reviews WHERE id = NEW.review_id;
  SELECT full_name INTO _replier_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  IF _review IS NOT NULL AND _review.user_id != NEW.user_id THEN
    PERFORM public.create_notification(
      _review.user_id, 'review',
      'Business replied to your review',
      COALESCE(_replier_name, 'A business') || ' responded to your review: "' || LEFT(NEW.body, 80) || '..."',
      jsonb_build_object('review_id', NEW.review_id, 'reply_id', NEW.id, 'link', '/reviews')
    );
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_review_reply_insert
  AFTER INSERT ON public.review_replies
  FOR EACH ROW EXECUTE FUNCTION public.notify_review_reply();

-- 2. Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can insert own referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "System can update referrals" ON public.referrals FOR UPDATE TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can manage all referrals" ON public.referrals FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 3. Saved Searches table
CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  notify_enabled boolean NOT NULL DEFAULT true,
  last_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved searches" ON public.saved_searches FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved searches" ON public.saved_searches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved searches" ON public.saved_searches FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved searches" ON public.saved_searches FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Onboarding Progress table
CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'buyer',
  steps_completed text[] DEFAULT '{}'::text[],
  is_dismissed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding" ON public.onboarding_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON public.onboarding_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON public.onboarding_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all onboarding" ON public.onboarding_progress FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
