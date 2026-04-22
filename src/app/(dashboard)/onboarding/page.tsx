'use client';

import { BusinessSetupForm } from '@/components/forms/business-setup-form';
import { useI18n } from '@/lib/i18n/i18n-provider';

export default function OnboardingPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('onboarding.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('onboarding.subtitle')}
        </p>
      </div>
      <BusinessSetupForm />
    </div>
  );
}
