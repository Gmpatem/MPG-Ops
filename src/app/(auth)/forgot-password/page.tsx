'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormStatus } from '@/components/form-status';
import { forgotPassword } from '@/app/actions/auth';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await forgotPassword(formData);
      if (result.success) {
        setMessage({
          type: 'success',
          text: t('auth.forgotPassword.success'),
        });
      } else {
        setMessage({ type: 'error', text: result.error || t('auth.forgotPassword.error') });
      }
    } catch {
      setMessage({ type: 'error', text: t('auth.resetPassword.error') });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.forgotPassword.title')}</CardTitle>
        <CardDescription className="text-center">
          {t('auth.forgotPassword.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-12"
            />
          </div>

          {message && <FormStatus type={message.type} message={message.text} />}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={isLoading || message?.type === 'success'}
          >
            {isLoading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendLink')}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            {t('auth.forgotPassword.backToSignIn')}
          </Link>
        </div>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher variant="minimal" />
        </div>
      </CardContent>
    </Card>
  );
}
