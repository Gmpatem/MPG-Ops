'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/forms/login-form';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center">
      {/* Brand header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xl mb-4">
          M
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <LoginForm />

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs text-muted-foreground">{t('common.or') || 'or'}</span>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="space-y-3 text-center text-sm">
          <Link
            href="/forgot-password"
            className="inline-block text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('auth.login.forgotPassword')}
          </Link>
          <div className="text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              {t('auth.login.signUp')}
            </Link>
          </div>
        </div>

        {/* Language */}
        <div className="mt-5 flex justify-center">
          <LanguageSwitcher variant="minimal" />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        <Link href="/" className="hover:text-foreground transition-colors">
          MPG Ops
        </Link>
      </p>
    </div>
  );
}
