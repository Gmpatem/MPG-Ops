'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { MagicLinkForm } from '@/components/auth/magic-link-form';
import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Brand mark */}
      <div className="text-center space-y-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-lg"
          aria-label="MPG Ops home"
        >
          M
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to MPG Ops</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your account · New here? We&apos;ll get you set up.
          </p>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Google — primary CTA, full-width with extra vertical padding */}
        <div className="p-6 pb-5">
          <GoogleSignInButton label="Continue with Google" />
        </div>

        {/* Divider */}
        <div className="relative px-6 pb-5">
          <div className="absolute inset-x-6 top-0 border-t" />
          <div className="relative flex justify-center -top-[0.6rem]">
            <span className="bg-card px-3 text-xs text-muted-foreground">
              or continue with email
            </span>
          </div>
        </div>

        {/* Magic link — secondary */}
        <div className="px-6 pb-6">
          <MagicLinkForm />
        </div>

        {/* Password — tertiary, collapsed by default */}
        <div className="border-t bg-muted/30 px-6 py-4">
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            {showPassword ? 'Hide password sign-in' : 'Sign in with a password instead'}
          </button>

          {showPassword && (
            <div className="mt-4 space-y-4">
              <LoginForm />
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minimal footer */}
      <p className="text-xs text-muted-foreground text-center">
        <Link href="/" className="hover:text-foreground transition-colors">
          MPG Ops
        </Link>
        {' · '}
        <Link href="/register" className="hover:text-foreground transition-colors">
          Create an account
        </Link>
        {' · '}
        <Link href="/forgot-password" className="hover:text-foreground transition-colors">
          Reset password
        </Link>
      </p>
    </div>
  );
}
