# ContiHub

Continental Construction of Ohio (CCO) operations portal for [contihub.app](https://contihub.app).

ContiHub is the live home for the Conti suite: Projects, ContiHub, ContiReview, ContiCRM, ContiField, ContiCost, Change Orders, ContiSafety, ContiTraK, and Conti Bid. Suite boards are scoped to an individual project.

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
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Mints magic links for bid and staff invites. Do not prefix with `NEXT_PUBLIC_`. |
| `CONTI_BID_FROM_MAILBOX` | Mailbox Graph should send as, when connected. Prefer `jon.hefner@continentalcando.com`. Not a secret. |
| `MICROSOFT_GRAPH_TENANT_ID` | Optional. Azure AD tenant for app-only Mail.Send. |
| `MICROSOFT_GRAPH_CLIENT_ID` | Optional. Graph app client id. |
| `MICROSOFT_GRAPH_CLIENT_SECRET` | Optional. Graph app secret. Server-only. |

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
https://www.contihub.app/auth/complete
https://contihub.app/auth/complete
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/auth/complete
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
- `/app/projects/[id]/change-orders` — Change Order log (proposed / priced / approved / rejected, owner exposure vs approved)
- `/app/projects/[id]/safety` — ContiSafety log for that project
- `/app/projects/[id]/trak` — ContiTraK milestone list (not CPM)
- `/app/projects/[id]/bid` — Conti Bid packages, invites, and chase list for that project
- `/app/projects/[id]/rfi` — ContiReview (roster, ContiReview form, architect or owner route, log, field and subcontractor drafts)
- `/app/bid/directory` — contractor directory (search, CSV import, CSV export)
- `/app/bid/invitations` — bidder landing (invited packages only)
- `/app/crm`, `/app/field`, `/app/rfi`, `/app/cost`, `/app/change-orders`, `/app/safety`, `/app/trak`, `/app/bid` — project pickers (redirect when only one project exists)

All `/app/**` routes share the suite nav and require a signed-in session.

## Suite data

Suite apps write to Supabase tables when the migration has been applied. If the tables are missing, the UI still works with an in-session memory store and shows a banner.

Apply these files in the Supabase SQL editor (in order), or with the Supabase CLI (`supabase db push`).

1. `supabase/migrations/20260909060000_conti_suite.sql` — CRM, Field, Cost, Safety, TraK, and Bid MVP tables
2. `supabase/migrations/20260909160000_contifield_daily_log.sql` — ContiField job settings, RFI table, and richer daily-log columns
3. `supabase/migrations/20260909180000_projects.sql` — `projects` table, nullable `project_id` on suite tables, and a per-user **Data Center** seed that attaches existing unassigned / “Data Center” sample rows
4. `supabase/migrations/20260914120000_change_orders.sql` — `change_orders` table (RLS + `project_id` FK) and a per-user fictional **Midwest Regional Stadium Renovation** demo project with a CO breakdown sample
5. `supabase/migrations/20260927120000_full_court_press.sql` — company org, staff vs bidder, contractor directory, bid packages, SAMPLE workspace, field-photo bucket
6. `supabase/migrations/20260928120000_rfi_pipeline.sql` — ContiReview roster, type routes, log, suggested-outcomes form, and the SAMPLE RFI
7. `supabase/migrations/20260928130000_rfi_roster_emails.sql` — confirmed roster names and emails if file 6 was applied with the earlier placeholders
8. `supabase/migrations/20260928140000_contireview_naming.sql` — ContiReview name on the suggested-outcomes step and operator notes

Run all eight in that order in the ContiHub Supabase SQL editor. If a file has not been applied yet, the matching UI still runs with an in-session memory store and shows a banner. After file 5, Conti staff in the same organization share projects. Bidders only see packages they were invited to. Files 6 through 8 are staff-only. Bidders do not see ContiReview.

### Change Orders SQL (Jon)

1. Open the ContiHub project in the [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Confirm the first three migrations above have already been applied (`projects` must exist).
3. Paste and run the full contents of `supabase/migrations/20260914120000_change_orders.sql`.
4. Reload ContiHub. Open **Projects → Midwest Regional Stadium Renovation** (or create that job and use **Load Midwest Stadium sample COs**).

The sample log is fictional stadium work only (no United CLE / live lead names). Totals after seed:

| Bucket | Amount |
| --- | ---: |
| Proposed + Pricing (pending) | $393,650 |
| Approved | $282,900 |
| Rejected (excluded from exposure) | $28,900 |
| **Net owner exposure** (pending + approved) | **$676,550** |

Deduct rows use a negative amount. Type **Deduct** with a positive number is stored as a credit.

Until the full court press SQL is applied, row level security scopes every row to `auth.uid()`. After that file, Conti staff share an organization and bidders stay on invited packages. Suite boards still filter by `project_id`.

## Full court press week

This is the week path for Conti Bid invitations, shared Hub access, and a demo that is not an empty board. Building Connected stays a parallel process. Conti Bid does not replace it and does not talk to Building Connected.

### Home reel

After sign-in, `/app` keeps the Conti Way shell and the same tile art as the rest of Hub. The header and the welcome lockup use the 3D chrome nested C from Conti marketing (`public/brand/conti-way-mark.png`): satin blue chrome around a brushed gold C. The tiles sit in a cover-flow row: scroll or swipe left and right and the row revolves. The front tile opens that app. ContiReview and Change Orders use the same tile treatment. Suite sub-pages are unchanged. The public marketing page stays a grid of tiles, not this reel.

### SQL to run

In the Supabase SQL editor, after the four files above, paste and run:

`supabase/migrations/20260927120000_full_court_press.sql`

That file:

- Creates `orgs` and `org_members` (`conti_staff` or `bidder`) and attaches existing projects to a Continental Construction organization
- Creates `bid_contractors`, `bid_packages`, and `bid_invitees`
- Adds CRM next action and value, safety what / who / action, TraK milestone status and owner
- Creates the private `field-photos` storage bucket (up to 4 photos on a daily log)
- Seeds a **SAMPLE Data Center** workspace for each user who already owns a project: multi-day field logs, three field RFIs, Conti chase stages, cost lines that roll up (budget $25,000,000 / committed $9,600,000 / actual $2,650,000 / variance $22,350,000), and one bid package with three SAMPLE invitees. No email is sent.

Hub also has **Load SAMPLE**, which calls `seed_full_court_press_sample()` when that function exists.

### Environment variables

Set these in Vercel (and `.env.local`). Do not commit real values.

| Variable | Required for |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Minting the magic link stored on the invite. Without it, the invitee row is still saved and the UI copies a draft. |
| `CONTI_BID_FROM_MAILBOX` | The From address Graph should use. Prefer `jon.hefner@continentalcando.com`, or another estimator mailbox. |
| `MICROSOFT_GRAPH_TENANT_ID` | App-only Graph send. Optional this week. |
| `MICROSOFT_GRAPH_CLIENT_ID` | App-only Graph send. Optional this week. |
| `MICROSOFT_GRAPH_CLIENT_SECRET` | App-only Graph send. Optional this week. |

Graph needs application permission **Mail.Send** and admin consent, then `POST /api/bid/graph-send`. If those env vars are empty, the route returns 501 and the estimator uses **Copy body** or **Open mailto**. Vercel does not hold Jon's Outlook user token, so this week does not depend on a live Graph send.

Magic links redirect to `/auth/complete`. Keep that path on the Supabase redirect allowlist (listed above).

### Contractor directory and CSV

Conti Bid → **Contractor directory** searches, adds, edits, imports, and exports CSV with these columns:

`First, Last, Email, Company, Phone, Office, Cell, Street, City, State, Zip, Categories, Notes`

A labeled SAMPLE subset is in `supabase/seeds/conti-bid-contractors-sample.csv` and is inserted by the SQL above. Import the full GAL export or Conti bidder list through the directory. Do not commit that full file.

Live Outlook GAL sync is not in this app. The Outlook connector can read personal contacts, not the Global Address List. Org directory scopes (`People` / `orgContacts` / users) need admin consent Conti does not have wired up yet. CSV import is the week path. When those scopes exist, live search can sit on top of this directory.

### Invites

1. Open a project → Conti Bid → save a package (title, due, Teams drawings link, notes).
2. Pick contractors from the directory, set the trade, and check **Also invited on Building Connected** only after that separate send.
3. **Send invites** creates or reuses the Supabase user, grants the **bidder** role for that package, and returns a Conti-branded draft: Conti Bid URL, username (work email), magic-link button, project, due, trade, Teams drawings link, and the Building Connected note.

Bidders who sign in land on `/app/bid/invitations` and do not get the rest of the suite. **Invite teammate** on the hub sends a staff magic link so Ann and the supers share company projects.

### Merge order

This branch includes the open Change Order log (PR #8). Merge this pull request and close #8, or merge #8 first and then this branch. Do not force-merge if CI fails. Run `20260914120000_change_orders.sql` before `20260927120000_full_court_press.sql`, then `20260928120000_rfi_pipeline.sql`, `20260928130000_rfi_roster_emails.sql`, and `20260928140000_contireview_naming.sql`. Hub shows the COs nav item, the ContiReview nav item, and an ops pulse (open RFIs, packages due, chase due, pending COs).

### ContiReview

Equal priority with Conti Bid for this week. ContiHub is the system of record for the Hub log. Access tblRFI can stay parallel until cutover. ContiRFI remains the draft and document-review process. The suggested-outcomes step is the ContiReview form. Conti’s ContiRFI training pack is reference only and is not this app. Staff paste citations. The form does not invent sheet numbers or answers.

After the full court press SQL, run `supabase/migrations/20260928120000_rfi_pipeline.sql`, `supabase/migrations/20260928130000_rfi_roster_emails.sql`, and `supabase/migrations/20260928140000_contireview_naming.sql`. **Load SAMPLE** also inserts **RFI-P01** on SAMPLE Data Center. That row is labeled SAMPLE. Its citation text says it is not from a drawing set.

Workflow on `/app/projects/[id]/rfi`:

1. Intake the question, urgency, cost impact, and schedule impact.
2. Paste doc-review notes and verbatim citations from the Teams link. If the documents already answer it, close with the drafter and do not issue.
3. Improve the question.
4. Submit to ContiReview: edit two or three suggested outcomes and select one.
5. Route by type. Design / documents goes to the architect liaison. Owner decision goes to the owner liaison. The route email is a copy or mailto draft.
6. Log the official return as Waiting, Closed, or Complete. That writes the ContiHub log and mirrors a ContiField RFI.
7. Push drafts to the active superintendent seat and the subcontractors you check. Mail is not sent from Hub this week.

Deploy roster (config table `rfi_roster`, not hard-coded in the UI). These people are operators who can act in ContiReview. ContiReview is the module name.

| Seat | Email | Role |
| --- | --- | --- |
| Ann Saccone | ann.saccone@continentalcando.com | admin and ContiReview (two rows) |
| Michael Might | michael.might@continentalcando.com | superintendent |
| Ryan Roberts | ryan.roberts@continentalcando.com | architect liaison |
| Braden Farmer | Braden.Farmer@continentalcando.com | distributor |

Add a person by inserting a row. Remove them by setting `active` off. The same person can hold more than one role. Owner liaison is not seeded. Add that row before owner-decision RFIs can route. A later seat can keep a blank email when the address is still unknown.

### Still later

- ContiRFI agent handoff that reads the Teams file set and fills citation-only notes
- Outlook GAL live search
- Sending mail from Graph without the copy/mailto step, once the app credentials exist
- Bid file storage beyond the Teams link
- Full CPM inside Hub TraK (the separate ContiTraK app remains the schedule)
- OSHA 300 export
