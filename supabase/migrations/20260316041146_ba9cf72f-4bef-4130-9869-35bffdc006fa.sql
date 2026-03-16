
-- Create saved_items table
CREATE TABLE public.saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id text NOT NULL,
  item_type text NOT NULL,
  item_name text NOT NULL,
  item_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved items" ON public.saved_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items" ON public.saved_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items" ON public.saved_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saved items" ON public.saved_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create followed_businesses table
CREATE TABLE public.followed_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_id text NOT NULL,
  business_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

ALTER TABLE public.followed_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own followed businesses" ON public.followed_businesses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own followed businesses" ON public.followed_businesses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own followed businesses" ON public.followed_businesses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all followed businesses" ON public.followed_businesses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
