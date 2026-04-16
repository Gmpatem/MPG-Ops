'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Check, Clock, Calendar, User, Scissors, CheckCircle, Star } from 'lucide-react';
import { submitPublicBooking } from '@/app/actions/public-booking';
import type { PublicBusiness, PublicService, PublicSiteSettings } from '@/app/actions/public-booking';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  service: PublicService | null;
  date: string;    // YYYY-MM-DD
  time: string;    // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface BookingWizardProps {
  business: PublicBusiness;
  services: PublicService[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getTimeSlots(
  dateStr: string,
  operatingHours: PublicBusiness['operating_hours']
): string[] {
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const [y, mo, d] = dateStr.split('-').map(Number);
  const dayName = DAYS[new Date(y, mo - 1, d).getDay()];

  let openH = 9,  openM = 0;
  let closeH = 18, closeM = 0;

  if (operatingHours && Object.keys(operatingHours).length > 0) {
    const day = operatingHours[dayName];
    if (!day || !day.isOpen) return [];    // closed
    const [oh, om] = day.open.split(':').map(Number);
    const [ch, cm] = day.close.split(':').map(Number);
    openH = oh; openM = om;
    closeH = ch; closeM = cm;
  }

  const slots: string[] = [];
  let cur = openH * 60 + openM;
  const end = closeH * 60 + closeM;
  while (cur < end) {
    slots.push(
      `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`
    );
    cur += 30;
  }
  return slots;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const total = 6;
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">Step {step} of {total}</span>
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

// ─── Landing Service Card ─────────────────────────────────────────────────────

function LandingServiceCard({
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
      className={`rounded-xl border bg-card overflow-hidden ${
        service.is_featured ? 'border-amber-200 bg-amber-50/30' : ''
      }`}
    >
      <div className="px-4 py-3.5">
        {/* Row 1: name + price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {service.is_featured && (
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="font-semibold text-sm leading-snug">{name}</span>
            {service.promo_badge && (
              <Badge className="text-xs shrink-0 bg-primary/10 text-primary border-0 px-1.5 ml-0.5">
                {service.promo_badge}
              </Badge>
            )}
          </div>
          <span className="text-sm font-bold text-primary shrink-0 leading-snug">
            ₱{service.price.toFixed(0)}
          </span>
        </div>

        {/* Row 2: duration + promo text */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{service.duration_minutes} min</span>
          {service.promo_text && (
            <>
              <span aria-hidden>·</span>
              <span className="text-primary font-medium">{service.promo_text}</span>
            </>
          )}
        </div>

        {/* Optional description */}
        {desc && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{desc}</p>
        )}

        {/* Book button */}
        <Button
          onClick={onBook}
          className="w-full h-10 text-sm font-semibold rounded-lg"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}

// ─── Step 1: Service-First Landing ────────────────────────────────────────────

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

  return (
    <div className="min-h-screen bg-background">
      {/* Business identity */}
      <div className="px-4 pt-8 pb-5 max-w-lg mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
          {typeLabels[business.business_type] ?? 'Service Business'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{business.name}</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
          No account required · Book in seconds
        </p>

        {instructions && (
          <div className="mt-4 rounded-lg border bg-muted/40 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Please note
            </p>
            <p className="text-sm">{instructions}</p>
          </div>
        )}
      </div>

      {/* Services list */}
      <div className="px-4 pb-12 max-w-lg mx-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {services.length === 1 ? '1 Service' : `${services.length} Services`}
        </p>
        <div className="space-y-2.5">
          {services.map((service) => (
            <LandingServiceCard
              key={service.id}
              service={service}
              onBook={() => onSelectService(service)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
          Free to book · Instant confirmation
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Choose Service ───────────────────────────────────────────────────

function StepService({
  services,
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  services: PublicService[];
  selected: PublicService | null;
  onSelect: (s: PublicService) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <StepShell
      step={2}
      title="Choose a service"
      subtitle="Select the service you'd like to book."
      onBack={onBack}
    >
      <div className="space-y-3 mb-8">
        {services.map((service) => {
          const isSelected = selected?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : service.is_featured
                  ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {service.is_featured && (
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-base">
                      {service.public_title ?? service.name}
                    </span>
                    {service.promo_badge && (
                      <Badge className="text-xs shrink-0 bg-primary/10 text-primary border-0 px-1.5">
                        {service.promo_badge}
                      </Badge>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                  {(service.public_description ?? service.description) && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {service.public_description ?? service.description}
                    </p>
                  )}
                  {service.promo_text && (
                    <p className="text-xs text-primary mt-1 font-medium">
                      {service.promo_text}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {service.duration_minutes} min
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary shrink-0">
                  ₱{service.price.toFixed(0)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!selected}
        className="w-full h-14 text-base font-semibold rounded-xl"
      >
        Continue
      </Button>
    </StepShell>
  );
}

// ─── Step 3: Choose Date ──────────────────────────────────────────────────────

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
  const today = todayString();
  const isValid = date >= today;

  return (
    <StepShell
      step={3}
      title="Pick a date"
      subtitle="Choose when you'd like your appointment."
      onBack={onBack}
    >
      <div className="mb-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bookingDate" className="text-sm font-medium">
            Appointment date
          </Label>
          <input
            id="bookingDate"
            type="date"
            min={today}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-14 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {date && !isValid && (
          <p className="text-sm text-red-600">Please select today or a future date.</p>
        )}

        {date && isValid && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium">{formatDate(date)}</span>
          </div>
        )}
      </div>

      <Button
        onClick={onNext}
        disabled={!date || !isValid}
        className="w-full h-14 text-base font-semibold rounded-xl"
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
  onTimeSelect,
  onNext,
  onBack,
}: {
  date: string;
  time: string;
  business: PublicBusiness;
  onTimeSelect: (t: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const slots = getTimeSlots(date, business.operating_hours);

  return (
    <StepShell
      step={4}
      title="Choose a time"
      subtitle={`Available slots for ${formatDate(date)}`}
      onBack={onBack}
    >
      {slots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold mb-1">Closed on this day</p>
          <p className="text-sm text-muted-foreground mb-6">
            The business is not available on this date. Please choose another day.
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
                  {formatTime(slot)}
                </button>
              );
            })}
          </div>

          <Button
            onClick={onNext}
            disabled={!time}
            className="w-full h-14 text-base font-semibold rounded-xl"
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

      <Button
        onClick={handleNext}
        className="w-full h-14 text-base font-semibold rounded-xl"
      >
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
  const rows = [
    { icon: <Scissors className="w-4 h-4" />, label: 'Service', value: state.service ? (state.service.public_title ?? state.service.name) : '—' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Date', value: state.date ? formatDate(state.date) : '—' },
    { icon: <Clock className="w-4 h-4" />, label: 'Time', value: state.time ? formatTime(state.time) : '—' },
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

      {/* Price */}
      {state.service && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 mb-4">
          <span className="font-medium text-sm">Total</span>
          <span className="text-xl font-bold text-primary">
            ₱{state.service.price.toFixed(2)}
          </span>
        </div>
      )}

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
    service: null,
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

  // Called from landing — preselects service and jumps straight to date step
  function handleSelectService(service: PublicService) {
    setState((s) => ({ ...s, service, step: 3 }));
  }

  async function handleConfirm() {
    if (!state.service || !state.date || !state.time) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitPublicBooking({
      businessId: business.id,
      serviceId: state.service.id,
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
      service: result.confirmation.serviceName,
      date: result.confirmation.bookingDate,
      time: result.confirmation.startTime,
      name: result.confirmation.customerName,
      business: result.confirmation.businessName,
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
        selected={state.service}
        onSelect={(s) => set('service', s)}
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
