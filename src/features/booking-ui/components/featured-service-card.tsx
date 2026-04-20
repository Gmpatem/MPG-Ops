'use client';

import Image from 'next/image';
import { Scissors, Star, ArrowRight } from 'lucide-react';
import type { PublicService } from '@/app/actions/public-booking';
import { formatCurrencyAmount } from '@/lib/business-payment-settings';

export function FeaturedServiceCard({
  service,
  currency,
  onBook,
}: {
  service: PublicService;
  currency: string;
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
      className="
        group relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[5/4] xl:aspect-[16/10] rounded-[32px] lg:rounded-[36px] overflow-hidden
        cursor-pointer shadow-[0_12px_48px_rgba(42,36,32,0.12)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        active:scale-[0.975] lg:hover:-translate-y-1 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
      "
      aria-label={`Select ${name}`}
    >
      {/* Full-bleed image or fallback */}
      {service.image_url ? (
        <Image
          src={service.image_url}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 58vw, 760px"
          className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Scissors className="w-8 h-8 text-primary/40" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase">Featured</span>
          </div>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(42,36,32,0.85)] via-[rgba(42,36,32,0.3)] to-transparent via-[35%] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(42,36,32,0.25)] via-transparent to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none lg:top-5 lg:left-5 lg:right-5">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#F5D68A] bg-black/40 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-[rgba(245,214,138,0.2)]">
          <Star className="w-2.5 h-2.5 fill-[#F5D68A] text-[#F5D68A]" />
          Featured
        </span>
        {service.promo_badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-background bg-primary/90 backdrop-blur-md rounded-full px-3.5 py-1.5">
            {service.promo_badge}
          </span>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 lg:p-7">
        <h3 className="mb-1 line-clamp-1 font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-background lg:text-[38px]">
          {name}
        </h3>
        {desc && (
          <p className="mb-4 line-clamp-1 text-[13px] font-light leading-relaxed text-background/60 lg:text-sm">
            {desc}
          </p>
        )}
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[30px] font-semibold text-background lg:text-[34px]">
              {formatCurrencyAmount(service.price, currency, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-xs text-background/45 font-medium">
              {service.duration_minutes} min
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-foreground bg-background rounded-full px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-px">
            Book now
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
}
