# Deployment Guide

This guide covers deploying MPG Ops to production using Vercel and Supabase.

---

## Prerequisites

- GitHub repository connected to Vercel
- Supabase project created
- Domain name (optional)

---

## Step 1: Supabase Production Setup

### 1.1 Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name it "mpg-ops-prod" (or your preferred name)
4. Choose region closest to your users
5. Save the database password securely

### 1.2 Run Migrations

Execute the SQL files in order:

1. Go to SQL Editor in Supabase
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_business_members.sql`
4. Run `supabase/migrations/003_services_category.sql`

### 1.3 Verify RLS Policies

Ensure these policies are active:

- Businesses: Users can only access their own business
- Services: Scoped by business_id
- Customers: Scoped by business_id
- Bookings: Scoped by business_id
- Payments: Scoped by business_id

### 1.4 Get API Credentials

From Project Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)

---

## Step 2: Vercel Deployment

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `Gmpatem/MPG-Ops`
4. Select the main branch

### 2.2 Configure Environment Variables

Add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Vercel will provide a `.vercel.app` URL

---

## Step 3: Custom Domain (Optional)

### 3.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `mpgops.com`)
3. Follow DNS configuration instructions

### 3.2 Update Supabase Redirect URLs

In Supabase Auth Settings, add your production domain:

```
https://yourdomain.com/auth/callback
```

---

## Step 4: Post-Deployment Verification

### 4.1 Test Core Flow

1. **Registration**
   - Create new account
   - Verify email (if enabled)

2. **Onboarding**
   - Complete business setup
   - Verify redirect to dashboard

3. **Main Features**
   - Add services
   - Add customers
   - Create bookings
   - Record payments

### 4.2 Check These URLs Work

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard (requires auth)
- `/services` - Services management
- `/customers` - Customer management
- `/bookings` - Bookings management
- `/payments` - Payments history
- `/settings` - Business settings

---

## Environment Variables Reference

### Required

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard |

### Optional (Post-MVP)

| Variable | Description | When Needed |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | Adding Sentry |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking | Adding analytics |

---

## Troubleshooting

### Build Failures

**Error:** "Module not found"
- **Fix:** Run `npm install` locally and commit lock file

**Error:** TypeScript errors
- **Fix:** Run `npx tsc --noEmit` locally and fix errors

### Runtime Errors

**Error:** "Invalid Supabase credentials"
- **Fix:** Check environment variables in Vercel match Supabase project

**Error:** "RLS policy violation"
- **Fix:** Verify RLS policies are correctly configured in Supabase

**Error:** "Middleware deprecated warning"
- **Note:** This is a warning, not an error. App works fine. Update to "proxy" convention in future.

### Auth Issues

**Error:** "Unable to sign in"
- **Fix:** Check that Site URL in Supabase Auth settings matches your domain

**Error:** "Session not persisting"
- **Fix:** Ensure cookies are not blocked; check browser dev tools

---

## Monitoring (Post-MVP)

### Recommended Additions

1. **Error Tracking**: Sentry.io
2. **Analytics**: Plausible or PostHog
3. **Uptime Monitoring**: UptimeRobot
4. **Performance**: Vercel Analytics

---

## Rollback Procedure

If deployment fails:

1. In Vercel Dashboard, go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

*Last Updated: 2026-04-13*
