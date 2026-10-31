# VanHop — Mini Van Rental Booking System

A van rental booking app: browse three vans, book a date range that can't be
double-booked, manage everything from a staff dashboard, and unlock the van from
a phone key page.

Next.js 15 (App Router) + MongoDB + TypeScript. One codebase, one deployment.

---

## 1. Requirements

- Node.js 20 or newer
- A free MongoDB Atlas account

Check your version:

```bash
node -v
```

---

## 2. MongoDB Atlas setup

1. Sign up at <https://www.mongodb.com/cloud/atlas/register>.
2. Click **Create**, choose the **M0 Free** tier, provider AWS, and a nearby
   region (Frankfurt or Ireland work well for Georgia).
3. **Security → Database Access → Add New Database User.** Pick a username and a
   strong password. Avoid `@ : / ? #` in the password, or you'll have to
   URL-encode them later. Give the user *Read and write to any database*.
4. **Security → Network Access → Add IP Address → Allow Access from Anywhere**
   (`0.0.0.0/0`). This is required because Vercel's serverless functions don't
   have fixed IP addresses.
5. On the cluster, click **Connect → Drivers → Node.js** and copy the string.
   Replace `<password>` with the real password and add the database name:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/vanhop?retryWrites=true&w=majority
```

---

## 3. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

| Variable | What it's for |
|---|---|
| `MONGODB_URI` | Atlas connection string from step 2 |
| `JWT_SECRET` | Signs the admin session cookie. Generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Admin account the seed script creates |
| `ADMIN_PASSWORD` | Password for that account |
| `NEXT_PUBLIC_APP_URL` | Base URL, `http://localhost:3000` locally. Used for the key link in the email |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `MAIL_FROM` | Optional. Sends the booking confirmation |

**Email is optional.** Leave the SMTP variables blank and the app books exactly
as before — the confirmation is printed to the server log instead of being sent,
so the reference is still easy to copy during a demo. To send for real with
Gmail: turn on 2-Step Verification, create an App Password at
<https://myaccount.google.com/apppasswords>, and use it as `SMTP_PASS`.

`.env.local` is gitignored. Only `.env.example` belongs in the repo.

---

## 4. Run it

```bash
yarn install
yarn seed     # inserts the 3 vans + the admin user
yarn dev
```

The repo is on **Yarn** — `yarn.lock` is the committed lockfile. npm works too
(`npm install && npm run seed && npm run dev`), but don't commit a second
lockfile: Vercel picks its package manager from whichever one it finds.

Open <http://localhost:3000>.

| Page | What's there |
|---|---|
| `/` | The fleet |
| `/book/sprinter` | Booking flow |
| `/keys` | Enter a booking reference to open its phone key |
| `/keys/VH-XXXXXXXX` | The phone key itself (linked from the confirmation screen) |
| `/admin/login` | Staff sign in |
| `/admin` | Dashboard |

Sign in with whatever you set as `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

`npm run seed` is idempotent — running it again updates the same documents
rather than creating duplicates.

---

## 5. Deploy to Vercel

1. Push the repo to GitHub.
2. Go to <https://vercel.com/new> and import it. Vercel detects Next.js on its
   own — leave the build settings alone.
3. Before the first deploy, open **Environment Variables** and add
   `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Set
   `NEXT_PUBLIC_APP_URL` to your Vercel URL.
4. Deploy.
5. Seed the production database from your machine, pointing at the same Atlas
   cluster:

```bash
MONGODB_URI="your-atlas-uri" npm run seed
```

Make sure Atlas network access is still `0.0.0.0/0`, or the deployed functions
will time out connecting.

---

## 6. How it's put together

```
src/
  app/            routes and pages; every api/*/route.ts is a one-liner
  features/       one folder per domain, layered like a NestJS module
    <feature>/
      *.model.ts        Mongoose schema
      *.service.ts      business logic — the only layer that composes steps
      *.controller.ts   parse → validate → call service → shape response
      dto/              Zod schemas; types are inferred with z.infer
      guards/           requireAdmin() etc., called at the top of controllers
  components/     ui/ primitives, then one folder per screen area
  hooks/          TanStack Query wrappers over the axios instance
  lib/            db, axios, env, errors, api-response, format
  constants/      routes, statuses, messages — no inline strings
```

A few rules the code sticks to:

- **Route handlers are thin.** No validation, no queries, no logic in `route.ts`.
- **One response shape.** Every endpoint returns `{ success, data, error }` via
  `lib/api-response.ts`.
- **Errors never leak.** Anything thrown goes through `handleError()`, which maps
  `AppError` and `ZodError` to clean messages and logs the rest.
- **One source of truth for overlap.** `features/reservations/availability.ts` is
  used by both the API and the calendar, so the UI can't disagree with the server.
- **Prices are snapshotted.** A reservation stores `pricePerDaySnapshot`, so
  changing a van's price later never rewrites past bookings.
- **Nothing is hardcoded.** Vans come from the database; statuses, fees and
  copy come from `constants/`.

### Availability and the two booking rules

A booking is refused when either rule fails.

**1. The van must be free.** Two ranges clash when:

```
existing.startDate <= newEnd   AND   existing.endDate >= newStart
```

and the existing booking isn't cancelled. **Both ends are inclusive**: the return
date is the last day the customer keeps the van, not a checkout the morning
after. So a booking ending on the 8th and one starting on the 8th *do* clash,
and `rentalDays()` counts both ends — pick up and return on the 6th and that is
one billable day. Tapping a single date in the calendar is therefore a complete,
valid booking; tapping a second date extends it.

**2. The customer must be free.** One person cannot drive two vans at once, so
the same email cannot hold two overlapping bookings, on any van. Booking several
vans is still fine as long as the dates don't overlap — this only stops a
double-submitted form and the obvious abuse case. Remove
`customerConflictFilter` from `assertNoClash` if a group hiring two vans at once
should be allowed.

### Why a transaction alone is not enough

A check followed by an insert is not safe — two people can pass the check in the
same instant. The obvious fix is to put both inside a transaction, but that does
**not** work on its own, and it is worth being precise about why.

MongoDB transactions give *snapshot isolation*, not serialisability. Two
concurrent transactions each read "nothing clashes" from their own snapshot, then
insert two **different** reservation documents. Different documents are not a
write conflict, so both commit and the van is double-booked. Tested with six
simultaneous requests for the same van and dates: four were accepted.

**What this project does:** each booking first bumps a counter on a shared
`BookingLock` row — one row per van, one per customer — inside the transaction.
Writing the *same* document **is** a conflict, so Mongo aborts the loser with a
`TransientTransactionError`, `withTransaction` retries it, and the retry reads the
winner's reservation and returns a clean 409. Re-tested: one 201, five 409s, one
row stored.

**Fallback for local dev:** a standalone `mongod` has no transactions. There the
code inserts first, then re-checks. The tie-break is the `_id`: a row only
deletes itself if an *older* conflicting row exists, so exactly one survives
rather than all of them deleting each other.

The relevant indexes:

```
Reservation: { vanId: 1, startDate: 1, endDate: 1 }   # availability lookups
Reservation: { createdAt: -1 }                         # admin list ordering
Reservation: { reference: 1 } unique
BookingLock: { key: 1 } unique                         # the serialisation point
```

### Auth

Email and password, hashed with bcrypt. The session is a JWT signed with `jose`
and stored in an **httpOnly, sameSite=lax** cookie — never `localStorage`, so
client-side scripts can't read it.

`middleware.ts` guards `/admin/*` page navigation. That alone isn't enough,
because middleware only sees navigation, so every admin API controller also
calls `requireAdmin()` as its first line.

### The phone key, which has no login

**Demo setting:** `PHONE_KEY.ENFORCE_RENTAL_WINDOW` in
`src/constants/reservation-status.ts` is `false`, so anyone holding a reference
can lock and unlock at any time. That is deliberate — it lets the feature be
tried straight after booking instead of only on the pickup day. **Set it to
`true` for a real deployment** and the key works only between the pickup and
return dates. The API and the key page both read the flag, so one edit changes
the rule and the button together.

The customer never gets an account, so the booking reference **is** the
credential — the same model as an airline booking code or a calendar invite
link. Three things make that defensible:

- The reference comes from a CSPRNG (`node:crypto`), not `Math.random()` and not
  the clock. Eight characters from a 26-character alphabet is about 2×10¹¹
  combinations, and references issued seconds apart tell you nothing about each
  other.
- `/keys/:ref` and the lock endpoint accept a **reference only**. A Mongo `_id`
  that leaked from an admin URL or a log line returns 404, so the one identifier
  staff see cannot open a customer's key.
- The lock endpoint is rate limited to 20 attempts a minute per IP, so the
  keyspace can't be walked.

`src/lib/rate-limit.ts` keeps its counter in process memory, which is honest for
one Node process but does not span serverless instances. A production deployment
would move it to Redis or Upstash; it is the one piece here that is sized for the
assignment rather than for scale.

---

## 7. Scripts

| Command | What it does |
|---|---|
| `yarn dev` | Dev server |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn seed` | Insert the vans and admin user |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | Next.js lint |

To build while a dev server is running, give the build its own output folder so
the two don't fight over `.next`:

```bash
NEXT_DIST_DIR=.next-build yarn build
```

---

## 8. Known limits

- Vans are seeded, not managed from the dashboard. Adding a van means editing
  `scripts/seed.ts` and re-running the seed.
- The lock/unlock button is a simulation, as the brief asked — it writes to the
  reservation's `accessLog` rather than talking to real hardware.
- The confirmation email has been verified as far as the SMTP connection — the
  config is read, a connection is attempted, and failures are logged without
  affecting the booking — but it has **not** been tested against a live mail
  server. Add real SMTP credentials and send one booking to yourself before
  relying on it.
- Mail is sent inside the booking request, so a slow mail server delays the
  response (capped at ~6s by the timeouts in `src/lib/mailer.ts`). A queue would
  be the real fix.
- The phone key's rental-window check is disabled for the demo — see
  *The phone key* above before deploying.
- The lock rate limiter is per process, not shared between serverless instances
  (see *The phone key* above).
- `BookingLock` gains one row per customer email and never prunes them. At this
  size that is a rounding error; a cleanup job would be the fix.
- `next/font` downloads Google Fonts at build time, so a build needs network
  access to `fonts.googleapis.com`. A flaky connection fails the build; re-run
  it, or self-host the two fonts with `next/font/local` to remove the dependency.
