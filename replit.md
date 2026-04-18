# Prime Link OS

## Overview
Prime Link OS is an internal business operating platform for a digital marketing/SEO agency. It features a public branding homepage, hidden admin/employee login portals, and role-based dashboards for admin, salesman, and worker roles.

## Architecture
pnpm workspace monorepo with TypeScript throughout.

- `artifacts/prime-link-os` — React + Vite frontend (port via `$PORT`, default 25019)
- `artifacts/api-server` — Express 5 REST API (port 8080)
- `lib/api-spec` — OpenAPI YAML spec
- `lib/api-zod` — Zod schemas generated from OpenAPI by Orval
- `lib/api-client-react` — React Query hooks generated from OpenAPI by Orval
- `lib/db` — Drizzle ORM schema + migrations (PostgreSQL)

## Stack
- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec → Zod + React Query hooks)
- **Frontend framework**: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- **Routing**: wouter
- **State/data**: TanStack Query v5

## Key Credentials
- **Admin login URL**: `/Admin.primelink.sec.mang.dash`
- **Employee login URL**: `/Prime.link.emp.sec.dash.work`
- **Admin account**: xyzapplywork@gmail.com / PrimeLink@2024!
- **Employee passwords**: Salesman@123 (salesmen), Worker@123 (workers)
- **Password hash**: SHA256 with salt `prime_link_salt_2024`

## Roles & Routes
- **admin**: `/admin`, `/admin/employees`, `/admin/clients`, `/admin/tasks`, `/admin/earnings`, `/admin/plans`, `/admin/chat`
- **salesman**: `/salesman`, `/salesman/add-client`, `/salesman/earnings`, `/salesman/chat`
- **worker**: `/worker`, `/worker/tasks`, `/worker/earnings`, `/worker/chat`

## Key Pages
- `pages/home.tsx` — Public SEO agency marketing homepage
- `pages/admin-login.tsx` — Hidden admin login (shield icon, blue theme)
- `pages/employee-login.tsx` — Hidden employee login (briefcase icon, indigo theme)
- `pages/admin/dashboard.tsx` — Stats, revenue chart, employee monitor, top performers
- `pages/admin/employees.tsx` — CRUD employees (salesman/worker), performance tracking
- `pages/admin/clients.tsx` — View all clients, assign workers, change status
- `pages/admin/tasks.tsx` — Create/manage tasks with priority labels, approve completions
- `pages/admin/earnings.tsx` — View all transactions, mark payouts
- `pages/admin/plans.tsx` — CRUD service plans (price, commissions)
- `pages/salesman/dashboard.tsx` — Personal stats, client list, recent earnings
- `pages/salesman/add-client.tsx` — Add new clients tied to plans
- `pages/salesman/earnings.tsx` — Salesman earning history
- `pages/worker/dashboard.tsx` — Task pipeline, start/complete tasks
- `pages/worker/tasks.tsx` — Detailed task management with progress tracking
- `pages/worker/earnings.tsx` — Worker payment history
- `pages/shared/chat.tsx` — Group + private messaging (polls every 3s)

## API Routes (all under `/api/`)
- `auth` — login, logout, /me
- `users` — CRUD employees
- `clients` — CRUD clients (filtered by role)
- `tasks` — CRUD tasks (filtered by role)
- `earnings` — CRUD earnings (filtered by role)
- `messages` — group + private messages
- `plans` — CRUD service plans
- `analytics` — dashboard stats, revenue chart, top performers

## Orval Quirk
After running codegen, `lib/api-zod/src/index.ts` may re-add bad exports. Correct content is just:
```ts
export * from "./generated/api";
```

## Design System
- Dark theme forced via `document.documentElement.classList.add("dark")` in main.tsx
- Background: `#09090f` (222 47% 11%)
- Primary: Blue (217.2 91.2% 59.8%)
- CSS variables in `src/index.css` using Tailwind v4 `@theme inline` syntax
- No emojis — only lucide-react icons throughout
