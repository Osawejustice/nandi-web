# Nandi Web

Africa-first customer engagement workspace — the agent frontend for the Nandi API.

Next.js 14 · TypeScript · Tailwind CSS · Zustand

The backend at `nandi-api` is the source of truth. This app talks to it only through REST JSON and WebSocket.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Point the URLs at your running nandi-api instance
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The API must be running (default `http://localhost:8080`).

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | REST base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080/api/v1/ws` | Authenticated WebSocket (`?access_token=`) |

Never put provider secrets in `NEXT_PUBLIC_*` variables.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Auth

1. `POST /api/v1/auth/register` creates an organization and owner, then returns tokens.
2. `POST /api/v1/auth/login` returns the same session payload.
3. Access + refresh tokens are stored in memory and cookies.
4. Expired access tokens are refreshed via `POST /api/v1/auth/refresh`.
5. `GET /api/v1/me` restores the session after a browser refresh.
6. WebSocket connects to `/api/v1/ws?access_token=...`.

## Product surfaces

- `/dashboard` — operational overview from `/analytics/overview` plus recent conversations
- `/inbox` — three-pane agent workspace
- `/contacts` — CRM list, create, edit, detail
- `/campaigns` — list, create, detail, start
- `/analytics` — backend overview metrics
- `/settings` — profile, org, team, API keys, provider status, preferences
