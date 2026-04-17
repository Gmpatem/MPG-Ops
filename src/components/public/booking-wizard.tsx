'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors } from 'lucide-react';
import { submitPublicBooking } from '@/app/actions/public-booking';
import type { PublicBusiness, PublicService } from '@/app/actions/public-booking';
import {
  ServiceFirstLanding,
  StepService,
  StepDate,
  StepTime,
  StepDetails,
  StepReview,
} from '@/features/booking-ui';
import type { WizardState } from '@/features/booking-ui';

interface BookingWizardProps {
  business: PublicBusiness;
  services: PublicService[];
}

export function BookingWizard({ business, services }: BookingWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(() => {
    const baseState: WizardState = {
      step: 1,
      services: [],
      date: '',
      time: '',
      name: '',
      phone: '',
      email: '',
      notes: '',
    };

    if (typeof window === 'undefined') {
      return baseState;
    }

    try {
      const raw = localStorage.getItem('mpg_guest');
      if (!raw) return baseState;

      const saved = JSON.parse(raw) as { name?: unknown; phone?: unknown; email?: unknown };
      return {
        ...baseState,
        name: typeof saved.name === 'string' ? saved.name : '',
        phone: typeof saved.phone === 'string' ? saved.phone : '',
        email: typeof saved.email === 'string' ? saved.email : '',
      };
    } catch {
      return baseState;
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <Scissors className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-extrabold mb-2 tracking-tight">No services available</h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
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
