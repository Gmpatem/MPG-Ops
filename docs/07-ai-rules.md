# AI Rules: MPG Ops

## AI Agent Operating Procedures

These rules are **mandatory** for all AI agents working on MPG Ops.

---

## Pre-Work Checklist

Before writing any code, AI MUST:

1. [ ] Read `docs/00-project-brief.md` for context
2. [ ] Read `docs/01-product-scope.md` for MVP boundaries
3. [ ] Read `docs/03-tech-stack.md` for technology constraints
4. [ ] Read `docs/04-architecture.md` for patterns
5. [ ] Read `docs/10-handoff.md` for current state
6. [ ] Check `docs/08-progress-tracker.md` for status

---

## Core Rules

### 1. MVP Scope Enforcement

**IN SCOPE:**
- Authentication
- Business setup
- Services management
- Customers management
- Bookings management
- Payments recording
- Dashboard

**OUT OF SCOPE (NEVER ADD):**
- Payroll
- Inventory
- Loyalty programs
- Marketing tools
- Multi-branch
- Advanced analytics
- Staff scheduling
- Online customer booking

**Rule:** If a feature is not in the MVP list, do not build it. Suggest it for post-MVP instead.

### 2. Single Codebase Rule

**ALWAYS:**
- Build ONE system for all business types
- Use `business_type` flag for differentiation
- Share components across types

**NEVER:**
- Create separate apps for salon/barbershop/spa
- Duplicate code for different business types
- Branch logic unnecessarily

### 3. Mobile-First Always

**ALWAYS:**
- Design for mobile first
- Use mobile-optimized touch targets (min 44px)
- Test layouts at 375px width
- Single column layouts on mobile

**NEVER:**
- Design desktop-first
- Use hover-only interactions
- Make touch targets too small

### 4. Technology Lock

**LOCKED (Never change without approval):**
- Next.js 16 with App Router
- React Server Components by default
- TypeScript strict mode
- Tailwind CSS for styling
- shadcn/ui components
- Supabase for backend
- Zod for validation

**ALWAYS:**
- Use Server Components unless interactivity required
- Use Server Actions for mutations
- Use Zod for all validation
- Follow shadcn/ui patterns

### 5. No Large Refactors

**NEVER:**
- Refactor without specific technical reason
- Change architecture patterns mid-stream
- Rename files/folders unless broken
- Switch state management approaches

**ALWAYS:**
- Work within existing patterns
- Incremental improvements only
- If stuck, simplify don't expand

---

## Anti-Loop Rules

**STOP WORK and alert user if:**

1. **Same UI redesigned repeatedly** — If we've redesigned the same screen 3+ times
2. **New features added before MVP done** — If suggesting features outside MVP scope
3. **Architecture keeps changing** — If patterns keep shifting

**When stuck:**
→ **SIMPLIFY, do not expand**
→ Remove complexity, don't add it
→ Choose the simpler solution always

---

## Code Quality Rules

### TypeScript
- Strict mode always
- No `any` types
- Explicit return types on exported functions
- Interface over type for objects

### Components
- Server Components by default
- `'use client'` only when needed (forms, interactivity)
- Props interface always
- Default exports for pages

### Styling
- Tailwind classes only
- No inline styles
- Use `cn()` utility for conditional classes
- Follow mobile-first breakpoints

### Database
- Use Supabase client from `@/lib/supabase`
- RLS policies for all tables
- Never expose service role key to client
- Type-safe queries with generated types

### Validation
- Zod schemas for all forms
- Validate at server action boundary
- Type inference from schemas

---

## Post-Work Requirements

After EVERY session, AI MUST update:

1. **docs/08-progress-tracker.md**
   - Mark completed tasks
   - Add new tasks discovered
   - Update percentages

2. **docs/09-decisions-log.md**
   - Record technical decisions made
   - Note alternatives considered
   - Explain why this choice

3. **docs/10-handoff.md**
   - Current status summary
   - What was completed this session
   - What's next
   - Any blockers or issues

4. **docs/11-known-issues.md** (if applicable)
   - New bugs discovered
   - Technical debt identified
   - Workarounds in place

---

## Communication Rules

### DO
- Ask clarifying questions when requirements unclear
- Suggest simplifications when appropriate
- Explain trade-offs for significant decisions
- Flag potential issues early

### DON'T
- Assume context not provided
- Over-engineer solutions
- Add features not requested
- Make breaking changes silently

---

## File Organization

### ALWAYS place files in correct locations:

| Type | Location |
|------|----------|
| Pages | `src/app/**/page.tsx` |
| Layouts | `src/app/**/layout.tsx` |
| Server Actions | `src/app/actions/*.ts` |
| UI Components | `src/components/ui/*.tsx` |
| Feature Components | `src/components/features/*.tsx` |
| Forms | `src/components/forms/*.tsx` |
| Hooks | `src/hooks/*.ts` |
| Types | `src/types/*.ts` |
| Schemas | `src/schemas/*.ts` |
| Utils | `src/lib/utils.ts` |
| Supabase | `src/lib/supabase/*.ts` |

---

## Testing Expectations

For every feature:
- Test happy path
- Test error states
- Test mobile layout (375px)
- Test form validation

---

## Documentation Updates

When changing any of these, update docs:
- Component patterns → Update `06-ui-rules.md`
- Architecture changes → Update `04-architecture.md`
- Database changes → Update `05-database-schema.md`
- Tech stack changes → Update `03-tech-stack.md`

---

## Violation Escalation

If user asks AI to violate these rules:

1. Explain the rule and why it exists
2. Suggest compliant alternative
3. If user insists, document in `09-decisions-log.md`
4. Proceed with explicit user direction

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*

**REMEMBER: Read docs before coding. Update docs after coding.**
