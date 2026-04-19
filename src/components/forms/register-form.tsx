'use client';

import { useState } from 'react';
import { register } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '@/lib/i18n/i18n-provider';

export function RegisterForm() {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (result?.success) {
      setSuccess(true);
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="flex justify-center">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary text-3xl">✓</span>
        </div>
        <p className="font-semibold text-foreground">{t('auth.register.checkEmail')}</p>
        <p className="text-sm text-muted-foreground">{t('auth.register.checkEmailSub')}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.register.email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.register.password')}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="h-12"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? t('auth.register.startingTrial') : t('auth.register.startTrial')}
      </Button>
    </form>
  );
}
