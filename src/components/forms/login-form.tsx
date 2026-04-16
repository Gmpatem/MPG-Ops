'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';

type LoginResult =
  | { error: string; code: 'account_not_found' }
  | { error: string; code: 'wrong_password' }
  | { error: string; code?: undefined }
  | undefined;

export function LoginForm() {
  const { t } = useI18n();
  const [result, setResult] = useState<LoginResult>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(undefined);

    const res = await login(formData);
    setResult(res as unknown as LoginResult);
    setIsLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {result?.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      {result?.code === 'account_not_found' && (
        <Link
          href="/register"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full h-12 inline-flex')}
        >
          {t('auth.login.createAccount')}
        </Link>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.login.email')}</Label>
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
        <Label htmlFor="password">{t('auth.login.password')}</Label>
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

      <Button
        type="submit"
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            {t('auth.login.signingIn')}
          </>
        ) : (
          t('auth.login.signIn')
        )}
      </Button>
    </form>
  );
}
