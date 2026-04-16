'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormStatus } from '@/components/form-status';
import { resetPassword } from '@/app/actions/auth';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
      }
      // On success, resetPassword redirects to /dashboard
    } catch {
      setError(t('auth.resetPassword.error'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.resetPassword.title')}</CardTitle>
        <CardDescription className="text-center">
          {t('auth.resetPassword.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.resetPassword.newPassword')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              required
              minLength={6}
              className="h-12"
            />
          </div>

          {error && <FormStatus type="error" message={error} />}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={isLoading}
          >
            {isLoading ? t('auth.resetPassword.updating') : t('auth.resetPassword.updatePassword')}
          </Button>
        </form>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher variant="minimal" />
        </div>
      </CardContent>
    </Card>
  );
}
