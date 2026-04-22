ALTER TABLE public.receipt_submissions
  ADD COLUMN IF NOT EXISTS document_type text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS authenticity_score integer,
  ADD COLUMN IF NOT EXISTS authenticity_label text,
  ADD COLUMN IF NOT EXISTS authenticity_flags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS redacted_fields jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extracted_developer_name text,
  ADD COLUMN IF NOT EXISTS redacted_image_url text;

CREATE INDEX IF NOT EXISTS idx_receipt_submissions_authenticity_score
  ON public.receipt_submissions (authenticity_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_receipt_submissions_document_type
  ON public.receipt_submissions (document_type);