'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Scissors, User } from 'lucide-react';
import type { PublicBusiness } from '@/app/actions/public-booking';
import { formatBookingDate, formatDurationMinutes, formatTime12h } from '@/lib/booking-dates';
import {
  formatCurrencyAmount,
  type BusinessPaymentSettings,
  type PublicManualPaymentState,
} from '@/lib/business-payment-settings';
import { StepShell } from './step-shell';
import type { WizardState } from '../types';

export function StepReview({
  state,
  business,
  currency,
  manualPaymentState,
  paymentSettings,
  onUploadPaymentProof,
  onRemovePaymentProof,
  isUploadingPaymentProof,
  onConfirm,
  onBack,
  isSubmitting,
  error,
}: {
  state: WizardState;
  business: PublicBusiness;
  currency: string;
  manualPaymentState: PublicManualPaymentState;
  paymentSettings: BusinessPaymentSettings;
  onUploadPaymentProof: (
    file: File
  ) => Promise<{ success: true } | { success: false; error: string }>;
  onRemovePaymentProof: () => void;
  isUploadingPaymentProof: boolean;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [proofError, setProofError] = useState<string | null>(null);

  const totalPrice = useMemo(
    () => state.services.reduce((sum, service) => sum + service.price, 0),
    [state.services]
  );
  const totalDuration = useMemo(
    () => state.services.reduce((sum, service) => sum + service.duration_minutes, 0),
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

  async function handleProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProofError(null);
    const result = await onUploadPaymentProof(file);
    event.target.value = '';

    if (!result.success) {
      setProofError(result.error);
    }
  }

  const amountDueLabel =
    manualPaymentState.amountDue !== null
      ? formatCurrencyAmount(manualPaymentState.amountDue, currency)
      : '—';

  const isConfirmDisabled =
    isSubmitting ||
    isUploadingPaymentProof ||
    (manualPaymentState.requiresProof && !state.manualPaymentProof);

  const uploadedProofName = state.manualPaymentProof?.path.split('/').pop() ?? null;

  return (
    <StepShell
      step={6}
      title="Review your booking"
      subtitle="Check all details before confirming"
      onBack={onBack}
    >
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-extrabold text-primary">
            {business.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Booking at</p>
        <p className="font-display text-xl font-semibold mt-0.5 tracking-tight">{business.name}</p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-4 mb-4 shadow-[0_2px_20px_rgba(42,36,32,0.06)]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Services</p>
            <p className="text-sm font-semibold text-foreground">
              {state.services.map((service) => service.public_title ?? service.name).join(' + ')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <div>
            <span className="font-bold text-sm text-foreground">Total</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDurationMinutes(totalDuration)}
            </p>
          </div>
          <span className="font-display text-2xl font-semibold text-gold">
            {formatCurrencyAmount(totalPrice, currency)}
          </span>
        </div>
      </div>

      {manualPaymentState.showPaymentStep && (
        <div className="rounded-3xl border border-border/60 bg-card p-4 mb-4 shadow-[0_2px_20px_rgba(42,36,32,0.06)] space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Payment
          </p>

          {manualPaymentState.provider === 'gcash_manual' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
                <p className="text-sm font-semibold text-foreground">
                  Step 1: Send {amountDueLabel} to this GCash QR
                </p>
                {paymentSettings.gcash?.qrImageUrl ? (
                  <img
                    src={paymentSettings.gcash.qrImageUrl}
                    alt="GCash QR"
                    className="mt-3 h-44 w-full rounded-lg border object-contain bg-white p-2"
                  />
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    QR image is not available yet.
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Account: {paymentSettings.gcash?.accountName ?? 'Not set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Number: {paymentSettings.gcash?.number ?? 'Not set'}
                </p>
                {paymentSettings.gcash?.instructions && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {paymentSettings.gcash.instructions}
                  </p>
                )}
              </div>

              {manualPaymentState.requiresProof && (
                <div className="space-y-2">
                  <Label htmlFor="manualPaymentProof">Step 2: Upload screenshot</Label>
                  <Input
                    id="manualPaymentProof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProofChange}
                    disabled={isUploadingPaymentProof || isSubmitting}
                    className="h-12 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
                  />
                  {state.manualPaymentProof && (
                    <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs flex items-center justify-between gap-2">
                      <span className="text-success font-medium">
                        Uploaded: {uploadedProofName ?? 'payment-proof'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemovePaymentProof}
                        className="h-7 px-2 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {proofError && (
                    <p className="text-xs text-destructive">{proofError}</p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Step 3: The business confirms your booking.
              </p>
            </div>
          )}

          {manualPaymentState.provider === 'momo_manual' && (
            <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3 space-y-2">
              <p className="text-sm font-semibold">Manual Mobile Money</p>
              {manualPaymentState.amountDue !== null && (
                <p className="text-xs text-muted-foreground">
                  Step 1: Send {amountDueLabel}
                </p>
              )}
              {manualPaymentState.amountDue === null && (
                <p className="text-xs text-muted-foreground">
                  Follow the business instructions below before confirmation.
                </p>
              )}
              {manualPaymentState.amountDue !== null && (
                <p className="text-xs text-muted-foreground">Amount due: {amountDueLabel}</p>
              )}
              {paymentSettings.momo?.accountName && (
                <p className="text-xs text-muted-foreground">
                  Account: {paymentSettings.momo.accountName}
                </p>
              )}
              {paymentSettings.momo?.number && (
                <p className="text-xs text-muted-foreground">
                  Number: {paymentSettings.momo.number}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {paymentSettings.momo?.instructions ??
                  'Mobile money confirmation is handled manually by this business.'}
              </p>
            </div>
          )}

          {manualPaymentState.provider === 'manual' && (
            <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3 space-y-2">
              <p className="text-sm font-semibold">Manual Payment</p>
              {manualPaymentState.amountDue !== null && (
                <p className="text-xs text-muted-foreground">
                  Amount due: {amountDueLabel}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {paymentSettings.manual?.instructions ??
                  'The business will share manual payment instructions after booking.'}
              </p>
            </div>
          )}
        </div>
      )}

      {manualPaymentState.fallbackMessage && (
        <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 mb-4 text-xs text-amber-900">
          {manualPaymentState.fallbackMessage}
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card mb-7 overflow-hidden shadow-[0_2px_20px_rgba(42,36,32,0.06)]">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3.5 ${
              i < rows.length - 1 ? 'border-b border-border/40' : ''
            }`}
          >
            <span className="text-primary/60 mt-0.5 shrink-0">{row.icon}</span>
            <span className="text-xs text-muted-foreground w-14 shrink-0 pt-0.5 font-medium">{row.label}</span>
            <span className="text-sm font-semibold text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium px-4 py-3.5 mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={onConfirm}
        disabled={isConfirmDisabled}
        className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all disabled:shadow-none disabled:hover:translate-y-0"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Confirming...
          </span>
        ) : isUploadingPaymentProof ? (
          'Uploading proof...'
        ) : (
          'Confirm Booking'
        )}
      </Button>
      {manualPaymentState.requiresProof && !state.manualPaymentProof ? (
        <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
          Upload your payment screenshot to continue.
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
          By confirming, you agree to show up for your appointment.
        </p>
      )}
    </StepShell>
  );
}
