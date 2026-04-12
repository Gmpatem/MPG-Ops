# Claude Code Prompt: MPG Ops

## Context

You are Claude Code, working on MPG Ops — a mobile-first SaaS platform for service businesses (salons, barbershops, spas).

---

## Required Reading (Before Any Code)

Read these files in order:

1. `docs/00-project-brief.md` — Product overview
2. `docs/01-product-scope.md` — MVP in/out scope
3. `docs/03-tech-stack.md` — Locked technologies
4. `docs/04-architecture.md` — System patterns
5. `docs/10-handoff.md` — Current work state
6. `docs/07-ai-rules.md` — AI operating rules

---

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **UI:** shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **Validation:** Zod
- **Platform:** Vercel

---

## Architecture Principles

### Server Components First
```tsx
// Default: Server Component
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}
```

### Client Components Only When Needed
```tsx
'use client'; // Only for:
// - Forms (interactivity)
// - Browser APIs
// - Real-time updates
// - Complex state
```

### Server Actions for Mutations
```tsx
'use server';

export async function createBooking(formData: FormData) {
  // Validate
  const data = schema.parse(Object.fromEntries(formData));
  
  // Check auth
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  // Mutate
  const result = await db.insert(data);
  
  // Revalidate
  revalidatePath('/bookings');
  
  return result;
}
```

---

## MVP Scope Enforcement

### Features to Build
- [ ] Authentication (login/register)
- [ ] Business setup (onboarding)
- [ ] Services management
- [ ] Customers management
- [ ] Bookings management
- [ ] Payments recording
- [ ] Dashboard (daily summary)

### Features to Reject
- Payroll
- Inventory tracking
- Loyalty programs
- Marketing tools
- Multi-branch support
- Advanced reporting
- Staff scheduling
- Online customer booking

**If asked to build out-of-scope features:** Explain it's post-MVP, document the request, but don't build it.

---

## Single Codebase Rule

All business types (salon, barbershop, spa) use ONE codebase:

```typescript
// Use business_type flag
interface Business {
  id: string;
  business_type: 'salon' | 'barbershop' | 'spa';
  // ...
}

// Conditional UI
const labels = {
  salon: { provider: 'Stylist' },
  barbershop: { provider: 'Barber' },
  spa: { provider: 'Therapist' }
};
```

**Never create separate apps or duplicate code for different types.**

---

## Mobile-First Requirements

- Design for 375px width first
- Touch targets minimum 44x44px
- Single column layouts on mobile
- Bottom navigation on mobile
- Test all changes at mobile breakpoint

---

## File Organization

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   ├── (dashboard)/         # Dashboard route group
│   ├── actions/             # Server Actions
│   └── api/                 # API routes (rare)
├── components/
│   ├── ui/                  # shadcn components
│   ├── features/            # Feature components
│   ├── forms/               # Form components
│   └── layout/              # Layout components
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── utils.ts             # Utilities (cn, etc.)
│   └── constants.ts         # Constants
├── hooks/                   # Custom hooks
├── types/                   # TypeScript types
└── schemas/                 # Zod schemas
```

---

## Post-Work Documentation

After every coding session, update:

1. **docs/08-progress-tracker.md**
   - Mark completed items
   - Update percentages

2. **docs/09-decisions-log.md**
   - Document technical decisions
   - Note alternatives considered

3. **docs/10-handoff.md**
   - What was completed
   - Current state
   - Next tasks with specifics

4. **docs/11-known-issues.md**
   - New bugs discovered
   - Technical debt identified

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Use `any` types | Define proper interfaces |
| Design desktop-first | Design mobile-first |
| Add Redux/Zustand | Use React state + Server Actions |
| Create separate apps | Use business_type flag |
| Skip validation | Use Zod schemas |
| Skip docs updates | Update all 4 docs files |
| Large refactors | Incremental changes |

---

## When Blocked

**Simplify, don't expand.**

Options in order:
1. Reduce scope
2. Use simpler solution
3. Ask for clarification
4. Document in decisions log

---

## Commands

```bash
# Navigate and start dev
cd "E:\mpg-ops" && npm run dev

# Type checking
cd "E:\mpg-ops" && npx tsc --noEmit

# Add shadcn component
cd "E:\mpg-ops" && npx shadcn add button
```

---

## Project Location

All work in: `E:\mpg-ops`

---

**Always read docs before coding. Always update docs after coding.**
