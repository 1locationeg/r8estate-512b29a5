
-- Table for editable Trust Page content
CREATE TABLE public.professional_pages (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_url text,
  headline text,
  bio text,
  location text,
  languages text[] DEFAULT '{}'::text[],
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professional pages"
  ON public.professional_pages FOR SELECT
  USING (true);

CREATE POLICY "Owner can insert own professional page"
  ON public.professional_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update own professional page"
  ON public.professional_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can delete own professional page"
  ON public.professional_pages FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_professional_pages_updated
  BEFORE UPDATE ON public.professional_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public storage bucket for cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-covers', 'professional-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cover images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'professional-covers');

CREATE POLICY "Owner can upload own cover image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'professional-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can update own cover image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'professional-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can delete own cover image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'professional-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
