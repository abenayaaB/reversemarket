# ReverseMarket

**Tell us what you need. Let providers compete for you.**

ReverseMarket is a reverse marketplace prototype for the hackathon:
customers post requirements and providers compete by submitting offers. Customers can compare offers using an explainable compatibility score, shortlist providers, and select the best offer.

## Current feature set

### Customer
- Register / login
- Customer dashboard with live Supabase statistics
- Post requirements
- View and search requirements
- View received provider offers
- Compare offers by price, delivery and relevance
- Explainable Match Score (%)
- Shortlist offers
- Select a provider
- Automatically reject other offers after selection
- Close the requirement
- Mark completed after work is finished
- Manage profile
- Marketplace map with provider service areas
- Verified provider reputation: success rate, completed projects and ratings
- Completed-project customer feedback
- Provider profile with recent customer feedback

### Provider
- Register / login
- Provider dashboard
- Recommended open requirements
- Browse/search/filter requirements
- View requirement details
- Submit one offer per requirement
- Success state after submission
- My Offers with live status tracking
- Submitted / Shortlisted / Selected / Rejected states
- Manage profile
- Marketplace map with provider service areas
- Verified provider reputation: success rate, completed projects and ratings
- Completed-project customer feedback
- Provider profile with recent customer feedback

## Tech stack

- React + Vite
- Tailwind CSS
- React Router
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Lucide React

## Matching logic

The client uses an explainable 100-point matching model:

- Budget compatibility: 50 points
- Delivery compatibility: 30 points
- Relevance: 20 points

The relevance score considers the requirement title/category/description against provider information and the provider's proposal.

## Run locally

From the project root:

```powershell
cd client
npm install
npm run dev
```

Open the local URL shown by Vite, normally:

```text
http://localhost:5173/
```

## Environment variables

Create `client/.env` from `client/.env.example` and add your Supabase project URL and anon/publishable key.

Do not commit `.env` or service-role keys.

## Supabase

The current application uses the schema documented in:

```text
supabase/schema.sql
```

If your existing Supabase project is already configured and working, **do not rerun the schema blindly**. The schema file is primarily documentation/setup for a fresh project.

## Important

The `server/` folder is retained from the original scaffold, but the current client uses Supabase directly and does not require the Express server for the core demo.

## Demo flow

```text
Customer posts requirement
        ↓
Provider browses requirement
        ↓
Provider submits offer
        ↓
Customer receives multiple offers
        ↓
Match Score + comparison
        ↓
Customer shortlists
        ↓
Customer selects provider
        ↓
Selected provider sees updated status
        ↓
Requirement can be marked completed
```

## New marketplace map + provider reputation + feedback upgrade

This version adds:
- Dedicated Marketplace Map navigation for both customers and providers.
- Customer view: provider service locations, reputation, completed projects and ratings.
- Provider view: open customer requirements by location.
- Provider profile service location field.
- Customer feedback after a requirement is marked completed.
- Provider dashboard reputation card and recent customer feedback.
- Customer dashboard prompts for pending completed-project feedback.
- Completion and review events surfaced in provider notifications.
- Provider success rate based on selected projects marked completed.
- Provider average rating and customer feedback history.
- Public provider profile page from customer offer comparison/map.

### Required Supabase upgrade

For an existing ReverseMarket database, run:
`supabase/migrations/20261005_provider_reputation_and_locations.sql`

Run it once in Supabase SQL Editor before using the new map/profile/feedback features. Existing requirements, offers, users and authentication are preserved.

For providers, open Profile and add a city/service area such as `Chennai, Tamil Nadu`. The map intentionally uses a service area rather than requiring a private street address.


For a step-by-step existing-database upgrade, see `SUPABASE_SETUP.md`.
