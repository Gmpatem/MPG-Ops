'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/marketing/pricing-section';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Calendar,
  Users,
  Scissors,
  Clock,
  Smartphone,
  Zap,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  CreditCard,
  Link2,
  BarChart3,
  Star,
} from 'lucide-react';

// ─── Header ─────────────────────────────────────────────────────────────────

function LandingHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: t('landing.header.features') || 'Features', href: '#features' },
    { label: t('landing.header.pricing') || 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 max-w-5xl">
        {/* Brand */}
        <Link href="/" className="font-bold text-lg tracking-tight select-none">
          MPG Ops
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher variant="dropdown" />
          <Link href="/login" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm">
              {t('landing.header.signIn') || 'Sign In'}
            </Button>
          </Link>
          <Link href="/register" className="hidden md:inline-flex">
            <Button size="sm">
              {t('landing.header.startTrial') || 'Start Free Trial'}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
              <SheetHeader className="flex flex-row items-center justify-between pb-2">
                <SheetTitle className="text-left font-bold text-lg">Menu</SheetTitle>
                <SheetClose className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors" aria-label="Close menu">
                  <X className="h-4 w-4" />
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col gap-1 py-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
                <div className="h-px bg-border my-2" />
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {t('landing.header.signIn') || 'Sign In'}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t('landing.header.startTrial') || 'Start Free Trial'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// ─── Product mock — Dashboard ────────────────────────────────────────────────

function DashboardMock() {
  const stats = [
    { label: 'Bookings', value: '12', sub: '3 done, 9 pending', icon: <Calendar className="w-3.5 h-3.5" /> },
    { label: 'Revenue', value: '₱4,200', sub: '8 payments today', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { label: 'Customers', value: '86', sub: 'Registered', icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Services', value: '14', sub: 'Active', icon: <Scissors className="w-3.5 h-3.5" /> },
  ];

  const schedule = [
    { time: '10:00', name: 'Maria Santos', service: 'Haircut', status: 'scheduled' },
    { time: '11:30', name: 'Jenny Cruz', service: 'Facial', status: 'scheduled' },
    { time: '14:00', name: 'Ana Reyes', service: 'Color', status: 'completed' },
  ];

  return (
    <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
      {/* Mock header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <span className="text-xs font-semibold">Dashboard</span>
        <span className="text-[10px] font-medium uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>
      <div className="p-3 sm:p-4 space-y-3">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-background p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
                <span className="text-muted-foreground">{s.icon}</span>
              </div>
              <div className="text-base font-bold leading-none">{s.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div className="rounded-xl border bg-background overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Today&apos;s Schedule
            </span>
            <span className="text-[10px] text-muted-foreground">{schedule.length} appts</span>
          </div>
          <div className="divide-y">
            {schedule.map((appt) => (
              <div key={appt.time} className="flex items-center gap-2.5 px-3 py-2">
                <div className="flex flex-col items-center justify-center w-10 h-8 rounded-lg bg-muted/60 shrink-0">
                  <span className="text-[10px] font-semibold leading-none">{appt.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{appt.name}</p>
                  <p className="text-[10px] text-muted-foreground">{appt.service}</p>
                </div>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                    appt.status === 'completed'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {appt.status === 'completed' ? 'Done' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product mock — Public booking page ─────────────────────────────────────

function PublicBookingMock() {
  const services = [
    { name: 'Signature Facial', price: '₱1,200', duration: '60 min', featured: true },
    { name: 'Haircut', price: '₱350', duration: '30 min', featured: false },
    { name: 'Color Treatment', price: '₱1,500', duration: '90 min', featured: false },
  ];

  return (
    <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
      {/* Mock browser bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
        <div className="flex-1 mx-2 h-4 rounded-md bg-muted/60 text-[10px] text-muted-foreground flex items-center px-2 font-mono">
          mpgops.com/book/glamour-salon
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* Business header */}
        <div className="text-center pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Hair Salon
          </span>
          <h4 className="text-base font-bold mt-0.5">Glamour Salon</h4>
          <p className="text-xs text-muted-foreground">Book your service in seconds.</p>
        </div>

        {/* Trust chips */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {['No account required', 'Instant booking', 'Free to book'].map((chip) => (
            <span
              key={chip}
              className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Featured service */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
              Featured
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{services[0].name}</p>
              <p className="text-xs text-muted-foreground">
                {services[0].price} · {services[0].duration}
              </p>
            </div>
            <span className="text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">
              Book
            </span>
          </div>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-2 gap-2">
          {services.slice(1).map((s) => (
            <div key={s.name} className="rounded-xl border bg-background p-2.5">
              <p className="text-xs font-medium leading-snug">{s.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {s.price} · {s.duration}
              </p>
              <span className="mt-1.5 block text-center text-[10px] font-semibold border rounded-lg py-0.5 text-foreground">
                Book
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useI18n();

  const features = [
    {
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      title: t('landing.features.onlineBooking.title') || 'Online Booking Page',
      desc: t('landing.features.onlineBooking.desc') || 'A branded page where customers book 24/7.',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      title: t('landing.features.smartAvailability.title') || 'Smart Availability',
      desc: t('landing.features.smartAvailability.desc') || 'Prevents double bookings automatically.',
    },
    {
      icon: <Scissors className="w-5 h-5" />,
      color: 'bg-primary/10 text-primary',
      title: t('landing.features.multiService.title') || 'Multi-Service Booking',
      desc: t('landing.features.multiService.desc') || 'Customers can book multiple services in one go.',
    },
    {
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
      title: t('landing.features.customerManagement.title') || 'Customer Management',
      desc: t('landing.features.customerManagement.desc') || 'Keep records, history, and contacts organised.',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
      title: t('landing.features.mobileFriendly.title') || 'Mobile-Friendly Workspace',
      desc: t('landing.features.mobileFriendly.desc') || 'Run your business from any device, anywhere.',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      title: 'Payment Tracking',
      desc: 'Record and track payments against every completed booking.',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: <Zap className="w-5 h-5" />,
      label: t('landing.howItWorks.steps.0.label') || 'Set up your business',
      desc: t('landing.howItWorks.steps.0.desc') || 'Add your services, set your hours, and customise your booking page in one short wizard.',
    },
    {
      num: '02',
      icon: <Link2 className="w-5 h-5" />,
      label: t('landing.howItWorks.steps.1.label') || 'Share your booking link',
      desc: t('landing.howItWorks.steps.1.desc') || 'Send your unique link to customers by WhatsApp, Instagram, or paste it anywhere.',
    },
    {
      num: '03',
      icon: <BarChart3 className="w-5 h-5" />,
      label: t('landing.howItWorks.steps.2.label') || 'Manage from your phone',
      desc: t('landing.howItWorks.steps.2.desc') || 'Accept bookings, track payments, and see your full schedule — all from your pocket.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Subtle background gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-muted/50 to-transparent"
          />

          <div className="relative container mx-auto max-w-5xl px-4 pt-12 pb-10 md:pt-20 md:pb-16">
            <div className="max-w-2xl mx-auto text-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                Salons · Barbershops · Spas · Service businesses
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
                {/* Split headline so "like a pro" gets amber treatment */}
                Run your service business{' '}
                <span className="text-accent">like a pro</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {t('landing.hero.description') ||
                  'Smart booking, scheduling, and customer management for salons, barbershops, spas, and service businesses — all from your phone.'}
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 px-8 w-full sm:w-auto rounded-xl text-base font-semibold"
                  >
                    {t('landing.hero.ctaTrial') || 'Start Free Trial'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 w-full sm:w-auto rounded-xl text-base"
                  >
                    {t('landing.header.signIn') || 'Sign In'}
                  </Button>
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {t('landing.hero.tagline') || 'No setup stress · Mobile-friendly · 14-day Pro trial'}
              </p>
            </div>

            {/* Product mocks */}
            <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground px-1">
                  {t('landing.preview.dashboardLabel') || 'Your Dashboard'} —{' '}
                  <span className="text-foreground">Admin view</span>
                </span>
                <DashboardMock />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground px-1">
                  {t('landing.preview.publicLabel') || 'Public Booking Page'} —{' '}
                  <span className="text-foreground">Customer view</span>
                </span>
                <PublicBookingMock />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="bg-muted/40 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="text-center mb-8 md:mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('landing.howItWorks.badge') || 'How it works'}
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
                {t('landing.howItWorks.title') || 'From zero to bookings in minutes'}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm md:text-base">
                {t('landing.howItWorks.subtitle') || 'No training required. No setup call. Just sign up and go.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
              {steps.map((step, i) => (
                <div key={step.num} className="relative rounded-2xl border bg-card p-5 md:p-6 shadow-sm">
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{step.label}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. PROBLEM / SOLUTION ───────────────────────────────────────── */}
        <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Problem */}
            <div className="rounded-2xl border bg-card p-5 md:p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Without MPG Ops
              </p>
              <h3 className="text-base md:text-lg font-bold mb-4">
                {t('landing.problem.title') || 'Still managing bookings manually?'}
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  t('landing.problem.items.0') || 'Missed messages and lost leads',
                  t('landing.problem.items.1') || 'Double bookings and schedule chaos',
                  t('landing.problem.items.2') || 'No clear view of your day',
                  t('landing.problem.items.3') || 'Customer details scattered everywhere',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                With MPG Ops
              </p>
              <h3 className="text-base md:text-lg font-bold mb-4">
                {t('landing.solution.title') || 'Everything in one place'}
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  t('landing.solution.items.0') || 'Professional online booking page',
                  t('landing.solution.items.1') || 'Smart availability and conflict prevention',
                  t('landing.solution.items.2') || 'Clear daily schedule and notifications',
                  t('landing.solution.items.3') || 'Organised customer records',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 4. FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="bg-muted/40 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {t('landing.features.title') || 'Everything you need'}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm md:text-base">
                {t('landing.features.subtitle') || 'Tools designed to save time, reduce no-shows, and grow your business.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border bg-card p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. WHY MPG OPS ──────────────────────────────────────────────── */}
        <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('landing.trust.title') || 'Why service businesses choose MPG Ops'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                icon: <Scissors className="w-5 h-5" />,
                color: 'bg-primary/10 text-primary',
                title: t('landing.trust.items.0.title') || 'Built for service businesses',
                desc: t('landing.trust.items.0.desc') || 'Designed around salons, barbers, and spas.',
              },
              {
                icon: <Smartphone className="w-5 h-5" />,
                color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
                title: t('landing.trust.items.1.title') || 'Mobile-first',
                desc: t('landing.trust.items.1.desc') || 'Your desk is your phone. So is ours.',
              },
              {
                icon: <Zap className="w-5 h-5" />,
                color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                title: t('landing.trust.items.2.title') || 'Fast setup',
                desc: t('landing.trust.items.2.desc') || 'Get your booking page live in minutes.',
              },
              {
                icon: <CheckCircle2 className="w-5 h-5" />,
                color: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
                title: t('landing.trust.items.3.title') || 'No coding required',
                desc: t('landing.trust.items.3.desc') || 'Everything is ready to use out of the box.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="text-center p-4 md:p-5 rounded-xl border bg-card shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="bg-muted/40">
          <PricingSection />
        </section>

        {/* ── 7. FINAL CTA ────────────────────────────────────────────────── */}
        <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="rounded-2xl bg-primary px-6 py-10 md:py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
              {t('landing.cta.title') || 'Ready to simplify your bookings?'}
            </h2>
            <p className="text-primary-foreground/80 mt-3 max-w-lg mx-auto text-sm md:text-base">
              {t('landing.cta.subtitle') ||
                'Join service businesses using MPG Ops to stay organised and book more appointments.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 w-full sm:w-auto rounded-xl font-semibold"
                >
                  {t('landing.hero.ctaTrial') || 'Start Free Trial'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 w-full sm:w-auto rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {t('landing.header.signIn') || 'Sign In'}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-primary-foreground/70">
              {t('landing.cta.tagline') || '14-day Pro trial · No credit card required'}
            </p>
          </div>
        </section>
      </main>

      {/* ── 8. FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t py-8">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold text-base">MPG Ops</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('landing.footer.tagline') || 'Booking & operations for service businesses'}
              </p>
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                {t('landing.header.features') || 'Features'}
              </a>
              <a href="#pricing" className="hover:text-foreground transition-colors">
                {t('landing.header.pricing') || 'Pricing'}
              </a>
              <Link href="/login" className="hover:text-foreground transition-colors">
                {t('landing.header.signIn') || 'Sign In'}
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                {t('landing.header.startTrial') || 'Start Free Trial'}
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MPG Ops. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
