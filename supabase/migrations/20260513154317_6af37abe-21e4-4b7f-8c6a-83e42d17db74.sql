
create table if not exists public.og_overrides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  image_url text,
  title text,
  description text,
  body_html text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.og_overrides enable row level security;

create policy "og_overrides public read enabled"
  on public.og_overrides for select
  using (enabled = true or public.has_role(auth.uid(), 'admin'));

create policy "og_overrides admin insert"
  on public.og_overrides for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "og_overrides admin update"
  on public.og_overrides for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "og_overrides admin delete"
  on public.og_overrides for delete
  using (public.has_role(auth.uid(), 'admin'));

create trigger trg_og_overrides_updated
  before update on public.og_overrides
  for each row execute function public.update_updated_at_column();

insert into storage.buckets (id, name, public)
values ('og-professional-assets', 'og-professional-assets', true)
on conflict (id) do nothing;

create policy "og-prof-assets public read"
  on storage.objects for select
  using (bucket_id = 'og-professional-assets');

create policy "og-prof-assets admin write"
  on storage.objects for insert
  with check (bucket_id = 'og-professional-assets' and public.has_role(auth.uid(), 'admin'));

create policy "og-prof-assets admin update"
  on storage.objects for update
  using (bucket_id = 'og-professional-assets' and public.has_role(auth.uid(), 'admin'));

create policy "og-prof-assets admin delete"
  on storage.objects for delete
  using (bucket_id = 'og-professional-assets' and public.has_role(auth.uid(), 'admin'));
