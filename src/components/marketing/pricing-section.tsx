'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-provider';
import { Reveal } from '@/components/marketing/reveal';

export function PricingSection() {
  const { t } = useI18n();

  const plans = [
    { key: 'free', highlighted: false },
    { key: 'pro', highlighted: true },
    { key: 'business', highlighted: false },
  ];

  return (
    <section className="py-10 md:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">{t('landing.pricing.title')}</h2>
            <p className="text-zinc-600 mt-2 max-w-lg mx-auto text-sm md:text-base">
              {t('landing.pricing.subtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3 md:gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const name = t(`pricing.${plan.key}.name`);
            const price = t(`pricing.${plan.key}.price`);
            const period = t(`pricing.${plan.key}.period`);
            const description = t(`pricing.${plan.key}.description`);
            const cta = t(`pricing.${plan.key}.cta`);
            const features = [
              t(`pricing.${plan.key}.features.0`),
              t(`pricing.${plan.key}.features.1`),
              t(`pricing.${plan.key}.features.2`),
              t(`pricing.${plan.key}.features.3`),
              t(`pricing.${plan.key}.features.4`),
              ...(plan.key === 'pro' ? [t(`pricing.${plan.key}.features.5`)] : []),
            ].filter((f) => !f.startsWith('pricing.'));
            const badge = plan.key === 'pro' ? t('pricing.pro.badge') : undefined;

            return (
              <Reveal key={plan.key} delay={i * 100}>
                <div
                  className={`
                    relative rounded-2xl border p-4 md:p-5 flex flex-col shadow-sm bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md
                    ${plan.highlighted ? 'border-amber-500/50 ring-1 ring-amber-500/10' : 'border-zinc-200'}
                  `}
                >
                  {badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0a0a0b]">
                      {badge}
                    </span>
                  )}

                  <div className="mb-3">
                    <h3 className="font-semibold text-base text-zinc-900">{name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-zinc-900">{price}</span>
                    <span className="text-sm text-zinc-500">{period}</span>
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-zinc-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/register">
                    <Button
                      className={`w-full h-11 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] ${plan.highlighted ? 'bg-amber-500 hover:bg-amber-400 text-[#0a0a0b]' : 'border-zinc-300 text-zinc-900 hover:bg-zinc-50'}`}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {cta}
                    </Button>
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
