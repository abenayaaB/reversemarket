-- ReverseMarket current Supabase schema
-- This file documents the schema used by the current React client.
-- Run only on a fresh Supabase project.

create extension if not exists pgcrypto;

-- ==================== TABLES ====================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('customer', 'provider')),
  phone text,
  company_name text,
  bio text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  budget_min numeric not null default 0,
  budget_max numeric not null,
  deadline date not null,
  location text,
  status text not null default 'open'
    check (status in ('open', 'closed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  price numeric not null check (price > 0),
  delivery_date date not null,
  message text not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'shortlisted', 'selected', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requirement_id, provider_id)
);

create index if not exists idx_requirements_customer
  on public.requirements(customer_id);

create index if not exists idx_requirements_status
  on public.requirements(status);

create index if not exists idx_offers_requirement
  on public.offers(requirement_id);

create index if not exists idx_offers_provider
  on public.offers(provider_id);

-- ==================== PROFILE CREATION ====================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role,
    phone,
    company_name,
    bio
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    case
      when new.raw_user_meta_data->>'role' = 'provider'
        then 'provider'
      else 'customer'
    end,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'bio'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- ==================== RLS ====================

alter table public.profiles enable row level security;
alter table public.requirements enable row level security;
alter table public.offers enable row level security;

-- Profiles
drop policy if exists "Users can view profiles" on public.profiles;
create policy "Users can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Requirements
drop policy if exists "Anyone authenticated can view open requirements" on public.requirements;
create policy "Anyone authenticated can view open requirements"
on public.requirements
for select
to authenticated
using (
  status = 'open'
  or customer_id = auth.uid()
);

drop policy if exists "Customers can create requirements" on public.requirements;
create policy "Customers can create requirements"
on public.requirements
for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists "Customers can update their own requirements" on public.requirements;
create policy "Customers can update their own requirements"
on public.requirements
for update
to authenticated
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

drop policy if exists "Customers can delete their own requirements" on public.requirements;
create policy "Customers can delete their own requirements"
on public.requirements
for delete
to authenticated
using (customer_id = auth.uid());

-- Offers
drop policy if exists "Users can view relevant offers" on public.offers;
create policy "Users can view relevant offers"
on public.offers
for select
to authenticated
using (
  provider_id = auth.uid()
  or exists (
    select 1
    from public.requirements r
    where r.id = requirement_id
      and r.customer_id = auth.uid()
  )
);

drop policy if exists "Providers can create their own offers" on public.offers;
create policy "Providers can create their own offers"
on public.offers
for insert
to authenticated
with check (
  provider_id = auth.uid()
  and exists (
    select 1
    from public.requirements r
    where r.id = requirement_id
      and r.status = 'open'
  )
);

drop policy if exists "Providers can update their own offers" on public.offers;
create policy "Providers can update their own offers"
on public.offers
for update
to authenticated
using (provider_id = auth.uid())
with check (provider_id = auth.uid());

drop policy if exists "Providers can delete their own offers" on public.offers;
create policy "Providers can delete their own offers"
on public.offers
for delete
to authenticated
using (provider_id = auth.uid());

drop policy if exists "Customers can update offers on their requirements" on public.offers;
create policy "Customers can update offers on their requirements"
on public.offers
for update
to authenticated
using (
  exists (
    select 1
    from public.requirements r
    where r.id = requirement_id
      and r.customer_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.requirements r
    where r.id = requirement_id
      and r.customer_id = auth.uid()
  )
);


-- ==================== PROVIDER REPUTATION / FEEDBACK ====================

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
