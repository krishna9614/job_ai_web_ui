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
| `/verify-email` | Check-your-inbox screen; resends the verification email (`POST /auth/verification/resend`) |
| `/forgot-password` | Sends a reset link (`POST /auth/password/forgot`; same reply for unknown emails) |
| `/reset-password?token_hash=…` | Reset-link target: exchanges the one-time token, then sets the new password (copy/cut/paste disabled) |
| `/auth/confirm?token_hash=…&type=…` | Route handler for verification and email-change links (`POST /auth/email/confirm`) |
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
  header when forwarding. Logout revokes the Supabase session and clears the cookies.
- The refresh token is stored the same way (`jobai_refresh_token`). When the backend returns 401 for an expired
  access token, `/api/backend/*` exchanges the refresh token once (`POST /auth/refresh`) and retries.
- **Remember me**: checked keeps the cookies for 30 days; unchecked uses browser-session cookies.
- Reset links: the recovery session lives in a 15-minute HttpOnly cookie scoped to `/api/auth`, and is only
  usable for `POST /auth/password/reset`. A successful reset signs out every device.
- A 401 that cannot be refreshed clears the cookies and sends the user to `/login?next=…`.
- Password rules (8+ chars, upper, lower, number, special character) live in `src/lib/validation/auth.ts` and
  mirror the backend's `StrongPassword`; required fields show a red `*` (`required` prop on the form fields).
- Supabase email templates must link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
  (and `type=email_change`) and `{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery`; see the
  backend README. `NEXT_PUBLIC_SUPPORT_EMAIL` sets the Contact support address (default `support@jobai.com`).
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

These parts of the design are implemented as UI but have no server call: social sign-in,
profile photo and resume upload, and onboarding steps 2–4 and 6 (kept in memory while you move between steps).
Step 1 (basic info) and the LinkedIn/GitHub links from step 5 are saved to the profile.
