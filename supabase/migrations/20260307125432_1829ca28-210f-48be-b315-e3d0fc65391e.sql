
CREATE TABLE public.receipt_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  developer_id TEXT,
  developer_name TEXT,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.receipt_submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own receipts
CREATE POLICY "Users can insert own receipts"
  ON public.receipt_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own receipts
CREATE POLICY "Users can view own receipts"
  ON public.receipt_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts"
  ON public.receipt_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update receipts (approve/reject)
CREATE POLICY "Admins can update receipts"
  ON public.receipt_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
