## ShiftSync Backend (API)

ShiftSync is a workforce scheduling backend built with **NestJS**, **TypeORM**, **PostgreSQL**, **JWT**, **Postmark (email)**, and **Socket.IO**.

- **API base**: `http://localhost:<PORT>/api/v1`
- **Swagger (non-production)**: `GET /api/docs`
- **Auth**: `Authorization: Bearer <accessToken>`

This README is meant for **client developers**: what endpoints exist, what to send, what you’ll get back, and how to consume REST + realtime events.

---

### Contents

- [Running locally](#running-locally)
- [API versioning + Swagger](#api-versioning--swagger)
- [Auth & tokens](#auth--tokens)
- [Global validation](#global-validation)
- [Common response shapes](#common-response-shapes)
- [Routes](#routes)
  - [Auth](#auth)
  - [Users](#users)
  - [Locations](#locations)
  - [Skills](#skills)
  - [Shifts](#shifts)
  - [Swaps](#swaps)
  - [Notifications](#notifications)
  - [Analytics](#analytics)
  - [Audit](#audit)
- [Client examples](#client-examples)
  - [REST (fetch)](#rest-fetch)
  - [REST (axios)](#rest-axios)
  - [Socket.IO client](#socketio-client)
- [Seed data](#seed-data)

---

## Running locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   - Copy `.env.example` to `.env` if provided, or ensure at least:
     - `DATABASE_URL` – Postgres connection string
     - `JWT_SECRET` – random long string
     - `JWT_EXPIRES_IN` – e.g. `15m`
   - Make sure your Postgres instance is running and accessible from your machine.

3. **Run database migrations**

   ```bash
   npm run migration:run
   ```

   If you have no tables yet and want demo data, also run:

   ```bash
   npm run seed
   ```

4. **Start the API (dev mode)**

   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000/api/v1` (see `PORT` in `.env` if customized).

---

## API versioning + Swagger

- All routes are mounted under **`/api/v1`** via global prefix.
- Swagger UI is available at **`/api/docs`** in non-production environments.

---

## Auth & tokens

- Login returns:
  - `accessToken` (short-lived)
  - `refreshToken` (long-lived)
  - `session` payload (role, permissions, etc.)
- Most endpoints require `Authorization: Bearer <accessToken>`.

---

## Routes

All routes below are relative to **`/api/v1`**.

### Auth

Base: `/auth`

| Method | Path | Body DTO | Notes |
|---|---|---|---|
| POST | `/auth/login` | `LoginDto` | Returns tokens + session |
| POST | `/auth/refresh` | `RefreshDto` | Refresh tokens |
| POST | `/auth/logout` | `LogoutDto` | Revoke refresh token |
| GET | `/auth/me` | — | Current session |
| PATCH | `/auth/me/notifications` | `UpdateNotificationsDto` | Updates `notifyInApp` / `notifyEmail` |
| PATCH | `/auth/me/password` | `ChangePasswordDto` | Change password |

**LoginDto**

- `email: string`
- `password: string`

---

### Users

Base: `/users`  
Guards: JWT + role/permission guards

| Method | Path | Query | Body DTO | Notes |
|---|---|---|---|---|
| GET | `/users` | `role?`, `locationId?`, `skillId?` | — | Admin-only list |
| POST | `/users` | — | `CreateUserDto` | Admin-only create |
| GET | `/users/:id` | — | — | View user (RBAC) |
| PATCH | `/users/:id` | — | `UpdateUserDto` / `UpdateSelfUserDto` | Admin can edit anyone; self-edit restricted |
| DELETE | `/users/:id` | — | — | Admin-only soft delete |
| POST | `/users/:id/skills` | — | `{ skillId: string }` | Admin-only |
| DELETE | `/users/:id/skills/:skillId` | — | — | Admin-only |
| POST | `/users/:id/certifications` | — | `AddCertificationDto` | Admin-only |
| DELETE | `/users/:id/certifications/:locationId` | — | `RevokeCertificationDto` | Admin-only revoke w/ reason |
| GET | `/users/:id/swaps` | — | — | Swap requests for user |
| GET | `/users/:id/assignments` | `startDate?`, `endDate?` | — | Assignments for user |
| GET | `/users/:id/availability` | — | — | Availability windows + exceptions |
| POST | `/users/:id/availability/windows` | — | `CreateAvailabilityWindowDto` | Self or admin |
| PATCH | `/users/:id/availability/windows/:wid` | — | `UpdateAvailabilityWindowDto` | Self or admin |
| DELETE | `/users/:id/availability/windows/:wid` | — | — | Self or admin |
| POST | `/users/:id/availability/exceptions` | — | `CreateAvailabilityExceptionDto` | Self or admin |
| DELETE | `/users/:id/availability/exceptions/:eid` | — | — | Self or admin |

---

### Locations

Base: `/locations`

| Method | Path | Body DTO | Notes |
|---|---|---|---|
| GET | `/locations` | — | List all locations |
| POST | `/locations` | `CreateLocationDto` | Admin-only |
| GET | `/locations/:id` | — | Get by id |
| PATCH | `/locations/:id` | `UpdateLocationDto` | Admin-only |
| DELETE | `/locations/:id` | — | Admin-only (soft delete) |
| POST | `/locations/:id/managers` | `{ managerId: string }` | Admin-only assign manager |
| DELETE | `/locations/:id/managers/:uid` | — | Admin-only remove manager |
| GET | `/locations/:id/staff` | — | Certified staff for location (location-guarded) |
| GET | `/locations/:id/on-duty` | — | On-duty staff now (location-guarded) |

---

### Skills

Base: `/skills`

| Method | Path | Body DTO | Notes |
|---|---|---|---|
| GET | `/skills` | — | List skills |
| POST | `/skills` | `CreateSkillDto` | Admin-only |
| GET | `/skills/:id` | — | Get by id |
| PATCH | `/skills/:id` | `UpdateSkillDto` | Admin-only |
| DELETE | `/skills/:id` | — | Admin-only |

---

### Shifts

Base: `/shifts`

Timezone rules:

- Storage: `timestamptz` (UTC).
- Input: `startAt` / `endAt` accept ISO 8601. If no offset, it is interpreted using the **location `ianaTimezone`**.
- Output: includes UTC timestamps plus `startAtLocalTime` / `endAtLocalTime`.

| Method | Path | Query | Body DTO | Notes |
|---|---|---|---|---|
| GET | `/shifts` | `locationId?`, `startDate?`, `endDate?`, `status?` | — | Manager/admin list with filters |
| POST | `/shifts` | — | `CreateShiftDto` | Location-guarded |
| GET | `/shifts/:id` | — | — | View shift with assignments |
| PATCH | `/shifts/:id` | — | `UpdateShiftDto` | Enforces edit cutoff for published shifts |
| DELETE | `/shifts/:id` | — | — | Draft-only delete |
| POST | `/shifts/:id/publish` | — | — | Publish a draft shift |
| POST | `/shifts/:id/unpublish` | — | — | Unpublish with cutoff enforcement |
| GET | `/shifts/:id/assignments` | — | — | Shift assignments |
| POST | `/shifts/:id/assignments` | — | `CreateAssignmentDto` | Runs full validation pipeline |
| DELETE | `/shifts/:id/assignments/:assignId` | — | — | Cancel assignment |
| GET | `/shifts/:id/history` | — | — | Audit trail for shift |

**CreateShiftDto**

- `locationId: uuid`
- `requiredSkillId: uuid`
- `title?: string`
- `startAt: string (ISO)`
- `endAt: string (ISO)`
- `headcountNeeded?: number` (default 1)
- `editCutoffHours?: number` (default 48)
- `isPremium?: boolean`

---

### Swaps

Base: `/swaps`

| Method | Path | Query | Body DTO | Notes |
|---|---|---|---|---|
| POST | `/swaps` | — | `CreateSwapDto` | Create swap/drop request |
| GET | `/swaps` | `locationId?`, `status?` | — | Admin/manager list |
| GET | `/swaps/:id` | — | — | Get by id |
| PATCH | `/swaps/:id/accept` | — | `AcceptSwapDto` | Target staff accepts |
| PATCH | `/swaps/:id/reject` | — | — | Target staff rejects |
| PATCH | `/swaps/:id/cancel` | — | — | Initiator cancels |
| PATCH | `/swaps/:id/approve` | — | — | Manager approves |
| PATCH | `/swaps/:id/deny` | — | `DenySwapDto` | Manager denies |

---

### Notifications

Base: `/notifications`

| Method | Path | Query | Notes |
|---|---|---|
| GET | `/notifications` | `limit?`, `offset?`, `unreadOnly?` | **Paginated** (defaults: limit 25, offset 0) |
| GET | `/notifications/unread-count` | — | Returns `{ count }` |
| PATCH | `/notifications/:id/read` | — | Mark one as read |
| PATCH | `/notifications/read-all` | — | Mark all as read |
| DELETE | `/notifications/:id` | — | Delete one |

---

### Analytics

Base: `/analytics`  
Note: fairness + hours distribution are cached for **5 minutes** in memory.

| Method | Path | Query | Notes |
|---|---|---|---|
| GET | `/analytics/overtime` | `locationId?`, `weekStart?` | Projected overtime for a week |
| GET | `/analytics/hours-distribution` | `locationId?`, `startDate`, `endDate` | Cached 5 min |
| GET | `/analytics/fairness` | `locationId`, `startDate?`, `endDate?` | Cached 5 min; location access guard |
| POST | `/analytics/what-if` | — | Body: `{ userId, shiftId }` |
| GET | `/analytics/understaffed` | `locationId?`, `startDate?`, `endDate?` | Published shifts with unfilled headcount |

---

### Audit

Base: `/audit`

| Method | Path | Query | Notes |
|---|---|---|---|
| GET | `/audit/logs` | `entityType?`, `entityId?`, `actorId?`, `locationId?`, `limit?`, `offset?` | **Paginated** (defaults: limit 25, offset 0) |
| GET | `/audit/logs/export` | same as above | CSV download |
| GET | `/audit/locations/:locationId/logs` | `limit?`, `offset?` | Location-scoped |
| GET | `/audit/shifts/:shiftId/logs` | — | Logs for a shift |

---

## Seed data

Seed the database with realistic demo data:

```bash
npm run seed
```

The seed creates:

- 4 locations (NY + LA timezones)
- 6 skills
- 1 admin + 2 managers + 12 staff
- shifts for current week + 2 weeks (premium, overnight, pending swap, overtime edge case)
- a double-booking attempt that is detected + logged but **not persisted**
