# BGG Collection Aggregator

A React + TypeScript app built with Vite that aggregates multiple BoardGameGeek users' collections and lets you filter by player count, play time, complexity, and more.

Tech stack:
- TanStack Router (file-based routing with vite plugin)
- TanStack Query for data fetching/cache
- Axios with retries and rate limiting
- Mantine UI

## Features
- Aggregate owned collections from multiple BGG usernames
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
- src/utils/* — normalization, merging, filtering, sorting
- src/components/* — UI (Mantine)
- src/routes/* — File-based routes for TanStack Router

## Customize
- To adjust throttling, change minTimeBetweenRequests in RateLimiter inside ggClient.ts.
- To add filters, extend FilterState in src/types/bgg.types.ts and update iltering.ts and FilterPanel.tsx.
