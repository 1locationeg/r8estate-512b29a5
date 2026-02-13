
-- Create storage bucket for review attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('review-attachments', 'review-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "Review attachments are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-attachments');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload review attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-attachments' AND auth.uid() IS NOT NULL);

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own review attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
