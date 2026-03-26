
-- Admin can read all messages
CREATE POLICY "Admins can read all messages"
ON public.messages FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can read all conversation_participants
CREATE POLICY "Admins can view all participants"
ON public.conversation_participants FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
