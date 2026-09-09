# ContiHub

Continental Construction of Ohio (CCO) operations portal for [contihub.app](https://contihub.app).

ContiHub is the live home for the Conti suite: ContiHub, ContiCRM, ContiField, ContiCost, ContiSafety, ContiTraK, and Conti Bid.

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
- `/app/crm` — ContiCRM opportunity / lead list
- `/app/field` — ContiField daily reports
- `/app/cost` — ContiCost job cost summary
- `/app/safety` — ContiSafety toolbox talks and incidents
- `/app/trak` — ContiTraK schedule / milestones
- `/app/bid` — Conti Bid chase list

All `/app/**` routes share the suite nav and require a signed-in session.

## Suite data

Suite apps write to Supabase tables when the migration has been applied. If the tables are missing, the UI still works with an in-session memory store and shows a banner.

Apply `supabase/migrations/20260909060000_conti_suite.sql` in the Supabase SQL editor, or with the Supabase CLI (`supabase db push`). No new environment variables are required.

Row Level Security scopes every row to `auth.uid()`. Next step after this MVP: richer ERP fields, attachments, and shared project records across apps.
