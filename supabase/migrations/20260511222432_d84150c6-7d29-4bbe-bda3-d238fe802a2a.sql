create or replace function public.get_professional_by_slug(_slug text)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  cover_url text,
  headline text,
  bio text,
  location text,
  languages text[],
  sections jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.user_id,
    p.full_name,
    p.avatar_url,
    pp.cover_url,
    pp.headline,
    pp.bio,
    pp.location,
    pp.languages,
    coalesce(pp.sections, '[]'::jsonb)
  from public.profiles p
  join public.user_account_kinds k on k.user_id = p.user_id and k.account_kind = 'professional'
  left join public.professional_pages pp on pp.user_id = p.user_id
  where p.full_name is not null
    and regexp_replace(
          regexp_replace(lower(trim(p.full_name)), '[^a-z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ) = _slug
  limit 1;
$$;

grant execute on function public.get_professional_by_slug(text) to anon, authenticated;