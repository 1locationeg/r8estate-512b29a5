
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_notifications boolean NOT NULL DEFAULT true,
  announcement_notifications boolean NOT NULL DEFAULT true,
  status_notifications boolean NOT NULL DEFAULT true,
  trust_score_notifications boolean NOT NULL DEFAULT true,
  interest_notifications boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.create_notification(_user_id uuid, _type text, _title text, _message text, _metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _prefs record;
  _should_notify boolean := true;
BEGIN
  SELECT * INTO _prefs FROM public.notification_preferences WHERE user_id = _user_id;
  
  IF _prefs IS NOT NULL THEN
    _should_notify := CASE _type
      WHEN 'review' THEN _prefs.review_notifications
      WHEN 'announcement' THEN _prefs.announcement_notifications
      WHEN 'review_status' THEN _prefs.status_notifications
      WHEN 'trust_score' THEN _prefs.trust_score_notifications
      WHEN 'interest' THEN _prefs.interest_notifications
      ELSE true
    END;
  END IF;

  IF _should_notify THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (_user_id, _type, _title, _message, _metadata);
  END IF;
END;
$function$;
