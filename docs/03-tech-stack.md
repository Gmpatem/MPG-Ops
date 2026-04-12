# Tech Stack: MPG Ops

## Core Technologies (LOCKED)

These technologies are **locked** for the MVP. No changes without team discussion.

---

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **shadcn/ui** | Latest | Pre-built accessible components |

### Key Decisions
- **App Router:** Use for all new pages
- **Server Components:** Default; Client Components only when needed
- **TypeScript:** Strict mode enabled
- **Tailwind v4:** CSS-first configuration

---

## Backend & Database

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Primary database |
| **Supabase Auth** | Authentication & user management |
| **Row Level Security (RLS)** | Data access control |

### Supabase Services Used
- **Database:** PostgreSQL with schemas
- **Auth:** Email/password, session management
- **Real-time:** Optional for live updates

---

## Validation & Types

| Technology | Purpose |
|------------|---------|
| **Zod** | Runtime validation, form validation |
| **TypeScript** | Compile-time type checking |

### Usage Pattern
```typescript
// Schema definition
const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

// Type inference
type Customer = z.infer<typeof customerSchema>;

// Runtime validation
const result = customerSchema.safeParse(data);
```

---

## Deployment

| Platform | Purpose |
|----------|---------|
| **Vercel** | Next.js hosting, CI/CD |
| **Supabase** | Database hosting |

### Environments
- **Development:** Local (`localhost:3000`)
- **Staging:** Vercel preview deployments
- **Production:** Vercel production

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **npm** | Package management |
| **Git** | Version control |

---

## File Structure

```
mpg-ops/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── api/               # API routes (if needed)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature-specific components
│   ├── lib/
│   │   ├── supabase/          # Supabase client/config
│   │   ├── utils.ts           # Utilities
│   │   └── constants.ts       # Constants
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── schemas/               # Zod schemas
├── public/                    # Static assets
├── docs/                      # Documentation
├── prompts/                   # AI prompts
└── config files
```

---

## Dependencies (Installed)

### Production
```json
{
  "next": "^16.x",
  "react": "^19.x",
  "react-dom": "^19.x",
  "@supabase/supabase-js": "^2.x",
  "zod": "^3.x",
  "tailwindcss": "^4.x",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

### Development
```json
{
  "typescript": "^5.x",
  "@types/node": "latest",
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "eslint": "latest",
  "eslint-config-next": "latest"
}
```

---

## Technology Constraints

### DO
- Use Server Components by default
- Use React Server Actions for mutations
- Use shadcn/ui components when available
- Follow TypeScript strict mode
- Use Zod for all form validation

### DON'T
- Don't add new state management (React state + Server Actions suffice)
- Don't add CSS-in-JS libraries (Tailwind only)
- Don't eject from shadcn/ui patterns
- Don't use external UI libraries without approval

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*
