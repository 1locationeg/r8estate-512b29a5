
-- Make comment nullable on reviews table
ALTER TABLE public.reviews ALTER COLUMN comment DROP NOT NULL;

-- Add completion_level to reviews
ALTER TABLE public.reviews ADD COLUMN completion_level text NOT NULL DEFAULT 'rating_only';

-- Make comment nullable on guest_reviews table
ALTER TABLE public.guest_reviews ALTER COLUMN comment DROP NOT NULL;

-- Add completion_level to guest_reviews
ALTER TABLE public.guest_reviews ADD COLUMN completion_level text NOT NULL DEFAULT 'rating_only';
