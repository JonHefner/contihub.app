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
npm run build
npm start
```

Vercel detects Next.js from `package.json` and `vercel.json` (`framework: nextjs`). In the Vercel project, the Framework Preset should be **Next.js** (not Other / static). Set the same environment variables in the Vercel project.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous / publishable key |
| `NEXT_PUBLIC_SITE_URL` | Public site origin. Defaults to `https://contihub.app` |

Never commit real secrets. Use `.env.example` as the template.

## Auth setup

In the Supabase project, add these Redirect URLs:

- `https://contihub.app/auth/callback`
- `http://localhost:3000/auth/callback`

Site URL should be `https://contihub.app` (or your preview origin during staging).

## Routes

- `/` — public landing page
- `/login` — sign in
- `/signup` — create an account
- `/auth/callback` — Supabase auth code exchange
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
