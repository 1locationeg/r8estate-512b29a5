
-- Add flagged_at column to community_posts for 100-minute grace period
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS flagged_at timestamptz DEFAULT NULL;

-- Create content_reports table for universal flag/report system
CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('post', 'reply', 'comment', 'review', 'review_reply')),
  content_id text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'harassment', 'misinformation', 'inappropriate', 'defamation', 'other')),
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert own reports
CREATE POLICY "Users can insert own reports"
  ON public.content_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view own reports
CREATE POLICY "Users can view own reports"
  ON public.content_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
  ON public.content_reports FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
