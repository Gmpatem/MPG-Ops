'use client';

import Link from 'next/link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { RegisterForm } from '@/components/forms/register-form';

export default function RegisterPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Start your free trial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            14 days of Pro · No credit card required
          </p>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Google — primary CTA */}
        <div className="p-6 pb-5">
          <GoogleSignInButton label="Continue with Google" />
        </div>

        {/* Divider */}
        <div className="relative px-6 pb-5">
          <div className="absolute inset-x-6 top-0 border-t" />
          <div className="relative flex justify-center -top-[0.6rem]">
            <span className="bg-card px-3 text-xs text-muted-foreground">
              or sign up with email
            </span>
          </div>
        </div>

        {/* Email + password registration */}
        <div className="px-6 pb-6">
          <RegisterForm />
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
