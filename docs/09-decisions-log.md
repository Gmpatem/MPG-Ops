# Decisions Log: MPG Ops

## Purpose

This document records all significant technical and product decisions made during development.

---

## Decision Format

Each entry includes:
- **Date:** When decision was made
- **Context:** Why the decision was needed
- **Decision:** What was decided
- **Alternatives:** Options considered
- **Rationale:** Why this choice
- **Impact:** How it affects the project

---

## Decisions

### 2026-04-13: Project Initialization

#### DEC-001: Project Name
- **Date:** 2026-04-13
- **Context:** Need a name for the SaaS product
- **Decision:** Name the project "MPG Ops"
- **Alternatives:** SalonManager, BookEasy, ServiceFlow
- **Rationale:** Short, memorable, doesn't limit to specific business type
- **Impact:** All branding, documentation, and code references

#### DEC-002: Location
- **Date:** 2026-04-13
- **Context:** Need to choose installation directory
- **Decision:** Install at `E:	mpg-ops` (npm naming: `mpg-ops`)
- **Alternatives:** `E:	mpg Ops` (spaces rejected by npm)
- **Rationale:** npm naming conventions require URL-friendly names
- **Impact:** All file paths reference this location

#### DEC-003: Tech Stack Lock
- **Date:** 2026-04-13
- **Context:** Need to define stable technology foundation
- **Decision:** Lock to Next.js 16, React 19, TypeScript 5, Tailwind 4, Supabase, Zod
- **Alternatives:** Prisma + NextAuth, Firebase, tRPC
- **Rationale:** Modern stack, great DX, single vendor (Vercel + Supabase), type-safe
- **Impact:** All development uses these technologies exclusively

#### DEC-004: Single Codebase for All Business Types
- **Date:** 2026-04-13
- **Context:** Need to support salons, barbershops, and spas
- **Decision:** One codebase with `business_type` flag, not separate apps
- **Alternatives:** Three separate apps, plugin architecture
- **Rationale:** Maintainability, faster iteration, shared improvements
- **Impact:** Database schema, component design, all use conditional logic based on type

#### DEC-005: Mobile-First Design
- **Date:** 2026-04-13
- **Context:** Target users are business owners on their feet
- **Decision:** Design mobile-first, adapt for desktop
- **Alternatives:** Desktop-first, responsive only
- **Rationale:** Primary use case is mobile; desktop is secondary
- **Impact:** All UI/UX decisions prioritize mobile experience

#### DEC-006: App Router + Server Components
- **Date:** 2026-04-13
- **Context:** Next.js offers Pages Router and App Router
- **Decision:** Use App Router with Server Components as default
- **Alternatives:** Pages Router, Client Components default
- **Rationale:** Better performance, simpler data fetching, modern pattern
- **Impact:** All pages use App Router structure

#### DEC-007: Server Actions for Mutations
- **Date:** 2026-04-13
- **Context:** Need pattern for data mutations
- **Decision:** Use React Server Actions for all mutations
- **Alternatives:** API routes, tRPC, React Query mutations
- **Rationale:** Simpler code, less boilerplate, progressive enhancement
- **Impact:** All form submissions use Server Actions

#### DEC-008: No Additional State Management
- **Date:** 2026-04-13
- **Context:** Need to manage client-side state
- **Decision:** Use React built-in state only (useState, useReducer, Context if needed)
- **Alternatives:** Redux, Zustand, Jotai, Recoil
- **Rationale:** Server Components reduce need; keep it simple
- **Impact:** No additional state libraries in dependencies

#### DEC-009: shadcn/ui Component Library
- **Date:** 2026-04-13
- **Context:** Need consistent, accessible UI components
- **Decision:** Use shadcn/ui for all base components
- **Alternatives:** Material UI, Chakra, Ant Design, custom
- **Rationale:** Copy-paste customization, Tailwind-native, accessible
- **Impact:** All UI built on shadcn/ui foundation

#### DEC-010: MVP Scope Definition
- **Date:** 2026-04-13
- **Context:** Need to define what ships in first version
- **Decision:** Include only: Auth, Business Setup, Services, Customers, Bookings, Payments, Dashboard
- **Alternatives:** Include payroll, inventory, loyalty
- **Rationale:** Focus on core problem; avoid scope creep
- **Impact:** Feature requests outside this list are documented but not built

### 2026-04-13: Session 2 - Authentication & Business Setup

#### DEC-011: Supabase SSR Package
- **Date:** 2026-04-13
- **Context:** Need to handle authentication sessions
- **Decision:** Use `@supabase/ssr` package for cookie-based session management
- **Alternatives:** Client-side only auth, custom session handling
- **Rationale:** Official package, handles cookies securely, works with Next.js middleware
- **Impact:** All auth flows use this package

#### DEC-012: Route Groups for Auth/Dashboard
- **Date:** 2026-04-13
- **Context:** Need different layouts for auth vs dashboard pages
- **Decision:** Use Next.js route groups: `(auth)` and `(dashboard)`
- **Alternatives:** Single layout with conditional rendering, separate layouts in each page
- **Rationale:** Clean separation, different layouts without URL prefixes
- **Impact:** `/login` and `/dashboard` have different layouts naturally

#### DEC-013: Zod Schema Location
- **Date:** 2026-04-13
- **Context:** Need to organize validation schemas
- **Decision:** Place all Zod schemas in `src/schemas/` directory
- **Alternatives:** Co-locate with components, put in lib/
- **Rationale:** Centralized validation, easy to import, separates concerns
- **Impact:** `src/schemas/auth.ts` contains auth-related schemas

#### DEC-014: Server Actions Location
- **Date:** 2026-04-13
- **Context:** Need to organize Server Actions
- **Decision:** Place Server Actions in `src/app/actions/` directory
- **Alternatives:** Co-locate with pages, put in lib/actions/
- **Rationale:** Follows Next.js conventions, easy to find, can be imported anywhere
- **Impact:** `src/app/actions/auth.ts` contains auth actions

#### DEC-015: Onboarding Flow
- **Date:** 2026-04-13
- **Context:** New users need to set up business after registration
- **Decision:** Redirect to `/onboarding` after first login if no business exists
- **Alternatives:** Modal on dashboard, multi-step wizard
- **Rationale:** Simple, focused, ensures business setup before using app
- **Impact:** Login action checks for business and redirects accordingly

#### DEC-016: Form Components Pattern
- **Date:** 2026-04-13
- **Context:** Need consistent form handling
- **Decision:** Create dedicated form components in `src/components/forms/`
- **Alternatives:** Inline forms in pages, generic Form component
- **Rationale:** Reusable, separates UI from logic, consistent error handling
- **Impact:** `LoginForm`, `RegisterForm`, `BusinessSetupForm` components

#### DEC-017: Mobile Bottom Navigation
- **Date:** 2026-04-13
- **Context:** Need mobile-friendly navigation
- **Decision:** Use sticky bottom nav on mobile, hide on desktop
- **Alternatives:** Hamburger menu, sidebar on mobile
- **Rationale:** Easy thumb access, common mobile pattern, always visible
- **Impact:** Dashboard layout has bottom nav visible only on mobile (`md:hidden`)

#### DEC-018: Password Reset Post-MVP
- **Date:** 2026-04-13
- **Context:** Password reset feature requested
- **Decision:** Defer password reset to post-MVP
- **Alternatives:** Build now with Supabase
- **Rationale:** Not critical for MVP testing; Supabase makes it easy to add later
- **Impact:** No `/reset-password` page for now

### 2026-04-13: Phase 2 Completion - Business Members

#### DEC-019: Business Members Table
- **Date:** 2026-04-13
- **Context:** Need to track relationship between users and businesses
- **Decision:** Create `business_members` junction table with role field
- **Alternatives:** Only use owner_id on businesses table
- **Rationale:** Enables future multi-user support, cleaner separation of concerns
- **Impact:** New migration `002_business_members.sql`, updated `setupBusiness` action

#### DEC-020: Database Migration Strategy
- **Date:** 2026-04-13
- **Context:** Schema changes needed after initial setup
- **Decision:** Use numbered migration files (001_, 002_, etc.)
- **Alternatives:** Single schema file, ORM migrations
- **Rationale:** Clear history, easy to apply incrementally, works with Supabase SQL Editor
- **Impact:** `supabase/migrations/` directory with numbered files

### 2026-04-13: Phase 3 - Services UI Implementation

#### DEC-021: Service Schema with Category
- **Date:** 2026-04-13
- **Context:** UI specification requires category field for services
- **Decision:** Add `category` field to service schema and database
  - name: required string
  - category: optional string (Hair, Beard, Massage, Facial)
  - durationMinutes: positive integer
  - price: non-negative number
  - isActive: boolean
- **Alternatives:** Use description field for category
- **Rationale:** Category is a distinct concept from description; enables filtering/grouping
- **Impact:** New migration `003_services_category.sql`, updated schema

#### DEC-022: Sheet Component for Add/Edit
- **Date:** 2026-04-13
- **Context:** UI specification prefers Sheet (side panel) over Dialog
- **Decision:** Use shadcn Sheet component for add/edit service forms
  - Opens from the right side
  - Mobile-friendly overlay
  - Reusable for create and edit
- **Alternatives:** Dialog (modal), separate page
- **Rationale:** Side panel keeps context visible, better for mobile, modern UX
- **Impact:** `ServiceSheet` component in `src/components/services/`

#### DEC-023: Service Card Component Structure
- **Date:** 2026-04-13
- **Context:** UI specification defines exact card layout
- **Decision:** Create dedicated ServiceCard component with:
  - Top row: Name (left) + Status badge (right)
  - Second row: Category
  - Third row: Duration + Price
  - Bottom row: Edit button + Enable/Disable button
- **Alternatives:** Inline card code, table layout
- **Rationale:** Reusable component, consistent UI, easy to maintain
- **Impact:** `ServiceCard` component with exact layout as specified

#### DEC-024: Inline Form Validation
- **Date:** 2026-04-13
- **Context:** UI specification requires inline validation messages
- **Decision:** Implement client-side validation in ServiceForm
  - Service name is required
  - Duration must be greater than 0
  - Price cannot be negative
  - Show errors below each field
- **Alternatives:** Server-side only validation, alert popups
- **Rationale:** Immediate feedback, better UX, reduces server round-trips
- **Impact:** Validation logic in ServiceForm component

#### DEC-025: Client Component for Services Page
- **Date:** 2026-04-13
- **Context:** Sheet component requires state management
- **Decision:** Make Services page a client component with:
  - useState for sheet open/close
  - useState for editing service
  - Server actions for data mutations
- **Alternatives:** Keep as server component, use URL state
- **Rationale:** Sheet requires client-side state, simpler with client component
- **Impact:** `src/app/(dashboard)/services/page.tsx` is now 'use client'

### 2026-04-13: Phase 4 - Customers Module

#### DEC-026: Customer Schema Design
- **Date:** 2026-04-13
- **Context:** Need to define customer data structure
- **Decision:** Create customer schema with:
  - name: required string
  - phone: optional string
  - email: optional string (validated)
  - notes: optional string (long text)
- **Alternatives:** Separate contact info table, required phone field
- **Rationale:** Simple structure matches business owner workflow; only name is required
- **Impact:** `src/schemas/customer.ts`, `customers` table in database

#### DEC-027: Reuse Services UI Pattern for Customers
- **Date:** 2026-04-13
- **Context:** Customers module needs consistent UI
- **Decision:** Reuse exact same patterns as Services module:
  - Card layout with avatar icon
  - Sheet component for add/edit
  - Grid layout for list
  - Same empty state pattern
- **Alternatives:** Table layout, different interaction pattern
- **Rationale:** Consistency reduces cognitive load; Services pattern proven effective
- **Impact:** `src/components/customers/` mirrors `src/components/services/`

#### DEC-028: Customer Card Layout
- **Date:** 2026-04-13
- **Context:** Need to display customer information clearly
- **Decision:** Customer card shows:
  - Top row: Avatar icon + Name
  - Contact info: Phone and/or Email (if exists)
  - Fallback: "No contact information" when both empty
  - Single action: Edit button
- **Alternatives:** Show notes preview, action buttons for call/email
- **Rationale:** Clean, scannable layout; edit opens full details including notes
- **Impact:** `CustomerCard` component design

### 2026-04-13: Phase 5 - Bookings System

#### DEC-029: Booking Schema Design
- **Date:** 2026-04-13
- **Context:** Need to link customers and services with time slots
- **Decision:** Create booking schema with:
  - customer_id: required (links to customers)
  - service_id: required (links to services)
  - booking_date: required (date only)
  - start_time: required (time only)
  - end_time: auto-calculated from service.duration_minutes
  - status: enum (scheduled, completed, cancelled)
  - notes: optional
- **Alternatives:** Store duration instead of end_time, use timestamp
- **Rationale:** Separate date/time fields simpler for day-based queries; end_time auto-calculated for display
- **Impact:** `src/schemas/booking.ts`, `bookings` table in database

#### DEC-030: End Time Auto-Calculation
- **Date:** 2026-04-13
- **Context:** Bookings need start and end times
- **Decision:** Calculate end_time in server action based on service.duration_minutes
  - User selects start time
  - System adds service duration to get end time
  - Stored in database for quick retrieval
- **Alternatives:** Calculate on client only, store duration only
- **Rationale:** Pre-calculated end time simplifies display logic; single source of truth
- **Impact:** `createBooking` action in `src/app/actions/bookings.ts`

#### DEC-031: Simple List (Not Calendar) for MVP
- **Date:** 2026-04-13
- **Context:** Need to display bookings for a selected date
- **Decision:** Use simple chronological list instead of calendar grid
  - Date selector with prev/next navigation
  - Cards sorted by start_time
  - Each card shows time range, customer, service, status
- **Alternatives:** Full calendar grid, week view, drag-and-drop
- **Rationale:** List is faster to implement, clearer on mobile, sufficient for MVP
- **Impact:** `BookingsPage` uses list layout, not calendar

#### DEC-032: Status-Based Actions
- **Date:** 2026-04-13
- **Context:** Bookings need lifecycle management
- **Decision:** Three statuses with specific actions:
  - Scheduled: Can Mark Completed or Cancel
  - Completed: No actions (archived)
  - Cancelled: No actions (archived)
- **Alternatives:** Edit booking details, reschedule
- **Rationale:** Simple workflow covers 90% of use cases; reschedule = new booking
- **Impact:** `BookingCard` shows actions only for Scheduled status

### 2026-04-13: Phase 6 - Payments System

#### DEC-033: Payment Schema Design
- **Date:** 2026-04-13
- **Context:** Need to record payments for completed bookings
- **Decision:** Create payment schema with:
  - booking_id: required (links to bookings)
  - amount: required number
  - method: enum (cash, gcash, card, other)
  - status: always 'paid' for MVP
  - notes: optional
- **Alternatives:** Link to customer directly, include tax fields
- **Rationale:** Simple structure links payment to specific booking; method tracking for reporting
- **Impact:** `src/schemas/payment.ts`, `payments` table in database

#### DEC-034: Default Amount from Service Price
- **Date:** 2026-04-13
- **Context:** Payment form needs to pre-fill amount
- **Decision:** Default payment amount to service.price
  - User can override if needed
  - Reduces data entry friction
  - Common case is paying full service price
- **Alternatives:** Always require manual entry, store custom amount on booking
- **Rationale:** Faster payment recording; most customers pay the listed price
- **Impact:** `PaymentForm` receives defaultAmount prop from service price

#### DEC-035: Record Payment Button on Completed Bookings
- **Date:** 2026-04-13
- **Context:** Need UX flow for recording payments
- **Decision:** Show "Record Payment" button on completed bookings without payment
  - Green outline button for visibility
  - Opens payment sheet when clicked
  - Shows "Paid ₱XXX" for bookings with payment
- **Alternatives:** Auto-open payment sheet on mark completed, separate payments page only
- **Rationale:** Contextual action reduces clicks; immediate visual feedback of payment status
- **Impact:** `BookingCard` shows payment status and Record Payment button

#### DEC-036: Revenue Summary on Payments Page
- **Date:** 2026-04-13
- **Context:** Business owners need revenue visibility
- **Decision:** Show revenue summary cards on payments page:
  - Today: Revenue from today
  - This Week: Last 7 days
  - This Month: Last 30 days
  - Total Payments: All time count
- **Alternatives:** Simple list only, separate reports page
- **Rationale:** Quick revenue overview at a glance; no additional reporting needed for MVP
- **Impact:** `PaymentsPage` includes 4 summary cards above payment history

### 2026-04-13: Phase 7 - MVP Polish & Demo Prep

#### DEC-037: Client-Side Filtering for MVP
- **Date:** 2026-04-13
- **Context:** Need filters/search for services, customers, bookings, payments
- **Decision:** Implement client-side filtering using useMemo
  - Services: filter by active/inactive
  - Customers: search by name/phone
  - Bookings: filter by status
  - Payments: filter by date range
- **Alternatives:** Server-side filtering with query params, database-level filtering
- **Rationale:** Simpler implementation, sufficient for expected data volumes (hundreds, not thousands), no additional server actions needed
- **Impact:** Filter logic in page components using useMemo

#### DEC-038: Skeleton Loading Components
- **Date:** 2026-04-13
- **Context:** Need loading states for better UX
- **Decision:** Create reusable skeleton components
  - `Skeleton` in `src/components/ui/skeleton.tsx`
  - `LoadingPage` in `src/components/loading-page.tsx`
  - `ErrorState` in `src/components/error-state.tsx`
- **Alternatives:** Simple "Loading..." text, spinners
- **Rationale:** Skeletons provide better perceived performance, maintain layout structure, modern UX pattern
- **Impact:** Consistent loading experience across all pages

#### DEC-039: Dashboard Loading with Route Convention
- **Date:** 2026-04-13
- **Context:** Dashboard is Server Component, needs loading state
- **Decision:** Use Next.js `loading.tsx` convention
  - Create `src/app/(dashboard)/dashboard/loading.tsx`
  - Skeleton UI matches dashboard layout
- **Alternatives:** Suspense boundaries inline, client component with useState
- **Rationale:** Route-level loading is standard Next.js pattern, automatic handling
- **Impact:** `loading.tsx` provides instant feedback on navigation

#### DEC-040: Error States with Retry
- **Date:** 2026-04-13
- **Context:** Need to handle data loading failures gracefully
- **Decision:** Implement ErrorState component with retry functionality
  - Consistent error UI across pages
  - Retry button re-fetches data
  - Clear error messaging
- **Alternatives:** Toast notifications only, inline error text
- **Rationale:** Users need clear feedback and ability to recover from errors
- **Impact:** All list pages show ErrorState when data fetching fails

### 2026-04-13: Phase 7.5 - UX Feedback & Polish

#### DEC-041: Standardized Form Status Component
- **Date:** 2026-04-13
- **Context:** Forms need consistent success/error feedback display
- **Decision:** Create `FormStatus` component in `src/components/form-status.tsx`
  - Supports success and error variants
  - Includes appropriate icons (CheckCircle, AlertCircle)
  - Consistent styling with borders
  - Used across all forms
- **Alternatives:** Inline divs with conditional classes, Alert component
- **Rationale:** Consistent UX, reusable, easier to maintain, clearer visual feedback
- **Impact:** All forms now use FormStatus for submit-level messages

#### DEC-042: ButtonLoading Component
- **Date:** 2026-04-13
- **Context:** Need consistent button loading state with spinner
- **Decision:** Create `ButtonLoading` component in `src/components/ui/button-loading.tsx`
  - Wraps Button with loading state
  - Shows spinner and loading text
  - Prevents duplicate submits via disabled state
  - Maintains button dimensions during loading
- **Alternatives:** Manual spinner implementation in each button
- **Rationale:** Reusable, consistent UX, prevents code duplication
- **Impact:** Available for use across all forms (forms already have loading states)

#### DEC-043: Global Error Boundary
- **Date:** 2026-04-13
- **Context:** Need to catch and display errors gracefully at route level
- **Decision:** Create `error.tsx` in `src/app/(dashboard)/`
  - Catches errors in dashboard routes
  - Shows user-friendly error message
  - Includes retry and navigation options
  - Logs errors for monitoring
- **Alternatives:** Error handling in each page component
- **Rationale:** Next.js convention, catches unexpected errors, prevents app crashes
- **Impact:** All dashboard routes have error boundary protection

#### DEC-044: Global Not Found Page
- **Date:** 2026-04-13
- **Context:** Need 404 page for non-existent routes
- **Decision:** Create `not-found.tsx` in `src/app/`
  - Clean, centered design
  - Icon in muted circle
  - Navigation options (Home, Dashboard)
  - Consistent with empty state patterns
- **Alternatives:** Default Next.js 404, inline not-found handling
- **Rationale:** Professional appearance, helpful navigation options, consistent branding
- **Impact:** All unknown routes show branded 404 page

#### DEC-045: EmptyState Reusable Component
- **Date:** 2026-04-13
- **Context:** Empty states should be consistent across modules
- **Decision:** Create `EmptyState` component in `src/components/empty-state.tsx`
  - Accepts icon, title, description
  - Optional primary and secondary actions
  - Consistent styling with existing empty states
  - Mobile-friendly layout
- **Alternatives:** Keep inline empty states
- **Rationale:** Reusable, consistent, easier to maintain, flexible for future use
- **Impact:** Available for future use; existing empty states kept as-is (already consistent)

### 2026-04-13: Phase 9 - Internal Flow Completion (Phase 1)

#### DEC-046: Dashboard Today's Schedule
- **Date:** 2026-04-13
- **Context:** Dashboard only showed aggregate counts, not actual appointments
- **Decision:** Replace Business Information card with Today's Schedule section
  - Fetches today's bookings via `getBookingsByDate`
  - Shows time range, customer name, service, and status badge
  - Empty state with CTA when no bookings exist
- **Alternatives:** Keep Business Info card and add schedule below it
- **Rationale:** Schedule is the most important operational info for a business owner; Business Info is redundant with Settings page
- **Impact:** Dashboard now functions as a true daily operations hub

#### DEC-047: Minimal Custom Toast System
- **Date:** 2026-04-13
- **Context:** Sheets closed silently after success, giving users no confirmation
- **Decision:** Build a minimal custom toast system instead of installing a library
  - `ToastProvider` with React Context
  - Auto-dismisses after 3 seconds
  - Fixed position at bottom-center above mobile nav
  - No external dependencies
- **Alternatives:** Install sonner or react-hot-toast, use Alert banners
- **Rationale:** Smallest possible solution, no bundle bloat, fully controlled, matches existing patterns
- **Impact:** All CRUD success actions now show toast confirmation

#### DEC-048: Extract Mobile Bottom Nav to Client Component
- **Date:** 2026-04-13
- **Context:** Bottom nav had no active state because layout was a Server Component
- **Decision:** Extract bottom navigation into `MobileBottomNav` client component
  - Uses `usePathname()` for active route detection
  - Active item gets `text-primary` and small indicator dot
- **Alternatives:** Pass pathname from layout as prop, use CSS :active
- **Rationale:** `usePathname()` requires client component; clean separation keeps layout as server component
- **Impact:** Mobile navigation now clearly indicates current page

#### DEC-049: OperatingHoursEditor Serializes to Hidden JSON Field
- **Date:** 2026-04-14
- **Context:** Operating hours is a JSONB field; needed an ergonomic weekly editor
- **Decision:** Client component manages state per day; serializes full hours object to a hidden `operating_hours` input on each change
- **Alternatives:** Individual form fields per day/time; separate API call for hours
- **Rationale:** Hidden JSON field is the simplest approach that works with existing form action pattern and requires no schema changes
- **Impact:** Works in both onboarding and settings without duplicating logic

#### DEC-050: Dashboard Quick Actions Open Sheets Directly
- **Date:** 2026-04-14
- **Context:** Dashboard quick actions previously navigated to pages; slowed daily workflow
- **Decision:** `DashboardQuickActions` client component renders sheets directly from dashboard; fetches customers/services lazily only when booking sheet opens
- **Alternatives:** Pass data from server component; navigate to pages
- **Rationale:** Lazy fetch avoids unnecessary DB calls; sheets give faster UX without leaving the dashboard
- **Impact:** Dashboard page remains a server component; quick actions are usable without page navigation

#### DEC-051: Password Reset via Supabase PKCE with Auth Callback Route
- **Date:** 2026-04-14
- **Context:** No self-service password reset existed (MVP-005)
- **Decision:** Standard Supabase PKCE reset flow: `resetPasswordForEmail` → email link → `/auth/callback?code=` → `/reset-password` → `updateUser`
- **Alternatives:** Token-in-hash flow (older Supabase approach)
- **Rationale:** PKCE is the current Supabase recommended approach for SSR apps; callback route handles code exchange securely server-side
- **Impact:** Closes MVP-005; requires `NEXT_PUBLIC_SITE_URL` env var for production redirect

#### DEC-052: Public Flow Uses Business UUID in URL (No Slug Column)
- **Date:** 2026-04-14
- **Context:** Public booking route needs a stable business identifier in the URL
- **Decision:** Use the existing `businesses.id` (UUID) as the URL parameter — `/book/[businessId]`
- **Alternatives:** Add a `slug` TEXT column to businesses (requires DB migration + uniqueness handling)
- **Rationale:** UUID requires no schema change, is collision-free, and is sufficient for MVP. The booking URL is shared by the owner, not typed manually. Can be upgraded to a friendly slug post-MVP.
- **Impact:** Booking URLs look like `/book/abc123-...`. Owner copies the link from Settings.

#### DEC-053: Public Booking Bypasses RLS via Service Role Key (Server-Only)
- **Date:** 2026-04-14
- **Context:** Supabase RLS blocks all unauthenticated reads/writes. Public booking needs to read services and write customers/bookings without a user session.
- **Decision:** Create `src/lib/supabase/admin.ts` using `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). Use only in server actions inside `public-booking.ts`.
- **Alternatives:** Add public read/insert RLS policies in Supabase dashboard; use Supabase Edge Functions
- **Rationale:** Service role in server-only code is the standard Supabase recommendation for this pattern. Key is never exposed to the browser. Input is validated with Zod and business/service ownership is verified manually before any write.
- **Impact:** Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and Vercel env. Documented in `.env.example`.

#### DEC-054: Public Bookings Created with Status `scheduled`
- **Date:** 2026-04-14
- **Context:** Needed to decide whether public bookings go in as `scheduled` or `pending`
- **Decision:** Use `scheduled` — same as internally-created bookings
- **Alternatives:** Introduce `pending` status requiring owner approval
- **Rationale:** The booking_status enum already includes `scheduled`. Using it keeps the internal dashboard consistent — owner sees all bookings in one list without a separate approval workflow. MVP scope does not include owner approval flows. Can add `pending` + confirmation screen post-MVP if needed.
- **Impact:** Public bookings appear immediately in `/bookings` and dashboard schedule.

#### DEC-055: Time Slots Use Operating Hours with 30-Min Intervals
- **Date:** 2026-04-14
- **Context:** No booking-slot availability system exists; needed a simple MVP-safe time picker
- **Decision:** Generate 30-minute intervals from business operating_hours (if set), falling back to 9am–6pm. If the business is closed on the selected day, show a "Closed" message and prompt re-selection.
- **Alternatives:** True availability engine (checks existing bookings); Google Calendar-style slots
- **Rationale:** True availability requires conflict detection (out of scope per constraints). Fixed intervals are clear, predictable, and sufficient for MVP. Owner manually avoids double-booking.
- **Impact:** No slot conflict detection. Documented as ISS-002.

---

#### DEC-056: public_site_settings Stored as JSONB on businesses Table
- **Date:** 2026-04-16
- **Context:** Need to persist public booking site customization (headline, subtitle, instructions, accent color) without creating a new table.
- **Decision:** Add a single `public_site_settings JSONB DEFAULT '{}'` column to the existing `businesses` table. Required migration: `ALTER TABLE businesses ADD COLUMN public_site_settings JSONB DEFAULT '{}';`
- **Alternatives:** New `public_site_settings` table; store as multiple columns; use operating_hours field as a combined blob
- **Rationale:** JSONB matches the existing `operating_hours` pattern already used in `businesses`. Avoids a new table and JOIN for a small, optional feature. All fields are optional so `'{}'` is a valid default.
- **Impact:** Schema migration required before the customization feature is active. Code degrades gracefully (shows defaults) if the column is not yet added.

#### DEC-057: Accent Color Applied via Server-Rendered style Tag
- **Date:** 2026-04-16
- **Context:** Accent color theming for the public page must work at runtime (not at build time) since each business can choose a different color.
- **Decision:** Inject a `<style>` tag with `:root { --primary: ...; }` CSS variable overrides in the public booking Server Component. Color values come from a hardcoded safe map (5 options), not raw user input.
- **Alternatives:** Tailwind arbitrary values; CSS-in-JS; generating separate CSS files per accent
- **Rationale:** CSS variable override is the simplest runtime approach. No XSS risk since values are from a controlled constant map, never from user input directly. Works with the existing shadcn/ui token system.
- **Impact:** Accent color only applies to the public booking page (`/book/[businessId]`). Admin UI is unaffected.

#### DEC-058: Public Site Card Added to Dashboard (Not Just Settings)
- **Date:** 2026-04-16
- **Context:** Business owners need quick access to their public booking link without navigating to Settings every time.
- **Decision:** Added a "Your Public Booking Site" card directly on the main dashboard with copy link, open, and customize buttons.
- **Alternatives:** Settings-only access; a dedicated "Booking Site" nav item
- **Rationale:** The dashboard is the first screen owners see. Surfacing the booking link there makes it easy to share after each work session without extra navigation.
- **Impact:** Dashboard has one extra card. Does not affect any data fetching (businessId already available).

#### DEC-059: Per-Service Public Fields Stored as Columns (not JSONB)
- **Date:** 2026-04-16
- **Context:** Need to add per-service public presentation fields (show/hide, featured, public title, description, promo, display order).
- **Decision:** Add 7 individual columns to `services` rather than a JSONB blob, and add a partial index for the public listing query.
- **Alternatives:** Single `public_settings JSONB` column on services; a new `service_public_settings` join table
- **Rationale:** These columns are all directly filterable (especially `show_on_public_booking` and `is_featured`). SQL indexes on individual boolean/int columns are faster than GIN indexes on JSONB for this workload. The column count is low enough that this isn't a maintenance burden.
- **Impact:** Migration `20260416000002_service_public_fields.sql` must be applied. Partial index `idx_services_public_listing` covers the most common public query.

#### DEC-060: Supabase TypeScript Types Bypassed with `as any[]` for New Columns
- **Date:** 2026-04-16
- **Context:** The Supabase-generated TypeScript types in this project didn't include the new migration columns (`show_on_public_booking`, `public_title`, etc.) because they were added after initial setup.
- **Decision:** Cast `data` as `any[]` before `.map()` in the two server actions that query new columns (`public-booking.ts`, `public-services.ts`). All field values are cast individually to their correct types inside the map.
- **Alternatives:** Regenerate Supabase types (`supabase gen types typescript`); maintain a manual override types file
- **Rationale:** Type regeneration requires the Supabase CLI and a live DB connection. The `any[]` cast is contained to exactly the two map calls, and per-field type casts provide the same runtime safety as before. Regenerate types post-migration for a cleaner codebase.
- **Impact:** *Superseded by DEC-062*. This was a temporary workaround.

#### DEC-062: Hand-Crafted Supabase Database Types
- **Date:** 2026-04-16
- **Context:** The temporary `as any[]` casts needed a proper fix. Generating types via `supabase gen types` wasn't feasible in this environment, so a manual type source was required.
- **Decision:** Create `src/lib/supabase/database.types.ts` containing a complete, hand-crafted `Database` interface matching the live Supabase schema (including all tables, enums, and JSONB helpers). Wire the `Database` generic into `createClient`, `createServerClient`, and `createAdminClient`.
- **Alternatives:** Keep the `as any[]` workarounds; generate types via CLI; use `supabase-to-zod`
- **Rationale:** Manual types provide full end-to-end type safety with zero external dependencies. The file is a single source of truth that can be updated incrementally when schema changes. It eliminates all temporary casts and prevents stale local interfaces from drifting.
- **Impact:** All `as any[]` casts removed. `public-booking.ts`, `public-services.ts`, dashboard actions, settings page, services page, and payments all use generated types. `npx tsc --noEmit` and `npm run build` pass cleanly.

#### DEC-061: Per-Service Save (vs. Batch Save) on `/services/public`
- **Date:** 2026-04-16
- **Context:** Considered whether to have one "Save All" button or per-row save for the public service management page.
- **Decision:** Per-service save — each `ServicePublicCard` manages its own state and save call independently.
- **Alternatives:** Single form with one Save All button; optimistic batch update
- **Rationale:** Business owners are more likely to tweak one or two services at a time. Per-service save means no risk of accidentally clearing edits on another service. Simpler state management — no top-level shared form state.
- **Impact:** More granular UX. Each save shows inline feedback on only the relevant card.

#### DEC-063: Remount Keys for Sheet-Based Forms Using Base UI Uncontrolled Inputs
- **Date:** 2026-04-16
- **Context:** Base UI `Input` and `Switch` warned that "a component is changing the default value state of an uncontrolled FieldControl after being initialized." This happened because `ServiceSheet`, `CustomerSheet`, `BookingSheet`, and `PaymentSheet` reused the same form instance when switching create/edit modes or different records.
- **Decision:** Add a stable React `key` to each form component inside its Sheet wrapper (`key={record?.id ?? 'new'}`). Also ensure every `defaultValue` and `defaultChecked` receives a non-undefined fallback (`?? ''`, `?? 0`, `?? 30`).
- **Alternatives:** Convert all inputs to fully controlled (more state management); ignore the warning (would leave console noise and potential bugs)
- **Rationale:** Remounting is the minimal fix — it preserves the uncontrolled form pattern, requires no additional state, and aligns with React's reconciliation model. Stable fallbacks prevent `undefined` defaults during first render.
- **Impact:** Warning eliminated in Service, Customer, Booking, and Payment forms. No behavioral changes for users.

#### DEC-064: Empty `operating_hours` JSONB Treated as Unconfigured in Public Booking
- **Date:** 2026-04-16
- **Context:** Public booking wizard showed "Closed on this day" for every date when `businesses.operating_hours` was `{}` (the JSONB default). `getTimeSlots` checked `if (operatingHours)` which is truthy for `{}`, then `operatingHours[dayName]` was `undefined`, causing an early `return []`.
- **Decision:** Guard with `Object.keys(operatingHours).length > 0` before treating `operatingHours` as configured. If empty or null, fall back to default 9am–6pm slots. Also fix `todayString()` to use local date getters instead of `toISOString()` to avoid UTC timezone skew.
- **Alternatives:** Change DB default to `NULL`; require operating hours setup before public booking is enabled; normalize `{}` to `null` in the server action.
- **Rationale:** The DB default is `{}` and many businesses were created before operating hours were configurable. The client-side guard is the safest, least invasive fix — it preserves backward compatibility and doesn't require a migration.
- **Impact:** Public booking works immediately for businesses with empty `operating_hours`. Configured hours still respected exactly as before.

#### DEC-065: Auto-Generate Business Slug Server-Side with Collision Handling
- **Date:** 2026-04-16
- **Context:** Onboarding failed because `businesses.slug` is NOT NULL in the live DB, but `setupBusiness` never inserted a slug. The form also had no slug field.
- **Decision:** Create `lib/slug.ts` with `generateSlug()` and `generateUniqueSlug()`. In `setupBusiness`, derive the slug from the business name (or an optional user-provided slug), query the DB for collisions, and append a numeric suffix (`-2`, `-3`, etc.) until unique. Include the slug in the `businesses` insert.
- **Alternatives:** Make `slug` nullable in the database; require users to manually type a slug; generate slug client-side only.
- **Rationale:** Server-side generation guarantees a valid slug regardless of client behavior. Collision handling prevents insert failures from duplicate names. Optional user override gives flexibility without adding friction.
- **Impact:** Onboarding now succeeds for all new businesses. Slug is guaranteed non-empty and URL-safe.

#### DEC-066: Onboarding Form Refactored into Step Wizard for Mobile
- **Date:** 2026-04-16
- **Context:** The onboarding form was a single long page with many fields, causing excessive vertical scrolling on phones.
- **Decision:** Convert `BusinessSetupForm` into a 4-step wizard (Business Basics → Contact → Location/Hours → Review). Each step has a progress bar, per-step validation, large touch targets, and hidden inputs so the existing server action pattern is preserved.
- **Alternatives:** Keep single-page form with sticky submit button; use a multi-page route approach; install a form-wizard library.
- **Rationale:** Breaking the form into steps dramatically improves mobile completion rates without adding dependencies or changing server-side logic. Hidden inputs keep the uncontrolled server-action pattern intact.
- **Impact:** Onboarding is now mobile-first, easier to complete, and visually aligned with the public booking wizard.

#### DEC-067: Login is for Existing Users Only — Remove Onboarding Redirect
- **Date:** 2026-04-16
- **Context:** The `login` action redirected successful logins to `/onboarding` when no business existed. This violated the product rule that login is only for existing users and onboarding is only for new account creation. The dashboard also redirected authenticated users without a business to onboarding.
- **Decision:** 
  1. Update `login` to query `profiles` via the admin client before signing in. Return a typed `account_not_found` error (with register CTA) if the profile doesn't exist, or `wrong_password` if sign-in fails.
  2. Redirect successful logins directly to `/dashboard` with no onboarding fallback.
  3. Remove the `/onboarding` redirect from `dashboard/page.tsx` and replace it with an empty state.
  4. Update `getCurrentBusiness` to also check `business_members` so member logins resolve correctly.
- **Alternatives:** Keep onboarding as a fallback for all logged-in users without a business; use Supabase auth error messages directly in UI.
- **Rationale:** Enforcing the product boundary between login (existing users) and registration/onboarding (new users) eliminates confusion and redirect loops. Pre-login profile lookup lets us provide actionable, friendly error messages without breaking Supabase's secure auth flow.
- **Impact:** Existing users always land on the dashboard after login. New users are guided to register when their email isn't found. No more onboarding redirect loops.

#### DEC-068: Mobile-First UI Polish — Stats Grid, Space Tightening, and Service Toggle
- **Date:** 2026-04-16
- **Context:** A mobile UX review found small but noticeable rough edges: home page containers felt left-indented, dashboard stats wasted vertical space with a single-column mobile layout, and service cards used text buttons for enable/disable instead of a direct toggle.
- **Decision:** 
  1. Add `mx-auto` to `container` classes across the landing page and dashboard layout to fix centering.
  2. Tighten mobile padding and gaps on the dashboard; switch stats grid to 2 columns on mobile (`grid-cols-2`) expanding to 4 on desktop.
  3. Replace the service card's Enable/Disable text button with a `Switch` in the card header for immediate, intuitive status changes.
  4. Keep the Edit button as a compact outline action for detail edits.
- **Alternatives:** Full redesign of dashboard/services; keep current layouts and accept scrolling; use a dropdown menu for service actions.
- **Rationale:** These are targeted, low-risk improvements that maximize screen real estate and reduce friction without changing the established design language. The Switch pattern is faster than a text button and communicates state instantly.
- **Impact:** Better mobile space usage, cleaner alignment, and faster service management.

---

## Pending Decisions

None at this time.

---

## Rejected Alternatives Archive

None at this time.

---

### 2026-04-16: Bookings & Customers Workspace Refinement

#### DEC-013: Booking rows instead of individual cards
- **Date:** 2026-04-16
- **Context:** Each booking was rendered as a standalone Card with excessive padding and multi-icon rows, making the list feel heavy and showing fewer bookings per screen.
- **Decision:** Remove the Card wrapper from BookingCard; render each booking as a compact `div` row. Wrap all rows in a single parent `bg-card rounded-xl border` container in BookingList with `border-t` dividers between rows.
- **Alternatives:** Keep cards, reduce padding only
- **Rationale:** Divider-row pattern is the standard workspace pattern for dense, scannable lists. Saves ~40% vertical height per booking without losing any information.
- **Impact:** More bookings visible without scrolling; cleaner visual hierarchy.

#### DEC-014: Customer workspace table layout
- **Date:** 2026-04-16
- **Context:** Customers were displayed in a 3-column card grid. As the list grows this becomes slow to scan and wastes space with repeated visual chrome per card.
- **Decision:** Replace grid-of-cards with a single parent card containing divider rows. Add a column header row (Name / Contact) visible on desktop. Each row uses a responsive grid: stacked on mobile, side-by-side on sm+.
- **Alternatives:** Full HTML `<table>` element; keep card grid
- **Rationale:** Div-based workspace pattern is more flexible for responsive behavior than a semantic table and avoids the "ugly spreadsheet" feel. Column headers on desktop give structure without rigidity.
- **Impact:** Faster scanning at scale; user stays in workspace; View/Edit open existing sheets.

#### DEC-015: Preserve locked booking controls
- **Date:** 2026-04-16
- **Context:** Date navigation card and status filter/count row were already working well.
- **Decision:** Zero changes to those elements. All refinements confined to BookingCard and BookingList components only.
- **Rationale:** Incremental targeted change; avoids regression risk on controls users already understand.
- **Impact:** None — preserved exactly.

*Last Updated: 2026-04-16*
