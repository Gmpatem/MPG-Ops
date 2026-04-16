'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/forms/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-center w-full">{t('auth.login.title')}</CardTitle>
        </div>
        <CardDescription className="text-center">
          {t('auth.login.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
          <div>
            <Link href="/forgot-password" className="text-primary hover:underline">
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
          <div>
            {t('auth.login.noAccount')}{' '}
            <Link href="/register" className="text-primary hover:underline">
              {t('auth.login.signUp')}
            </Link>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher variant="minimal" />
        </div>
      </CardContent>
    </Card>
  );
}
