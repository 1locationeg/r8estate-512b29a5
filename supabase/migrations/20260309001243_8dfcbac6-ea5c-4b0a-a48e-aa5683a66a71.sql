-- Fix broadcast_notification to reach all users
-- We need to get all user IDs without being restricted by RLS

-- Drop the existing function
DROP FUNCTION IF EXISTS public.broadcast_notification(text, text, text, jsonb);

-- Create a new version that gets user IDs from user_roles table
-- This table has proper admin access policies
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
  
  -- Insert notification for each user by getting user_ids from user_roles table
  -- Since admins can view all user roles, this will work correctly
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT DISTINCT ur.user_id, _type, _title, _message, _metadata
  FROM public.user_roles ur;
END;
$function$;