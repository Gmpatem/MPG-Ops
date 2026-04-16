'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Check,
  Clock,
  Calendar,
  User,
  Scissors,
  CheckCircle,
  Star,
} from 'lucide-react';
import {
  submitPublicBooking,
  getPublicBookingsForDate,
} from '@/app/actions/public-booking';
import type { PublicBusiness, PublicService, PublicSiteSettings } from '@/app/actions/public-booking';
import {
  formatTime12h,
  formatBookingDate,
  getUpcomingBookingDates,
  getTimeSlots,
  computeNextAvailableSlot,
  formatDurationMinutes,
} from '@/lib/booking-dates';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  services: PublicService[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface BookingWizardProps {
  business: PublicBusiness;
  services: PublicService[];
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const total = 6;
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">
          Step {step} of {total}
        </span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step Shell ───────────────────────────────────────────────────────────────

function StepShell({
  step,
  title,
  subtitle,
  onBack,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <ProgressBar step={step} />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Featured Service Card ────────────────────────────────────────────────────

function FeaturedServiceCard({
  service,
  onBook,
}: {
  service: PublicService;
  onBook: () => void;
}) {
  const name = service.public_title ?? service.name;
  const desc = service.public_description ?? service.description;

  return (
    <div
      onClick={onBook}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onBook();
      }}
      className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Select ${name}`}
    >
      {/* Full-bleed image or fallback */}
      {service.image_url ? (
        <img
          src={service.image_url}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
            <Scissors className="w-10 h-10" />
            <span className="text-xs font-medium">Featured service</span>
          </div>
        </div>
      )}

      {/* Subtle bottom gradient for overlay blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100/90 border border-amber-200/60 rounded-full px-2 py-0.5 backdrop-blur-sm">
          <Star className="w-3 h-3" />
          Featured
        </span>
      </div>
      {service.promo_badge && (
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-background/90 border border-white/10 rounded-full px-2 py-0.5 backdrop-blur-sm">
            {service.promo_badge}
          </span>
        </div>
      )}

      {/* Compact floating bottom overlay */}
      <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-md rounded-xl border border-white/10 shadow-sm p-3 pointer-events-none">
        {/* Line 1: Service name */}
        <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight line-clamp-1 mb-0.5">
          {name}
        </h3>

        {/* Line 2: Price + duration */}
        <p className="text-xs text-muted-foreground mb-1.5">
          ₱{service.price.toFixed(0)} • {service.duration_minutes} min
        </p>

        {/* Line 3: Short descriptor + inline Book CTA */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground line-clamp-1 min-w-0">
            {desc || service.promo_text || '\u00A0'}
          </p>
          <span className="text-xs font-semibold text-primary whitespace-nowrap">
            Select →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Grid Service Card ────────────────────────────────────────────────────────

function GridServiceCard({
  service,
  onBook,
}: {
  service: PublicService;
  onBook: () => void;
}) {
  const name = service.public_title ?? service.name;

  return (
    <div className="rounded-xl border bg-card overflow-hidden flex flex-col">
      {service.image_url ? (
        <div className="w-full h-28 bg-muted">
          <img
            src={service.image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-20 bg-muted/60 flex items-center justify-center">
          <Scissors className="w-6 h-6 text-muted-foreground/40" />
        </div>
      )}
      <div className="p-2.5 flex flex-col flex-1">
        <p className="font-medium text-sm leading-tight line-clamp-1 mb-0.5">{name}</p>
        <p className="text-xs text-muted-foreground mb-2">
          ₱{service.price.toFixed(0)} • {service.duration_minutes} min
        </p>
        <div className="mt-auto">
          <Button
            onClick={onBook}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs font-medium rounded-lg"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Storefront Landing ───────────────────────────────────────────────

function ServiceFirstLanding({
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
  const [nextSlot, setNextSlot] = useState<string | null>(null);
  useEffect(() => {
    setNextSlot(computeNextAvailableSlot(business.operating_hours));
  }, [business.operating_hours]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Compact Premium Header ──────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 max-w-lg mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">
              {typeLabels[business.business_type] ?? 'Service Business'}
            </p>
            <h1 className="text-xl font-bold tracking-tight truncate">
              {business.name}
            </h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {business.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Trust Row ───────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
            No account required
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
            Instant confirmation
          </span>
        </div>
      </div>

      {/* ── Instructions notice (compact) ───────────────────────────────── */}
      {instructions && (
        <div className="px-4 pb-4 max-w-lg mx-auto">
          <div className="rounded-lg border bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {instructions}
            </p>
          </div>
        </div>
      )}

      {/* ── Featured service ────────────────────────────────────────────── */}
      {currentFeatured && (
        <div className="px-4 pb-5 max-w-lg mx-auto">
          <FeaturedServiceCard
            service={currentFeatured}
            onBook={() => onSelectService(currentFeatured)}
          />
          {/* Cycle indicator dots */}
          {featuredCycle.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2.5">
              {featuredCycle.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIdx(i)}
                  aria-label={`View featured service ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === featuredIdx ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Services grid ───────────────────────────────────────────────── */}
      {gridServices.length > 0 && (
        <div className="px-4 pb-8 max-w-lg mx-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {gridServices.length === 1 ? 'More Services' : 'All Services'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {gridServices.map((service) => (
              <GridServiceCard
                key={service.id}
                service={service}
                onBook={() => onSelectService(service)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky Bottom Booking Bar ───────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 backdrop-blur px-4 py-3 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            {nextSlot ? (
              <>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Next available
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {nextSlot}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-foreground">
                Ready to book?
              </p>
            )}
          </div>
          <Button
            onClick={() => onSelectService(currentFeatured || services[0])}
            className="h-10 px-5 text-sm font-semibold rounded-lg shrink-0"
          >
            Book now
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Choose Services (multi-select) ───────────────────────────────────

function StepService({
  services,
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  services: PublicService[];
  selected: PublicService[];
  onToggle: (service: PublicService) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const totalPrice = useMemo(
    () => selected.reduce((sum, s) => sum + s.price, 0),
    [selected]
  );
  const totalDuration = useMemo(
    () => selected.reduce((sum, s) => sum + s.duration_minutes, 0),
    [selected]
  );

  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected]
  );

  return (
    <StepShell
      step={2}
      title="Choose services"
      subtitle="Select one or more services for your appointment."
      onBack={onBack}
    >
      <div className="space-y-3 mb-4">
        {services.map((service) => {
          const isSelected = selectedIds.has(service.id);
          return (
            <button
              key={service.id}
              onClick={() => onToggle(service)}
              className={`w-full text-left rounded-xl border-2 p-3 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {service.image_url && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={service.image_url}
                      alt={service.public_title ?? service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {service.is_featured && (
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-sm">
                      {service.public_title ?? service.name}
                    </span>
                    {service.promo_badge && (
                      <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0 px-1.5">
                        {service.promo_badge}
                      </Badge>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                  {(service.public_description ?? service.description) && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {service.public_description ?? service.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    ₱{service.price.toFixed(0)} • {service.duration_minutes} min
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compact summary */}
      {selected.length > 0 && (
        <div className="rounded-xl border bg-muted/40 px-4 py-3 mb-4">
          <p className="text-xs text-muted-foreground mb-0.5">Selected</p>
          <p className="text-sm font-medium line-clamp-1">
            {selected.map((s) => s.public_title ?? s.name).join(' + ')}
          </p>
          <p className="text-xs text-foreground mt-1">
            ₱{totalPrice.toFixed(0)} • {formatDurationMinutes(totalDuration)}
          </p>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={selected.length === 0}
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        Continue
      </Button>
    </StepShell>
  );
}

// ─── Step 3: Choose Date (tapable chips) ──────────────────────────────────────

function StepDate({
  date,
  onDateChange,
  onNext,
  onBack,
}: {
  date: string;
  onDateChange: (d: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return d;
  }, [today, monthOffset]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const result: { value: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean }[] = [];

    // leading padding
    for (let i = 0; i < startDay; i++) {
      result.push({ value: '', dayNum: 0, isCurrentMonth: false, isPast: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      result.push({ value, dayNum: d, isCurrentMonth: true, isPast });
    }

    // trailing padding to fill 6 rows (42 cells)
    const remaining = 42 - result.length;
    for (let i = 0; i < remaining; i++) {
      result.push({ value: '', dayNum: 0, isCurrentMonth: false, isPast: false });
    }

    return result;
  }, [currentMonth, today]);

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <StepShell
      step={3}
      title="Pick a date"
      subtitle="Choose when you'd like your appointment."
      onBack={onBack}
    >
      <div className="mb-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMonthOffset((m) => m - 1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-sm font-semibold">{monthLabel}</p>
          <button
            onClick={() => setMonthOffset((m) => m + 1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Next month"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((wd) => (
            <div key={wd} className="text-center text-[10px] font-medium text-muted-foreground uppercase">
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, idx) => {
            if (!d.isCurrentMonth) {
              return <div key={idx} className="aspect-square" />;
            }
            const isSelected = date === d.value;
            const isToday = d.value === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            return (
              <button
                key={d.value}
                disabled={d.isPast}
                onClick={() => onDateChange(d.value)}
                className={`
                  aspect-square rounded-lg border-2 text-sm font-medium transition-all
                  flex items-center justify-center
                  ${isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : d.isPast
                    ? 'border-transparent text-muted-foreground/40 cursor-not-allowed'
                    : isToday
                    ? 'border-primary/40 bg-primary/10 text-primary hover:border-primary/70'
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                {d.dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {date && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 mb-6">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium">{formatBookingDate(date)}</span>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!date}
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        Continue
      </Button>
    </StepShell>
  );
}

// ─── Step 4: Choose Time ──────────────────────────────────────────────────────

function StepTime({
  date,
  time,
  business,
  totalDurationMinutes,
  onTimeSelect,
  onNext,
  onBack,
}: {
  date: string;
  time: string;
  business: PublicBusiness;
  totalDurationMinutes: number;
  onTimeSelect: (t: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [existingBookings, setExistingBookings] = useState<{ start_time: string; end_time: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPublicBookingsForDate(business.id, date).then((bookings) => {
      if (!cancelled) setExistingBookings(bookings);
    });
    return () => {
      cancelled = true;
    };
  }, [business.id, date]);

  const slots = useMemo(
    () => getTimeSlots(date, business.operating_hours, totalDurationMinutes, existingBookings),
    [date, business.operating_hours, totalDurationMinutes, existingBookings]
  );

  return (
    <StepShell
      step={4}
      title="Choose a time"
      subtitle={`Available slots for ${formatBookingDate(date)}`}
      onBack={onBack}
    >
      {slots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold mb-1">No available slots</p>
          <p className="text-sm text-muted-foreground mb-6">
            The business is closed or fully booked for this date. Please choose another day.
          </p>
          <Button variant="outline" onClick={onBack}>
            Choose Another Date
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-8">
            {slots.map((slot) => {
              const isSelected = time === slot;
              return (
                <button
                  key={slot}
                  onClick={() => onTimeSelect(slot)}
                  className={`h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {formatTime12h(slot)}
                </button>
              );
            })}
          </div>

          <Button
            onClick={onNext}
            disabled={!time}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            Continue
          </Button>
        </>
      )}
    </StepShell>
  );
}

// ─── Step 5: Customer Details ─────────────────────────────────────────────────

function StepDetails({
  name,
  phone,
  email,
  notes,
  onChange,
  onNext,
  onBack,
}: {
  name: string;
  phone: string;
  email: string;
  notes: string;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNext() {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onNext();
  }

  return (
    <StepShell
      step={5}
      title="Your details"
      subtitle="We need a few details to confirm your booking."
      onBack={onBack}
    >
      <div className="space-y-4 mb-8">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Maria Santos"
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`h-12 text-base ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. 09171234567"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`h-12 text-base ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Any special requests or notes for your appointment..."
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
            className="min-h-20 resize-none text-base"
          />
        </div>
      </div>

      <Button onClick={handleNext} className="w-full h-12 text-base font-semibold rounded-xl">
        Review Booking
      </Button>
    </StepShell>
  );
}

// ─── Step 6: Review & Confirm ─────────────────────────────────────────────────

function StepReview({
  state,
  business,
  onConfirm,
  onBack,
  isSubmitting,
  error,
}: {
  state: WizardState;
  business: PublicBusiness;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const totalPrice = useMemo(
    () => state.services.reduce((sum, s) => sum + s.price, 0),
    [state.services]
  );
  const totalDuration = useMemo(
    () => state.services.reduce((sum, s) => sum + s.duration_minutes, 0),
    [state.services]
  );

  const rows = [
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Date',
      value: state.date ? formatBookingDate(state.date) : '—',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Time',
      value: state.time ? formatTime12h(state.time) : '—',
    },
    { icon: <User className="w-4 h-4" />, label: 'Name', value: state.name },
    { icon: <User className="w-4 h-4" />, label: 'Phone', value: state.phone },
  ];

  if (state.email) {
    rows.push({ icon: <User className="w-4 h-4" />, label: 'Email', value: state.email });
  }
  if (state.notes) {
    rows.push({ icon: <User className="w-4 h-4" />, label: 'Notes', value: state.notes });
  }

  return (
    <StepShell
      step={6}
      title="Review your booking"
      subtitle="Check all details before confirming."
      onBack={onBack}
    >
      {/* Business name header */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">Booking at</p>
        <p className="text-xl font-bold mt-0.5">{business.name}</p>
      </div>

      {/* Services summary */}
      <div className="rounded-xl border bg-card px-4 py-3 mb-4">
        <div className="flex items-start gap-3 mb-2">
          <Scissors className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-0.5">Services</p>
            <p className="text-sm font-medium">
              {state.services.map((s) => s.public_title ?? s.name).join(' + ')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
          <span className="font-medium text-sm">Total</span>
          <span className="text-lg font-bold text-primary">
            ₱{totalPrice.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDurationMinutes(totalDuration)} total
        </p>
      </div>

      {/* Summary rows */}
      <div className="rounded-xl border bg-card mb-6 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3 ${
              i < rows.length - 1 ? 'border-b' : ''
            }`}
          >
            <span className="text-muted-foreground mt-0.5 shrink-0">{row.icon}</span>
            <span className="text-sm text-muted-foreground w-14 shrink-0">{row.label}</span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="w-full h-14 text-base font-semibold rounded-xl"
      >
        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-3">
        By confirming, you agree to show up for your appointment.
      </p>
    </StepShell>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function BookingWizard({ business, services }: BookingWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    step: 1,
    services: [],
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Restore guest details from a previous booking on this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mpg_guest');
      if (!raw) return;
      const saved = JSON.parse(raw) as { name?: unknown; phone?: unknown; email?: unknown };
      setState((s) => ({
        ...s,
        name: typeof saved.name === 'string' ? saved.name : s.name,
        phone: typeof saved.phone === 'string' ? saved.phone : s.phone,
        email: typeof saved.email === 'string' ? saved.email : s.email,
      }));
    } catch {
      // localStorage unavailable or parse error — silently ignore
    }
  }, []);

  function next() {
    setState((s) => ({ ...s, step: (s.step + 1) as WizardState['step'] }));
  }

  function back() {
    setState((s) => ({ ...s, step: (s.step - 1) as WizardState['step'] }));
  }

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  // Called from landing — preselects service and jumps to service selection step
  function handleSelectService(service: PublicService) {
    setState((s) => ({
      ...s,
      services: s.services.some((x) => x.id === service.id)
        ? s.services
        : [...s.services, service],
      step: 2,
    }));
  }

  function handleToggleService(service: PublicService) {
    setState((s) => {
      const exists = s.services.some((x) => x.id === service.id);
      if (exists) {
        return { ...s, services: s.services.filter((x) => x.id !== service.id) };
      }
      return { ...s, services: [...s.services, service] };
    });
  }

  async function handleConfirm() {
    if (state.services.length === 0 || !state.date || !state.time) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitPublicBooking({
      businessId: business.id,
      serviceIds: state.services.map((s) => s.id),
      bookingDate: state.date,
      startTime: state.time,
      customerName: state.name,
      customerPhone: state.phone,
      customerEmail: state.email,
      notes: state.notes,
    });

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    // Persist guest details for faster repeat bookings on this device
    try {
      localStorage.setItem(
        'mpg_guest',
        JSON.stringify({ name: state.name, phone: state.phone, email: state.email })
      );
    } catch {
      // localStorage unavailable — silently ignore
    }

    // Navigate to success page with query params
    const params = new URLSearchParams({
      services: result.confirmation.allServiceNames.join(', '),
      date: result.confirmation.bookingDate,
      time: result.confirmation.startTime,
      name: result.confirmation.customerName,
      business: result.confirmation.businessName,
      duration: String(result.confirmation.totalDurationMinutes),
      price: String(result.confirmation.totalPrice),
    });
    router.push(`/book/${business.id}/success?${params.toString()}`);
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <Scissors className="w-10 h-10 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No services available</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          This business hasn&apos;t added any bookable services yet. Check back later.
        </p>
      </div>
    );
  }

  if (state.step === 1) {
    return (
      <ServiceFirstLanding
        business={business}
        services={services}
        onSelectService={handleSelectService}
      />
    );
  }

  if (state.step === 2) {
    return (
      <StepService
        services={services}
        selected={state.services}
        onToggle={handleToggleService}
        onNext={next}
        onBack={back}
      />
    );
  }

  if (state.step === 3) {
    return (
      <StepDate
        date={state.date}
        onDateChange={(d) => {
          set('date', d);
          set('time', ''); // reset time on date change
        }}
        onNext={next}
        onBack={back}
      />
    );
  }

  if (state.step === 4) {
    return (
      <StepTime
        date={state.date}
        time={state.time}
        business={business}
        totalDurationMinutes={state.services.reduce((sum, s) => sum + s.duration_minutes, 0)}
        onTimeSelect={(t) => set('time', t)}
        onNext={next}
        onBack={back}
      />
    );
  }

  if (state.step === 5) {
    return (
      <StepDetails
        name={state.name}
        phone={state.phone}
        email={state.email}
        notes={state.notes}
        onChange={(field, value) => set(field as keyof WizardState, value)}
        onNext={next}
        onBack={back}
      />
    );
  }

  return (
    <StepReview
      state={state}
      business={business}
      onConfirm={handleConfirm}
      onBack={back}
      isSubmitting={isSubmitting}
      error={submitError}
    />
  );
}
