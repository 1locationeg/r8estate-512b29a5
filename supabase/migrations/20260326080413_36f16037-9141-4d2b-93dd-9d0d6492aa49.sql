
-- Add KYC columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_document_url text;

-- Add selfie_url and id_document_url to reviewer_verifications
ALTER TABLE public.reviewer_verifications ADD COLUMN IF NOT EXISTS selfie_url text;
ALTER TABLE public.reviewer_verifications ADD COLUMN IF NOT EXISTS id_document_url text;
