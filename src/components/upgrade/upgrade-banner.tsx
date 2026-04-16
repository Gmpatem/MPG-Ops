'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles, Crown } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';
import { isTrialActive, getEffectivePlan } from '@/lib/subscription';

interface UpgradeBannerProps {
  business: Tables<'businesses'>;
}

function getTrialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function UpgradeBanner({ business }: UpgradeBannerProps) {
  const effectivePlan = getEffectivePlan(business);
  const trialActive = isTrialActive(business);
  const trialDaysLeft = getTrialDaysLeft(business.trial_ends_at);

  // Trial ending soon (< 3 days)
  if (trialActive && trialDaysLeft <= 3) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {trialDaysLeft === 0
                  ? 'Your free trial ends today'
                  : `Your free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}`}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-200/80 mt-0.5">
                Upgrade to Pro to keep your premium features running smoothly.
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="shrink-0">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              Upgrade Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Free plan (expired trial or explicitly free)
  if (effectivePlan === 'free' && !trialActive) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                You&apos;re on the Free plan
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unlock unlimited services, custom branding, and smart scheduling with Pro.
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="shrink-0">
            <Button size="sm">Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Pro plan but not Business — upsell to Business
  if (effectivePlan === 'pro' && !trialActive) {
    return (
      <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900/50 dark:bg-violet-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
                Ready to scale?
              </p>
              <p className="text-xs text-violet-700 dark:text-violet-200/80 mt-0.5">
                Upgrade to Business for payments, analytics, and team features.
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="shrink-0">
            <Button size="sm" variant="outline" className="border-violet-600 text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/30">
              View Business Plan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
