'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, Scissors, User, ArrowRight } from 'lucide-react';
import { formatTime12h, formatBookingDate, formatDurationMinutes } from '@/lib/booking-dates';

interface BookingSuccessViewProps {
  businessId: string;
  businessName: string;
  servicesText: string;
  date: string;
  time: string;
  customerName: string;
  duration: number | null;
  price: number | null;
}

export function BookingSuccessView({
  businessId,
  businessName,
  servicesText,
  date,
  time,
  customerName,
  duration,
  price,
}: BookingSuccessViewProps) {
  const firstName = customerName.split(' ')[0];

  const details = [
    {
      icon: <Scissors className="w-4 h-4" />,
      label: 'Services',
      value: servicesText,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Date',
      value: date ? formatBookingDate(date) : '—',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Time',
      value: time ? formatTime12h(time) : '—',
    },
    {
      icon: <User className="w-4 h-4" />,
      label: 'Name',
      value: customerName,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center px-5 py-8">
        <div className="max-w-lg w-full">
          {/* Success State */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="w-[72px] h-[72px] rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-success" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-[32px] font-semibold text-foreground tracking-tight leading-tight mb-2">
              You&apos;re booked!
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs mx-auto mb-1">
              Your appointment at{' '}
              <span className="font-semibold text-foreground">{businessName}</span>{' '}
              has been confirmed.
            </p>
            <p className="text-[13px] text-muted-foreground">
              We look forward to seeing you, {firstName}.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="rounded-3xl border border-border/60 bg-card p-4 mb-6 shadow-[0_2px_20px_rgba(42,36,32,0.06)] animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Appointment
                </p>
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {servicesText}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/15 overflow-hidden">
              {details.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 ${
                    i < details.length - 1 ? 'border-b border-border/30' : ''
                  }`}
                >
                  <span className="text-primary/60 mt-0.5 shrink-0">{row.icon}</span>
                  <span className="text-xs text-muted-foreground w-14 shrink-0 pt-0.5 font-medium">
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {(duration !== null || price !== null) && (
              <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 mt-3">
                <div>
                  <span className="font-bold text-sm text-foreground">Total</span>
                  {duration !== null && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDurationMinutes(duration)}
                    </p>
                  )}
                </div>
                <span className="font-display text-2xl font-semibold text-gold">
                  {price !== null ? `₱${price.toFixed(2)}` : '—'}
                </span>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Please arrive on time for your appointment.
              Contact the business directly if you need to cancel or reschedule.
            </p>
          </div>

          {/* CTA */}
          <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
            <Link href={`/book/${businessId}`}>
              <Button className="w-full h-14 text-[15px] font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all">
                Book Another Appointment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
