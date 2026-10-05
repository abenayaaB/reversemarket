# ReverseMarket — one-time Supabase setup

This project keeps the existing ReverseMarket database and adds provider reputation, customer feedback, and marketplace locations.

## For an existing ReverseMarket project

Open **Supabase → SQL Editor → New query** and paste the complete contents of:

```text
supabase/migrations/20261005_provider_reputation_and_locations.sql
```

Run it once.

The migration is idempotent for the supported tables/columns and does not delete existing users, requirements or offers.

## Verify the upgrade

Run:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'location';

select to_regprocedure('public.get_provider_reputation(uuid[])');

select to_regclass('public.provider_reviews');
```

Expected:

- `location`
- `public.get_provider_reputation(uuid[])`
- `provider_reviews`

## Provider setup

After the migration:

1. Sign in as a provider.
2. Open **Profile**.
3. Add a city/service area, for example `Chennai, Tamil Nadu`.
4. Save.

The location is intentionally a service area, not a private street address.

## Feedback flow

1. Customer receives offers.
2. Customer selects one provider.
3. Requirement becomes closed.
4. Customer clicks **Mark as completed** after the work is actually finished.
5. The completed-project feedback panel appears.
6. Customer gives 1–5 stars and written feedback.
7. The review is stored against the selected offer.
8. Provider success rate and rating update from real database data.

Success rate is:

```text
completed selected projects / selected projects × 100
```

Ratings are the average of verified customer reviews.

## Important

Do not use the fresh-project `supabase/schema.sql` as a destructive replacement for an existing production/demo database. The migration above is the intended upgrade path for the existing ReverseMarket project.
