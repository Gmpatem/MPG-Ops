# Known Issues: MPG Ops

## Purpose

This document tracks bugs, technical debt, workarounds, and limitations.

---

## Issue Format

| Field | Description |
|-------|-------------|
| **ID** | Unique issue identifier (ISS-XXX) |
| **Status** | Open / In Progress / Resolved / Won't Fix |
| **Severity** | Critical / High / Medium / Low |
| **Reported** | Date reported |
| **Description** | What the issue is |
| **Impact** | How it affects users/system |
| **Workaround** | Temporary solution if any |
| **Resolution** | How it was/will be fixed |

---

## Open Issues

### ISS-001: NEXT_PUBLIC_SITE_URL Required for Production Password Reset
**Status:** Open  
**Severity:** Medium  
**Reported:** 2026-04-14  
**Description:** The `forgotPassword` action uses `process.env.NEXT_PUBLIC_SITE_URL` to construct the email redirect URL. If this env var is not set in the Vercel deployment, the reset email will redirect to an empty base URL.  
**Impact:** Password reset emails will fail to redirect correctly in production.  
**Workaround:** Set `NEXT_PUBLIC_SITE_URL=https://your-production-domain.com` in Vercel environment variables.  
**Resolution:** Pending deployment configuration.

### ISS-002: No Booking Slot Conflict Detection in Public Flow
**Status:** Open
**Severity:** Low (MVP-safe)
**Reported:** 2026-04-14
**Description:** The public booking wizard shows all 30-minute time slots from operating hours without checking whether a slot is already booked. Two customers can independently book the same slot.
**Impact:** Owner may see overlapping bookings. They must manage conflicts manually.
**Workaround:** Owner cancels or reschedules one booking from the internal app.
**Resolution:** Post-MVP — implement slot availability query that excludes already-booked times.

---

## Resolved Issues

### ISS-003: DB Migrations / Type Alignment for Public Site + Service Presentation Features
**Status:** Resolved (2026-04-16)
**Severity:** Medium
**Reported:** 2026-04-16
**Description:** Two SQL migration files must be applied to the Supabase database before Phase 11/12 features are fully operational:
- `migrations/20260416000001_public_site_settings.sql` — adds `public_site_settings JSONB` to `businesses`
- `migrations/20260416000002_service_public_fields.sql` — adds 7 columns + 1 index to `services`
Additionally, the TypeScript types in the project did not include these new columns, requiring temporary `as any[]` casts.

**Resolution:** Migrations applied to the online DB. Hand-crafted `src/lib/supabase/database.types.ts` now matches the live schema, the `Database` generic is wired into all Supabase clients (`server.ts`, `client.ts`, `admin.ts`), and all temporary `as any[]` casts have been removed. Both `npx tsc --noEmit` and `npm run build` pass cleanly.

### ISS-004: Public Booking Wizard Shows "Closed on this day" for All Dates
**Status:** Resolved (2026-04-16)
**Severity:** High
**Reported:** 2026-04-16
**Description:** When a business had an empty `operating_hours` JSONB object (`{}`) in the database, the public booking wizard's `getTimeSlots` function treated `{}` as configured hours. Because no weekday keys existed inside `{}`, every day resolved to `undefined` and was marked closed, showing "Closed on this day" regardless of the selected date.

**Resolution:** Updated `getTimeSlots` in `src/components/public/booking-wizard.tsx` to check `Object.keys(operatingHours).length > 0` before using stored hours. Empty or missing hours now correctly fall back to default 9am–6pm slots. Also fixed `todayString()` to use local date getters instead of `toISOString()` to avoid UTC timezone skew.

### ISS-005: Onboarding Fails with `null value in column "slug"`
**Status:** Resolved (2026-04-16)
**Severity:** High
**Reported:** 2026-04-16
**Description:** The `setupBusiness` server action inserted a new business row without providing a `slug`. The live database schema requires `slug` to be non-null, causing onboarding to crash for every new user.

**Resolution:**
- Created `src/lib/slug.ts` with `generateSlug()` and `generateUniqueSlug()` utilities.
- Updated `setupBusiness` to auto-generate a URL-safe slug from the business name (or optional user-provided slug), check the database for collisions, and append a numeric suffix if needed.
- Refactored `BusinessSetupForm` into a 4-step mobile wizard with progress bar, per-step validation, and hidden inputs so the server action pattern is preserved.

### ISS-006: Login Redirected Successful Users to Onboarding
**Status:** Resolved (2026-04-16)
**Severity:** High
**Reported:** 2026-04-16
**Description:** The `login` server action and the dashboard page both redirected authenticated users to `/onboarding` when no business was found. This broke the product rule that login is only for existing users and onboarding is only for new account creation. Additionally, Supabase's generic "Invalid login credentials" error offered no guidance for unknown emails versus wrong passwords.

**Resolution:**
- `login` now queries `profiles` (via admin client) before attempting sign-in. It returns a typed `account_not_found` error with a register CTA when the email doesn't exist, and `wrong_password` when the password is incorrect.
- Successful logins redirect directly to `/dashboard` with no onboarding fallback.
- Removed the `/onboarding` redirect from `dashboard/page.tsx` and updated `settings/page.tsx` to no longer reference onboarding for logged-in users.
- Updated `getCurrentBusiness` to also check `business_members` so member (non-owner) accounts resolve correctly.

---

## Technical Debt

None at this time.

---

## Limitations

### MVP-001: Single Business Per Account
**Status:** By Design  
**Description:** Each user account can only have one business.

**Rationale:** Multi-business support is post-MVP. Single business keeps schema simple.

**Future:** Add multi-business support in Phase 2+.

---

### MVP-002: No Offline Support
**Status:** By Design  
**Description:** App requires internet connection.

**Rationale:** Supabase requires connectivity. Offline sync adds complexity.

**Future:** Consider service worker for basic offline functionality post-MVP.

---

### MVP-003: Email-Only Authentication
**Status:** By Design  
**Description:** Only email/password auth supported.

**Rationale:** Social auth adds complexity. Email is universal.

**Future:** Add Google OAuth if requested by users.

---

### MVP-004: No Receipts/Invoices
**Status:** By Design  
**Description:** Payment recording only, no printable receipts.

**Rationale:** Core problem is tracking, not invoicing.

**Future:** Add PDF receipt generation post-MVP.

---

### MVP-005: Password Reset
**Status:** Resolved (2026-04-14)  
**Description:** Self-service password reset flow implemented.

**Resolution:** Forgot Password page, auth/callback route, Reset Password page added. Requires `NEXT_PUBLIC_SITE_URL` in production.

---

### MVP-006: Services Page is Client Component
**Status:** By Design  
**Description:** Services page uses 'use client' for Sheet state management.

**Rationale:** Sheet component requires client-side state. Tradeoff for better UX.

**Impact:** Slightly more client-side JavaScript, but better interactivity.

---

### MVP-007: No Booking Conflict Detection
**Status:** By Design  
**Description:** System allows creating overlapping bookings.

**Rationale:** MVP focuses on core booking creation; conflict detection adds complexity.

**Impact:** Users must manually manage scheduling conflicts.

**Future:** Add availability checking and conflict warnings post-MVP.

---

### MVP-008: No Calendar Grid View
**Status:** By Design  
**Description:** Bookings displayed as list, not calendar grid.

**Rationale:** List view faster to implement, clearer on mobile, sufficient for MVP.

**Impact:** No visual overview of multiple days at once.

**Future:** Add week/month calendar view post-MVP.

---

### MVP-009: No Partial Payments
**Status:** By Design  
**Description:** System only supports full payment recording.

**Rationale:** Simplifies payment flow; most service businesses take full payment.

**Impact:** Cannot track deposits or partial payments.

**Future:** Add partial payment and balance tracking post-MVP.

---

### MVP-010: No Payment Editing/Refund
**Status:** By Design  
**Description:** Payments cannot be edited or refunded once recorded.

**Rationale:** Payment correction adds complexity; workaround is to record new payment.

**Impact:** Incorrect payments require manual adjustment or new entry.

**Future:** Add payment editing and refund functionality post-MVP.

---

### MVP-011: Single Currency (PHP)
**Status:** By Design  
**Description:** System uses Philippine Peso (₱) only.

**Rationale:** Initial target market uses PHP; multi-currency adds complexity.

**Impact:** Not suitable for businesses using other currencies.

**Future:** Add multi-currency support with exchange rates post-MVP.

---

## Watch List

Potential issues to monitor:

1. **Supabase Free Tier Limits**
   - Monitor database connections
   - Monitor auth users limit
   - Action: Upgrade if limits approached

2. **Vercel Cold Starts**
   - Monitor Server Action response times
   - Action: Optimize if > 500ms consistently

3. **Mobile Performance**
   - Monitor bundle size
   - Action: Code split if > 200KB initial

4. **Service Card Grid**
   - Currently uses simple grid
   - Monitor if many services (>20) need pagination

---

---

*Last Updated: 2026-04-16*
