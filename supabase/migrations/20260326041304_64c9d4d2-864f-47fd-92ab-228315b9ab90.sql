
-- Allow admins to insert messages into any conversation
CREATE POLICY "Admins can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to join any conversation as participant
CREATE POLICY "Admins can join conversations"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND has_role(auth.uid(), 'admin'::app_role)
);
