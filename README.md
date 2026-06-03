# FloodWatch Web — IoT Flood Early-Warning Dashboard

React + TypeScript + Vite dashboard for the IoT Flood Early-Warning System.
Visualises real-time sensor readings, site-specific flood risk, time-to-flood
projections, historical trends, the rainfall→water-level relationship, station
health, and the CAP alert log. Talks to the FastAPI backend over REST and a
WebSocket (with automatic polling fallback).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Live dashboard — network status, per-site risk, focused-site metrics & charts |
| `/stations` · `/stations/:id` | Station fleet health, battery, RF link; per-node detail & charts |
| `/alerts` | Filterable CAP alert log with acknowledge + CAP detail dialog |
| `/history` | Time-range explorer: water level / rainfall / dH/dt charts + table + CSV export |
| `/analytics` | Rainfall→dH/dt scatter, fitted α, classification mix, cross-site comparison |
| `/settings` | Site threshold calibration + SMS/push subscriber management |

## Develop

```bash
cd community-watch-web
npm install
npm run dev        # http://localhost:8080
```

The backend must be running (see `../community-watch-server`). Configure the API
endpoint via `.env`:

```
VITE_API_URL=http://localhost:8000
# VITE_WS_URL is derived from VITE_API_URL if omitted
```

## Build

```bash
npm run build      # type-checks and bundles to dist/
npm run preview    # preview the production build
```

## Real-time

`src/hooks/use-realtime.tsx` opens a WebSocket to the backend, reconnects with
backoff, and invalidates React Query caches on `reading` / `alert` messages.
When the socket is unavailable the data hooks fall back to polling
(`src/hooks/use-api.ts`), so the dashboard keeps updating either way.

## Deploy

Vercel (root directory `community-watch-web`). See `../DEPLOYMENT.md`.

---

Final-year project · Department of Electrical & Electronics Engineering,
University of Lagos.
