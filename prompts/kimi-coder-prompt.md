# Kimi Coder Prompt: MPG Ops

## Role

You are Kimi Code CLI, working on MPG Ops — a mobile-first SaaS for service businesses.

---

## Pre-Flight Checklist

Before writing code:

- [ ] Read `docs/00-project-brief.md`
- [ ] Read `docs/01-product-scope.md` (MVP boundaries)
- [ ] Read `docs/03-tech-stack.md`
- [ ] Read `docs/04-architecture.md`
- [ ] Read `docs/10-handoff.md` (current state)
- [ ] Read `docs/07-ai-rules.md` (rules)

---

## Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| Next.js | 16.x | Framework |
| React | 19.x | UI |
| TypeScript | 5.x | Language (strict) |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Components |
| Supabase | 2.x | Backend |
| Zod | 3.x | Validation |

---

## Code Standards

### TypeScript
```typescript
// Strict mode - no 'any'
interface Props {
  id: string;
  name: string;
}

// Explicit return types for exports
export async function getData(): Promise<Data[]> {
  // ...
}
```

### Components
```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}

// Client Component (interactivity only)
'use client';
export function Form() {
  const [state, setState] = useState();
  // ...
}
```

### Styling
```tsx
// Mobile-first Tailwind
<div className="p-4 md:p-6 lg:p-8">
  <button className="h-12 w-full md:w-auto">
    {/* 44px+ touch target */}
  </button>
</div>
```

### Server Actions
```tsx
'use server';

export async function action(formData: FormData) {
  // 1. Validate
  const data = schema.parse(Object.fromEntries(formData));
  
  // 2. Auth check
  const { user } = await getSession();
  if (!user) throw new Error('Unauthorized');
  
  // 3. Database
  const result = await db.insert(data);
  
  // 4. Revalidate
  revalidatePath('/path');
  
  return result;
}
```

---

## MVP Scope (DO NOT EXCEED)

✅ IN:
- Authentication
- Business setup
- Services (CRUD)
- Customers (CRUD)
- Bookings (CRUD)
- Payments (record)
- Dashboard

❌ OUT:
- Payroll
- Inventory
- Loyalty
- Marketing
- Multi-branch
- Advanced analytics

---

## File Locations

| Type | Path |
|------|------|
| Pages | `src/app/**/page.tsx` |
| Layouts | `src/app/**/layout.tsx` |
| Actions | `src/app/actions/*.ts` |
| UI | `src/components/ui/*.tsx` |
| Features | `src/components/features/*.tsx` |
| Forms | `src/components/forms/*.tsx` |
| Hooks | `src/hooks/*.ts` |
| Types | `src/types/*.ts` |
| Schemas | `src/schemas/*.tsx` |
| Supabase | `src/lib/supabase/*.ts` |

---

## Post-Session Requirements

Update documentation:
1. `docs/08-progress-tracker.md` — Check off completed tasks
2. `docs/09-decisions-log.md` — Log any decisions
3. `docs/10-handoff.md` — Write next session handoff
4. `docs/11-known-issues.md` — Note bugs/issues

---

## Commands

```bash
# Dev server
cd "E:\mpg-ops" ; npm run dev

# Build
cd "E:\mpg-ops" ; npm run build

# Add shadcn component
cd "E:\mpg-ops" ; npx shadcn add <component>
```

---

## Anti-Loop Rules

STOP if:
- Same UI redesigned 3+ times
- New features added before MVP done
- Architecture keeps changing

When stuck → **SIMPLIFY**

---

## Project Root

`E:\mpg-ops`

Always use this base path.

---

**Read docs first. Code second. Update docs last.**
