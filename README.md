# Kanban Board – MyCritters Engineering Onboarding

A Trello-style kanban board built as part of the **MyCritters engineering onboarding project**.

This project demonstrates a real-world full-stack workflow using the same tools and patterns used by the MyCritters team.

---

##  Tech Stack

- **Next.js (App Router)** + **TypeScript**
- **React**
- **Tailwind CSS**
- **Apollo Client** + **GraphQL Code Generator**
- **Nhost** (Auth, Hasura GraphQL, Postgres, Realtime Subscriptions)
- **Vercel** (deployment)

---

##  Features

- Email/password authentication (Nhost)
- Protected routes (`/boards`, `/boards/[boardId]`)
- Boards list → board detail routing
- Kanban board with:
  - Columns
  - Cards
  - Create, edit, delete cards
  - Drag & drop ordering
- Realtime updates using GraphQL subscriptions
- Persistent auth sessions
- Reliable sign-out from all pages
- Deployed to Vercel with auto-deploy on `main`

---

## Authentication Flow

- Unauthenticated users are redirected to `/auth`
- Authenticated users are redirected to `/boards`
- Sessions persist via cookies
- Sign-out immediately clears session and redirects to `/auth`
- Redirect race conditions handled explicitly

---

##  Data & Realtime

- Data is fetched via **Apollo GraphQL**
- Typed operations generated with **GraphQL Codegen**
- Realtime syncing via **Hasura subscriptions**
- Drag & drop updates are optimistically rendered and persisted

> **Note:** For onboarding/demo purposes, boards are shared across users.  
> In production, boards would be scoped per user via Hasura row-level permissions.

---

##  Local Development

### 1️⃣ Install dependencies
```bash
pnpm install


### 2️⃣ Environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
NEXT_PUBLIC_NHOST_REGION=your-region

Run the dev server
pnpm dev
App runs at:
http://localhost:3000


