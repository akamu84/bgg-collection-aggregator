# BGG Collection Aggregator

A React + TypeScript app built with Vite that aggregates multiple BoardGameGeek users' collections and lets you filter by player count, play time, complexity, and more.

[![Deploy static site to GitHub Pages](https://github.com/akamu84/bgg-collection-aggregator/actions/workflows/deploy.yml/badge.svg)](https://github.com/akamu84/bgg-collection-aggregator/actions/workflows/deploy.yml)

Live site: https://akamu84.github.io/bgg-collection-aggregator/

Tech stack:

- TanStack Router (file-based routing with vite plugin)
- TanStack Query for data fetching/cache
- TanStack Form for form state management
- Axios with retries and rate limiting
- Mantine UI

## Features

- Aggregate owned collections from multiple BGG usernames
- **Share links with pre-loaded usernames** using URL parameters (e.g., `?users=user1,user2,user3`)
- Filter by player count, play time, complexity, and minimum rating
- Sort by name, rating, rank, complexity, playing time, or number of owners
- Built-in retry/backoff and a 1 rps rate limiter for BGG XML API2
- Dev proxy to bypass CORS in development

## Getting started

`pwsh

# Install deps

npm install

# Start dev server

npm run dev

# Build for production

npm run build

# Preview the production build

npm run preview
`

Open http://localhost:5173/ in your browser, add a few BGG usernames, and use the filters.

## Sharing Collections

You can share a link with pre-loaded usernames by adding them to the URL as a comma-separated list:

```
https://akamu84.github.io/bgg-collection-aggregator/?users=username1,username2,username3
```

When someone opens the link, the specified usernames will automatically be loaded and their collections aggregated. The URL updates automatically as you add or remove usernames, making it easy to share your current view.

## Deployment (GitHub Pages)

This repo is set up to auto-deploy to GitHub Pages via Actions on every push to `main`.

- Public URL: https://akamu84.github.io/bgg-collection-aggregator/
- Workflow: `.github/workflows/deploy.yml`

Notes:

- Vite `base` is configured to `/bgg-collection-aggregator/` so assets resolve under the project subpath.
- TanStack Router uses `basepath: import.meta.env.BASE_URL` so client-side routing works under the subpath.
- SPA fallback is handled by copying `index.html` to `404.html` during the build step.

First-time setup (one-time):

1. In GitHub → Repo Settings → Pages, set Source to “GitHub Actions”.
2. Push to `main` (or re-run the deploy workflow) to publish.

Manual deploy trigger:

1. Make any change and push to `main`, or use “Re-run jobs” on the last workflow run.

## Forms

- The username input and filter controls use TanStack Form to manage state.
- Username form: see `src/components/CollectionAggregator.tsx` (`usernameForm`).
- Filters form: see `src/components/FilterPanel.tsx` (Mantine inputs are wired via `form.Field`).
- Resetting filters uses `form.reset({})` and stays in sync with parent state.

## BGG API usage

- Endpoints used: /collection and /thing (with stats=1)
- Handles 202 (queued) responses with automatic retries and exponential backoff
- Respects Retry-After header when provided
- Throttles to minimum 1 second between outbound requests
- Batches /thing requests to 20 IDs per call to reduce load

## Notes and limits

- The BGG XML API can be slow or temporarily queue requests; allow a few seconds for large collections.
- Complexity (weight) comes from /thing?stats=1; the app fetches details only for games missing weight to reduce calls.

## Project structure

- src/api/bggClient.ts — Axios client, retry + rate limiting, XML parsing
- src/hooks/useBGGData.ts — Query hooks to load/aggregate data
- src/utils/\* — normalization, merging, filtering, sorting
- src/components/\* — UI (Mantine)
- src/routes/\* — File-based routes for TanStack Router

## Customize

- To adjust throttling, change minTimeBetweenRequests in RateLimiter inside ggClient.ts.
- To add filters, extend FilterState in src/types/bgg.types.ts and update iltering.ts and FilterPanel.tsx.
