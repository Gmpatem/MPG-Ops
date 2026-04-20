'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import type { PublicService } from '@/app/actions/public-booking';
import { formatDurationMinutes } from '@/lib/booking-dates';
import { formatCurrencyAmount } from '@/lib/business-payment-settings';
import { StepShell } from './step-shell';

export function StepService({
  services,
  selected,
  currency,
  onToggle,
  onNext,
  onBack,
}: {
  services: PublicService[];
  selected: PublicService[];
  currency: string;
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
      subtitle="Select one or more for your appointment"
      onBack={onBack}
    >
      <div className="space-y-3 mb-5">
        {services.map((service, i) => {
          const isSelected = selectedIds.has(service.id);
          return (
            <button
              key={service.id}
              onClick={() => onToggle(service)}
              className={`
                w-full text-left flex items-start gap-3.5
                bg-card rounded-3xl p-4 border-2 transition-all duration-300 ease-out
                shadow-[0_2px_20px_rgba(42,36,32,0.06)]
                hover:border-gold/20
                active:scale-[0.985]
                ${isSelected
                  ? 'border-primary bg-gradient-to-br from-card to-gold/5 shadow-[0_4px_32px_rgba(42,36,32,0.08)]'
                  : 'border-transparent'
                }
              `}
              style={{ animation: `fadeUp 0.4s ease ${100 + i * 70}ms both` }}
            >
              {/* Checkbox */}
              <div className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300
                ${isSelected
                  ? 'bg-primary border-primary'
                  : 'border-border bg-background'
                }
              `}>
                <Check className={`w-3.5 h-3.5 text-primary-foreground transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
              </div>

              {/* Thumbnail */}
              {service.image_url && (
                <div className="w-14 h-14 rounded-[14px] overflow-hidden bg-muted shrink-0">
                  <Image
                    src={service.image_url}
                    alt={service.public_title ?? service.name}
                    width={56}
                    height={56}
                    sizes="56px"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {service.is_featured && (
                    <Star className="w-3.5 h-3.5 text-gold fill-gold shrink-0" />
                  )}
                  <span className="font-display text-lg font-semibold text-foreground capitalize">
                    {service.public_title ?? service.name}
                  </span>
                  {service.promo_badge && (
                    <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0 px-1.5 font-bold">
                      {service.promo_badge}
                    </Badge>
                  )}
                </div>
                {(service.public_description ?? service.description) && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                    {service.public_description ?? service.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-sm font-bold text-gold">
                    {formatCurrencyAmount(service.price, currency, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="w-[3px] h-[3px] rounded-full bg-stone-400" />
                  <span className="text-xs text-muted-foreground">{service.duration_minutes} min</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Pill */}
      {selected.length > 0 && (
        <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/20 px-5 py-4 mb-6 flex items-center justify-between gap-4 animate-fade-up">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary mb-0.5">
              {selected.length} selected
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {selected.map((s) => s.public_title ?? s.name).join(' + ')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-2xl font-semibold text-gold leading-none">
              {formatCurrencyAmount(totalPrice, currency, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formatDurationMinutes(totalDuration)}</p>
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={selected.length === 0}
        className="w-full h-14 text-[15px] font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all disabled:shadow-none disabled:hover:translate-y-0"
      >
        Continue
      </Button>
    </StepShell>
  );
}
