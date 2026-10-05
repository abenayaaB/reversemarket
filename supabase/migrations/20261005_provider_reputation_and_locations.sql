-- ReverseMarket upgrade: provider locations + completed-project feedback + reputation.
-- Run this ONCE in the existing ReverseMarket Supabase project.

alter table public.profiles
  add column if not exists location text;

create table if not exists public.provider_reviews (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  feedback text not null,
  created_at timestamptz not null default now(),
  unique (offer_id),
  unique (requirement_id, customer_id)
);

create index if not exists idx_provider_reviews_provider
  on public.provider_reviews(provider_id);

create index if not exists idx_provider_reviews_requirement
  on public.provider_reviews(requirement_id);

alter table public.provider_reviews enable row level security;

drop policy if exists "Authenticated users can view provider reviews" on public.provider_reviews;
create policy "Authenticated users can view provider reviews"
on public.provider_reviews
for select
to authenticated
using (true);

drop policy if exists "Customers can submit feedback for completed selected work" on public.provider_reviews;
create policy "Customers can submit feedback for completed selected work"
on public.provider_reviews
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1
    from public.requirements r
    join public.offers o on o.requirement_id = r.id
    where r.id = requirement_id
      and r.customer_id = auth.uid()
      and r.status = 'completed'
      and o.id = offer_id
      and o.provider_id = provider_id
      and o.status = 'selected'
  )
);

-- A safe aggregate function lets the UI show reputation without exposing
-- another user's offer history through client-side queries.
create or replace function public.get_provider_reputation(provider_ids uuid[])
returns table (
  provider_id uuid,
  completed_projects bigint,
  selected_projects bigint,
  success_rate numeric,
  average_rating numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
as $$
  with selected as (
    select
      o.provider_id,
      count(*) as selected_projects,
      count(*) filter (where r.status = 'completed') as completed_projects
    from public.offers o
    join public.requirements r on r.id = o.requirement_id
    where o.provider_id = any(provider_ids)
      and o.status = 'selected'
    group by o.provider_id
  ),
  reviews as (
    select
      pr.provider_id,
      avg(pr.rating)::numeric(10,2) as average_rating,
      count(*) as review_count
    from public.provider_reviews pr
    where pr.provider_id = any(provider_ids)
    group by pr.provider_id
  )
  select
    p.id as provider_id,
    coalesce(s.completed_projects, 0)::bigint as completed_projects,
    coalesce(s.selected_projects, 0)::bigint as selected_projects,
    case
      when coalesce(s.selected_projects, 0) = 0 then 0::numeric
      else round((s.completed_projects::numeric / s.selected_projects::numeric) * 100, 0)
    end as success_rate,
    coalesce(rv.average_rating, 0)::numeric(10,2) as average_rating,
    coalesce(rv.review_count, 0)::bigint as review_count
  from public.profiles p
  left join selected s on s.provider_id = p.id
  left join reviews rv on rv.provider_id = p.id
  where p.id = any(provider_ids)
    and p.role = 'provider';
$$;

grant execute on function public.get_provider_reputation(uuid[]) to authenticated;

-- Ask PostgREST to refresh its schema cache immediately after the migration.
notify pgrst, 'reload schema';
