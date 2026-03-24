
-- Create widget_configs table
CREATE TABLE public.widget_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  embed_token text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Generate embed token function
CREATE OR REPLACE FUNCTION public.generate_embed_token()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT substr(md5(random()::text || now()::text), 1, 12)
$$;

-- Enable RLS
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;

-- Admins full CRUD
CREATE POLICY "Admins can manage all widgets"
ON public.widget_configs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can read active widgets (for embed rendering)
CREATE POLICY "Anyone can read active widgets"
ON public.widget_configs
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Auto-update updated_at
CREATE TRIGGER update_widget_configs_updated_at
  BEFORE UPDATE ON public.widget_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
