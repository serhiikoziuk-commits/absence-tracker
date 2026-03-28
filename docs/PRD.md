# PRD — Team Absence Tracking SaaS
**Version:** 1.0
**Date:** 2026-03-26
**Status:** Phase 1 — Architecture & PRD

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Multi-Tenant Architecture](#3-multi-tenant-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [User Stories](#5-user-stories)
6. [Data Models & Database Schema](#6-data-models--database-schema)
7. [API Routes](#7-api-routes)
8. [Auth Flow](#8-auth-flow)
9. [Notification Strategy](#9-notification-strategy)
10. [File Storage Strategy](#10-file-storage-strategy)
11. [Subscription & Billing](#11-subscription--billing)
12. [Project Structure](#12-project-structure)

---

## 1. Product Overview

A B2B/B2B2C multi-tenant SaaS platform enabling companies to track employee absences (vacations, sick leaves, day-offs, etc.). Each company operates in an isolated workspace accessed via a unique path segment (`yourdomain.com/{workspace_slug}`). The product ships as:

- **Web Portal** — Next.js 15 (admin + user cabinet + landing page)
- **Mobile App** — Expo (React Native), iOS & Android
- **Backend** — Supabase (Postgres + RLS + Auth + Storage + Realtime)

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Web Frontend | Next.js 15 (App Router), TypeScript | SSR for landing/SEO, RSC for app shell |
| Mobile | Expo SDK (managed workflow), TypeScript | OTA updates, push notifications, EAS Build |
| Styling (Web) | Tailwind CSS + shadcn/ui | Utility-first, copy-paste components, fully customizable |
| Styling (Mobile) | NativeWind (Tailwind for RN) + custom primitives | Consistent design tokens across platforms |
| Database | Supabase (PostgreSQL 15) | Managed Postgres, RLS, realtime subscriptions |
| Auth | Supabase Auth (Email OTP + OAuth2) | Built-in OTP, Google/Microsoft SSO via providers |
| File Storage | Supabase Storage | Integrated with RLS policies, CDN-backed |
| Email | Resend | Developer-friendly, reliable deliverability |
| Payments | Stripe | Subscriptions, usage-based billing, webhooks |
| Hosting (Web) | Vercel | Edge network, simple path-based routing, preview URLs |
| Hosting (Mobile) | Expo EAS | Managed builds and OTA updates |
| Monorepo | Turborepo | Shared types/utils between web and mobile |

### Repository Structure (Monorepo)

```
/
├── apps/
│   ├── web/          # Next.js 15 — landing + app
│   └── mobile/       # Expo — iOS & Android
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utility functions
│   └── ui/           # Shared design tokens / primitives (optional)
├── docs/
│   ├── PRD.md
│   └── design-system.md
├── turbo.json
└── package.json
```

---

## 3. Multi-Tenant Architecture

### Strategy: Path-per-Tenant + Single Database with RLS

Each company (tenant) gets a unique path: `yourdomain.com/{workspace_slug}/...`

**Examples:**
- `yourdomain.com/acme-corp/dashboard`
- `yourdomain.com/acme-corp/calendar`
- Invite link: `yourdomain.com/acme-corp/invite/{token}`

**Registration Flow:**
1. Founder visits `yourdomain.com/register`
2. Enters company name → system auto-suggests `workspace_slug` (e.g., `acme-corp`), user can edit
3. Slug uniqueness checked via `GET /api/workspace/slug-check?slug=`
4. Workspace is created → user is redirected to `yourdomain.com/acme-corp/dashboard`
5. All invite links automatically include the workspace slug in the path

**Local Development:**
- Works out of the box at `localhost:3000/{slug}/...`
- No special DNS configuration required

**Tenant Isolation:**
- Every table has a `workspace_id UUID` foreign key
- Supabase RLS policies enforce: `workspace_id = (auth.jwt() ->> 'workspace_id')::uuid`
- The `workspace_id` is embedded in the JWT custom claim at login via a Supabase Auth Hook
- No cross-tenant data leakage is possible at the database layer

**Next.js Routing (App Router):**
```
app/
├── (landing)/page.tsx               → yourdomain.com/
├── register/page.tsx                → yourdomain.com/register
├── [workspace]/
│   ├── layout.tsx                   → resolves workspace from slug, sets context
│   ├── login/page.tsx               → yourdomain.com/acme-corp/login
│   ├── invite/[token]/page.tsx      → yourdomain.com/acme-corp/invite/abc123
│   ├── dashboard/page.tsx           → yourdomain.com/acme-corp/dashboard
│   ├── calendar/page.tsx
│   ├── requests/page.tsx
│   ├── profile/page.tsx
│   └── admin/...
```

**Workspace Resolution (layout.tsx):**
```ts
// app/[workspace]/layout.tsx
export default async function WorkspaceLayout({ params }) {
  const workspace = await getWorkspaceBySlug(params.workspace);
  if (!workspace) notFound();
  // Workspace context passed via React context / headers
}
```

---

## 4. User Roles & Permissions

| Permission | Regular User | Manager (Team Admin) | Workspace Admin |
|---|---|---|---|
| Submit absence requests | ✅ | ✅ | ✅ |
| View shared calendar | ✅ | ✅ | ✅ |
| View own dashboard | ✅ | ✅ | ✅ |
| Approve/reject team requests | ❌ | ✅ | ✅ |
| Manage absence types | ❌ | ❌ | ✅ |
| Manage users (invite/block/delete) | ❌ | ❌ | ✅ |
| Manage teams | ❌ | ❌ | ✅ |
| Adjust individual balances | ❌ | ❌ | ✅ |
| Configure workspace settings | ❌ | ❌ | ✅ |
| Manage subscription/billing | ❌ | ❌ | ✅ |

**Notes:**
- First registered user in a workspace automatically becomes Admin
- A user can be Admin of multiple teams (acts as manager for each)
- Workspace Admin ⊃ Manager — admins can approve any team's requests

---

## 5. User Stories

### Authentication
- **US-001** As a company founder, I want to create a workspace with a unique subdomain so my team has an isolated environment.
- **US-002** As a user, I want to log in with my email + 6-digit OTP so I don't have to remember a password.
- **US-003** As a user, I want to log in via Google or Microsoft SSO so login is seamless with my work account.
- **US-004** As an admin, I want to restrict workspace registration to emails matching `@company.com` so only my employees can join.
- **US-005** As an admin, I want to invite users via a referral link that includes my workspace subdomain.
- **US-006** As an admin, I want to bulk-invite users by pasting a list of email addresses.

### Dashboard
- **US-010** As a user, I want to see my available days per absence category on my dashboard.
- **US-011** As a user, I want to see my upcoming approved absences on my dashboard.

### Calendar
- **US-020** As a user, I want to see a shared calendar where each day shows dots for how many people are absent.
- **US-021** As a user, I want to click a day and see a breakdown of who is absent and their absence type.
- **US-022** As a user, I want to see a per-person absence timeline below the calendar for the current month.
- **US-023** As a user, I want to see a separate birthdays section in the calendar view.
- **US-024** As a user, I want to navigate between months.

### Requests
- **US-030** As a user, I want to submit an absence request with type, date range, optional comment, and optional file attachments.
- **US-031** As a user, I want to view all my submitted requests with their status (pending, approved, rejected, modified).
- **US-032** As a user, I want to delete my own pending requests.
- **US-033** As a manager, I want to see all pending requests from my team in a separate tab.
- **US-034** As a manager, I want to approve or reject a request with an optional comment.
- **US-035** As a manager, I want to modify a request (change dates) and send it back to the user for acceptance.
- **US-036** As a user, I want to accept or counter-modify a request that a manager has modified.

### Profile
- **US-040** As a user, I want to update my first/last name and upload an avatar.
- **US-041** As a user, I want to manage my push notification preferences.
- **US-042** As a user, I want to log out from the app.

### Admin Panel
- **US-050** As an admin, I want to see a list of all workspace users with their roles and statuses.
- **US-051** As an admin, I want to invite, block, activate, or delete users.
- **US-052** As an admin, I want to create, edit, and delete teams.
- **US-053** As an admin, I want to assign users to teams and assign managers to teams.
- **US-054** As an admin, I want to click a user and edit their team, job title, start date, and absence day balances.
- **US-055** As an admin, I want to add/delete absence types and configure available days and auto-accrual rules.

---

## 6. Data Models & Database Schema

### `workspaces`
```sql
CREATE TABLE workspaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,           -- subdomain identifier
  name          TEXT NOT NULL,
  logo_url      TEXT,
  email_domain  TEXT,                           -- optional restriction (e.g. "company.com")
  restrict_email_domain BOOLEAN DEFAULT false,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  plan          TEXT DEFAULT 'free',            -- free | starter | pro | enterprise
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### `users` (extends Supabase auth.users)
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  first_name      TEXT,
  last_name       TEXT,
  avatar_url      TEXT,
  job_title       TEXT,
  start_date      DATE,
  date_of_birth   DATE,
  role            TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  status          TEXT NOT NULL DEFAULT 'active', -- 'active' | 'blocked' | 'invited'
  push_token      TEXT,                           -- Expo push token
  push_notifications_enabled BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `teams`
```sql
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### `team_members`
```sql
CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_manager  BOOLEAN DEFAULT false,
  UNIQUE(team_id, user_id)
);
```

### `absence_types`
```sql
CREATE TABLE absence_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,               -- e.g. "Vacation", "Sick Leave"
  color               TEXT NOT NULL,               -- hex color for UI
  icon                TEXT,                        -- icon name/emoji
  requires_attachment BOOLEAN DEFAULT false,       -- e.g. medical cert required
  accrual_type        TEXT DEFAULT 'none',         -- 'none' | 'monthly' | 'yearly'
  accrual_amount      NUMERIC DEFAULT 0,
  default_days        NUMERIC DEFAULT 0,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

### `absence_balances`
```sql
CREATE TABLE absence_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  absence_type_id UUID NOT NULL REFERENCES absence_types(id) ON DELETE CASCADE,
  total_days      NUMERIC NOT NULL DEFAULT 0,
  used_days       NUMERIC NOT NULL DEFAULT 0,
  year            INT NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  UNIQUE(user_id, absence_type_id, year)
);
```

### `absence_requests`
```sql
CREATE TABLE absence_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  absence_type_id UUID NOT NULL REFERENCES absence_types(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_days      NUMERIC NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'
  comment         TEXT,
  reviewer_id     UUID REFERENCES users(id),
  reviewer_comment TEXT,
  modified_start_date DATE,
  modified_end_date   DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `absence_request_files`
```sql
CREATE TABLE absence_request_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES absence_requests(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
```

### `invites`
```sql
CREATE TABLE invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         TEXT,                   -- null = open invite link
  token         TEXT UNIQUE NOT NULL,
  invited_by    UUID NOT NULL REFERENCES users(id),
  status        TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'expired'
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,          -- 'request_approved' | 'request_rejected' | etc.
  title         TEXT NOT NULL,
  body          TEXT,
  read          BOOLEAN DEFAULT false,
  payload       JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policy Strategy

Every table includes `workspace_id`. Supabase RLS policies follow this pattern:

```sql
-- Example for absence_requests
ALTER TABLE absence_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see requests in their workspace
CREATE POLICY "workspace_isolation" ON absence_requests
  USING (workspace_id = (auth.jwt() ->> 'workspace_id')::uuid);

-- Users can only see their own requests (unless admin/manager)
CREATE POLICY "user_own_requests" ON absence_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.is_manager = true
        AND tm.team_id IN (
          SELECT team_id FROM team_members WHERE user_id = absence_requests.user_id
        )
    )
  );
```

The `workspace_id` and `role` are injected into the JWT via a Supabase Auth Hook (PostgreSQL function triggered on token creation).

---

## 7. API Routes

All API routes are Next.js Route Handlers under `apps/web/app/api/`. Supabase client is initialized server-side with the user's session JWT, so RLS applies automatically.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register-workspace` | Create new workspace + first admin user |
| POST | `/api/auth/send-otp` | Send 6-digit OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, return session |
| POST | `/api/auth/sso/google` | Initiate Google OAuth |
| POST | `/api/auth/sso/microsoft` | Initiate Microsoft OAuth |
| POST | `/api/auth/logout` | Invalidate session |

### Workspace
| Method | Route | Description |
|---|---|---|
| GET | `/api/workspace` | Get current workspace info |
| PATCH | `/api/workspace` | Update workspace settings |
| GET | `/api/workspace/slug-check?slug=` | Check slug availability |

### Invites
| Method | Route | Description |
|---|---|---|
| POST | `/api/invites` | Create invite link or bulk invite by email list |
| GET | `/api/invites` | List all invites |
| DELETE | `/api/invites/[id]` | Revoke invite |
| GET | `/api/invites/[token]/validate` | Validate invite token (public) |
| POST | `/api/invites/[token]/accept` | Accept invite, complete registration |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | List workspace users (admin only) |
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update own profile (name, avatar, push token) |
| GET | `/api/users/[id]` | Get user detail (admin only) |
| PATCH | `/api/users/[id]` | Update user (admin: role, status, job title, start date) |
| DELETE | `/api/users/[id]` | Delete user (admin only) |

### Teams
| Method | Route | Description |
|---|---|---|
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create team (admin only) |
| PATCH | `/api/teams/[id]` | Update team name (admin only) |
| DELETE | `/api/teams/[id]` | Delete team (admin only) |
| POST | `/api/teams/[id]/members` | Add user to team |
| DELETE | `/api/teams/[id]/members/[userId]` | Remove user from team |
| PATCH | `/api/teams/[id]/members/[userId]` | Set manager flag |

### Absence Types
| Method | Route | Description |
|---|---|---|
| GET | `/api/absence-types` | List absence types for workspace |
| POST | `/api/absence-types` | Create absence type (admin only) |
| PATCH | `/api/absence-types/[id]` | Update absence type (admin only) |
| DELETE | `/api/absence-types/[id]` | Delete absence type (admin only) |

### Absence Balances
| Method | Route | Description |
|---|---|---|
| GET | `/api/balances/me` | Get current user's balances |
| GET | `/api/balances/[userId]` | Get user balances (admin only) |
| PATCH | `/api/balances/[userId]/[typeId]` | Adjust balance (admin only) |

### Absence Requests
| Method | Route | Description |
|---|---|---|
| GET | `/api/requests` | List requests (own; or team if manager/admin) |
| POST | `/api/requests` | Submit new request |
| GET | `/api/requests/[id]` | Get request detail |
| DELETE | `/api/requests/[id]` | Delete request (own pending; or admin) |
| POST | `/api/requests/[id]/approve` | Approve request (manager/admin) |
| POST | `/api/requests/[id]/reject` | Reject with comment (manager/admin) |
| POST | `/api/requests/[id]/modify` | Propose modification (manager/admin) |
| POST | `/api/requests/[id]/accept-modification` | User accepts manager's modification |
| POST | `/api/requests/[id]/counter-modify` | User counter-proposes new dates |

### Calendar
| Method | Route | Description |
|---|---|---|
| GET | `/api/calendar?year=&month=` | Approved absences for a given month (all users in workspace) |
| GET | `/api/calendar/birthdays?year=&month=` | Birthdays in a given month |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard` | Current user's balances + upcoming absences |

### Files
| Method | Route | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload file to Supabase Storage, return URL |
| DELETE | `/api/files/[id]` | Delete file |

### Notifications
| Method | Route | Description |
|---|---|---|
| GET | `/api/notifications` | List user's notifications |
| PATCH | `/api/notifications/[id]/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Billing (Stripe)
| Method | Route | Description |
|---|---|---|
| GET | `/api/billing/plans` | List available plans |
| POST | `/api/billing/checkout` | Create Stripe checkout session |
| POST | `/api/billing/portal` | Open Stripe customer portal |
| POST | `/api/billing/webhook` | Stripe webhook handler |

---

## 8. Auth Flow

### Workspace Registration (First Admin)
```
1. User visits yourdomain.com/register
2. Enters: Company Name, Workspace Slug (auto-suggested, editable), Email
3. POST /api/auth/register-workspace
   → Creates workspace record
   → Creates auth.users entry
   → Creates users record with role='admin'
   → Embeds workspace_id + role in JWT via Auth Hook
4. POST /api/auth/send-otp → Resend sends 6-digit code
5. User enters OTP → POST /api/auth/verify-otp
6. Redirect to yourdomain.com/{slug}/dashboard
```

### Returning User Login
```
1. User visits yourdomain.com/{slug}/login
2. Middleware resolves workspace from slug → 404 if not found
3. Enters email → POST /api/auth/send-otp (workspace-scoped)
4. Enters OTP → POST /api/auth/verify-otp
5. If email not in workspace → error "Not a member of this workspace"
6. Redirect to yourdomain.com/{slug}/dashboard
```

### Invite Acceptance
```
1. Admin creates invite link: yourdomain.com/{slug}/invite/{token}
2. New user visits link → GET /api/invites/{token}/validate
3. If valid: Show registration form (name, email pre-filled if specific invite)
4. User submits → POST /api/invites/{token}/accept
   → Creates user with role='user', status='active'
   → Sends OTP for first login
   → Redirect to yourdomain.com/{slug}/dashboard
```

### JWT Custom Claims (Auth Hook)
```sql
-- Supabase Auth Hook: fires on every token creation
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT workspace_id, role INTO user_record
  FROM users WHERE id = (event->>'user_id')::uuid;

  RETURN jsonb_set(
    jsonb_set(event, '{claims,workspace_id}', to_jsonb(user_record.workspace_id::text)),
    '{claims,role}', to_jsonb(user_record.role)
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Notification Strategy

### In-App Notifications
- Stored in `notifications` table
- Supabase Realtime subscription on `notifications` table for live badge updates
- Web: Bell icon with unread count in top nav

### Push Notifications (Mobile)
- Expo Push Notifications service
- `push_token` stored on `users` table (updated on mobile app launch)
- Server-side: after DB write for request status change, call Expo Push API

### Email Notifications (Resend)
Triggered for:
- Invite sent
- Request submitted (to manager)
- Request approved/rejected/modified (to requester)
- Request modification accepted (to manager)

---

## 10. File Storage Strategy

- **Bucket:** `absence-attachments` (private, RLS-protected)
- **Path:** `{workspace_id}/{user_id}/{request_id}/{filename}`
- **Access:** Signed URLs with 1-hour expiry (generated server-side)
- **Limits:** Max 10MB per file, max 5 files per request
- **Allowed types:** PDF, JPG, PNG, HEIC

---

## 11. Subscription & Billing

### Plans (Display for Phase 3, Wired in Phase 4)

| Plan | Users | Price | Features |
|---|---|---|---|
| Free | Up to 5 | $0/mo | Core absence tracking |
| Starter | Up to 25 | $29/mo | + Custom absence types, SSO |
| Pro | Up to 100 | $79/mo | + API access, advanced reports |
| Enterprise | Unlimited | Custom | + SLA, dedicated support, custom domain |

### Billing Implementation
- Stripe Subscriptions with `workspace_id` in Stripe metadata
- Webhook events: `customer.subscription.updated`, `customer.subscription.deleted`
- `workspaces.plan` updated on webhook receipt
- Feature flags checked against plan at API layer

---

## 12. Project Structure

```
apps/web/
├── app/
│   ├── page.tsx                          # yourdomain.com/ — landing home
│   ├── pricing/page.tsx                  # yourdomain.com/pricing
│   ├── terms/page.tsx                    # yourdomain.com/terms
│   ├── register/page.tsx                 # yourdomain.com/register — create workspace
│   ├── [workspace]/                      # yourdomain.com/{slug}/...
│   │   ├── layout.tsx                    # Resolves workspace, auth guard
│   │   ├── login/page.tsx
│   │   ├── invite/[token]/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── requests/page.tsx
│   │   ├── profile/page.tsx
│   │   └── admin/
│   │       ├── users/page.tsx
│   │       ├── teams/page.tsx
│   │       └── absence-types/page.tsx
│   └── api/                              # Route handlers
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── layout/                  # Shell, sidebar, header
│   ├── calendar/
│   ├── requests/
│   ├── admin/
│   └── dashboard/
├── lib/
│   ├── supabase/                # Client + server Supabase instances
│   ├── auth/                    # Session helpers
│   └── utils/
└── middleware.ts                # Auth session guard (redirects unauthenticated users)

apps/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── otp.tsx
│   ├── (tabs)/
│   │   ├── dashboard.tsx
│   │   ├── calendar.tsx
│   │   ├── requests.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
├── lib/
│   ├── supabase.ts
│   └── notifications.ts
└── hooks/

packages/
├── types/
│   ├── database.ts              # Generated Supabase types
│   └── index.ts
└── utils/
    └── dates.ts                 # Shared date calculation logic
```

---

*End of Phase 1 PRD. Awaiting approval to proceed to Phase 2: UI/UX & Design System.*
