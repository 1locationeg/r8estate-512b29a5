ALTER TABLE public.professional_pages
  ADD COLUMN IF NOT EXISTS cover_source_url text,
  ADD COLUMN IF NOT EXISTS cover_crop jsonb;