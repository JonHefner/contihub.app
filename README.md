# ContiHub

Continental Construction of Ohio (CCO) operations portal for [contihub.app](https://contihub.app).

ContiHub is the live home for the Conti suite: Projects, ContiHub, ContiCRM, ContiField, ContiCost, ContiSafety, ContiTraK, and Conti Bid. Suite boards are scoped to an individual project.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)

## Local development

```bash
npm install
cp .env.example .env.local
```

Set the values in `.env.local`, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm test
npm run build
npm start
```

Vercel detects Next.js from `package.json` and `vercel.json` (`framework: nextjs`). In the Vercel project, the Framework Preset should be **Next.js** (not Other / static). Set the same environment variables in the Vercel project.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous / publishable key |
| `NEXT_PUBLIC_SITE_URL` | Public site origin. Use `https://www.contihub.app`. Apex `https://contihub.app` is canonicalized to www because Vercel 308-redirects apex → www. |

Never commit real secrets. Use `.env.example` as the template.

## Auth setup

Vercel sends `contihub.app` → `www.contihub.app` (308). Confirmation links must land on **www** so the PKCE verifier cookie and session cookies stay on the same host. Do **not** turn off email confirmation.

In the Supabase Dashboard go to **Authentication → URL Configuration** and set:

**Site URL**

```
https://www.contihub.app
```

**Redirect URLs** (add all of these):

```
https://www.contihub.app/auth/callback
https://www.contihub.app/auth/confirm
https://contihub.app/auth/callback
https://contihub.app/auth/confirm
https://www.contihub.app/**
https://contihub.app/**
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/**
```

Optional Vercel preview deployments:

```
https://*-*.vercel.app/**
```

Signup uses `emailRedirectTo=https://www.contihub.app/auth/callback?next=/app`. That exact callback origin must stay on the allowlist.

**Email templates** (Authentication → Email Templates → Confirm signup):

- Preferred: keep the default `{{ .ConfirmationURL }}` link. It verifies on Supabase, then redirects to `emailRedirectTo` with `?code=`.
- If the template uses `token_hash`, point it at the confirm route (not Site URL + `/auth/callback` appended onto an already-full `RedirectTo`):

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

If `emailRedirectTo` is already the full callback URL, the href should be `{{ .RedirectTo }}` only — do not append `/auth/confirm`.

In **Vercel → Settings → Environment Variables**, set:

```
NEXT_PUBLIC_SITE_URL=https://www.contihub.app
```

Then redeploy. Leave **Authentication → Providers → Email → Confirm email** enabled.

## Routes

- `/` — public landing page
- `/login` — sign in
- `/signup` — create an account
- `/auth/callback` — Supabase PKCE `?code=` exchange and `token_hash` OTP verify
- `/auth/confirm` — same handler for the official `token_hash` email template
- `/auth/complete` — client fallback when tokens arrive in the URL hash
- `/app` — protected ops hub (middleware redirects unauthenticated users to `/login`)
- `/app/projects` — list and create jobs
- `/app/projects/[id]` — project home (summary + links into suite apps for that job)
- `/app/projects/[id]/field` — ContiField daily construction log for that project
- `/app/projects/[id]/field/log/[date]` — create or edit a daily log for a date
- `/app/projects/[id]/field/rfis` — ContiField RFI list for that project
- `/app/projects/[id]/crm` — ContiCRM opportunities for that project
- `/app/projects/[id]/cost` — ContiCost job cost summary for that project
- `/app/projects/[id]/safety` — ContiSafety log for that project
- `/app/projects/[id]/trak` — ContiTraK milestones for that project
- `/app/projects/[id]/bid` — Conti Bid chase list for that project
- `/app/crm`, `/app/field`, `/app/cost`, `/app/safety`, `/app/trak`, `/app/bid` — project pickers (redirect when only one project exists)

All `/app/**` routes share the suite nav and require a signed-in session.

## Suite data

Suite apps write to Supabase tables when the migration has been applied. If the tables are missing, the UI still works with an in-session memory store and shows a banner.

Apply these files in the Supabase SQL editor (in order), or with the Supabase CLI (`supabase db push`). No new environment variables are required.

1. `supabase/migrations/20260909060000_conti_suite.sql` — CRM, Field, Cost, Safety, TraK, and Bid MVP tables
2. `supabase/migrations/20260909160000_contifield_daily_log.sql` — ContiField job settings, RFI table, and richer daily-log columns
3. `supabase/migrations/20260909180000_projects.sql` — `projects` table, nullable `project_id` on suite tables, and a per-user **Data Center** seed that attaches existing unassigned / “Data Center” sample rows

Run all three in that order in the ContiHub Supabase SQL editor. If a file has not been applied yet, the matching UI still runs with an in-session memory store and shows a banner.

Row Level Security scopes every row to `auth.uid()`. Suite boards filter by `project_id` so Data Center and the next chase stay separate.
