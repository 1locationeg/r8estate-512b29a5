-- Homepage sections visibility manager
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  phase text NOT NULL DEFAULT 'always',
  audience text NOT NULL DEFAULT 'all',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read homepage sections"
  ON public.homepage_sections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert homepage sections"
  ON public.homepage_sections FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update homepage sections"
  ON public.homepage_sections FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete homepage sections"
  ON public.homepage_sections FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed every existing homepage section with the Pro GTM preset applied
INSERT INTO public.homepage_sections (key, label, phase, audience, is_visible, sort_order) VALUES
  ('hero',                    'Main Hero',                    'always',   'all',          true,  10),
  ('pro_founder_counter',     'Founder Members Counter',      'pro_gtm',  'professional', true,  15),
  ('pro_leaderboard',         'Top 1% Pros Leaderboard',      'pro_gtm',  'professional', true,  20),
  ('pro_spotlight',           'Featured Pro Spotlight',       'pro_gtm',  'professional', true,  25),
  ('pro_how_it_works',        'How a Trust Page Works',       'pro_gtm',  'professional', true,  30),
  ('pro_endorsements',        'Endorsement & Verified Deal',  'pro_gtm',  'professional', true,  35),
  ('pro_testimonials',        'Pro Testimonials',             'pro_gtm',  'professional', true,  40),
  ('pro_final_cta',           'Claim Your Page CTA',          'pro_gtm',  'professional', true,  45),
  ('spotlight',               'Developer Spotlight',          'phase_2',  'buyer',        false, 110),
  ('compare_engine',          'Compare Engine Showcase',      'phase_2',  'buyer',        false, 120),
  ('finance_grid',            'Deal/Launch/Contract/Pulse',   'phase_3',  'buyer',        false, 130),
  ('trust_strip',             'Trust Strip Pills',            'always',   'all',          true,  140),
  ('how_we_work',             'How We Work (generic)',        'phase_2',  'buyer',        false, 150),
  ('audience_segments',       'Audience Segment Cards',       'phase_2',  'all',          false, 160),
  ('community_highlights',    'Community Highlights',         'phase_2',  'buyer',        false, 170),
  ('reviews_carousel',        'Reviews Carousel',             'phase_2',  'buyer',        false, 180),
  ('pricing_teaser',          'Pricing Teaser',               'phase_3',  'business',     false, 190),
  ('sdg_strip',               'SDG Alignment Strip',          'always',   'all',          true,  200),
  ('journey_complete_cta',    'Journey Complete CTA',         'phase_2',  'all',          false, 210),
  ('site_experience_feedback','Site Experience Feedback',     'always',   'all',          true,  220),
  ('hero_category_links',     'Browse by Category',           'phase_2',  'buyer',        false, 230),
  ('smart_recommendations',   'Smart Recommendations',        'phase_3',  'buyer',        false, 240);