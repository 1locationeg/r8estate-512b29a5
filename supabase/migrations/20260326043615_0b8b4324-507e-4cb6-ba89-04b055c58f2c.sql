-- Drop the self-referencing policy that causes infinite recursion
DROP POLICY IF EXISTS "Can view co-participants" ON public.conversation_participants;

-- Replace with a non-recursive approach: users can see participants 
-- for conversations they belong to, using a security definer function
CREATE OR REPLACE FUNCTION public.user_in_conversation(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = auth.uid()
  )
$$;

-- New non-recursive policy using the security definer function
CREATE POLICY "Can view co-participants via function"
ON public.conversation_participants FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.user_in_conversation(conversation_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Drop the now-redundant policies (covered by the new one)
DROP POLICY IF EXISTS "Participants can view their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Admins can view all participants" ON public.conversation_participants;