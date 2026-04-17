'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import type { PublicBusiness } from '@/app/actions/public-booking';
import { getPublicBookingsForDate } from '@/app/actions/public-booking';
import { formatTime12h, getTimeSlots } from '@/lib/booking-dates';
import { StepShell } from './step-shell';

export function StepTime({
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

  const morningSlots = useMemo(() => slots.filter(s => parseInt(s.split(':')[0]) < 12), [slots]);
  const afternoonSlots = useMemo(() => slots.filter(s => {
    const h = parseInt(s.split(':')[0]);
    return h >= 12 && h < 17;
  }), [slots]);
  const eveningSlots = useMemo(() => slots.filter(s => parseInt(s.split(':')[0]) >= 17), [slots]);

  const renderSlotGroup = (label: string, groupSlots: string[]) => {
    if (groupSlots.length === 0) return null;
    return (
      <div className="mb-5">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">{label}</p>
        <div className="grid grid-cols-3 gap-2">
          {groupSlots.map((slot) => {
            const isSelected = time === slot;
            return (
              <button
                key={slot}
                onClick={() => onTimeSelect(slot)}
                className={`
                  h-12 rounded-xl text-sm font-semibold transition-all duration-200
                  active:scale-95
                  ${isSelected
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 font-bold'
                    : 'bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground'
                  }
                `}
              >
                {formatTime12h(slot)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <StepShell
      step={4}
      title="Choose a time"
      subtitle={`Available slots for ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      onBack={onBack}
    >
      {slots.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-bold text-lg mb-1.5">No available slots</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-[260px] mx-auto leading-relaxed">
            The business is closed or fully booked for this date. Please choose another day.
          </p>
          <Button variant="outline" onClick={onBack} className="rounded-xl h-11 px-6 font-semibold">
            Choose Another Date
          </Button>
        </div>
      ) : (
        <>
          {renderSlotGroup('Morning', morningSlots)}
          {renderSlotGroup('Afternoon', afternoonSlots)}
          {renderSlotGroup('Evening', eveningSlots)}

          <Button
            onClick={onNext}
            disabled={!time}
            className="w-full h-14 text-[15px] font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all disabled:shadow-none disabled:hover:translate-y-0"
          >
            Continue
          </Button>
        </>
      )}
    </StepShell>
  );
}
