'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/forms/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.register.title')}</CardTitle>
        <CardDescription className="text-center">
          {t('auth.register.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('auth.register.hasAccount')}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </div>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher variant="minimal" />
        </div>
      </CardContent>
    </Card>
  );
}
