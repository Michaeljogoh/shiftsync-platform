<div align="center">

# ShiftSync

**Intelligent workforce scheduling for multi-location teams.**

A full-stack platform that handles shift creation, constraint-aware staff assignment, real-time updates, swap/drop workflows, and fairness analytics — built for restaurant groups that operate across timezones.

[![NestJS](https://img.shields.io/badge/API-NestJS%2011-ea2845?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Web-Next.js%2014-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/Lang-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[Live Demo (API)](https://shiftsync-platform.onrender.com/) · [Live Demo (Web)](https://shiftsync-platform-c2uk.onrender.com/login) · [API Docs (Swagger)](https://shiftsync-platform.onrender.com/api/v1/docs)

</div>

> **Note:** The live demo is hosted on Render's free tier. The API may take 30–60 seconds to wake on first request.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker (One Command)](#docker-one-command)
- [Demo Credentials](#demo-credentials)
- [Role-Based Access](#role-based-access)
- [Pages & Routes](#pages--routes)
- [Real-Time Events](#real-time-events)
- [Design Decisions](#design-decisions)
- [Project Structure](#project-structure)

---

## Features

### Scheduling Engine
- **Multi-location, timezone-aware** shifts stored in UTC with IANA timezone display
- **Draft → Published → Cancelled** shift lifecycle with configurable edit cutoff enforcement
- Weekly calendar, list view, and mobile single-day calendar mode
- Overnight shift detection with `+1` day indicator

### Constraint-Aware Assignments
- Double-booking prevention (cross-location)
- Minimum rest period enforcement between shifts
- Consecutive-day limit with manager override flow
- Overtime hard-block at configurable weekly hours
- **What-if analysis** — pre-assignment feasibility checks with projected hours and conflict details

### Swap & Drop Workflows
- Staff-initiated swap requests with multi-step approval (target → manager)
- Drop requests with open claim board — no manager approval needed for claims
- Automatic expiry of stale requests via scheduled jobs

### Analytics & Fairness
- Overtime projections with estimated cost
- Hours distribution visualization across staff
- Premium shift fairness scoring (flags deviations > 25% from team average)
- Understaffed shift alerts for published shifts with unfilled headcount

### Real-Time Updates
- Socket.IO with JWT-authenticated connections
- Room-scoped events: per-user, per-location, and admin broadcast
- Live schedule invalidation, on-duty roster updates, and notification badges

### Audit & Compliance
- Full mutation audit trail with JSONB before/after state
- Filterable, paginated log with CSV export
- Location-scoped audit views for managers

### Notifications
- 20 notification types covering assignments, swaps, schedule changes, and system alerts
- In-app feed with mark-as-read and optional Postmark email delivery
- Deep-links from notifications into relevant schedule views

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     shiftsync-web                        │
│          Next.js 14 · App Router · RSC + CSR             │
│   React Query · Zustand · shadcn/ui · Socket.IO Client   │
│                       :3001                              │
└──────────────────────┬──────────────────────────────────┘
                       │  REST + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                     shiftsync-api                        │
│        NestJS 11 · TypeORM · Passport JWT · Swagger      │
│     Socket.IO Gateway · Postmark · Cron Scheduler        │
│                       :4000                              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    PostgreSQL                            │
│     12 entities · UUID PKs · soft deletes · migrations   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | NestJS 11, TypeORM 0.3, Passport JWT, Socket.IO, class-validator, Postmark, @nestjs/schedule |
| **Frontend** | Next.js 14 (App Router), React 18, TanStack React Query v5, Zustand, Axios |
| **UI** | shadcn/ui, Radix UI, Tailwind CSS v4, Framer Motion, Recharts, react-big-calendar, Lucide Icons |
| **Forms** | React Hook Form + Zod (web), class-validator + class-transformer (API) |
| **Database** | PostgreSQL (Neon serverless or local), TypeORM migrations |
| **Infrastructure** | Docker, Docker Compose, Node 20 Alpine |
| **Language** | TypeScript (strict mode) across the entire stack |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** — local instance or a hosted connection string (e.g. [Neon](https://neon.tech))
- **npm** (API) and **pnpm** 9+ (web) — run `corepack enable` to activate pnpm
- **Docker** (optional, for containerized setup)

### Local Development

**1. Clone the repository**

```bash
git clone https://github.com/<your-username>/shiftsync-platform.git
cd shiftsync-platform
```

**2. Start the API**

```bash
cd shiftsync-api
npm install
cp .env.example .env
```

Edit `.env` and configure at minimum:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random secret for access tokens |
| `REFRESH_TOKEN_SECRET` | Random secret for refresh tokens |
| `PORT` | API port (default `4000`) |

Then run migrations, seed demo data, and start the server:

```bash
npm run migration:run
npm run seed
npm run start:dev
```

Swagger UI will be available at `http://localhost:4000/api/docs`.

**3. Start the Web App**

```bash
cd shiftsync-web
pnpm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3001
```

```bash
pnpm dev
```

Open `http://localhost:3001` in your browser.

### Docker (One Command)

From the repository root:

```bash
docker compose up --build
```

After the containers are running, seed the database:

```bash
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed
```

| Service | URL |
|---|---|
| Web | `http://localhost:3000` |
| API | `http://localhost:4000/api/v1` |

---

## Demo Credentials

Run `npm run seed` inside `shiftsync-api` to create demo accounts for the "Coastal Eats" restaurant group.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@coastaleats.com` | `Admin1234!` |
| **Manager** (NY locations) | `manager1@coastaleats.com` | `Manager123!` |
| **Manager** (LA locations) | `manager2@coastaleats.com` | `Manager123!` |
| **Staff** (12 accounts) | `jordan@coastaleats.com`, `casey@coastaleats.com`, ... | `Staff123!` |

<details>
<summary>All staff accounts</summary>

| Email | Name |
|---|---|
| `jordan@coastaleats.com` | Jordan |
| `casey@coastaleats.com` | Casey |
| `riley@coastaleats.com` | Riley |
| `quinn@coastaleats.com` | Quinn |
| `sam@coastaleats.com` | Sam |
| `taylor@coastaleats.com` | Taylor |
| `jamie@coastaleats.com` | Jamie |
| `morgan@coastaleats.com` | Morgan |
| `avery@coastaleats.com` | Avery |
| `reese@coastaleats.com` | Reese |
| `parker@coastaleats.com` | Parker |
| `drew@coastaleats.com` | Drew |

</details>

**Seeded locations:**

| Location | Timezone |
|---|---|
| Coastal Eats Downtown | `America/New_York` |
| Coastal Eats Midtown | `America/New_York` |
| Coastal Eats West | `America/Los_Angeles` |
| Coastal Eats Pacific | `America/Los_Angeles` |

**Seeded skills:** Bartender, Line Cook, Server, Host, Barback, Supervisor

---

## Role-Based Access

ShiftSync uses a granular permission system with three roles spanning 10 resources and 9 action types.

<details>
<summary><strong>Admin</strong> — Full system access</summary>

| Area | Capabilities |
|---|---|
| Users | Create, view, edit, assign skills, manage certifications, deactivate |
| Locations | Full CRUD, assign/remove managers |
| Skills | Full CRUD |
| Shifts | Create, edit, publish, unpublish, delete drafts, assign staff |
| Assignments | Create/delete for any location, override constraints |
| Swaps & Drops | View all, approve/deny |
| Analytics | All reports, overtime dashboard, what-if, understaffed alerts, export |
| Audit Log | View and export full trail |
| Availability | View all staff windows and exceptions |

</details>

<details>
<summary><strong>Manager</strong> — Scoped to assigned location(s)</summary>

| Area | Capabilities |
|---|---|
| Shifts | Create, edit, publish, unpublish, delete drafts within assigned locations |
| Assignments | Create/delete within assigned locations, override constraints |
| Swaps & Drops | View and approve/deny within assigned locations |
| Analytics | View and export for assigned locations |
| Audit Log | View only (no export) |
| Availability | View staff windows and exceptions |

</details>

<details>
<summary><strong>Staff</strong> — Self-service only</summary>

| Area | Capabilities |
|---|---|
| Schedule | View published shifts at certified locations |
| Swaps & Drops | Submit/receive swap requests, submit drops, claim available drops |
| Availability | View and edit own weekly windows and date-specific exceptions |
| Analytics | View own weekly hours projection |
| Profile | Update name, phone, desired hours/week, change password |

</details>

---

## Pages & Routes

| Page | Path | Access | Description |
|---|---|---|---|
| Login | `/login` | Public | JWT authentication with refresh token flow |
| Dashboard | `/` | All roles | Upcoming shifts, pending approvals, understaffed alerts |
| Schedule | `/schedule` | All roles | Calendar views with shift creation, editing, and publishing |
| Staff | `/staff` | All roles | Staff management with skills and certifications |
| Swaps & Drops | `/swaps` | All roles | Swap/drop request management and approval workflows |
| Analytics | `/analytics` | All roles | Overtime, hours distribution, fairness, and what-if analysis |
| On-Duty | `/on-duty` | All roles | Live roster per location with real-time updates |
| Notifications | `/notifications` | All roles | In-app notification feed with mark-as-read |
| Audit Log | `/audit` | Admin, Manager | Filterable, paginated mutation log with CSV export |
| Locations | `/locations` | Admin | Location CRUD with manager assignment |
| Skills | `/skills` | Admin | Skill management |

---

## Real-Time Events

The web client maintains a Socket.IO connection scoped to three room types:

| Room | Scope |
|---|---|
| `user_{userId}` | Personal (assignments, swap requests, notifications) |
| `location_{locationId}` | Location-wide (schedule changes, on-duty updates) |
| `admin_feed` | Broadcast to all admin sessions |

| Event | Trigger |
|---|---|
| `schedule.published` | Shift published |
| `schedule.updated` | Shift edited or unpublished |
| `shift.cancelled` | Shift cancelled |
| `assignment.created` | Staff assigned to shift |
| `assignment.cancelled` | Assignment removed |
| `assignment.conflict` | Double-booking or constraint violation detected |
| `swap.request_received` | Swap request targets a staff member |
| `swap.status_changed` | Swap approved, denied, or claimed |
| `duty.update` | On-duty roster change |
| `notification.new` | New in-app notification created |

---

## Design Decisions

Where requirements were ambiguous, the following choices were made:

| Topic | Decision |
|---|---|
| **Cross-location overlap** | Staff cannot hold overlapping shifts across any locations, not just the same one |
| **Rest period** | Enforced as a minimum gap between consecutive shifts; configurable per environment |
| **Drop claims** | No manager approval required — the drop is auto-approved on claim |
| **What-if analysis** | Runs full constraint checks (double-booking, rest period, consecutive days) plus hours projection |
| **Manager scope** | Managers only access locations where they have an explicit `managedLocations` relationship |
| **Skill requirement** | Optional on shifts — when set, only qualified staff appear in the assignment picker |
| **Publish blocking** | Understaffed shifts are publishable by default; set `PUBLISH_BLOCK_UNFILLED_HEADCOUNT=true` to block |
| **Token storage** | Access tokens in Zustand (localStorage); refresh tokens in httpOnly cookies with silent refresh |
| **Timezone display** | Pre-computed local time strings from the API to avoid browser-timezone ambiguity |
| **Audit coverage** | Only HTTP mutations are audited; seed operations are excluded |

---

## Project Structure

```
shiftsync-platform/
├── docker-compose.yml
├── README.md
│
├── shiftsync-api/                # NestJS backend
│   ├── src/
│   │   ├── common/               # Guards, filters, decorators, utils
│   │   ├── config/               # Swagger, environment config
│   │   └── modules/
│   │       ├── analytics/        # Overtime, fairness, what-if, understaffed
│   │       ├── assignments/      # Shift assignment logic
│   │       ├── audit/            # Audit trail interceptor + controller
│   │       ├── auth/             # JWT auth, Passport, refresh tokens
│   │       ├── availability/     # Weekly windows + date exceptions
│   │       ├── database/         # TypeORM config, migrations, seeds
│   │       ├── jobs/             # Cron: swap expiry, cutoffs, fairness
│   │       ├── locations/        # Location + certification management
│   │       ├── mail/             # Postmark email templates
│   │       ├── notifications/    # 20 notification types
│   │       ├── realtime/         # Socket.IO gateway
│   │       ├── shifts/           # Shift lifecycle management
│   │       ├── skills/           # Skill CRUD
│   │       ├── swaps/            # Swap/drop request workflows
│   │       └── users/            # User management + RBAC
│   └── Dockerfile
│
└── shiftsync-web/                # Next.js frontend
    ├── src/
    │   ├── app/                  # App Router pages
    │   │   ├── (dashboard)/      # Authenticated route group
    │   │   ├── login/
    │   │   └── signup/
    │   ├── components/
    │   │   ├── ui/               # shadcn/ui primitives
    │   │   ├── dashboard/        # Dashboard-specific components
    │   │   ├── landing/          # Marketing page components
    │   │   ├── constraint-feedback/  # Assignment constraint modals
    │   │   └── shared/           # Skeletons, error states, gates
    │   ├── lib/
    │   │   ├── api/              # REST client + server wrappers
    │   │   ├── socket/           # Socket.IO client + sync hooks
    │   │   ├── stores/           # Zustand stores
    │   │   └── validations/      # Zod schemas
    │   └── types/                # TypeScript type definitions
    └── Dockerfile
```

---

<div align="center">

Built with TypeScript, tested with real scheduling constraints.

</div>
