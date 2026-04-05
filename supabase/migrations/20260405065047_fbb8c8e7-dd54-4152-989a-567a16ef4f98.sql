ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS category_ratings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.guest_reviews ADD COLUMN IF NOT EXISTS category_ratings jsonb DEFAULT '{}'::jsonb;