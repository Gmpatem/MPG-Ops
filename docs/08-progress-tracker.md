# Progress Tracker: MPG Ops

## Project Status Overview

**Project:** MPG Ops  
**Status:** Phase 7.5 Complete - UX Feedback & Polish  
**Last Updated:** 2026-04-13  
**Overall Progress:** ~95%

---

## Phase 1: Project Setup ✅

| Task | Status | Notes |
|------|--------|-------|
| Create Next.js project | ✅ Complete | TypeScript, Tailwind, App Router |
| Install core dependencies | ✅ Complete | zod, @supabase/supabase-js |
| Initialize shadcn/ui | ✅ Complete | Button, utils installed |
| Create docs structure | ✅ Complete | All 12 docs created |
| Create prompts structure | ✅ Complete | 4 AI prompt files |

**Phase 1 Progress: 100%**

---

## Phase 2: Authentication & Onboarding ✅

| Task | Status | Notes |
|------|--------|-------|
| Supabase client setup | ✅ Complete | client.ts, server.ts, middleware.ts |
| Environment variables | ✅ Complete | .env.local template + .env.example |
| Sign up flow | ✅ Complete | /register with validation |
| Sign in flow | ✅ Complete | /login with session |
| Sign out flow | ✅ Complete | Server action + redirect |
| Protected routes | ✅ Complete | Middleware checks auth |
| Onboarding page | ✅ Complete | /onboarding form |
| Business creation | ✅ Complete | Creates business + owner membership |
| Redirect logic | ✅ Complete | No business → onboarding, Has business → app |

**Phase 2 Progress: 100%**

---

## Phase 3: Services UI & Settings ✅

| Task | Status | Notes |
|------|--------|-------|
| Services page UI | ✅ Complete | Exact layout with header, CTA, empty state |
| Service card component | ✅ Complete | Name, category, duration, price, status |
| Service sheet (add/edit) | ✅ Complete | Side panel, mobile-friendly |
| Service form | ✅ Complete | Category field, inline validation |
| Service status badge | ✅ Complete | Active/Inactive badges |
| Service list component | ✅ Complete | Grid layout, responsive |
| Settings page UI | ✅ Complete | Clean form, business info only |
| Dashboard service count | ✅ Complete | Real count, proper card layout |
| Category field | ✅ Complete | Added to schema, UI, and DB |

**Phase 3 Progress: 100%**

---

## Phase 4: Customer Management ✅

| Task | Status | Notes |
|------|--------|-------|
| Customer schema (Zod) | ✅ Complete | name, phone, email, notes |
| Customer server actions | ✅ Complete | create, update, get, count |
| Customer form component | ✅ Complete | Inline validation, mobile-first |
| Customer card component | ✅ Complete | Name, phone, email, edit button |
| Customer sheet (add/edit) | ✅ Complete | Side panel, reusable |
| Customer list component | ✅ Complete | Grid layout, responsive |
| Customer empty state | ✅ Complete | Icon, text, CTA button |
| Customers page UI | ✅ Complete | Header, CTA, list, empty state |
| Dashboard customer count | ✅ Complete | Real count from database |

**Phase 4 Progress: 100%**

---

## Phase 5: Bookings System ✅

| Task | Status | Notes |
|------|--------|-------|
| Booking schema (Zod) | ✅ Complete | customer_id, service_id, date, time, status |
| Booking server actions | ✅ Complete | create, updateStatus, getByDate, counts |
| Booking form component | ✅ Complete | Customer/service select, date/time picker |
| Booking card component | ✅ Complete | Time, customer, service, status, actions |
| Booking status badge | ✅ Complete | Scheduled/Completed/Cancelled badges |
| Booking sheet | ✅ Complete | Add booking side panel |
| Booking list component | ✅ Complete | Simple list layout |
| Booking empty state | ✅ Complete | Icon, text, CTA button |
| Bookings page UI | ✅ Complete | Header, date selector, list |
| Dashboard booking counts | ✅ Complete | Today's bookings + completed count |
| End time auto-calculation | ✅ Complete | Based on service duration |

**Phase 5 Progress: 100%**

---

## Phase 6: Payments System ✅

| Task | Status | Notes |
|------|--------|-------|
| Payment schema (Zod) | ✅ Complete | booking_id, amount, method, status |
| Payment server actions | ✅ Complete | recordPayment, getRevenue, getPayments |
| Payment form component | ✅ Complete | Amount, method select, notes |
| Payment sheet component | ✅ Complete | Record payment side panel |
| Payment card component | ✅ Complete | Amount, method, customer, service |
| Payment list component | ✅ Complete | List with revenue summary |
| Payment empty state | ✅ Complete | Icon, text |
| Booking payment integration | ✅ Complete | Record Payment button on completed bookings |
| Dashboard revenue | ✅ Complete | Today's revenue, payments count |
| Payments page | ✅ Complete | History + revenue summary (today/week/month) |

**Phase 6 Progress: 100%**

---

## Phase 7: Polish & Demo Prep ✅

### 7.1 Filters & Search

| Feature | Status | Notes |
|---------|--------|-------|
| Bookings status filter | ✅ Complete | All, Scheduled, Completed, Cancelled |
| Customers search | ✅ Complete | Search by name or phone |
| Payments date filter | ✅ Complete | All, Today, Last 7 Days, Last 30 Days |
| Services status filter | ✅ Complete | All, Active, Inactive |

### 7.2 Empty/Loading/Error States

| Page | Loading | Error | Empty |
|------|---------|-------|-------|
| Services | ✅ Skeleton | ✅ Retry button | ✅ CTA to add |
| Customers | ✅ Skeleton | ✅ Retry button | ✅ CTA to add |
| Bookings | ✅ Skeleton | ✅ Retry button | ✅ CTA to add |
| Payments | ✅ Skeleton | ✅ Retry button | ✅ Info message |
| Dashboard | ✅ Skeleton | N/A | N/A |
| Settings | ✅ Skeleton | ✅ Retry button | N/A |

**Phase 7 Progress: 100%**

---

## Phase 7.5: UX Feedback & Polish ✅

### 7.5.1 Shared UI Feedback Components

| Component | Status | Notes |
|-----------|--------|-------|
| ButtonLoading | ✅ Created | Button with built-in spinner for loading state |
| FormStatus | ✅ Created | Standardized success/error message component |
| EmptyState | ✅ Created | Reusable empty state with icon, title, description |
| ErrorState | ✅ Already existed | Error state with retry functionality |
| LoadingPage | ✅ Already existed | Page-level skeleton loading |

### 7.5.2 Button Pending States

| Location | Status | Notes |
|----------|--------|-------|
| Login | ✅ Already implemented | "Signing in..." with disabled state |
| Register | ✅ Already implemented | "Creating account..." with disabled state |
| Save Service | ✅ Already implemented | "Saving..." with disabled state |
| Save Customer | ✅ Already implemented | "Saving..." with disabled state |
| Save Booking | ✅ Already implemented | "Saving..." with disabled state |
| Record Payment | ✅ Already implemented | "Recording..." with disabled state |
| Save Settings | ✅ Already implemented | "Saving..." with disabled state |

### 7.5.3 Form UX States

| Form | Inline Validation | Submit Error | Pending State | Success Feedback |
|------|------------------|--------------|---------------|------------------|
| Login | ✅ HTML5 | ✅ Alert | ✅ Disabled button | N/A (redirects) |
| Register | ✅ HTML5 | ✅ Alert | ✅ Disabled button | N/A (redirects) |
| Service | ✅ Client-side | ✅ FormStatus | ✅ Disabled button | Sheet closes |
| Customer | ✅ Client-side | ✅ FormStatus | ✅ Disabled button | Sheet closes |
| Booking | ✅ Client-side | ✅ FormStatus | ✅ Disabled button | Sheet closes |
| Payment | ✅ Client-side | ✅ FormStatus | ✅ Disabled button | Sheet closes |
| Settings | ✅ HTML5 | ✅ FormStatus | ✅ Disabled button | ✅ FormStatus success |

### 7.5.4 Route-Level Loading

| Route | Loading UI | Status |
|-------|-----------|--------|
| /dashboard | loading.tsx with skeleton cards | ✅ Complete |
| /services | LoadingPage component | ✅ Complete |
| /customers | LoadingPage component | ✅ Complete |
| /bookings | LoadingPage component | ✅ Complete |
| /payments | LoadingPage component | ✅ Complete |
| /settings | Inline skeleton | ✅ Complete |

### 7.5.5 Page Error States

| Page | Error UI | Retry | Status |
|------|----------|-------|--------|
| Services | ErrorState component | ✅ Yes | ✅ Complete |
| Customers | ErrorState component | ✅ Yes | ✅ Complete |
| Bookings | ErrorState component | ✅ Yes | ✅ Complete |
| Payments | ErrorState component | ✅ Yes | ✅ Complete |
| Settings | ErrorState component | ✅ Yes | ✅ Complete |
| Global | error.tsx boundary | ✅ Yes | ✅ Complete |

### 7.5.6 Empty State Consistency

All empty states now follow consistent pattern:
- Icon in muted circle
- Title (text-lg font-semibold)
- Description (text-sm text-muted-foreground)
- CTA button when applicable

### 7.5.7 Additional UX Improvements

| Improvement | Status | Notes |
|-------------|--------|-------|
| Global not-found page | ✅ Created | 404 page with navigation |
| Global error boundary | ✅ Created | error.tsx for dashboard routes |
| FormStatus component | ✅ Standardized | All forms use consistent status display |

**Phase 7.5 Progress: 100%**

---

## Phase 8: Production Deployment ✅

### 8.1 Build Verification

| Check | Status |
|-------|--------|
| TypeScript strict mode passes | ✅ |
| Production build succeeds | ✅ |
| No console errors | ✅ |
| No debug code | ✅ |

### 8.2 Git & GitHub

| Task | Status |
|------|--------|
| Code committed | ✅ |
| Pushed to GitHub | ✅ |
| .env.example created | ✅ |
| Repository public | ✅ |

### 8.3 Documentation

| Document | Status |
|----------|--------|
| DEPLOYMENT.md | ✅ Created |
| DEMO-DATA.md | ✅ Created |
| Environment variables documented | ✅ |
| Demo flow documented | ✅ |

**Phase 8 Progress: 100%**

---

## Definition of MVP Complete

The MVP is complete:

- [x] Business owner can register and set up their business (5 min)
- [x] Can add services with pricing
- [x] Can add customers
- [x] Can create and manage bookings
- [x] Can record payments
- [x] Can see daily dashboard summary
- [x] All functions work on mobile
- [x] No critical bugs
- [x] Filters and search work
- [x] Loading/error states implemented
- [x] Code pushed to GitHub
- [x] Production build verified
- [x] Deployment documentation complete
- [x] UX feedback polish complete
- [x] Every page has proper loading state
- [x] Every form has validation + submit feedback
- [x] Every data-driven page has error handling
- [x] Customer detail with service history
- [x] Booking edit without re-creating
- [x] No-show status fully supported
- [x] Operating hours configurable (onboarding + settings)
- [x] Business email editable in settings
- [x] Dashboard quick actions open sheets (no page navigation)
- [x] Password reset self-service flow
- [x] All empty states have meaningful CTAs

---

## Repository Information

**GitHub:** https://github.com/Gmpatem/MPG-Ops.git  
**Branch:** main  
**Commit:** Latest (Phase 9: Internal Flow Completion)

---

## Phase 9: Internal Flow Completion ✅

### 9.1 Dashboard Operational Improvements

| Task | Status | Notes |
|------|--------|-------|
| Today's Schedule on dashboard | ✅ Complete | Shows time, customer, service, status |
| Bottom nav active state | ✅ Complete | Current route highlighted |
| Success toast feedback | ✅ Complete | Toast notifications for all CRUD actions |

### 9.2 Core Workflow Completion (Phase 2)

| Task | Status | Notes |
|------|--------|-------|
| Customer detail + service history | ✅ Complete | CustomerDetailSheet with bookings + payments history |
| Booking edit capability | ✅ Complete | Edit sheet pre-fills existing data, recalculates end time |
| No-show status handling | ✅ Complete | Badge, action, card UI, filter all support no_show |

### 9.3 Final Internal Flow Completion (Phase 3)

| Task | Status | Notes |
|------|--------|-------|
| Operating hours in onboarding | ✅ Complete | Weekly editor with toggle per day, saves to JSONB |
| Operating hours in settings | ✅ Complete | Editable, pre-filled from current business data |
| Business email in settings | ✅ Complete | Editable alongside name, phone, address |
| Dashboard quick actions → sheets | ✅ Complete | Add Customer/Booking/Service open sheets directly |
| Password reset flow | ✅ Complete | Forgot Password page, Reset Password page, auth/callback route |
| Payments empty state CTA | ✅ Complete | "Go to Bookings" button on empty payments |

**Phase 9 Progress: 100%**

---

## Phase 10: Public Booking Flow ✅

### 10.1 Infrastructure

| Task | Status | Notes |
|------|--------|-------|
| Supabase admin client | ✅ Complete | `src/lib/supabase/admin.ts` — service-role, server-only |
| Public server actions | ✅ Complete | `getPublicBusiness`, `getPublicServices`, `submitPublicBooking` |
| Route: `/book/[businessId]` | ✅ Complete | Public, no auth required |
| Route: `/book/[businessId]/success` | ✅ Complete | Confirmation screen via URL params |
| Not-found page for invalid businessId | ✅ Complete | Clean 404 UI |

### 10.2 Booking Wizard (6 Steps)

| Step | Status | Notes |
|------|--------|-------|
| Step 1 — Welcome | ✅ Complete | Business name, intro, service preview, CTA |
| Step 2 — Choose Service | ✅ Complete | Service cards with name/price/duration, tap to select |
| Step 3 — Choose Date | ✅ Complete | Native date input, min=today, local date display |
| Step 4 — Choose Time | ✅ Complete | 30-min slots from operating hours; "Closed" state |
| Step 5 — Customer Details | ✅ Complete | Name*, phone*, email, notes with validation |
| Step 6 — Review & Confirm | ✅ Complete | Summary + price + confirm button |
| Success Screen | ✅ Complete | Booking confirmed with full summary |

### 10.3 Integration

| Task | Status | Notes |
|------|--------|-------|
| Customer upsert by phone | ✅ Complete | Matches existing customer or creates new one |
| Booking created as `scheduled` | ✅ Complete | Immediately visible in internal dashboard |
| Booking link in Settings | ✅ Complete | Copy-to-clipboard card in settings page |
| `.env.example` updated | ✅ Complete | Documents `SUPABASE_SERVICE_ROLE_KEY` |

**Phase 10 Progress: 100%**

---

## Phase 11: Public Site Admin Management ✅

### 11.1 Public Site Access & Link Management

| Task | Status | Notes |
|------|--------|-------|
| Public site card on dashboard | ✅ Complete | Copy URL, open link, customize button all in one card |
| Settings page public site section | ✅ Complete | BookingLinkCard upgraded: copy + open + Customize link |
| `/settings/public-site` route | ✅ Complete | Dedicated customization page, server-rendered |

### 11.2 Public Site Customization (Admin Side)

| Task | Status | Notes |
|------|--------|-------|
| `public_site_settings` JSONB field | ✅ Complete | Added to `businesses` table (migration required — see DEC-056) |
| `PublicSiteSettings` type | ✅ Complete | `headline`, `subtitle`, `instructions`, `accent` — all optional |
| `updatePublicSiteSettings` server action | ✅ Complete | Validates, saves, revalidates; auth-gated |
| Customization form UI | ✅ Complete | Character counts, accent color swatches, FormStatus feedback |
| Accent color support (5 options) | ✅ Complete | default/blue/green/purple/rose via CSS variable override |

### 11.3 Public Landing Page Integration

| Task | Status | Notes |
|------|--------|-------|
| BookingWizard uses custom headline | ✅ Complete | Falls back to "Book an Appointment" |
| BookingWizard uses custom subtitle | ✅ Complete | Falls back to default tagline |
| BookingWizard shows instructions notice | ✅ Complete | Only shown if instructions text is set |
| Accent CSS injected server-side | ✅ Complete | `<style>` tag with `:root` variable override in public page |

**Phase 11 Progress: 100%**

---

## Phase 12: Public Service Presentation Management ✅

### 12.1 Schema & Migrations

| Task | Status | Notes |
|------|--------|-------|
| `migrations/` folder | ✅ Created | SQL migration files for all new columns |
| Migration 001: `public_site_settings` | ✅ Created | JSONB column on `businesses` |
| Migration 002: service public fields | ✅ Created | 7 columns + partial index on `services` |

### 12.2 Server Actions

| Task | Status | Notes |
|------|--------|-------|
| `public-services.ts` — `getServicesForPublicManagement` | ✅ Created | All services with public fields, ordered |
| `public-services.ts` — `updateServicePublicSettings` | ✅ Created | Auth-gated, Zod-validated, per-service save |
| `public-booking.ts` — `getPublicServices` extended | ✅ Updated | Filters `show_on_public_booking`, sorts by `display_order`, all new fields, graceful fallback |
| `public-booking.ts` — `getPublicBusiness` fallback | ✅ Updated | Graceful fallback if `public_site_settings` column missing |

### 12.3 Admin Management UI

| Task | Status | Notes |
|------|--------|-------|
| `/services/public` route | ✅ Created | Per-service toggles + collapsible detail form |
| Inline Toggle component | ✅ Created | Pill switch, no external dependency |
| Per-service save with feedback | ✅ Complete | Local state, inline FormStatus, toast |
| "Public Settings" button on `/services` | ✅ Added | Globe icon, links to `/services/public` |
| Empty / error / loading states | ✅ Complete | Skeleton, ErrorState, empty card |

### 12.4 Public Booking Wizard Integration

| Task | Status | Notes |
|------|--------|-------|
| Step 1 (Welcome) service preview | ✅ Updated | `public_title`, `is_featured` star, `promo_badge` badge |
| Step 2 (Service) cards | ✅ Updated | `public_title`, `public_description`, `promo_text`, featured highlight |
| Step 6 (Review) service label | ✅ Updated | Uses `public_title ?? name` |

**Phase 12 Progress: 100%**

---

## Summary

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Project Setup | ✅ Complete | 100% |
| 2. Auth & Onboarding | ✅ Complete | 100% |
| 3. Services UI | ✅ Complete | 100% |
| 4. Customers | ✅ Complete | 100% |
| 5. Bookings | ✅ Complete | 100% |
| 6. Payments | ✅ Complete | 100% |
| 7. Polish & Demo | ✅ Complete | 100% |
| 7.5 UX Feedback | ✅ Complete | 100% |
| 8. Deployment | ✅ Complete | 100% |
| 9. Internal Flow Completion | ✅ Complete | 100% |
| 10. Public Booking Flow | ✅ Complete | 100% |
| 11. Public Site Admin Management | ✅ Complete | 100% |
| 12. Public Service Presentation | ✅ Complete | 100% |

**Overall Progress: 100%**

---

## Phase 13: Type-Safety & Schema Alignment Cleanup ✅

### 13.1 Generated Database Types
| Task | Status | Notes |
|------|--------|-------|
| `src/lib/supabase/database.types.ts` created | ✅ Complete | Hand-crafted types matching online schema |
| Enums typed (`booking_status`, `payment_method`, `payment_status`) | ✅ Complete | |
| Relationships typed for embedded selects | ✅ Complete | `isOneToOne` set where code expects single objects |

### 13.2 Supabase Client Factories
| Task | Status | Notes |
|------|--------|-------|
| `server.ts` uses `Database` generic | ✅ Complete | |
| `client.ts` uses `Database` generic | ✅ Complete | |
| `admin.ts` uses `Database` generic | ✅ Complete | |

### 13.3 Temporary Casts Removed
| File | Change |
|------|--------|
| `public-booking.ts` | Removed `as any[]` and `as PublicBusiness` broad casts |
| `public-services.ts` | Removed `as any[]` cast |
| `settings/page.tsx` | Removed `as Business \| null` casts |
| `dashboard/page.tsx` | Removed `as Booking[]` cast |
| `dashboard-quick-actions.tsx` | Removed `as Customer[]` and `as Service[]` casts |

### 13.4 Stale Interfaces Updated
| File | Change |
|------|--------|
| `settings/page.tsx` | Local `Business` interface replaced with `Tables<'businesses'>` |
| `services/page.tsx` | Local `Service` interface replaced with `Tables<'services'>` |
| `services/service-list.tsx` | Local `Service` interface replaced with `Tables<'services'>` |
| `services/service-card.tsx` | Local `Service` interface replaced with `Tables<'services'>` |
| `services/service-sheet.tsx` | Local `Service` interface replaced with `Tables<'services'>` |
| `payments/page.tsx` | Payment `method` aligned to DB enum |
| `payments/payment-card.tsx` | Payment `method` aligned to DB enum |
| `payments/payment-list.tsx` | Payment `method` aligned to DB enum |
| `schemas/payment.ts` | Method enum updated to `cash` / `card` / `mobile_money` |
| `forms/payment-form.tsx` | Method options updated to match DB enum |

### 13.5 Build Verification
| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Passes |
| `npm run build` | ✅ Succeeds |
| All routes resolved | ✅ No regressions |

**Phase 13 Progress: 100%**

---

## Phase 14: Base UI Uncontrolled Input Warning Fix ✅

### 14.1 Root Cause
Base UI `Input` and `Switch` components warn when `defaultValue`/`defaultChecked` changes after initialization. `ServiceSheet`, `CustomerSheet`, `BookingSheet`, and `PaymentSheet` were reusing the same form component instance when switching between create/edit modes or different records, causing prop changes to uncontrolled fields.

### 14.2 Fixes Applied
| File | Change |
|------|--------|
| `services/service-sheet.tsx` | Added `key={service?.id ?? 'new-service'}` to `ServiceForm` |
| `forms/service-form.tsx` | Stable fallbacks: `name ?? ''`, `category ?? ''`, `durationMinutes ?? 30`, `price ?? 0` |
| `customers/customer-sheet.tsx` | Added `key={customer?.id ?? 'new-customer'}` to `CustomerForm` |
| `forms/customer-form.tsx` | Stable fallback: `name ?? ''` |
| `bookings/booking-sheet.tsx` | Added optional `bookingId` prop; `key={bookingId ?? 'new-booking'}` on `BookingForm` |
| `forms/booking-form.tsx` | Stable fallback: `start_time ?? ''` on time `Input` |
| `payments/payment-sheet.tsx` | Added `key={bookingId}` to `PaymentForm` |
| `app/(dashboard)/bookings/page.tsx` | Pass `bookingId={editingBooking?.id}` to edit `BookingSheet` |

### 14.3 Verification
| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Passes |
| `npm run build` | ✅ Succeeds |
| Add/Edit/Switch flows | ✅ No regressions |

**Phase 14 Progress: 100%**

---

## Phase 15: Public Booking Date Availability Fix ✅

### 15.1 Root Cause
`getTimeSlots` in `booking-wizard.tsx` treated an empty `operating_hours` object `{}` as "configured hours." When a business had `{}` in the database (default JSONB), the function entered the hours lookup branch, found `undefined` for every weekday, and returned `[]` — marking every date as "Closed on this day."

Additionally, `todayString()` used `toISOString()`, which returns UTC date. In timezones ahead of UTC, this could shift "today" to the previous day during early-morning hours.

### 15.2 Fixes Applied
| File | Change |
|------|--------|
| `public/booking-wizard.tsx` | `getTimeSlots`: added `Object.keys(operatingHours).length > 0` guard before treating `{}` as configured hours |
| `public/booking-wizard.tsx` | `todayString()`: switched from `toISOString()` to local-date getter (`getFullYear/getMonth/getDate`) |

### 15.3 Verification
| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Passes |
| `npm run build` | ✅ Succeeds |
| Empty `operating_hours {}` | ✅ Falls back to 9am–6pm default slots |
| Configured closed day | ✅ Still correctly shows "Closed on this day" |
| Configured open day | ✅ Shows correct slots |

**Phase 15 Progress: 100%**

---

## Phase 16: Onboarding Slug Bug Fix + Mobile Wizard Refactor ✅

### 16.1 Root Cause
The `setupBusiness` server action inserted a row into `businesses` without a `slug` value. Because the live database schema enforces `slug NOT NULL`, onboarding failed with:
`null value in column "slug" of relation "businesses" violates not-null constraint`.

The form and schema also lacked any slug field, so there was no way to provide one.

### 16.2 Fixes Applied
| File | Change |
|------|--------|
| `lib/slug.ts` | NEW — `generateSlug()` sanitizes strings; `generateUniqueSlug()` checks DB collisions and appends a numeric suffix |
| `app/actions/auth.ts` | `setupBusiness` now generates a unique slug server-side from business name (or optional user-provided slug) and includes it in the insert |
| `schemas/auth.ts` | Added optional `slug` to `businessSetupSchema` |
| `components/forms/business-setup-form.tsx` | Refactored from long scrolling form into 4-step mobile wizard with progress bar, per-step validation, and large touch-friendly buttons |
| `app/(dashboard)/onboarding/page.tsx` | Simplified wrapper for full-height mobile wizard layout |

### 16.3 Wizard Steps
1. **Business Basics** — name, auto-generated slug (editable), business type
2. **Contact Details** — phone, email
3. **Location & Hours** — address, operating hours editor
4. **Review & Create** — summary card + submit

### 16.4 Verification
| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Passes |
| `npm run build` | ✅ Succeeds |
| Onboarding submit | ✅ Inserts business with valid slug |
| Duplicate slug handling | ✅ Appends `-2`, `-3`, etc. automatically |
| Redirect after onboarding | ✅ Still routes to `/dashboard` |
| Mobile UX | ✅ One step per screen, minimal scrolling |

**Phase 16 Progress: 100%**

---

## Phase 17: Login Flow Redirect Fix + Smarter Error Messages ✅

### 17.1 Root Cause
The `login` server action was redirecting successful logins to `/onboarding` whenever the user had no business. This violated the product rule that login is only for existing users and onboarding is only for new account creation. The dashboard page also redirected authenticated users without a business to `/onboarding`.

Additionally, Supabase's generic "Invalid login credentials" error was shown for both unknown emails and wrong passwords, giving users no clear next step.

### 17.2 Fixes Applied
| File | Change |
|------|--------|
| `app/actions/auth.ts` | `login` now checks `profiles` via admin client before signing in. Returns typed `account_not_found` / `wrong_password` errors. Successful logins redirect directly to `/dashboard` with no onboarding fallback. |
| `components/forms/login-form.tsx` | Shows a "Create an account" CTA when `code === 'account_not_found'`. Maps `wrong_password` to a clear message. |
| `app/actions/business.ts` | `getCurrentBusiness` now falls back to `business_members` lookup so member (non-owner) logins resolve the correct business. |
| `app/(dashboard)/dashboard/page.tsx` | Removed redirect to `/onboarding`. Now shows a "No business found" empty state instead. |
| `app/(dashboard)/settings/page.tsx` | Updated "no business" copy to remove onboarding reference. |

### 17.3 Verification
| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Passes |
| `npm run build` | ✅ Succeeds |
| Unknown email login | ✅ Shows "Business account not found. Please register instead." + register CTA |
| Wrong password | ✅ Shows "Wrong password." |
| Successful login | ✅ Redirects directly to `/dashboard` |
| No onboarding redirect loop | ✅ Confirmed |
| Register → onboarding | ✅ Still works for new users |

**Phase 17 Progress: 100%**

---

## Next Steps (Pre-Production)

1. Apply DB migrations in order:
   - `migrations/20260416000001_public_site_settings.sql`
   - `migrations/20260416000002_service_public_fields.sql`
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and Vercel environment
3. Set `NEXT_PUBLIC_SITE_URL` for password reset redirects
4. Share `/book/[businessId]` link with customers (found in Settings or Dashboard)
5. Customize public site appearance from `/settings/public-site`
6. Control per-service public visibility at `/services/public`
7. Deploy to production (Vercel)

---

*Last Updated: 2026-04-16*
