'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Scissors, User } from 'lucide-react';
import type { PublicBusiness } from '@/app/actions/public-booking';
import { formatBookingDate, formatDurationMinutes, formatTime12h } from '@/lib/booking-dates';
import { StepShell } from './step-shell';
import type { WizardState } from '../types';

export function StepReview({
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
      subtitle="Check all details before confirming"
      onBack={onBack}
    >
      {/* Business name header */}
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-extrabold text-primary">
            {business.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Booking at</p>
        <p className="font-display text-xl font-semibold mt-0.5 tracking-tight">{business.name}</p>
      </div>

      {/* Services summary */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 mb-4 shadow-[0_2px_20px_rgba(42,36,32,0.06)]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Services</p>
            <p className="text-sm font-semibold text-foreground">
              {state.services.map((s) => s.public_title ?? s.name).join(' + ')}
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
            ₱{totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Summary rows */}
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
        disabled={isSubmitting}
        className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all disabled:shadow-none disabled:hover:translate-y-0"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Confirming...
          </span>
        ) : (
          'Confirm Booking'
        )}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
        By confirming, you agree to show up for your appointment.
      </p>
    </StepShell>
  );
}
