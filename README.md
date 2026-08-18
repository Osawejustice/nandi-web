# Nandi Web

**Cloud Contact Center (CCaaS) — Agent Workspace UI**

Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Zustand

Companion frontend to the [Nandi Go backend](https://github.com/Osawejustice/usenandiv1). Backend is the source of truth — frontend talks to it via REST + WebSocket only.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your backend URLs

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Go backend REST API |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080/ws` | Go backend WebSocket endpoint |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build + type check |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emit |
| `npx shadcn@latest add <component>` | Add a shadcn/ui component |

## Project Structure

```
nandi-web/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Login, Register
│   │   ├── (dashboard)/             # Protected layout (sidebar + topbar)
│   │   │   ├── dashboard/           # Overview stats
│   │   │   ├── inbox/               # Unified conversation inbox
│   │   │   ├── contacts/            # Customer contacts
│   │   │   ├── campaigns/           # Multi-channel campaigns
│   │   │   ├── analytics/           # Performance dashboards
│   │   │   └── settings/            # Workspace settings
│   │   └── (onboarding)/            # Create organization flow
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── inbox/                   # Inbox-specific components
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── hooks/                       # useAuth, useInbox, useConversation
│   ├── stores/                      # Zustand state (authStore)
│   ├── lib/
│   │   ├── api.ts                   # Typed fetch wrapper + auth headers
│   │   ├── auth.ts                  # Token storage (memory + cookie)
│   │   ├── ws.ts                    # WebSocket client with reconnect
│   │   ├── types.ts                 # Shared TypeScript types
│   │   └── utils.ts                 # cn() helper
│   └── middleware.ts                # Route protection
├── tailwind.config.ts               # Design tokens (Nandi brand colors)
├── components.json                  # shadcn/ui configuration
└── package.json
```

## Design System

Color palette aligned to the [Nandi landing page](https://github.com/Osawejustice/usenandiv1):

| Token | Hex | Usage |
|---|---|---|
| **Brand** | `#0F766E` | Primary actions, navigation, focus rings |
| **Brand Dark** | `#115E59` | Hover states |
| **Brand Light** | `#14B8A6` | Accents, gradients |
| **Accent** | `#D97706` | Conversion CTAs only |
| **Background** | `#FAFAF9` | Page canvas |
| **Soft** | `#F5F5F4` | Hover states, secondary surfaces |
| **Ink** | `#0C0A09` | Primary text |
| **Live** | `#16A34A` | Success, active status |

**Typography:** Inter (body) · JetBrains Mono (code)  
**Buttons:** `rounded-full` with lift/float shadow transitions  
**Components:** shadcn/ui primitives styled with Nandi tokens

## Architecture Rules

- Backend owns all business rules. Frontend does presentation + optimistic UI only.
- Auth tokens live in memory + cookie — never `localStorage` for long-lived secrets.
- One WebSocket connection per logged-in agent. Reconnect + resubscribe on disconnect.
- All API calls go through the typed client in `lib/api.ts`.
- Tenant context comes from the JWT / backend — no client-side tenancy logic.

## Auth Flow

1. User visits `/register` or `/login`
2. Form submits to backend → receives `access_token` + `refresh_token`
3. Tokens stored in memory + cookie via `lib/auth.ts`
4. WebSocket connects with the access token
5. Middleware redirects unauthenticated users to `/login`
6. Logout clears tokens + disconnects WebSocket

## Inbox Features

- **Split-view layout** — conversation list (380px) + thread panel
- **Status filters** — All / Open / Pending / Resolved / Closed
- **Search** — filter conversations by contact name or message content
- **Message thread** — inbound (left) vs outbound (right) with sentiment badges
- **Reply composer** — Enter to send, Shift+Enter for newline, auto-expanding textarea
- **Optimistic UI** — reply appears instantly, reconciles with server response
- **Live updates** — WebSocket pushes `new_message` and `conversation_updated` events
- **Responsive** — mobile shows one panel at a time with back navigation

## License

Private — Nandi Operations
