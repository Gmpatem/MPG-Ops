'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/marketing/pricing-section';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';
import { Reveal } from '@/components/marketing/reveal';
import { cn } from '@/lib/utils';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t('landing.header.features') || 'Features', href: '#features' },
    { label: t('landing.header.pricing') || 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300 ease-out',
        scrolled
          ? 'border-white/10 bg-[#0a0a0b] backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0b]/95'
          : 'border-white/10 bg-[#0a0a0b]'
      )}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 max-w-5xl">
        {/* Brand */}
        <Link href="/" className="font-bold text-lg tracking-tight select-none text-white">
          MPG Ops
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher variant="dropdown" />
          <Link href="/login" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-white/10">
              {t('landing.header.signIn') || 'Sign In'}
            </Button>
          </Link>
          <Link href="/register" className="hidden md:inline-flex">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0b]">
              {t('landing.header.startTrial') || 'Start Free Trial'}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Open menu">
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
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-amber-500 text-[#0a0a0b] hover:bg-amber-400 transition-colors"
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
    <div className="group relative rounded-2xl border border-white/10 bg-[#141416]/80 shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-black/60">
      {/* Mock header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
        <span className="text-xs font-semibold text-white">Dashboard</span>
        <span className="text-[10px] font-medium uppercase tracking-wide bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
          Admin
        </span>
      </div>
      <div className="p-3 sm:p-4 space-y-3">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0f0f10] p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-400 font-medium">{s.label}</span>
                <span className="text-zinc-400">{s.icon}</span>
              </div>
              <div className="text-base font-bold leading-none text-white">{s.value}</div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-white/10 bg-[#0f0f10] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              Today&apos;s Schedule
            </span>
            <span className="text-[10px] text-zinc-500">{schedule.length} appts</span>
          </div>
          <div className="divide-y divide-white/5">
            {schedule.map((appt) => (
              <div key={appt.time} className="flex items-center gap-2.5 px-3 py-2">
                <div className="flex flex-col items-center justify-center w-10 h-8 rounded-lg bg-white/5 shrink-0">
                  <span className="text-[10px] font-semibold leading-none text-zinc-300">{appt.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-zinc-200">{appt.name}</p>
                  <p className="text-[10px] text-zinc-500">{appt.service}</p>
                </div>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 border ${
                    appt.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
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
    <div className="group relative rounded-2xl border border-white/10 bg-[#141416]/80 shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-black/60">
      {/* Premium ambient background composition */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 transition-transform duration-700 ease-out group-hover:scale-110"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -30%, rgba(251,191,36,0.28), transparent 60%),
            radial-gradient(ellipse 80% 60% at 110% 50%, rgba(244,63,94,0.14), transparent 50%),
            radial-gradient(ellipse 70% 70% at -10% 110%, rgba(139,92,246,0.14), transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 90%, rgba(251,191,36,0.10), transparent 50%)
          `,
        }}
      />

      {/* Soft noise overlay for texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mock browser bar */}
      <div className="relative flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="flex-1 mx-2 h-4 rounded-md bg-white/10 text-[10px] text-zinc-400 flex items-center px-2 font-mono">
          mpgops.com/book/glamour-salon
        </div>
      </div>

      <div className="relative p-3 sm:p-4 space-y-3">
        {/* Business header */}
        <div className="text-center pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
            Hair Salon
          </span>
          <h4 className="text-base font-bold mt-0.5 text-white">Glamour Salon</h4>
          <p className="text-xs text-zinc-400">Book your service in seconds.</p>
        </div>

        {/* Trust chips */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {['No account required', 'Instant booking', 'Free to book'].map((chip) => (
            <span
              key={chip}
              className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Featured service */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
              Featured
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{services[0].name}</p>
              <p className="text-xs text-zinc-400">
                {services[0].price} · {services[0].duration}
              </p>
            </div>
            <span className="text-xs font-semibold bg-amber-500 text-[#0a0a0b] px-2.5 py-1 rounded-lg">
              Book
            </span>
          </div>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-2 gap-2">
          {services.slice(1).map((s) => (
            <div key={s.name} className="rounded-xl border border-white/10 bg-[#0f0f10] p-2.5">
              <p className="text-xs font-medium leading-snug text-zinc-200">{s.name}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {s.price} · {s.duration}
              </p>
              <span className="mt-1.5 block text-center text-[10px] font-semibold border border-white/10 rounded-lg py-0.5 text-zinc-300">
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
      color: 'bg-amber-100 text-amber-700',
      title: t('landing.features.onlineBooking.title') || 'Online Booking Page',
      desc: t('landing.features.onlineBooking.desc') || 'A branded page where customers book 24/7.',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-zinc-100 text-zinc-700',
      title: t('landing.features.smartAvailability.title') || 'Smart Availability',
      desc: t('landing.features.smartAvailability.desc') || 'Prevents double bookings automatically.',
    },
    {
      icon: <Scissors className="w-5 h-5" />,
      color: 'bg-zinc-100 text-zinc-700',
      title: t('landing.features.multiService.title') || 'Multi-Service Booking',
      desc: t('landing.features.multiService.desc') || 'Customers can book multiple services in one go.',
    },
    {
      icon: <Users className="w-5 h-5" />,
      color: 'bg-amber-100 text-amber-700',
      title: t('landing.features.customerManagement.title') || 'Customer Management',
      desc: t('landing.features.customerManagement.desc') || 'Keep records, history, and contacts organised.',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-zinc-100 text-zinc-700',
      title: t('landing.features.mobileFriendly.title') || 'Mobile-Friendly Workspace',
      desc: t('landing.features.mobileFriendly.desc') || 'Run your business from any device, anywhere.',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-amber-100 text-amber-700',
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
        <section className="relative overflow-hidden bg-[#0a0a0b]">
          {/* Subtle background gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(251,191,36,0.12),transparent)]"
          />

          <div className="relative container mx-auto max-w-5xl px-4 pt-12 pb-10 md:pt-20 md:pb-16">
            <div className="max-w-2xl mx-auto text-center">
              {/* Eyebrow */}
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 mb-5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Salons · Barbershops · Spas · Service businesses
                </div>
              </Reveal>

              {/* Headline */}
              <Reveal delay={80}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
                  Run your service business{' '}
                  <span className="text-amber-400">like a pro</span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
                  {t('landing.hero.description') ||
                    'Smart booking, scheduling, and customer management for salons, barbershops, spas, and service businesses — all from your phone.'}
                </p>
              </Reveal>

              {/* CTAs */}
              <Reveal delay={240}>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="h-12 px-8 w-full sm:w-auto rounded-xl text-base font-semibold bg-amber-500 hover:bg-amber-400 text-[#0a0a0b] shadow-lg shadow-amber-500/20 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-amber-500/30"
                    >
                      {t('landing.hero.ctaTrial') || 'Start Free Trial'}
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-8 w-full sm:w-auto rounded-xl text-base bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-300 ease-out hover:scale-[1.02]"
                    >
                      {t('landing.header.signIn') || 'Sign In'}
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <p className="mt-3 text-xs text-zinc-500">
                  {t('landing.hero.tagline') || 'No setup stress · Mobile-friendly · 14-day Pro trial'}
                </p>
              </Reveal>
            </div>

            {/* Product mocks */}
            <Reveal delay={400} distance={32} duration={900}>
              <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-zinc-500 px-1">
                    {t('landing.preview.dashboardLabel') || 'Your Dashboard'} —{' '}
                    <span className="text-zinc-200">Admin view</span>
                  </span>
                  <DashboardMock />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-zinc-500 px-1">
                    {t('landing.preview.publicLabel') || 'Public Booking Page'} —{' '}
                    <span className="text-zinc-200">Customer view</span>
                  </span>
                  <PublicBookingMock />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 2. HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="bg-[#fafafa] py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <Reveal>
              <div className="text-center mb-8 md:mb-10">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  {t('landing.howItWorks.badge') || 'How it works'}
                </span>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                  {t('landing.howItWorks.title') || 'From zero to bookings in minutes'}
                </h2>
                <p className="text-zinc-600 mt-2 max-w-md mx-auto text-sm md:text-base">
                  {t('landing.howItWorks.subtitle') || 'No training required. No setup call. Just sign up and go.'}
                </p>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
              {steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 100}>
                  <div className="relative rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                    {/* Step number */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                        {step.icon}
                      </div>
                      <span className="text-xs font-bold tabular-nums text-zinc-400">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm md:text-base text-zinc-900">{step.label}</h3>
                    <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. PROBLEM / SOLUTION ───────────────────────────────────────── */}
        <section className="bg-white container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Problem */}
            <Reveal direction="left" distance={20}>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                  Without MPG Ops
                </p>
                <h3 className="text-base md:text-lg font-bold mb-4 text-zinc-900">
                  {t('landing.problem.title') || 'Still managing bookings manually?'}
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    t('landing.problem.items.0') || 'Missed messages and lost leads',
                    t('landing.problem.items.1') || 'Double bookings and schedule chaos',
                    t('landing.problem.items.2') || 'No clear view of your day',
                    t('landing.problem.items.3') || 'Customer details scattered everywhere',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-600">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400/80 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Solution */}
            <Reveal direction="right" distance={20} delay={100}>
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 md:p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">
                  With MPG Ops
                </p>
                <h3 className="text-base md:text-lg font-bold mb-4 text-zinc-900">
                  {t('landing.solution.title') || 'Everything in one place'}
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    t('landing.solution.items.0') || 'Professional online booking page',
                    t('landing.solution.items.1') || 'Smart availability and conflict prevention',
                    t('landing.solution.items.2') || 'Clear daily schedule and notifications',
                    t('landing.solution.items.3') || 'Organised customer records',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-800">
                      <CheckCircle2 className="mt-0.5 w-4 h-4 text-amber-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 4. FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="bg-[#fafafa] py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <Reveal>
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                  {t('landing.features.title') || 'Everything you need'}
                </h2>
                <p className="text-zinc-600 mt-2 max-w-lg mx-auto text-sm md:text-base">
                  {t('landing.features.subtitle') || 'Tools designed to save time, reduce no-shows, and grow your business.'}
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="group rounded-xl border border-zinc-200 bg-white p-4 md:p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 ease-out group-hover:scale-110 ${f.color}`}>
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-zinc-900">{f.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. WHY MPG OPS ──────────────────────────────────────────────── */}
        <section className="bg-white container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <Reveal>
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                {t('landing.trust.title') || 'Why service businesses choose MPG Ops'}
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                icon: <Scissors className="w-5 h-5" />,
                color: 'bg-amber-100 text-amber-700',
                title: t('landing.trust.items.0.title') || 'Built for service businesses',
                desc: t('landing.trust.items.0.desc') || 'Designed around salons, barbers, and spas.',
              },
              {
                icon: <Smartphone className="w-5 h-5" />,
                color: 'bg-zinc-100 text-zinc-700',
                title: t('landing.trust.items.1.title') || 'Mobile-first',
                desc: t('landing.trust.items.1.desc') || 'Your desk is your phone. So is ours.',
              },
              {
                icon: <Zap className="w-5 h-5" />,
                color: 'bg-amber-100 text-amber-700',
                title: t('landing.trust.items.2.title') || 'Fast setup',
                desc: t('landing.trust.items.2.desc') || 'Get your booking page live in minutes.',
              },
              {
                icon: <CheckCircle2 className="w-5 h-5" />,
                color: 'bg-zinc-100 text-zinc-700',
                title: t('landing.trust.items.3.title') || 'No coding required',
                desc: t('landing.trust.items.3.desc') || 'Everything is ready to use out of the box.',
              },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 60}>
                <div className="group text-center p-4 md:p-5 rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 ease-out group-hover:scale-110 ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-sm text-zinc-900">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 6. PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="bg-[#fafafa]">
          <PricingSection />
        </section>

        {/* ── 7. FINAL CTA ────────────────────────────────────────────────── */}
        <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <Reveal distance={28} duration={800}>
            <div className="rounded-2xl bg-[#0a0a0b] border border-white/10 px-6 py-10 md:py-14 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {t('landing.cta.title') || 'Ready to simplify your bookings?'}
              </h2>
              <p className="text-zinc-400 mt-3 max-w-lg mx-auto text-sm md:text-base">
                {t('landing.cta.subtitle') ||
                  'Join service businesses using MPG Ops to stay organised and book more appointments.'}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 px-8 w-full sm:w-auto rounded-xl font-semibold bg-amber-500 hover:bg-amber-400 text-[#0a0a0b] shadow-lg shadow-amber-500/20 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-amber-500/30"
                  >
                    {t('landing.hero.ctaTrial') || 'Start Free Trial'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 w-full sm:w-auto rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-300 ease-out hover:scale-[1.02]"
                  >
                    {t('landing.header.signIn') || 'Sign In'}
                  </Button>
                </Link>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                {t('landing.cta.tagline') || '14-day Pro trial · No credit card required'}
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── 8. FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold text-base text-zinc-900">MPG Ops</span>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('landing.footer.tagline') || 'Booking & operations for service businesses'}
              </p>
            </div>
            <div className="flex items-center gap-5 text-sm text-zinc-600">
              <a href="#features" className="hover:text-zinc-900 transition-colors">
                {t('landing.header.features') || 'Features'}
              </a>
              <a href="#pricing" className="hover:text-zinc-900 transition-colors">
                {t('landing.header.pricing') || 'Pricing'}
              </a>
              <Link href="/login" className="hover:text-zinc-900 transition-colors">
                {t('landing.header.signIn') || 'Sign In'}
              </Link>
              <Link href="/register" className="hover:text-zinc-900 transition-colors">
                {t('landing.header.startTrial') || 'Start Free Trial'}
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} MPG Ops. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
