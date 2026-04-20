
ALTER TABLE public.nfc_tags
  ADD COLUMN IF NOT EXISTS issued_by_admin uuid;

CREATE INDEX IF NOT EXISTS idx_nfc_tags_business_id ON public.nfc_tags(business_id);
CREATE INDEX IF NOT EXISTS idx_nfc_tags_issued_by_admin ON public.nfc_tags(issued_by_admin);
