# Handoff Document: MPG Ops

## Session Information

**Session Date:** 2026-04-16
**Session Type:** Phase 14 — Public Booking Polish, Autofill & Global Loading Bar
**Status:** ✅ Complete

---

## What Was Completed (Phase 14)

### Public Booking Polish, Autofill & Global Loading Bar

**booking-wizard.tsx — StepWelcome:**
- py-16 → py-10, icon w-16/w-8 → w-12/w-6, tighter mb values throughout
- Headline elevated from `text-muted-foreground` to `text-base font-medium`
- Type label: `text-xs font-semibold uppercase tracking-widest`
- Services-count paragraph + bottom trust paragraph replaced with compact inline trust cue row (CheckCircle + "No account needed · N services")
- Footer text: "Free · Quick · No signup required" (from mt-4 to mt-2)

**booking-wizard.tsx — Autofill:**
- useEffect reads `mpg_guest` from localStorage on mount → pre-fills name, phone, email in WizardState
- handleConfirm writes `mpg_guest` after successful submission
- Fully SSR-safe (localStorage only touched inside useEffect)

**login-form.tsx — Spinner:**
- Loader2 from lucide-react, `animate-spin`, rendered alongside "Signing in..." text inside the submit button during isLoading

**navigation-progress.tsx (new file):**
- Slim `h-0.5` fixed bar at z-9999; uses usePathname + useSearchParams inside Suspense
- Remounts inner div on route change, triggering CSS @keyframes `nav-progress` (scaleX 5%→92%→100%, then fade)

**globals.css:** Added `@keyframes nav-progress`

**layout.tsx:** `<NavigationProgress />` mounted above ToastProvider

---

## What Was Completed (Phase 13)

### Bookings & Customers Workspace Refinement

Targeted UI refinement pass to reduce visual weight, improve scanning speed, and make both pages more practical as data grows. No redesign — existing design language preserved throughout.

---

### Changes (Phase 13)

**Bookings — display area only (date nav + filter row untouched):**
- `booking-card.tsx` — Removed Card wrapper. Combined customer + service into a single text line. Compact `px-4 py-3` rows with `mb-1` / `mb-2.5` spacing. Action buttons reduced to `h-8 text-xs`. Time formatted to HH:MM. Status badge + edit icon stay inline in row 1.
- `booking-list.tsx` — Wrapped all rows in one `bg-card rounded-xl border overflow-hidden` container. Rows separated by `border-t` dividers instead of individual card gaps (`space-y-3`).

**Customers — workspace table layout:**
- `customer-card.tsx` — Removed Card wrapper. Initial-letter avatar (8×8 rounded). Name + contact in a responsive grid (stacked mobile / side-by-side sm+). Phone and email rendered as icon+text inline. View/Edit buttons reduced to `h-8 text-xs`.
- `customer-list.tsx` — Single parent card container with `overflow-hidden`. Desktop-only column header row (Name / Contact). Rows separated by `border-t` dividers.

**Preserved unchanged:**
- Bookings date navigation card
- Bookings status filter + count row
- Customer search bar
- All sheets: BookingSheet, PaymentSheet, CustomerSheet, CustomerDetailSheet
- All server actions and business logic

### New Features (Phase 12)

#### 1. SQL Migration Files ✅

`migrations/` — two SQL migration files created for all schema additions:

| File | Content |
|------|---------|
| `20260416000001_public_site_settings.sql` | `JSONB` column on `businesses` |
| `20260416000002_service_public_fields.sql` | 7 columns + partial index on `services` |

#### 2. `src/app/actions/public-services.ts` ✅

New server action file (auth-gated, `business_members` pattern):
- `getServicesForPublicManagement()` — all services with public fields, ordered by `display_order`, then `name`
- `updateServicePublicSettings(serviceId, input)` — Zod-validated; updates 7 public columns + `updated_at`

#### 3. `/services/public` — Per-Service Public Management ✅

`src/app/(dashboard)/services/public/page.tsx`:
- Each service renders as a `ServicePublicCard` with:
  - Always-visible quick toggles: **Show on public** / **Featured**
  - Collapsible detail form: public title, public description, promo badge, promo text, display order
  - Per-service save with inline FormStatus and toast
  - Reset button to restore original values
- Empty state, error state with retry, skeleton loading
- "Preview" link to `/book/[businessId]`
- "visible / total" count header

#### 4. Services Page — "Public Settings" Button ✅

`src/app/(dashboard)/services/page.tsx` — added Globe icon button linking to `/services/public` in the page header.

#### 5. Booking Wizard Updated — Service Fields ✅

`src/components/public/booking-wizard.tsx`:
- **Step 1 (Welcome)** service preview: `public_title ?? name`, `is_featured` star/amber highlight, `promo_badge` badge
- **Step 2 (Choose Service)** cards: `public_title ?? name`, `public_description ?? description`, `promo_text`, `is_featured` amber border + star, `promo_badge` badge
- **Step 6 (Review)** service label: `public_title ?? name`

#### 6. TypeScript Fix: `as any[]` for New Columns ✅

`public-booking.ts` and `public-services.ts` both cast `data as any[]` before mapping, since the project's Supabase-generated types predate the new columns. Per-field casts preserve runtime type safety.

---

### Schema Changes (Phase 12)

```sql
-- Apply migrations/20260416000001_public_site_settings.sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS public_site_settings JSONB DEFAULT '{}';

-- Apply migrations/20260416000002_service_public_fields.sql
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_on_public_booking BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS public_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS public_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS promo_badge TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS promo_text TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_services_public_listing ON services (business_id, show_on_public_booking, display_order, name) WHERE is_active = TRUE;
```

All code has graceful fallbacks — works before and after migrations are applied.

---

## Files Created (Phase 12)

```
migrations/
├── 20260416000001_public_site_settings.sql
└── 20260416000002_service_public_fields.sql
src/
├── app/actions/
│   └── public-services.ts                 # NEW — per-service public management actions
├── app/(dashboard)/services/
│   └── public/
│       └── page.tsx                       # NEW — admin service public management page
```

## Files Modified (Phase 12)

```
src/app/actions/public-booking.ts          # Extended PublicService, getPublicServices, graceful fallback
src/components/public/booking-wizard.tsx   # StepService + StepWelcome + StepReview use new fields
src/app/(dashboard)/services/page.tsx      # "Public Settings" Globe button added
docs/08-progress-tracker.md               # Phase 12 added
docs/09-decisions-log.md                  # DEC-059, DEC-060, DEC-061
docs/10-handoff.md                        # This file
```

---

## Current State (Phase 12)

**TypeScript:** ✅ Zero errors (`npx tsc --noEmit`)
**Build:** ✅ Production build succeeds (`npm run build`)

**All routes resolved in build:**
- `/services/public` ƒ Dynamic (new)
- `/settings/public-site` ƒ Dynamic (Phase 11)
- All existing routes unchanged ✅

---

## Verification Checklist (Phase 12)

- [x] `/services/public` loads with all services (skeleton while loading)
- [x] Each service shows "Show on public" and "Featured" toggles (always visible)
- [x] Collapsible "Edit" form shows all public fields with character counts
- [x] Per-service save persists to DB; toast + inline feedback shown
- [x] "Reset" button restores fields to server values
- [x] Inactive services shown as dimmed; `is_active = false` services never appear publicly regardless
- [x] "visible / total" count header shows correct numbers
- [x] "Public Settings" button appears on `/services` page header
- [x] Step 1 welcome service preview: `public_title`, featured star, `promo_badge` badge
- [x] Step 2 service selection: featured amber border, `public_description`, `promo_text`
- [x] Step 6 review shows `public_title ?? name`
- [x] TypeScript strict mode passes (zero errors)
- [x] Production build succeeds with all routes present

---

## Previous Session (Phase 11)

**Session Date:** 2026-04-16
**Session Type:** Phase 11 — Public Site Admin Management
**Status:** ✅ Complete

---

## What Was Completed (Phase 11)

### Public Site Admin Management

MPG Ops now has a complete admin-side management layer for the public booking site (Flow 2).

---

### New Features

#### 1. Public Booking Site Card on Dashboard ✅

`src/components/dashboard/public-site-card.tsx` — a client component rendered on the dashboard that shows:
- Globe icon + explanatory description
- Full booking URL in a read-only input (click to select)
- Copy-to-clipboard button with check feedback
- Open-in-new-tab button
- "Customize Site" button → `/settings/public-site`

#### 2. Settings Page: Public Site Section Upgrade ✅

`src/app/(dashboard)/settings/page.tsx` — the `BookingLinkCard` was replaced with `PublicSiteCard` that adds:
- A **Customize** link pointing to `/settings/public-site`
- Open-in-new-tab button alongside the copy button
- Consistent labeling with the dashboard card

#### 3. `/settings/public-site` — Customization Page ✅

`src/app/(dashboard)/settings/public-site/page.tsx` — a full customization page:

| Field | Type | Default |
|-------|------|---------|
| Welcome headline | Text (max 80) | "Book an Appointment" |
| Subtitle | Text (max 120) | "Easy online booking — it only takes a minute." |
| Booking instructions | Textarea (max 300) | (hidden if blank) |
| Accent color | Radio swatches (5 options) | default (zinc/dark) |

- Loads current `public_site_settings` from `businesses` table
- Saves via `updatePublicSiteSettings` server action (auth-gated, Zod-validated)
- Shows character count per field
- Toast + FormStatus feedback on save
- "Preview public site" link opens the live booking page in a new tab
- Back link to Settings

#### 4. Public Landing Page Reflects Customization ✅

`src/components/public/booking-wizard.tsx` — `StepWelcome` now reads:
- `business.public_site_settings.headline` (fallback: "Book an Appointment")
- `business.public_site_settings.subtitle` (fallback: default tagline)
- `business.public_site_settings.instructions` — shown as a "Please note" notice box if set; hidden if empty

#### 5. Accent Color via CSS Variable Override ✅

`src/app/book/[businessId]/page.tsx` — injects a `<style>` tag with `:root { --primary: oklch(...) }` overrides for 5 accent options (default/blue/green/purple/rose). Values come from a hardcoded map — no user input is injected into CSS.

---

### Schema Change Required

```sql
-- Run once in Supabase SQL Editor or via migration
ALTER TABLE businesses ADD COLUMN public_site_settings JSONB DEFAULT '{}';
```

The code degrades gracefully (shows defaults) if the column is not yet added.

---

## Files Created (Phase 11)

```
src/
├── app/(dashboard)/settings/
│   └── public-site/
│       └── page.tsx                    # NEW — public site customization page
├── components/dashboard/
│   └── public-site-card.tsx            # NEW — reusable public site card for dashboard
```

## Files Modified (Phase 11)

```
src/app/actions/business.ts             # Added PublicSiteSettings type + updatePublicSiteSettings
src/app/actions/public-booking.ts       # Added public_site_settings to PublicBusiness type + query
src/components/public/booking-wizard.tsx # StepWelcome uses headline/subtitle/instructions
src/app/book/[businessId]/page.tsx      # Accent CSS variable injection
src/app/(dashboard)/settings/page.tsx   # PublicSiteCard with Customize link
src/app/(dashboard)/dashboard/page.tsx  # PublicSiteCard imported and rendered
docs/08-progress-tracker.md            # Phase 11 added
docs/09-decisions-log.md               # DEC-056 to DEC-058
docs/10-handoff.md                     # This file
docs/11-known-issues.md                # ISS-003 added
```

---

## Current State

**TypeScript:** ✅ Zero errors (`npx tsc --noEmit`)
**Build:** ✅ Production build succeeds (`npm run build`)

**All routes resolved in build:**
- `/settings/public-site` ƒ Dynamic (new)
- All existing routes unchanged ✅

---

## Verification Checklist (Phase 11)

- [x] Dashboard shows "Your Public Booking Site" card with URL, copy, open, customize
- [x] Settings page shows public site section with copy, open, Customize link
- [x] `/settings/public-site` loads with existing settings pre-filled
- [x] Character count shown per field
- [x] Accent color picker shows 5 swatches; selected is highlighted
- [x] Save action persists to DB (requires `public_site_settings` column in DB)
- [x] Toast + FormStatus success/error feedback on save
- [x] "Preview public site" opens `/book/[businessId]` in new tab
- [x] Public booking page welcome step shows custom headline + subtitle
- [x] Instructions notice box appears only if text is set
- [x] Accent color override visible on public page when non-default is chosen
- [x] Default values shown gracefully if no customization set yet
- [x] Internal routes unaffected
- [x] TypeScript strict mode passes
- [x] Production build succeeds

---

## Previous Session (Phase 10)

**Session Date:** 2026-04-14
**Session Type:** Phase 10 — Public Booking Flow (Flow 2)
**Status:** ✅ Complete

---

## What Was Completed

### Public Booking Flow (Flow 2)

MPG Ops now has two distinct flows:
- **Flow 1** — Internal owner/admin app (unchanged)
- **Flow 2** — Public customer-facing booking site at `/book/[businessId]`

---

### Infrastructure

#### 1. Supabase Admin Client ✅

`src/lib/supabase/admin.ts` — uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for public booking operations. Server-only; never exposed to the browser. Throws a clear error if the env var is missing.

#### 2. Public Server Actions ✅

`src/app/actions/public-booking.ts` — three server actions:

| Action | Purpose |
|--------|---------|
| `getPublicBusiness(businessId)` | Fetch business name/type/hours. Returns `null` if not found. |
| `getPublicServices(businessId)` | Fetch active services only (`is_active = true`). |
| `submitPublicBooking(input)` | Validate → upsert customer by phone → create booking → return confirmation. |

Zod validation on all inputs. Business + service ownership verified before any write. Bookings created as `scheduled`.

---

### Routes

#### `/book/[businessId]` ✅

Server component that:
1. Fetches business + services via public actions
2. Calls `notFound()` if business doesn't exist
3. Renders `<BookingWizard>` with data as props

No auth required. Not in middleware `protectedPaths` or `authPaths`.

#### `/book/[businessId]/success` ✅

Success page that reads URL search params (`business`, `service`, `date`, `time`, `name`) and renders a booking confirmation screen. No additional DB fetch required.

#### `/book/[businessId]/not-found.tsx` ✅

Clean 404 page when `businessId` doesn't match any business.

---

### BookingWizard Component ✅

`src/components/public/booking-wizard.tsx` — a single client component managing all 6 steps:

| Step | Content |
|------|---------|
| 1 — Welcome | Business name, service count preview, "Book an Appointment" CTA |
| 2 — Choose Service | Tap-to-select service cards (name, price, duration) |
| 3 — Choose Date | Native `<input type="date">` with min=today |
| 4 — Choose Time | 30-min slots grid from operating hours; closed-day state |
| 5 — Customer Details | Name*, phone*, email (opt), notes (opt) with inline validation |
| 6 — Review & Confirm | Full summary + price + confirm button + error handling |

Progress bar at top of every step. Back navigation on steps 2–6. State preserved across steps.

On success: navigates to `/book/[id]/success?...` with confirmation params.
On empty service list: shows a "no services available" fallback.
On closed day: shows "Closed on this day" with a back button.  
*Bug fix (2026-04-16): empty `operating_hours {}` now correctly falls back to default 9am–6pm slots instead of marking every day closed.*

---

### Settings — Booking Link Card ✅

Added a **"Your Booking Link"** card to `settings/page.tsx`:
- Shows the full public booking URL for the business
- One-click copy to clipboard with visual feedback
- "Preview" link opens in new tab

---

### `.env.example` Updated ✅

Documents `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SITE_URL`.

---

## Files Created

```
src/
├── lib/supabase/
│   └── admin.ts                              # NEW — service-role Supabase client
├── app/
│   ├── actions/
│   │   └── public-booking.ts                # NEW — public server actions
│   └── book/
│       └── [businessId]/
│           ├── page.tsx                      # NEW — booking page (server component)
│           ├── not-found.tsx                 # NEW — 404 for invalid business
│           └── success/
│               └── page.tsx                  # NEW — booking confirmation
├── components/
│   └── public/
│       └── booking-wizard.tsx               # NEW — 6-step wizard client component
```

## Files Modified

```
src/app/(dashboard)/settings/page.tsx        # Added BookingLinkCard component
.env.example                                  # Added SUPABASE_SERVICE_ROLE_KEY
docs/08-progress-tracker.md                  # Phase 10 added
docs/09-decisions-log.md                     # DEC-052 to DEC-055
docs/10-handoff.md                           # This file
docs/11-known-issues.md                      # ISS-002 added
```

---

## Current State

**TypeScript:** ✅ Zero errors (`npx tsc --noEmit`)
**Build:** ✅ Production build succeeds (`npm run build`)

**All routes resolved in build:**
- `/book/[businessId]` ƒ Dynamic
- `/book/[businessId]/success` ƒ Dynamic
- All internal routes unchanged ✅

---

## Verification Checklist

- [x] `/book/[businessId]` loads without auth
- [x] Shows business name and active services on welcome screen
- [x] Wizard steps flow: welcome → service → date → time → details → review → success
- [x] Back navigation works at every step
- [x] Selecting a service pre-selects it with visual feedback
- [x] Date input rejects past dates
- [x] Time slots generated from operating hours; closed days show correct message
- [x] Customer details validation (name + phone required)
- [x] Review screen shows full summary + price
- [x] Submission creates customer (or matches by phone) + booking in DB
- [x] Booking appears in internal `/bookings` page as `scheduled`
- [x] Success page shows booking confirmation
- [x] Invalid businessId shows not-found page
- [x] Settings page shows shareable booking URL with copy button
- [x] Internal routes unaffected (dashboard, bookings, customers, etc.)
- [x] TypeScript strict mode passes
- [x] Production build succeeds

---

## Environment Variables Required

```bash
# Required for public booking flow
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # From Supabase > Settings > API

# Required for password reset
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Known Limitations

- **No slot conflict detection** — Two customers can book the same time slot. Owner manages manually. See ISS-002.
- **No booking URL slug** — URL uses UUID. Can be improved to a friendly slug post-MVP. See DEC-052.
- **No customer notifications** — No SMS/email confirmation sent to customer. Post-MVP.
- **No cancellation flow** — Customers cannot cancel from the public flow. Post-MVP.

---

---

## Onboarding Bug Fix & Wizard Refactor (2026-04-16)

### Problem
Onboarding at `/onboarding` crashed with:
`null value in column "slug" of relation "businesses" violates not-null constraint`

`setupBusiness` never inserted a `slug`, and the onboarding form had no slug field.

### Fix
- **Slug utilities** (`src/lib/slug.ts`) — `generateSlug()` sanitizes names; `generateUniqueSlug()` checks DB collisions and appends `-2`, `-3`, etc.
- **Server action** (`src/app/actions/auth.ts`) — `setupBusiness` now auto-generates a unique slug from the business name (or optional user override) and includes it in the insert.
- **Wizard refactor** (`src/components/forms/business-setup-form.tsx`) — converted the long scrolling form into a 4-step mobile wizard:
  1. Business Basics (name, slug, type)
  2. Contact Details (phone, email)
  3. Location & Hours (address, operating hours)
  4. Review & Create (summary + submit)
- **Progress bar**, per-step validation, large touch-friendly buttons, minimal scrolling.

---

---

## Login Flow Fix (2026-04-16)

### Problem
- Successful logins were incorrectly redirected to `/onboarding` when no business existed.
- Login error messages were generic ("Invalid login credentials"), giving users no clear next step.

### Fix
- **`login` action** (`src/app/actions/auth.ts`):
  - Queries `profiles` via admin client before signing in.
  - Returns `account_not_found` with register CTA when email has no profile.
  - Returns `wrong_password` when sign-in fails for a known email.
  - Successful logins always redirect to `/dashboard`.
- **`getCurrentBusiness`** (`src/app/actions/business.ts`):
  - Falls back to `business_members` so non-owner members resolve their business correctly.
- **Dashboard / Settings**:
  - Removed `/onboarding` redirects for authenticated users without a business.
  - Shows a "No business found" empty state instead.

### Behavior
| Scenario | Result |
|----------|--------|
| Unknown email + any password | "Business account not found. Please register instead." + register button |
| Known email + wrong password | "Wrong password." |
| Known email + correct password | Redirect to `/dashboard` |
| New user registers | Still redirected to `/onboarding` |

---

---

## Mobile UI Polish Pass (2026-04-16)

### Changes
- **Landing page (`/`)**: Fixed `container` centering with `mx-auto`, tightened hero/feature spacing for less scrolling.
- **Dashboard layout**: Added `mx-auto` and responsive horizontal padding to the main container.
- **Dashboard (`/dashboard`)**:
  - Stats cards now use a 2-column grid on mobile (`grid-cols-2`) expanding to 4 columns on desktop, saving vertical space.
  - Reduced card padding and section gaps on mobile while keeping desktop comfort.
  - Tightened Today's Schedule list spacing.
  - Quick Actions use a 2-column grid on mobile instead of wrapped flex.
- **Services (`/services`)**:
  - Service cards now show a `Switch` toggle directly in the header for instant active/inactive control.
  - Edit button moved to a compact outline button in the card footer.
  - Reduced grid gap and card padding for better density.

### Behavior
- Toggle switch updates service status immediately (same server action, better UX).
- Edit sheet still opens correctly for detail changes.
- No horizontal overflow on narrow screens.
- Sticky navbar untouched.

---

---

## Public Booking: Service-First Landing & Mini Storefront (2026-04-16)

### Phase 15 — Service-First Landing
The public booking page (`/book/[businessId]`) previously showed a gated welcome screen before services were visible. The new flow presents services immediately on load:

- **`ServiceFirstLanding`** (inside `booking-wizard.tsx`) replaces the old `StepWelcome`.
- Each service renders as a `LandingServiceCard` with its own "Book Now" CTA.
- Clicking "Book Now" on any service calls `handleSelectService(service)` which sets `state.service` and jumps directly to step 3 (date selection), skipping the service-selection step (step 2).
- Step 2 remains accessible via "Back" from step 3.

### Phase 16 — Mini Storefront
Further redesign of the landing into a storefront pattern:

**Featured service cycling**
- Services with `is_featured=true` cycle through a `FeaturedServiceCard` at the top (4-second interval via `setInterval`).
- Fallback: if no featured services, cycles `services.slice(0, 1)`.
- Featured services are excluded from the grid below to avoid duplication.

**2-column service grid**
- `GridServiceCard` — compact card with name, price, duration, and an outline "Book" button.
- Rendered in `grid grid-cols-2 gap-2.5`.

**Trust chips**
- Static row: "No account required", "Instant booking", "Free to book".
- All verifiably true for every business; no fake social proof.

**Next available slot**
- `computeNextAvailableSlot(operating_hours)` — pure client-side helper.
- Called in `useEffect` only (SSR-safe; avoids hydration mismatch with local time).
- Loops 7 days from today, finds next 30-min boundary after current time.
- Shows `"Today · 3:30 PM"` / `"Tomorrow · 9:00 AM"` / `"Monday · 9:00 AM"` or nothing if hours not configured.

**Guest autofill** (carried from Phase 14)
- Reads `{ name, phone, email }` from localStorage key `mpg_guest` on mount.
- Writes back on successful booking submission.

---

*Last Updated: 2026-04-16*
*Next Task: Deploy to Vercel, test public booking end-to-end with a real business*
