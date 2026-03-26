-- Fix the conversations SELECT policy that also references conversation_participants
-- (which could cause issues with the recursive pattern)
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;

CREATE POLICY "Participants can view conversations"
ON public.conversations FOR SELECT TO authenticated
USING (
  public.user_in_conversation(id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Drop now-redundant admin policy
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;