# MPG Ops

A mobile-first SaaS system for service businesses (salons, barbershops, spas).

## Overview

MPG Ops helps service business owners move from notebooks and manual systems to a digital platform, eliminating:
- Missed bookings
- Poor customer tracking  
- Unclear daily revenue

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **Validation:** Zod
- **Deployment:** Vercel

## Project Structure

```
mpg-ops/
├── docs/                   # Project documentation
│   ├── 00-project-brief.md
│   ├── 01-product-scope.md
│   ├── 02-user-flows.md
│   ├── 03-tech-stack.md
│   ├── 04-architecture.md
│   ├── 05-database-schema.md
│   ├── 06-ui-rules.md
│   ├── 07-ai-rules.md
│   ├── 08-progress-tracker.md
│   ├── 09-decisions-log.md
│   ├── 10-handoff.md
│   └── 11-known-issues.md
├── prompts/                # AI agent prompts
│   ├── master-agent-prompt.md
│   ├── kimi-coder-prompt.md
│   ├── claude-code-prompt.md
│   └── codex-prompt.md
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities and helpers
│   └── types/             # TypeScript types
├── public/                # Static assets
└── ...config files
```

## Documentation

All project documentation lives in `/docs`. Start with `00-project-brief.md` for context.

## AI Workflow

Before any coding session, AI agents must:
1. Read relevant docs in `/docs`
2. Check `10-handoff.md` for current state
3. Follow rules in `07-ai-rules.md`
4. Update `08-progress-tracker.md` after work

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## MVP Status

See `docs/08-progress-tracker.md` for current development status.

---

**Project Location:** `E:\mpg-ops`
