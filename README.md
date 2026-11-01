# JobAI Web UI

Next.js frontend for [JobAI](https://github.com/krishna9614/job_ai_adk_agent): landing page, authentication,
6-step profile setup and the **User Profile Dashboard**, built from the JobAI design system (Emerald + Ivory).

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui · TanStack Query ·
Zustand · Axios · React Hook Form + Zod · Lucide React.

## Getting started

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the FastAPI backend
npm install
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/signup`, `/login` | Email + password auth (`POST /api/v1/auth/signup`, `/auth/login`) |
| `/verify-email`, `/forgot-password`, `/reset-password` | Auth support screens |
| `/onboarding/{basic,preferences,experience,skills,resume,additional,complete}` | Profile setup |
| `/dashboard` | **User Profile Dashboard** — view, create and edit the profile |

`/dashboard` and `/onboarding/*` require a session (`src/proxy.ts`); `/login` and `/signup` redirect signed-in users to the dashboard.

## How it talks to the backend

```
Browser ──axios──▶ /api/auth/*        (Next.js route handlers) ──▶ FastAPI /api/v1/auth/*
        ──axios──▶ /api/backend/*                               ──▶ FastAPI /api/v1/*  + Authorization: Bearer <token>
```

- The FastAPI backend authenticates with `Authorization: Bearer <Supabase access token>`. To keep that token out
  of JavaScript (no `localStorage`), the login/signup route handlers store it in an **HttpOnly, SameSite=Lax**
  cookie (`Secure` in production) and only return the user object. `/api/backend/*` attaches it as the bearer
  header when forwarding. Logout clears the cookie.
- A 401 from the backend clears the cookie and sends the user to `/login?next=…`.
- The backend's own contracts are used unchanged; the user ID always comes from the verified token.

Profile endpoints used by the dashboard:

| Action | Endpoint |
| --- | --- |
| Current user | `GET /api/v1/users/me` |
| Load profile (404 → "create profile" state) | `GET /api/v1/users/me/profile` |
| Create profile | `POST /api/v1/users/me/profile` |
| Update profile (only changed fields; cleared fields sent as `null`) | `PATCH /api/v1/users/me/profile` |

## Project structure

```
src/
  app/                 routes, route handlers (app/api) and global styles
  components/          auth, onboarding, dashboard, forms, ui (shadcn), brand/icons
  hooks/               TanStack Query hooks (use-auth, use-profile)
  services/            auth.service.ts, profile.service.ts (API calls only)
  stores/              Zustand: auth session state, onboarding draft
  lib/api/             axios client + error normalisation
  lib/server/          server-only backend proxy helpers
  lib/profile/         Zod schema, payload mapping, formatting
  types/api.ts         types mirrored from the backend schemas
```

## Not yet backed by the API

The backend currently exposes only signup, login, current user and profile CRUD. These parts of the design are
implemented as UI but have no server call: social sign-in, resend verification email, forgot/reset password,
profile photo and resume upload, and onboarding steps 2–4 and 6 (kept in memory while you move between steps).
Step 1 (basic info) and the LinkedIn/GitHub links from step 5 are saved to the profile.
