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

---

## Pending Decisions

None at this time.

---

## Rejected Alternatives Archive

None at this time.

---

*Last Updated: 2026-04-13*
