
-- Create admin permission levels enum
CREATE TYPE public.admin_permission_level AS ENUM ('super_admin', 'admin', 'editor', 'view_only');

-- Create admin_permissions table
CREATE TABLE public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  permission_level admin_permission_level NOT NULL DEFAULT 'view_only',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view all admin permissions
CREATE POLICY "Admins can view admin permissions"
  ON public.admin_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Only super_admin can insert/update/delete
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions
    WHERE user_id = _user_id AND permission_level = 'super_admin'
  )
$$;

CREATE POLICY "Super admins can insert admin permissions"
  ON public.admin_permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update admin permissions"
  ON public.admin_permissions FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete admin permissions"
  ON public.admin_permissions FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Set the first admin as super_admin
INSERT INTO public.admin_permissions (user_id, permission_level)
VALUES ('6c1146d9-ed9a-4a23-b7e5-081caeaf1eed', 'super_admin');

-- Set the second admin as default 'admin'
INSERT INTO public.admin_permissions (user_id, permission_level)
VALUES ('915e1c67-6cd6-4387-9aaa-34e6d382bc97', 'admin');
