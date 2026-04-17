'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { PublicBusiness, PublicService, PublicSiteSettings } from '@/app/actions/public-booking';
import { computeNextAvailableSlot } from '@/lib/booking-dates';
import { FeaturedServiceCard } from './featured-service-card';
import { GridServiceCard } from './grid-service-card';

export function ServiceFirstLanding({
  business,
  services,
  onSelectService,
}: {
  business: PublicBusiness;
  services: PublicService[];
  onSelectService: (service: PublicService) => void;
}) {
  const typeLabels: Record<string, string> = {
    salon: 'Hair Salon',
    barbershop: 'Barbershop',
    spa: 'Spa & Wellness',
  };

  const settings: PublicSiteSettings = business.public_site_settings ?? {};
  const instructions = settings.instructions ?? null;

  // ── Featured cycle logic ──────────────────────────────────────────────────
  const explicitlyFeatured = services.filter((s) => s.is_featured);
  const featuredCycle =
    explicitlyFeatured.length > 0 ? explicitlyFeatured : services.slice(0, 1);
  const featuredIdSet = new Set(featuredCycle.map((s) => s.id));
  const gridServices = services.filter((s) => !featuredIdSet.has(s.id));

  const [featuredIdx, setFeaturedIdx] = useState(0);
  useEffect(() => {
    if (featuredCycle.length <= 1) return;
    const id = setInterval(
      () => setFeaturedIdx((i) => (i + 1) % featuredCycle.length),
      4000
    );
    return () => clearInterval(id);
  }, [featuredCycle.length]);
  const currentFeatured = featuredCycle[featuredIdx] ?? null;

  // ── Next available slot (client-side only to avoid hydration mismatch) ────
  const nextSlot = useMemo(
    () => computeNextAvailableSlot(business.operating_hours),
    [business.operating_hours]
  );
  const primaryService = currentFeatured ?? services[0] ?? null;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-44 -right-32 hidden h-[460px] w-[460px] rounded-full bg-primary/10 blur-3xl lg:block" />
        <div className="pointer-events-none absolute top-36 -left-20 hidden h-[280px] w-[280px] rounded-full bg-gold/12 blur-3xl lg:block" />

        <div className="mx-auto max-w-lg px-5 pt-7 pb-6 lg:max-w-6xl lg:px-8 lg:pt-12 lg:pb-10">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="animate-fade-up lg:col-span-5">
              {/* ── Header ──────────────────────────────────────────── */}
              <div className="mb-5 flex items-center gap-4 lg:mb-7 lg:items-start lg:gap-5">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-primary/80 font-display text-[26px] font-semibold tracking-tight text-background shadow-[0_8px_32px_rgba(139,110,78,0.2)] flex items-center justify-center lg:h-16 lg:w-16 lg:text-[30px]">
                  {business.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary lg:text-[11px]">
                    {typeLabels[business.business_type] ?? 'Service Business'}
                  </p>
                  <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground lg:text-[40px] lg:leading-[1.02]">
                    {business.name}
                  </h1>
                </div>
              </div>

              {/* Trust Row */}
              <div
                className="flex items-center gap-4 animate-fade-up lg:gap-5"
                style={{ animationDelay: '100ms' }}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                  <span className="h-[18px] w-[18px] rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-success" />
                  </span>
                  No account needed
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                  <span className="h-[18px] w-[18px] rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-success" />
                  </span>
                  Instant confirmation
                </span>
              </div>

              {/* ── Instructions notice ─────────────────────────────────────── */}
              {instructions && (
                <div
                  className="pt-5 animate-fade-up lg:pt-6"
                  style={{ animationDelay: '150ms' }}
                >
                  <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 lg:rounded-3xl lg:px-5 lg:py-4">
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground lg:text-sm">
                      {instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Desktop CTA block ───────────────────────────────────────── */}
              <div
                className="hidden lg:flex animate-fade-up mt-6 rounded-3xl border border-border/60 bg-card px-5 py-5 items-center justify-between gap-4 shadow-[0_8px_32px_rgba(42,36,32,0.08)]"
                style={{ animationDelay: '220ms' }}
              >
                <div className="min-w-0">
                  {nextSlot ? (
                    <>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                        Next available
                      </p>
                      <p className="truncate font-display text-[22px] font-semibold text-foreground leading-none">
                        {nextSlot}
                      </p>
                    </>
                  ) : (
                    <p className="font-display text-[22px] font-semibold text-foreground leading-none">
                      Ready to book?
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (primaryService) onSelectService(primaryService);
                  }}
                  disabled={!primaryService}
                  className="h-12 shrink-0 rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 px-7 text-sm font-semibold text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(42,36,32,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Book now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ── Featured service ────────────────────────────────────────── */}
            {currentFeatured && (
              <div
                className="mt-6 animate-fade-up lg:col-span-7 lg:mt-0"
                style={{ animationDelay: '200ms' }}
              >
                <FeaturedServiceCard
                  service={currentFeatured}
                  onBook={() => onSelectService(currentFeatured)}
                />

                {/* Cycle indicator dots */}
                {featuredCycle.length > 1 && (
                  <div className="flex justify-center gap-2 pt-3.5 lg:pt-4.5">
                    {featuredCycle.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedIdx(i)}
                        aria-label={`View featured service ${i + 1}`}
                        className={`
                          rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                          ${i === featuredIdx
                            ? 'h-1.5 w-6 bg-primary'
                            : 'h-1.5 w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/55'
                          }
                        `}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section Divider ─────────────────────────────────────────── */}
      {gridServices.length > 0 && (
        <div className="mx-auto max-w-lg px-5 pb-8 lg:max-w-6xl lg:px-8 lg:pb-12">
          <div
            className="mb-5 flex items-center gap-4 animate-fade-up lg:mb-7"
            style={{ animationDelay: '250ms' }}
          >
            <div className="h-px flex-1 bg-border" />
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground lg:text-[11px]">
              {gridServices.length === 1 ? 'More Services' : 'All Services'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ── Services grid ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 lg:gap-5">
            {gridServices.map((service, i) => (
              <div
                key={service.id}
                className="animate-scale-in"
                style={{ animationDelay: `${350 + i * 70}ms` }}
              >
                <GridServiceCard
                  service={service}
                  onBook={() => onSelectService(service)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky Bottom Booking Bar ───────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 animate-slide-up lg:hidden"
        style={{ animationDelay: '400ms' }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 border-t border-border/60 bg-card px-6 py-3.5">
          <div className="min-w-0">
            {nextSlot ? (
              <>
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                  Next available
                </p>
                <p className="font-display text-[17px] font-semibold text-foreground truncate">
                  {nextSlot}
                </p>
              </>
            ) : (
              <p className="font-display text-[17px] font-semibold text-foreground">
                Ready to book?
              </p>
            )}
          </div>
          <Button
            onClick={() => {
              if (primaryService) onSelectService(primaryService);
            }}
            disabled={!primaryService}
            className="h-12 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_6px_28px_rgba(42,36,32,0.3)] hover:-translate-y-px active:scale-95 transition-all shrink-0"
          >
            Book now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
