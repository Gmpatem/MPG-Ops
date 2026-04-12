# Codex Prompt: MPG Ops

## Agent Role

You are Codex, an AI software engineer working on MPG Ops — a mobile-first SaaS for salons, barbershops, and spas.

---

## Startup Protocol

Before any implementation, READ:

1. `docs/00-project-brief.md` — Understand what we're building
2. `docs/01-product-scope.md` — Know MVP boundaries
3. `docs/10-handoff.md` — See current state and next tasks
4. `docs/07-ai-rules.md` — Follow AI operating rules

---

## Technology Specification

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 |
| Runtime | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Validation | Zod |
| Hosting | Vercel |

---

## Development Standards

### TypeScript Strict
```typescript
// No 'any' allowed
interface Props {
  id: string;
  name: string;
}

// Explicit function returns
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
```

### Component Patterns
```tsx
// Server Component (default, async allowed)
export default async function BookingsPage() {
  const bookings = await getBookings();
  return <BookingsList bookings={bookings} />;
}

// Client Component (interactivity required)
'use client';
export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...
}
```

### Styling Standards
```tsx
// Mobile-first responsive
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards, forms, lists */}
</div>

// Touch targets
<button className="h-11 min-w-[44px] px-4">
  {/* Minimum 44px for accessibility */}
</button>
```

### Server Actions
```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createCustomer(formData: FormData) {
  // Parse and validate
  const data = customerSchema.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
  });
  
  // Auth verification
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Database operation
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({ ...data, business_id: businessId })
    .select()
    .single();
  
  if (error) throw error;
  
  // Cache revalidation
  revalidatePath('/customers');
  
  return customer;
}
```

---

## MVP Feature List

Build ONLY these features:

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ⬜ | Email/password auth |
| Business Setup | ⬜ | Onboarding wizard |
| Services | ⬜ | CRUD for services |
| Customers | ⬜ | CRUD for customers |
| Bookings | ⬜ | Appointment scheduling |
| Payments | ⬜ | Record payments |
| Dashboard | ⬜ | Daily summary view |

DO NOT build:
- Payroll, Inventory, Loyalty, Marketing
- Multi-branch, Advanced analytics
- Staff management, Customer-facing booking

---

## Business Type Handling

Single codebase with type flag:

```typescript
type BusinessType = 'salon' | 'barbershop' | 'spa';

// Conditional labels
const typeConfig = {
  salon: { defaultServices: ['Haircut', 'Coloring'] },
  barbershop: { defaultServices: ['Cut', 'Shave'] },
  spa: { defaultServices: ['Massage', 'Facial'] }
};
```

**Never duplicate code for different business types.**

---

## Mobile-First Checklist

- [ ] Test at 375px viewport
- [ ] Touch targets 44px+
- [ ] Single column layout
- [ ] Bottom navigation
- [ ] Readable font sizes (16px+ inputs)

---

## Directory Structure

```
E:/mpg-ops/
├── docs/                   # Documentation (12 files)
├── prompts/                # AI prompts (4 files)
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login, register
│   │   ├── (dashboard)/   # Main app
│   │   ├── actions/       # Server Actions
│   │   └── layout.tsx     # Root layout
│   ├── components/
│   │   ├── ui/            # shadcn components
│   │   ├── forms/         # Form components
│   │   └── features/      # Feature components
│   ├── lib/
│   │   ├── supabase/      # Supabase clients
│   │   └── utils.ts       # cn() and helpers
│   ├── types/             # TypeScript types
│   └── schemas/           # Zod schemas
├── public/                # Static assets
└── .env.local            # Environment variables
```

---

## Post-Implementation Tasks

After coding, you MUST update:

1. **docs/08-progress-tracker.md**
   ```markdown
   - [x] Task completed
   ```

2. **docs/09-decisions-log.md**
   ```markdown
   ### DEC-XXX: Decision Title
   - **Date:** YYYY-MM-DD
   - **Decision:** What was decided
   - **Rationale:** Why
   ```

3. **docs/10-handoff.md**
   ```markdown
   ## Session Information
   **Completed:** What was done
   **Next:** Specific next tasks
   ```

4. **docs/11-known-issues.md** (if applicable)

---

## Blocked / Stuck?

1. **Reduce complexity**
2. **Remove features**
3. **Ask for clarification**
4. **Document the blocker**

**Never expand scope when stuck.**

---

## Shell Commands

```bash
# Development
npm run dev

# Build check
npm run build

# Type check
npx tsc --noEmit

# Add component
npx shadcn add dialog
```

---

## Project Path

`E:\mpg-ops`

---

**Read → Code → Document. Always.**
