'use client';

import { useState } from 'react';
import { signInWithMagicLink } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail } from 'lucide-react';

export function MagicLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await signInWithMagicLink(formData);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3 py-2">
        <div className="flex justify-center">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm">Check your email</p>
          <p className="text-xs text-muted-foreground mt-1">
            We sent a sign-in link. Click it to continue — no password needed.
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          onClick={() => setSent(false)}
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="magic-email" className="text-sm">
          Email address
        </Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-11"
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        className="w-full h-11 gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        Email me a sign-in link
      </Button>
    </form>
  );
}
