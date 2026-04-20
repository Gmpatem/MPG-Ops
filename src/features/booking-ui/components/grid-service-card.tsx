'use client';

import Image from 'next/image';
import { Scissors } from 'lucide-react';
import type { PublicService } from '@/app/actions/public-booking';
import { formatCurrencyAmount } from '@/lib/business-payment-settings';

export function GridServiceCard({
  service,
  currency,
  onBook,
}: {
  service: PublicService;
  currency: string;
  onBook: () => void;
}) {
  const name = service.public_title ?? service.name;

  return (
    <div
      onClick={onBook}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onBook();
      }}
      className="
        group bg-card rounded-3xl overflow-hidden flex flex-col cursor-pointer
        border-[1.5px] border-transparent shadow-[0_2px_20px_rgba(42,36,32,0.06)]
        hover:-translate-y-[3px] lg:hover:-translate-y-1 hover:shadow-[0_4px_32px_rgba(42,36,32,0.08)] hover:border-gold/20
        active:scale-[0.97] transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]
      "
    >
      {service.image_url ? (
        <div className="relative w-full aspect-[4/3] lg:aspect-[16/11] overflow-hidden">
          <Image
            src={service.image_url}
            alt={name}
            fill
            sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 360px"
            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
          />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center relative">
          <Scissors className="w-5 h-5 text-muted-foreground/30" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4 lg:px-5 lg:pt-4.5 lg:pb-5">
        <p className="mb-1 line-clamp-1 capitalize font-display text-lg font-semibold leading-tight text-foreground lg:text-xl">
          {name}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3.5">
          <span className="font-semibold text-gold text-[13px]">
            {formatCurrencyAmount(service.price, currency, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-stone-400" />
          <span>{service.duration_minutes} min</span>
        </div>
        <div className="mt-auto">
          <div className="flex h-[38px] w-full items-center justify-center rounded-xl border-[1.5px] border-border/60 bg-transparent text-xs font-semibold uppercase tracking-[0.06em] text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground lg:h-10">
            Select
          </div>
        </div>
      </div>
    </div>
  );
}
