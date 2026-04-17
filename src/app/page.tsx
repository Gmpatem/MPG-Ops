'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/marketing/pricing-section';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';
import {
  Calendar,
  Users,
  Scissors,
  Clock,
  Smartphone,
  Zap,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();

  const featureItems = [
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      title: t('landing.features.onlineBooking.title'),
      desc: t('landing.features.onlineBooking.desc'),
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: t('landing.features.smartAvailability.title'),
      desc: t('landing.features.smartAvailability.desc'),
    },
    {
      icon: <Scissors className="w-5 h-5 text-primary" />,
      title: t('landing.features.multiService.title'),
      desc: t('landing.features.multiService.desc'),
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: t('landing.features.customerManagement.title'),
      desc: t('landing.features.customerManagement.desc'),
    },
    {
      icon: <Smartphone className="w-5 h-5 text-primary" />,
      title: t('landing.features.mobileFriendly.title'),
      desc: t('landing.features.mobileFriendly.desc'),
    },
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      title: t('landing.features.fastSetup.title'),
      desc: t('landing.features.fastSetup.desc'),
    },
  ];

  const trustItems = [
    { title: t('landing.trust.items.0.title'), desc: t('landing.trust.items.0.desc') },
    { title: t('landing.trust.items.1.title'), desc: t('landing.trust.items.1.desc') },
    { title: t('landing.trust.items.2.title'), desc: t('landing.trust.items.2.desc') },
    { title: t('landing.trust.items.3.title'), desc: t('landing.trust.items.3.desc') },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <span className="font-bold text-xl">MPG Ops</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher variant="dropdown" />
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">{t('landing.header.signIn')}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t('landing.header.startTrial')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. Hero */}
        <section className="container mx-auto px-4 pt-14 pb-10 md:pt-24 md:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.hero.description')}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 w-full sm:w-auto">
                  {t('landing.hero.ctaTrial')}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="h-12 px-8 w-full sm:w-auto">
                  {t('landing.hero.ctaDemo')}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t('landing.hero.tagline')}
            </p>
          </div>
        </section>

        {/* 2. Problem → Solution */}
        <section className="bg-muted/40 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {t('landing.problem.title')}
                </h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    t('landing.problem.items.0'),
                    t('landing.problem.items.1'),
                    t('landing.problem.items.2'),
                    t('landing.problem.items.3'),
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {t('landing.solution.title')}
                </h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    t('landing.solution.items.0'),
                    t('landing.solution.items.1'),
                    t('landing.solution.items.2'),
                    t('landing.solution.items.3'),
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Product Preview */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {t('landing.preview.title')}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                {t('landing.preview.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Dashboard Preview Card */}
              <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">{t('landing.preview.dashboardLabel')}</h3>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {t('landing.preview.dashboardBadge')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="rounded-xl border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Bookings</span>
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-lg font-bold mt-1">12</div>
                    <p className="text-[10px] text-muted-foreground">3 done, 9 pending</p>
                  </div>
                  <div className="rounded-xl border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Revenue</span>
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-lg font-bold mt-1">₱4,200</div>
                    <p className="text-[10px] text-muted-foreground">8 payments</p>
                  </div>
                  <div className="rounded-xl border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Customers</span>
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-lg font-bold mt-1">86</div>
                    <p className="text-[10px] text-muted-foreground">Registered</p>
                  </div>
                  <div className="rounded-xl border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Services</span>
                      <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-lg font-bold mt-1">14</div>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border bg-background p-3">
                  <div className="text-[10px] text-muted-foreground mb-2">Today&apos;s Schedule</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-12 text-xs font-medium">10:00</div>
                        <span className="truncate">Maria Santos</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Haircut</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-12 text-xs font-medium">11:30</div>
                        <span className="truncate">Jenny Cruz</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Facial</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Booking Preview Card */}
              <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">{t('landing.preview.publicLabel')}</h3>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {t('landing.preview.publicBadge')}
                  </span>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">
                    Hair Salon
                  </p>
                  <h4 className="text-lg font-bold">Glamour Salon</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Book your service in seconds.
                  </p>
                  <div className="mt-4 rounded-xl overflow-hidden border bg-muted h-32 flex items-center justify-center">
                    <div className="text-center">
                      <Scissors className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">Featured Service</span>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-background/90 border p-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Signature Facial</p>
                        <p className="text-xs text-muted-foreground">₱1200 • 60 min</p>
                      </div>
                      <span className="text-xs font-semibold text-primary">Book →</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-muted/50 p-2">
                      <p className="text-xs font-medium">Haircut</p>
                      <p className="text-[10px] text-muted-foreground">₱350 • 30 min</p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-2">
                      <p className="text-xs font-medium">Color</p>
                      <p className="text-[10px] text-muted-foreground">₱1500 • 90 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Key Features */}
        <section className="bg-muted/40 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('landing.features.title')}</h2>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                  {t('landing.features.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((f) => (
                  <div key={f.title} className="rounded-xl border bg-card p-5">
                    <div className="mb-3">{f.icon}</div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Trust / Why Choose Us */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('landing.trust.title')}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {trustItems.map((item, idx) => (
                <div key={idx} className="text-center p-4">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Pricing */}
        <PricingSection />

        {/* 7. Final CTA */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-3xl mx-auto text-center rounded-2xl bg-primary px-6 py-10 md:py-14">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
              {t('landing.cta.title')}
            </h2>
            <p className="text-primary-foreground/90 mt-3 max-w-lg mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="h-12 px-8 w-full sm:w-auto">
                  {t('landing.hero.ctaTrial')}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {t('landing.header.signIn')}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-primary-foreground/80">
              {t('landing.cta.tagline')}
            </p>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">MPG Ops</span>
              <span className="text-xs text-muted-foreground">
                {t('landing.footer.tagline')}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                {t('landing.header.signIn')}
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                {t('landing.header.startTrial')}
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
}
