
-- Seed OG meta settings into platform_settings
INSERT INTO public.platform_settings (key, value)
VALUES
  ('og_title', 'R8ESTATE - Reviews Always Right'),
  ('og_description', 'The reputation platform for off-plan real estate. Verified reviews, trust scores, and developer ratings.'),
  ('og_image', 'https://lovable.dev/opengraph-image-p98pqg.png')
ON CONFLICT DO NOTHING;
