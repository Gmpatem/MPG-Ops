# Architecture: MPG Ops

## Core Architecture Principle

**ONE SYSTEM FOR ALL BUSINESS TYPES**

All business types (salon, barbershop, spa) use a single codebase with business_type differentiation via database flags.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Mobile    │  │   Desktop   │  │     Tablet          │  │
│  │  (Primary)  │  │  (Secondary)│  │    (Occasional)     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          └────────────────┴────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Vercel    │
                    │   (Next.js) │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌──────▼──────┐
    │  Server   │   │  Server   │   │   Static    │
    │Components │   │  Actions  │   │    Assets   │
    └─────┬─────┘   └─────┬─────┘   └─────────────┘
          │               │
          └───────────────┘
                  │
          ┌───────▼────────┐
          │    Supabase    │
          │  ┌──────────┐  │
          │  │PostgreSQL│  │
          │  │   Auth   │  │
          │  │    RLS   │  │
          │  └──────────┘  │
          └────────────────┘
```

---

## Application Layers

### 1. Presentation Layer
- **Next.js App Router**
- **Server Components** (default)
- **Client Components** (interactivity only)
- **shadcn/ui** components

### 2. Business Logic Layer
- **React Server Actions** (mutations)
- **Zod schemas** (validation)
- **Custom hooks** (client-side state)

### 3. Data Access Layer
- **Supabase Client**
- **Row Level Security** policies
- **Database queries**

---

## Business Type Architecture

### Single Codebase Approach

```typescript
// Business type as a database flag
interface Business {
  id: string;
  name: string;
  business_type: 'salon' | 'barbershop' | 'spa';
  // ... other fields
}

// UI adapts based on business_type
function ServiceList({ businessType }: { businessType: BusinessType }) {
  // Same component, different data/labels based on type
}
```

### Benefits
- One deployment
- One codebase to maintain
- Shared improvements across all types
- Consistent user experience
- Easier testing

---

## Data Flow

### Server Actions Pattern

```
[User Action]
    ↓
[Client Component]
    ↓
[Server Action]
    ├── Zod validation
    ├── Auth check
    ├── Database operation
    └── Revalidate cache
    ↓
[UI Update]
```

### Example Flow
```typescript
// app/actions/bookings.ts
'use server';

export async function createBooking(formData: FormData) {
  // 1. Validate
  const data = bookingSchema.parse(Object.fromEntries(formData));
  
  // 2. Auth check
  const { user } = await getSession();
  if (!user) throw new Error('Unauthorized');
  
  // 3. Database operation
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  
  // 4. Revalidate
  revalidatePath('/bookings');
  
  return booking;
}
```

---

## Database Access Pattern

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

```sql
-- Example RLS policy
CREATE POLICY "Users can only access their own business data"
ON bookings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = bookings.business_id
    AND businesses.owner_id = auth.uid()
  )
);
```

### Client Types

```typescript
// Server client (Server Components, Server Actions)
import { createClient } from '@/lib/supabase/server';

// Browser client (Client Components)
import { createClient } from '@/lib/supabase/client';
```

---

## Authentication Flow

```
[Login Page]
    ↓
[Supabase Auth]
    ↓
[Session Created]
    ↓
[Middleware Check]
    ├── Valid session → Allow
    └── Invalid session → Redirect to login
```

### Session Management
- HTTP-only cookies
- Automatic refresh
- Middleware protection

---

## Route Structure

```
app/
├── page.tsx                    # Landing/marketing page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── (auth)/                     # Auth route group (no layout)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/page.tsx
├── (dashboard)/                # Dashboard route group
│   ├── layout.tsx              # Dashboard layout (sidebar, etc.)
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── bookings/
│   │   ├── page.tsx            # Bookings list
│   │   └── new/page.tsx        # New booking
│   ├── customers/
│   │   ├── page.tsx            # Customers list
│   │   └── [id]/page.tsx       # Customer detail
│   ├── services/
│   │   └── page.tsx            # Services management
│   └── settings/
│       └── page.tsx            # Business settings
└── api/                        # API routes (minimal)
```

---

## Component Architecture

### Server Components (Default)
- Page components
- Layout components
- Data fetching
- Static content

### Client Components ('use client')
- Forms (interactivity)
- Modals
- Date pickers
- Real-time updates

### Component Hierarchy
```
[Server Page]
    ↓
[Server Layout]
    ↓
[Feature Component (Server)]
    ↓
[UI Components (Client when needed)]
    ├── Form Components
    ├── Interactive Lists
    └── Dialogs/Modals
```

---

## State Management

### Minimal State Approach

| State Type | Solution |
|------------|----------|
| Server state | React Server Components + Server Actions |
| URL state | Next.js useSearchParams |
| Form state | React useState + Zod validation |
| UI state | React useState/useReducer |
| Global client state | React Context (if needed) |

**No Redux, Zustand, or Jotai for MVP.**

---

## Performance Guidelines

1. **Use Server Components** — Less JavaScript to client
2. **Streaming** — Leverage Next.js streaming
3. **Image Optimization** — Use next/image
4. **Font Optimization** — Use next/font
5. **Code Splitting** — Automatic with App Router
6. **Data Fetching** — Parallel where possible

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*
