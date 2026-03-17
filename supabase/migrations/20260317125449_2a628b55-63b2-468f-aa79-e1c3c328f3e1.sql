
CREATE OR REPLACE FUNCTION public.broadcast_notification(_type text, _title text, _message text, _metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can broadcast notifications';
  END IF;
  
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT DISTINCT ur.user_id, _type, _title, _message, _metadata
  FROM public.user_roles ur;
END;
$function$;
