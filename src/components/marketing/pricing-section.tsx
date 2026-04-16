'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-provider';

export function PricingSection() {
  const { t } = useI18n();

  const plans = [
    {
      key: 'free',
      highlighted: false,
    },
    {
      key: 'pro',
      highlighted: true,
    },
    {
      key: 'business',
      highlighted: false,
    },
  ];

  return (
    <section className="py-14 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('landing.pricing.title')}</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {plans.map((plan) => {
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
              <div
                key={plan.key}
                className={`
                  relative rounded-2xl border bg-card p-5 md:p-6 flex flex-col
                  ${plan.highlighted ? 'border-primary shadow-md ring-1 ring-primary/10' : ''}
                `}
              >
                {badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    {badge}
                  </span>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold text-base">{name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">{price}</span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
