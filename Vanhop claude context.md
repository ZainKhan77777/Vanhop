# VanHop Project Context
**For use with Claude extension in Cursor IDE**

---

## Project Overview
VanHop is a mini van rental booking system built with Next.js 15 + MongoDB. Designed for Tekle Vanishvili. All 4 UI screens from the HTML prototype are fully implemented and deployed-ready.

---

## Live Pages & File Mapping

### Public Pages
| Page | URL | File | Features |
|---|---|---|---|
| **Fleet Listing** | `/` | `src/app/(public)/page.tsx` | Hero with Ken Burns animation, 3 van cards with hover effects, staggered reveal |
| **Booking Flow** | `/book/[vanId]` | `src/app/(public)/book/[vanId]/page.tsx` | 4-step indicator, van picker, dual-month calendar (blocked dates), contact form, sticky summary, confirmation with checkmark animation |
| **Phone Key** | `/keys/[ref]` | `src/app/(public)/keys/[ref]/page.tsx` | SVG van illustration, animated lock/unlock with signal waves, indicator lamps, door pin lift, van bounce, toggle button |

### Admin Pages (Protected by JWT middleware)
| Page | URL | File | Features |
|---|---|---|---|
| **Login** | `/admin/login` | `src/app/admin/login/page.tsx` | Admin login form (email + password) |
| **Overview Dashboard** | `/admin` | `src/app/admin/(dashboard)/page.tsx` | Stats (total vans, active bookings, revenue), quick overview |
| **Reservations List** | `/admin/reservations` | `src/app/admin/(dashboard)/reservations/page.tsx` | Search + filter chips, reservation table, detail drawer with CSV export |
| **Fleet Management** | `/admin/fleet` | `src/app/admin/(dashboard)/fleet/page.tsx` | Van utilization chart, fleet status overview |

---

## Tech Stack

```
Frontend:     Next.js 15 (App Router), TypeScript, Tailwind CSS, React Hook Form
Backend:      Next.js API Routes (no separate NestJS)
Database:     MongoDB Atlas + Mongoose
Validation:   Zod (shared client + server)
Auth:         JWT (jose) in httpOnly cookies
State:        TanStack Query v5 (server state), React state (UI)
HTTP Client:  Axios (one configured instance)
```

---

## Folder Structure (Key Directories)

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  ← Fleet listing
│   │   ├── book/[vanId]/page.tsx     ← Booking flow
│   │   └── keys/[ref]/page.tsx       ← Phone key
│   ├── admin/
│   │   ├── login/page.tsx            ← Admin login
│   │   └── (dashboard)/
│   │       ├── layout.tsx            ← Sidebar + session check
│   │       ├── page.tsx              ← Overview
│   │       ├── reservations/page.tsx ← Reservations list
│   │       └── fleet/page.tsx        ← Fleet util
│   └── api/
│       ├── vans/route.ts
│       ├── vans/[id]/availability/route.ts
│       ├── reservations/route.ts
│       ├── reservations/[id]/lock/route.ts
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       └── auth/me/route.ts
├── features/
│   ├── vans/
│   │   ├── van.model.ts              ← Mongoose schema
│   │   ├── van.service.ts            ← Business logic
│   │   ├── van.controller.ts         ← API handler
│   │   └── dto/
│   ├── reservations/
│   │   ├── reservation.model.ts
│   │   ├── reservation.service.ts    ← Includes race-condition guard
│   │   ├── reservation.controller.ts
│   │   ├── availability.ts           ← Shared client+server date logic
│   │   └── dto/
│   └── auth/
│       ├── user.model.ts
│       ├── auth.service.ts
│       ├── auth.controller.ts
│       ├── guards/require-admin.ts
│       └── guards/require-session.ts
├── components/
│   ├── ui/              ← Reusable: Button, Input, Badge, Skeleton, Drawer, etc.
│   ├── fleet/           ← VanCard, Fleet list
│   ├── booking/         ← BookingFlow, VanPicker, DateRangeCalendar, etc.
│   ├── keys/            ← VanLockAnimation, LockToggle
│   └── admin/           ← StatCard, ReservationTable, Sidebar, etc.
├── hooks/               ← useVans, useAvailability, useCreateReservation, etc.
├── lib/
│   ├── db.ts            ← MongoDB connection (with serverless cache)
│   ├── axios.ts         ← HTTP client instance
│   ├── api-response.ts  ← ok() / fail() helpers
│   ├── errors.ts        ← AppError class
│   ├── env.ts           ← Validated environment variables
│   └── format.ts        ← Date/currency formatting
├── types/index.ts       ← TypeScript types (VanDto, ReservationDto, etc.)
├── constants/
│   ├── routes.ts
│   ├── messages.ts
│   └── reservation-status.ts
└── middleware.ts        ← Protects /admin/* routes

scripts/
└── seed.ts              ← Idempotent seeding (3 vans + admin user)
```

---

## Database Schema

### Van
```typescript
{
  _id: ObjectId
  name: string
  slug: string (unique)
  description: string
  pricePerDay: number
  image: string (Unsplash photo ID)
  capacity: number
  features: string[]
  createdAt: Date
}
```

### Reservation
```typescript
{
  _id: ObjectId
  vanId: ObjectId (ref: Van)
  reference: string (unique, format: VH-XXXX)
  startDate: Date (ISO)
  endDate: Date (ISO, exclusive for checkout)
  contactEmail: string
  contactPhone: string
  contactName: string
  pricePerDaySnapshot: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}
```

### User (Admin)
```typescript
{
  _id: ObjectId
  email: string (unique)
  passwordHash: string
  role: "admin"
  createdAt: Date
}
```

### Indexes
```
Reservation: { vanId: 1, startDate: 1, endDate: 1 } // availability check
Reservation: { createdAt: -1 }                       // admin list
Reservation: { reference: 1 } unique
Van: { slug: 1 } unique
User: { email: 1 } unique
```

---

## Key Features & Implementation

### 1. Availability Check with Race-Condition Guard
- **File**: `src/features/reservations/reservation.service.ts` → `insertGuarded()`
- **Method**: MongoDB transactions (primary) + fallback check-exclude-delete
- **Logic**: Ensures two users can't book overlapping dates, even under high concurrency

### 2. Shared Date Logic (Client + Server)
- **File**: `src/features/reservations/availability.ts`
- **Functions**: `rangesOverlap()`, `isRangeFree()`, `blockedDays()`
- **Used by**: DateRangeCalendar component AND service layer
- **Note**: End date is **exclusive** (checkout), so back-to-back bookings are allowed

### 3. Authentication
- JWT signed with `jose` (Edge-compatible)
- Stored in httpOnly, secure, sameSite=lax cookie
- Middleware guards `/admin/*` page routes
- Every admin API controller calls `requireAdmin()` as first line

### 4. Animations
- **Hero**: Ken Burns zoom effect
- **Van Cards**: Hover lift + staggered reveal
- **Booking Confirmation**: Checkmark draw animation
- **Phone Key**: Signal waves from phone, indicator lamp blinks, door pin lifts, van bounces
- **All**: Use CSS keyframes (Tailwind) + React transitions

### 5. Admin Features
- Search + filter chips on reservation list
- CSV export of reservations
- Reservation detail drawer with full booking info
- Dashboard overview with count-up stats
- Fleet utilization chart

---

## Environment Variables

```bash
# .env or .env.local
MONGODB_URI=mongodb+srv://vanhop:PASSWORD@cluster0.zyxjzen.mongodb.net/vanhop?retryWrites=true&w=majority
JWT_SECRET=<openssl rand -base64 32>
ADMIN_EMAIL=admin@vanhop.ge
ADMIN_PASSWORD=<strong-password>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Commands

```bash
npm install / yarn install
npm run seed / yarn seed          # Seed 3 vans + admin user
npm run dev / yarn dev            # Local dev server
npm run build / yarn build        # Production build
npm run typecheck / yarn typecheck
npm run start / yarn start        # Run production build
```

---

## Seed Data (Idempotent Upserts)

**3 Vans:**
1. Ford Transit Custom | slug: `transit-custom` | ₾180/day
2. Mercedes Sprinter | slug: `sprinter` | ₾240/day
3. VW Grand California | slug: `grand-california` | ₾310/day

**Admin User:** From env vars (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

---

## Design System (Tailwind)

### Colors
```
Navy:        #101A2E (page bg), #0E1626 (navy-900)
Brass:       #A8761F (primary), #D8B071 (light), #F6EEDF (tint)
White:       #FFFFFF (cards), #F5F7FB (surface-2)
Line:        #EAEEF5
Muted:       #64728C
Rose:        #A33C3C (alert/validation)
```

### Fonts
- **Headings**: Newsreader (serif)
- **Body**: Plus Jakarta Sans (sans-serif)

### Spacing & Sizing
- Follow Tailwind's 4px base unit (4, 8, 12, 16, 20, 24...)
- Consistent padding/margin across surfaces

---

## API Endpoints

### Public
```
GET  /api/vans                           → List all vans
GET  /api/vans/[id]/availability        → Get blocked dates for a van
POST /api/reservations                   → Create reservation
GET  /api/reservations/[id]              → Get reservation by ID
GET  /api/reservations?ref=VH-XXXX       → Get reservation by reference
POST /api/reservations/[id]/lock         → Trigger van lock/unlock
```

### Admin (Protected)
```
POST /api/auth/login                     → Admin login
POST /api/auth/logout                    → Admin logout
GET  /api/auth/me                        → Current session
```

---

## Common Tasks

### Add a New Van
1. Increase seed data in `scripts/seed.ts`
2. Add Unsplash photo ID
3. `yarn seed`

### Modify Booking Flow
1. Edit `src/app/(public)/book/[vanId]/page.tsx`
2. Update form validation in `src/features/reservations/dto/`
3. Adjust service logic in `src/features/reservations/reservation.service.ts`

### Add Admin Feature
1. Create new page in `src/app/admin/(dashboard)/[feature]/page.tsx`
2. Add corresponding API route if needed
3. Call `requireAdmin()` at top of controller
4. Create hook in `src/hooks/`

### Change Theme Colors
1. Tailwind config is in `tailwind.config.ts` (or use inline Tailwind classes)
2. Update constants if using CSS variables

### Deploy to Vercel
1. Push to GitHub
2. `vercel.com/new` → import repo
3. Add env vars in Project Settings
4. Deploy
5. `MONGODB_URI="atlas-uri" npm run seed` (production DB)

---

## Debugging Tips

- **Availability issues?** Check `src/features/reservations/availability.ts` — date overlap logic
- **Race condition test?** Try booking same dates twice in quick succession. Should fail on 2nd attempt (409)
- **Auth failing?** Check middleware in `src/middleware.ts` + guards in `src/features/auth/guards/`
- **Animations not working?** Verify Tailwind is compiling (rebuild with `npm run build`)
- **MongoDB error?** Check `.env` file has correct `MONGODB_URI` and credentials haven't expired

---

## File Naming Conventions

- **Models**: `feature.model.ts` (Mongoose schemas)
- **Services**: `feature.service.ts` (business logic, no HTTP)
- **Controllers**: `feature.controller.ts` (parse request, validate, call service, return response)
- **DTOs**: `feature.dto.ts` or `dto/` folder (Zod schemas)
- **Guards**: `require-*.ts` (auth/permission checks)
- **Hooks**: `use[Feature].ts` (React Query hooks)
- **Components**: PascalCase, feature folder (e.g., `components/fleet/VanCard.tsx`)

---

## Next Steps After Local Testing
1. Verify all pages load + interact correctly
2. Test booking flow end-to-end (fleet → book → admin dashboard)
3. Test race-condition guard (same dates, concurrent bookings)
4. Push to GitHub
5. Deploy to Vercel
6. Seed production database
7. Send client live URL + admin login credentials

---

## Contact & Support
- Client: Tekle Vanishvili
- Project: VanHop Mini Van Rental
- Developer: Zain Khan
- Date: Oct 2026