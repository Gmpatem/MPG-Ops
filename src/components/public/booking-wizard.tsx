'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors } from 'lucide-react';
import {
  submitPublicBooking,
  uploadPublicBookingPaymentProof,
} from '@/app/actions/public-booking';
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
import {
  buildPublicManualPaymentState,
  normalizeBusinessRegionPaymentConfig,
} from '@/lib/business-payment-settings';

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
      manualPaymentProof: null,
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
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalDurationMinutes = useMemo(
    () => state.services.reduce((sum, service) => sum + service.duration_minutes, 0),
    [state.services]
  );
  const totalPrice = useMemo(
    () => state.services.reduce((sum, service) => sum + service.price, 0),
    [state.services]
  );
  const normalizedRegionPayment = useMemo(
    () =>
      normalizeBusinessRegionPaymentConfig({
        country: business.country,
        currency: business.currency,
        defaultPaymentMethod: business.default_payment_method,
        paymentSettingsRaw: business.payment_settings,
      }),
    [business.country, business.currency, business.default_payment_method, business.payment_settings]
  );
  const manualPaymentState = useMemo(
    () =>
      buildPublicManualPaymentState(
        {
          country: normalizedRegionPayment.country,
          defaultPaymentMethod: normalizedRegionPayment.defaultPaymentMethod,
          paymentSettings: normalizedRegionPayment.paymentSettings,
        },
        totalPrice
      ),
    [normalizedRegionPayment, totalPrice]
  );

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

  async function handleUploadPaymentProof(file: File): Promise<{ success: true } | { success: false; error: string }> {
    setIsUploadingProof(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.set('businessId', business.id);
    formData.set('proofFile', file);

    const result = await uploadPublicBookingPaymentProof(formData);
    setIsUploadingProof(false);

    if (!result.success) {
      setSubmitError(result.error);
      return { success: false, error: result.error };
    }

    setState((current) => ({
      ...current,
      manualPaymentProof: result.proof,
    }));
    return { success: true };
  }

  function handleRemovePaymentProof() {
    setState((current) => ({
      ...current,
      manualPaymentProof: null,
    }));
  }

  async function handleConfirm() {
    if (state.services.length === 0 || !state.date || !state.time) return;
    if (manualPaymentState.requiresProof && !state.manualPaymentProof) {
      setSubmitError('Please upload your payment screenshot before confirming.');
      return;
    }
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
      manualPaymentProof: state.manualPaymentProof ?? undefined,
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
      currency: normalizedRegionPayment.currency,
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
        currency={normalizedRegionPayment.currency}
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
        totalDurationMinutes={totalDurationMinutes}
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
      currency={normalizedRegionPayment.currency}
      manualPaymentState={manualPaymentState}
      paymentSettings={normalizedRegionPayment.paymentSettings}
      onUploadPaymentProof={handleUploadPaymentProof}
      onRemovePaymentProof={handleRemovePaymentProof}
      isUploadingPaymentProof={isUploadingProof}
      onConfirm={handleConfirm}
      onBack={back}
      isSubmitting={isSubmitting}
      error={submitError}
    />
  );
}
