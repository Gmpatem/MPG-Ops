# UI Redesign Prompt: MPG Ops
## "Warm Charcoal + Amber" — Complete Design System Implementation

---

## 1. What You Are Building

**MPG Ops** is a mobile-first SaaS platform for service businesses: hair salons, barbershops, and spas. It has two distinct surfaces:

| Surface | Audience | Goal |
|---------|----------|------|
| **Internal dashboard** (`/dashboard`, `/bookings`, `/customers`, `/services`, `/payments`, `/settings`) | Business owner on mobile/desktop | Fast, dense, scannable data management |
| **Public booking page** (`/book/[businessId]`) | End customer on mobile | Clean, premium, zero-friction appointment booking |

The tech stack is **locked** — do not suggest changes to it:
- **Next.js 16.2.3** App Router (React Server Components + `'use client'` where needed)
- **React 19**, **TypeScript** (strict mode — no `any`, no type suppressions)
- **Tailwind CSS v4** — `@theme` blocks in `globals.css`, no `tailwind.config.ts`
- **shadcn/ui** style `base-nova` on top of **Base UI React** (`@base-ui/react`) primitives
- **Lucide React** for all icons
- **Geist** (sans) + **Geist Mono** as the only fonts, loaded via `next/font/google`
- **Supabase** for all data (server actions only — no client-side Supabase calls)
- OKLCH color space for all color values

---

## 2. The Design System to Apply

### 2.1 Color Tokens — paste this into `src/app/globals.css`, replacing `:root` and `.dark`

```css
:root {
  --background:         oklch(0.99  0.003  85);
  --foreground:         oklch(0.13  0.012  50);
  --card:               oklch(1     0      0);
  --card-foreground:    oklch(0.13  0.012  50);
  --popover:            oklch(1     0      0);
  --popover-foreground: oklch(0.13  0.012  50);

  --primary:            oklch(0.18  0.015  50);
  --primary-foreground: oklch(0.99  0.003  85);

  --secondary:            oklch(0.95  0.006  80);
  --secondary-foreground: oklch(0.18  0.015  50);

  --muted:            oklch(0.96  0.004  80);
  --muted-foreground: oklch(0.50  0.010  55);

  --accent:            oklch(0.74  0.14   78);
  --accent-foreground: oklch(0.13  0.012  50);

  --destructive: oklch(0.58  0.245  27.3);
  --border:      oklch(0.90  0.005  80);
  --input:       oklch(0.90  0.005  80);
  --ring:        oklch(0.74  0.14   78);

  --chart-1: oklch(0.74  0.14  78);
  --chart-2: oklch(0.60  0.10  75);
  --chart-3: oklch(0.45  0.06  60);
  --chart-4: oklch(0.35  0.03  55);
  --chart-5: oklch(0.25  0.01  50);

  --radius: 0.625rem;

  --sidebar:                    oklch(0.97  0.004  80);
  --sidebar-foreground:         oklch(0.13  0.012  50);
  --sidebar-primary:            oklch(0.18  0.015  50);
  --sidebar-primary-foreground: oklch(0.99  0.003  85);
  --sidebar-accent:             oklch(0.74  0.14   78);
  --sidebar-accent-foreground:  oklch(0.13  0.012  50);
  --sidebar-border:             oklch(0.90  0.005  80);
  --sidebar-ring:               oklch(0.74  0.14   78);
}

.dark {
  --background:         oklch(0.14  0.008  50);
  --foreground:         oklch(0.97  0.003  85);
  --card:               oklch(0.19  0.010  50);
  --card-foreground:    oklch(0.97  0.003  85);
  --popover:            oklch(0.19  0.010  50);
  --popover-foreground: oklch(0.97  0.003  85);

  --primary:            oklch(0.74  0.14   78);
  --primary-foreground: oklch(0.14  0.008  50);

  --secondary:            oklch(0.24  0.010  50);
  --secondary-foreground: oklch(0.97  0.003  85);

  --muted:            oklch(0.24  0.010  50);
  --muted-foreground: oklch(0.63  0.008  55);

  --accent:            oklch(0.74  0.14   78);
  --accent-foreground: oklch(0.14  0.008  50);

  --destructive: oklch(0.70  0.19   22.2);
  --border:      oklch(1     0      0  / 10%);
  --input:       oklch(1     0      0  / 15%);
  --ring:        oklch(0.74  0.14   78);

  --chart-1: oklch(0.74  0.14  78);
  --chart-2: oklch(0.60  0.10  75);
  --chart-3: oklch(0.45  0.06  60);
  --chart-4: oklch(0.35  0.03  55);
  --chart-5: oklch(0.25  0.01  50);

  --sidebar:                    oklch(0.19  0.010  50);
  --sidebar-foreground:         oklch(0.97  0.003  85);
  --sidebar-primary:            oklch(0.74  0.14   78);
  --sidebar-primary-foreground: oklch(0.14  0.008  50);
  --sidebar-accent:             oklch(0.74  0.14   78);
  --sidebar-accent-foreground:  oklch(0.14  0.008  50);
  --sidebar-border:             oklch(1     0      0  / 10%);
  --sidebar-ring:               oklch(0.74  0.14   78);
}
```

### 2.2 Typography — Three Levels Only

Never invent new type levels. Every text element must belong to one of these three:

| Level | Classes | Use for |
|-------|---------|---------|
| **Title** | `text-base font-semibold tracking-tight` | Page headings, card titles, section labels |
| **Body** | `text-sm` | Row content, descriptions, form values |
| **Meta** | `text-xs text-muted-foreground` | Timestamps, counts, sub-labels, column headers |

For uppercase labels (column headers, status chips, step indicators):
```
text-xs font-medium uppercase tracking-widest text-muted-foreground
```

Font is always Geist (inherited via `font-sans`). Do not set `font-family` manually anywhere.

### 2.3 Spacing & Density

The app is **mobile-first and data-dense**. Default to tight spacing — scale up only when whitespace actively helps comprehension.

| Context | Padding/Gap |
|---------|-------------|
| Page outer wrapper | `px-4 sm:px-6` |
| Card internal padding | `p-4` |
| Compact row (booking/customer) | `px-4 py-3` |
| Form field spacing | `space-y-4` for groups, `space-y-2` for label+input |
| Section gap | `space-y-4 sm:space-y-6` |
| Inline icon gap | `gap-1.5` or `gap-2` |

### 2.4 Radius

Use the pre-defined scale — do not use arbitrary `rounded-[Xpx]` values:
- Interactive elements (buttons, inputs, badges): `rounded-lg`
- Cards, sheets, modals: `rounded-xl`
- Avatars, pills: `rounded-full`
- Small chips/tags: `rounded-md`

### 2.5 The Amber Accent — Rules

Amber (`--accent` / `--ring`) is the **only** non-neutral color used for interactive UI chrome. Use it for:
- Primary CTA buttons (`bg-primary` in light mode = charcoal; `bg-primary` in dark mode = amber — automatic)
- Focus rings (automatic via `--ring`)
- Active nav states
- Featured/highlighted elements
- The "Book Now" CTA on the public booking page

Do **not** use amber for status indicators. Status colors use semantic green/yellow/red:
- Scheduled: `text-blue-600 bg-blue-50` (or `dark:bg-blue-950/40`)
- Completed: `text-green-600 bg-green-50`
- Cancelled: `text-red-500 bg-red-50`
- No-show: `text-orange-500 bg-orange-50`
- Paid: `text-emerald-600 bg-emerald-50`

### 2.6 Elevation Model

Three layers only:

| Layer | Treatment |
|-------|-----------|
| Page background | `bg-background` |
| Cards / containers | `bg-card ring-1 ring-foreground/8 rounded-xl` |
| Sheets / dialogs | `bg-card` with `shadow-lg` (handled by sheet/dialog primitives) |

No box shadows on cards — use `ring-1` instead for a crisp, flat look. Shadows reserved for floating elements only (sheets, tooltips, dropdowns).

---

## 3. Component Conventions

### Buttons

Three sizes used in the app:

| Size | Classes | Use |
|------|---------|-----|
| Default | `h-9 px-4 text-sm` | Primary page actions |
| Small | `h-8 px-3 text-xs` | Inline row actions (Edit, View) |
| Large | `h-11 px-6 text-sm` | CTA in public booking page only |

Never use `text-gray-*` or `text-slate-*` directly — always use semantic tokens (`text-muted-foreground`, `text-foreground`, etc.).

The primary button uses `bg-primary text-primary-foreground`. In light mode this renders as dark charcoal with white text. In dark mode it becomes amber with dark text — handled automatically by the token system.

### Lists / Workspace rows

All list pages (bookings, customers, payments, services) use the **parent-card + divider-row** pattern — not a grid of individual cards:

```tsx
// Parent container
<div className="bg-card rounded-xl ring-1 ring-foreground/8 overflow-hidden">
  {/* Column header — desktop only */}
  <div className="hidden sm:flex px-4 py-2 border-b text-xs font-medium uppercase tracking-widest text-muted-foreground">
    ...
  </div>
  {/* Rows */}
  {items.map((item, i) => (
    <div key={item.id} className={cn("px-4 py-3", i > 0 && "border-t")}>
      ...
    </div>
  ))}
</div>
```

### Status Badges

Always use the `<Badge>` component with explicit color classes, not variant props for status. Pattern:

```tsx
<Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400">
  Completed
</Badge>
```

### Empty States

Every data-driven page must have an empty state. Pattern:

```tsx
<div className="flex flex-col items-center gap-3 py-16 text-center">
  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
    <Icon className="w-5 h-5 text-muted-foreground" />
  </div>
  <div>
    <p className="text-sm font-medium">No items yet</p>
    <p className="text-xs text-muted-foreground mt-1">Description of what to do next</p>
  </div>
  <Button size="sm">Primary action</Button>
</div>
```

### Loading States

Use `<Skeleton>` components that mirror the shape of the real content. Never show a blank page or spinner alone.

### Form Inputs

All inputs use `h-9` (not `h-8` or `h-12` except login page which uses `h-11` for large mobile targets). Labels are always `text-sm font-medium`.

---

## 4. Page-by-Page Reference

### 4.1 Marketing Landing (`/`)

**Purpose:** Convert visitors to sign-ups or direct them to log in.

**Must have:**
- Hero: headline + sub + two CTAs (Get Started → /register, Sign In → /login)
- Features section: 3–4 key benefits with icons
- Pricing section (if applicable)
- No nav after sign-in; separate auth header

**Tone:** Confident, premium, brief. Target audience is a small business owner. Not a developer.

---

### 4.2 Auth Pages (`/login`, `/register`, `/forgot-password`, `/reset-password`)

**Purpose:** Frictionless access.

**Layout:** Centered single card, max-width ~400px, vertically centered on page.

**Rules:**
- Login button shows `<Loader2 className="w-4 h-4 animate-spin" />` + "Signing in…" during submission
- All inputs use `h-11` for large tap targets on mobile
- Error messages appear inline below the form using `<FormStatus>` component
- No navigation elements — standalone pages

---

### 4.3 Onboarding (`/onboarding`)

**Purpose:** First-run business setup as a 4-step wizard.

**Steps:**
1. Business Basics (name, type, slug)
2. Contact Details (phone, email)
3. Location & Hours (address, operating hours editor)
4. Review & Create

**Rules:**
- Step indicator at top (1 / 2 / 3 / 4 — dots or numbers, no text labels on mobile)
- One step visible at a time — no scrolling between steps
- Back/Next at bottom — Next only if current step is valid
- Mobile full-width layout; max-width ~480px on desktop, centered

---

### 4.4 Dashboard (`/dashboard`)

**Purpose:** Daily overview for the business owner. Most-used page on mobile.

**Sections (top to bottom):**
1. Sticky header — business name, avatar, notifications icon
2. Stats grid — Today's bookings, Revenue, Customers, Pending (2-col mobile / 4-col desktop)
3. Today's Schedule — next 3–5 bookings as compact rows with time, customer, service, status
4. Quick Actions — Add Booking, Add Customer, Add Service (opens sheets, no navigation)
5. Public Site card — copy booking URL, customize link

**Rules:**
- Stats cards: `text-2xl font-bold` for the number, `text-xs text-muted-foreground` for the label
- Schedule rows: same compact pattern as booking-list rows
- Quick action buttons: icon + label, 2-col grid on mobile

---

### 4.5 Bookings (`/bookings`)

**Purpose:** Manage all appointments.

**Layout (top to bottom):**
1. Date navigation card — locked, do not modify
2. Status filter row (All / Scheduled / Completed / Cancelled / No-show) + count — locked
3. Booking list using parent-card + divider-row pattern

**Each booking row contains:**
- Row 1: Time (HH:MM) + Customer · Service (Xmin) + Status badge + Edit icon
- Row 2 (if paid/completed): CheckCircle + amount paid in `text-xs text-muted-foreground`
- Actions: Edit button (h-8 text-xs), Cancel/Complete inline

**Locked:** Date nav card and filter row. Never touch these.

---

### 4.6 Customers (`/customers`)

**Purpose:** Contact list and history.

**Layout:**
1. Search bar + "Add Customer" button row
2. Customer workspace table (parent-card + divider-row)

**Each customer row:**
- Initial-letter avatar (w-8 h-8 rounded-full bg-primary/10)
- Name (font-medium) + phone + email (responsive grid: stacked mobile / 2-col sm+)
- View / Edit action buttons (h-8 text-xs)

View opens `<CustomerDetailSheet>` — bookings history + payment history.
Edit opens `<CustomerSheet>` — edit form.

---

### 4.7 Services (`/services`)

**Purpose:** Manage all offered services.

**Layout:**
1. Header: "Services" title + "Public Settings" button (Globe icon) + "Add Service" button
2. Active services list
3. Inactive services list (collapsible or separate section)

**Each service card:**
- Name + category badge + duration + price
- Switch toggle for active/inactive in card header
- Edit button (outline, compact)

---

### 4.8 Public Services Management (`/services/public`)

**Purpose:** Configure how services appear on the public booking page.

**Per-service controls:**
- Show on public booking toggle
- Public title input
- Public description textarea
- Promo badge input (e.g. "Popular")
- Promo text input
- Display order number
- Is featured toggle
- Per-service Save button with inline FormStatus

---

### 4.9 Payments (`/payments`)

**Purpose:** Record and view payments against bookings.

**Layout:** Parent-card + divider-row list.

**Each payment row:**
- Customer name + service + date
- Amount (bold) + method badge (Cash / Card / Mobile Money)
- Status badge (Paid / Pending)

---

### 4.10 Settings (`/settings`)

**Purpose:** Business configuration.

**Sections:**
- Business details (name, phone, email, address)
- Operating hours editor (day toggles + open/close time inputs)
- Booking link card (copy URL, open link, Customize link)
- Password change

---

### 4.11 Public Site Settings (`/settings/public-site`)

**Purpose:** Customize public booking page appearance.

**Controls:**
- Headline input (character count)
- Subtitle textarea (character count)
- Instructions textarea (shown as notice on booking page)
- Accent color swatch picker (5 options: default / blue / green / purple / rose)

---

### 4.12 Public Booking Page (`/book/[businessId]`)

**Purpose:** Customer-facing appointment booking. Zero-friction, zero account required.

**Structure (6 steps):**

| Step | Name | Description |
|------|------|-------------|
| 0 (Landing) | Service First | Featured service (cycling, 4s) + 2-col service grid + trust chips + next available slot |
| 1 | Choose Service | Full service cards with public title, description, promo badge, price, duration |
| 2 | Choose Date | Native date input, min = today |
| 3 | Choose Time | 30-min slots from operating hours, "Closed" state if no hours |
| 4 | Your Details | Name*, phone*, email, notes — autofilled from localStorage `mpg_guest` |
| 5 | Review | Full summary — service, date, time, customer, price — Confirm button |

**Landing page components:**
- `FeaturedServiceCard`: full-width, `border-2 border-accent/30 bg-accent/5`, Star icon, `h-11` "Book Now" (amber CTA)
- `GridServiceCard`: compact 2-column, name + price + duration, `h-9` outline Book button
- Trust chips: `["No account required", "Instant booking", "Free to book"]` — horizontal scroll row
- Next slot: `"Next available: Today · 3:30 PM"` computed client-side from operating hours

**Rules:**
- Mobile-first: max-width 480px, `mx-auto`, horizontal padding `px-4`
- Progress indicator at top showing current step
- Back button on all steps except landing
- No authentication required anywhere in this flow
- Guest autofill via localStorage key `mpg_guest` (`{name, phone, email}`)
- Write back to localStorage on successful booking
- SSR-safe: all localStorage + Date operations inside `useEffect` only

---

### 4.13 Platform Admin (`/platform`)

**Purpose:** Master admin area for the SaaS operator. Gated by `profiles.is_platform_admin = true`.

**Sub-pages:** `/platform/businesses`, `/platform/users`, `/platform/plans`, `/platform/metrics`, `/platform/feature-flags`

**Layout:** Separate nav from dashboard nav (`<PlatformNav>`). Clean table-based list views. No mobile optimization required — admin tool.

---

## 5. Global Layout Rules

### Bottom Navigation (mobile)

The `<MobileBottomNav>` is shown on all dashboard pages. Five items:
Dashboard / Bookings / Customers / Services / Payments

Rules:
- Active item uses `text-primary` (amber in dark mode, charcoal in light)
- Inactive items use `text-muted-foreground`
- Icon + label stacked, centered
- `h-16` fixed bottom bar, `z-50`, `bg-background/95 backdrop-blur border-t`

### Dashboard Header (sticky)

`<DashboardHeader>` — sticky top, `z-50`, `bg-background/95 backdrop-blur border-b`.

Contains: business name (left) + avatar/icon (right).

### Navigation Progress Bar

`<NavigationProgress>` — h-0.5 fixed bar at z-9999. Fires on every route change. Amber colored (`bg-primary`). Already implemented via `@keyframes nav-progress`.

### Page Wrapper Pattern

Every dashboard page uses this outer wrapper:

```tsx
<div className="flex flex-col min-h-screen pb-20">          {/* pb-20 clears bottom nav */}
  <DashboardHeader />
  <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto w-full">
    {/* page content */}
  </main>
  <MobileBottomNav />
</div>
```

---

## 6. Absolute Rules — Never Violate These

1. **No arbitrary color values** — only semantic tokens (`text-foreground`, `bg-muted`, `border-border`, etc.) or status-specific semantic classes (`text-green-600`, `bg-red-50`)
2. **No `text-gray-*` or `text-slate-*`** — these bypass the token system and break dark mode
3. **No inline styles** except for dynamic data (e.g. `style={{ width: \`${pct}%\` }}`)
4. **No new npm packages** without explicit approval
5. **No `any` types** in TypeScript — use proper interfaces or `unknown`
6. **No client-side Supabase imports** — all DB work goes through server actions in `src/app/actions/`
7. **No fake data** — never hardcode stats, counts, or reviews that aren't from the real database
8. **localStorage and `new Date()`** must only be called inside `useEffect` — never at module or render scope (SSR safety)
9. **`'use client'`** only on components that actually need browser APIs or event handlers. Server components by default.
10. **Sheets stay sheets** — all edit/create forms open in `<Sheet>` side panels. No navigation to a separate edit page.

---

## 7. File Structure Reference

```
src/
  app/
    (auth)/           login, register, forgot-password, reset-password
    (dashboard)/      dashboard, bookings, customers, services, payments, settings
    book/[businessId] public booking + success
    platform/         master admin area
    globals.css       ← THE design system lives here
    layout.tsx        ← Geist fonts, NavigationProgress, ToastProvider
  components/
    ui/               shadcn/base-ui primitives (Button, Input, Card, Badge, etc.)
    bookings/         BookingCard, BookingList, BookingSheet, booking-status-badge
    customers/        CustomerCard, CustomerList, CustomerSheet, CustomerDetailSheet
    services/         ServiceCard, ServiceList, ServiceSheet, service-status-badge
    payments/         PaymentCard, PaymentList, PaymentSheet
    forms/            All form components (login, register, booking, customer, service, payment)
    public/           booking-wizard.tsx (entire public booking flow)
    dashboard/        DashboardHeader, DashboardQuickActions, PublicSiteCard
    platform/         PlatformNav
    navigation-progress.tsx
    mobile-bottom-nav.tsx
    operating-hours-editor.tsx
    form-status.tsx
    empty-state.tsx
    error-state.tsx
    loading-page.tsx
  app/actions/        Server actions (auth, bookings, customers, services, payments, public-booking)
  lib/
    supabase/         client.ts, server.ts, admin.ts, database.types.ts
    utils.ts          cn() helper
```

---

## 8. How to Approach Any UI Task

### Step 1 — Read before writing
Always read the target component file before editing. Understand what already exists.

### Step 2 — Token-first
Before picking a color, ask: "does a semantic token cover this?" Check: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-primary`, `bg-accent`, `text-accent-foreground`.

### Step 3 — Three type levels
Every piece of text is one of: Title / Body / Meta. Assign it accordingly.

### Step 4 — Responsive
Mobile first. Base classes = mobile. `sm:` prefix = 640px+. Never write `md:` or `lg:` unless there is a genuine 3-column layout at play.

### Step 5 — Verify build
After any change to `globals.css` or a component: run `npm run build`. TypeScript errors fail the build in this project. Fix them before reporting work as done.

---

## 9. The Single Most Important Aesthetic Principle

This app is used by a small business owner — often standing behind a salon chair, between clients, on their phone. Every screen must answer: **"can I scan this in 2 seconds?"**

That means:
- The most important number on a page is the biggest thing on the page
- Actions the user takes multiple times a day are one tap away
- Nothing decorative that doesn't carry information
- The amber accent appears only where the user needs to act — it is a signal, not decoration

When in doubt: remove, don't add.
