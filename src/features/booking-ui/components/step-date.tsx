'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft } from 'lucide-react';
import { formatBookingDate } from '@/lib/booking-dates';
import { StepShell } from './step-shell';

export function StepDate({
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
    const startDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const result: { value: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean }[] = [];

    for (let i = 0; i < startDay; i++) {
      result.push({ value: '', dayNum: 0, isCurrentMonth: false, isPast: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      result.push({ value, dayNum: d, isCurrentMonth: true, isPast });
    }

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
      subtitle="Choose when you'd like your appointment"
      onBack={onBack}
    >
      <div className="mb-6">
        {/* Calendar card */}
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[0_2px_20px_rgba(42,36,32,0.06)]">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setMonthOffset((m) => m - 1)}
              className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <p className="text-sm font-bold tracking-tight">{monthLabel}</p>
            <button
              onClick={() => setMonthOffset((m) => m + 1)}
              className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all"
              aria-label="Next month"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((wd) => (
              <div key={wd} className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider py-1">
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
                    aspect-square rounded-xl text-sm font-semibold transition-all duration-200
                    flex items-center justify-center relative
                    active:scale-90
                    ${isSelected
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 font-bold'
                      : d.isPast
                      ? 'text-muted-foreground/25 cursor-not-allowed'
                      : isToday
                      ? 'bg-primary/10 text-primary font-bold hover:bg-primary/20'
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                >
                  {d.dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {date && (
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 border border-primary/15 px-4 py-3 mb-6 animate-fade-up">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">{formatBookingDate(date)}</span>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!date}
        className="w-full h-14 text-[15px] font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all disabled:shadow-none disabled:hover:translate-y-0"
      >
        Continue
      </Button>
    </StepShell>
  );
}
