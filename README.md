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
| `NEXT_PUBLIC_APP_URL` | Base URL, `http://localhost:3000` locally |

`.env.local` is gitignored. Only `.env.example` belongs in the repo.

---

## 4. Run it

```bash
npm install
npm run seed     # inserts the 3 vans + the admin user
npm run dev
```

Open <http://localhost:3000>.

| Page | What's there |
|---|---|
| `/` | The fleet |
| `/book/sprinter` | Booking flow |
| `/keys/VH-XXXX` | Phone key for a booking (link shown after booking) |
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

### Availability and the race condition

A booking clashes when:

```
existing.startDate < newEnd   AND   existing.endDate > newStart
```

and the existing booking isn't cancelled. The end date is treated as **checkout
(exclusive)**, so a van returned on the 8th can go out again on the 8th.

The interesting part is that a check followed by an insert is not safe. Two
people can both pass the check in the same instant and both get written.

**What this project does:** the re-check and the insert run inside a Mongoose
transaction (`session.withTransaction`). Atlas runs a replica set, so either
both the check and the write commit, or neither does. The second request sees
the first one's row and is rejected with a 409.

**Fallback for local dev:** a standalone `mongod` has no transactions. If the
transaction fails for that reason, the code inserts, immediately re-checks for
conflicts excluding its own row, and deletes its own insert if it lost the race.
The booking that committed first wins, and the loser is never left stored.

The relevant indexes:

```
Reservation: { vanId: 1, startDate: 1, endDate: 1 }   # availability lookups
Reservation: { createdAt: -1 }                         # admin list ordering
Reservation: { reference: 1 } unique
```

### Auth

Email and password, hashed with bcrypt. The session is a JWT signed with `jose`
and stored in an **httpOnly, sameSite=lax** cookie — never `localStorage`, so
client-side scripts can't read it.

`middleware.ts` guards `/admin/*` page navigation. That alone isn't enough,
because middleware only sees navigation, so every admin API controller also
calls `requireAdmin()` as its first line.

---

## 7. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run seed` | Insert the vans and admin user |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js lint |

---

## 8. Known limits

- Vans are seeded, not managed from the dashboard. Adding a van means editing
  `scripts/seed.ts` and re-running the seed.
- The lock/unlock button is a simulation, as the brief asked — it writes to the
  reservation's `accessLog` rather than talking to real hardware.
- No email is actually sent on confirmation; the confirmation screen shows the
  booking reference and a link to the phone key instead.
