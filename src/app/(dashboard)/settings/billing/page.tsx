'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentBusiness } from '@/app/actions/business';
import { formatPlanLabel, formatSubscriptionStatus, isTrialActive, getTrialDaysLeft } from '@/lib/subscription';
import { Check, ArrowLeft, Sparkles, Crown } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

export default function BillingPage() {
  const [business, setBusiness] = useState<Tables<'businesses'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentBusiness().then((b) => {
      setBusiness(b);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plan</h1>
        <Card className="p-6 text-center text-muted-foreground">No business found.</Card>
      </div>
    );
  }

  const trialActive = isTrialActive(business);
  const trialDaysLeft = getTrialDaysLeft(business);
  const effectivePlan = trialActive ? 'pro' : (business.plan_tier as 'free' | 'pro' | 'business');

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plan</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">{formatPlanLabel(effectivePlan)}</h2>
              <Badge variant={trialActive ? 'default' : 'outline'}>
                {formatSubscriptionStatus(business.subscription_status as 'trialing' | 'active' | 'expired' | 'free')}
              </Badge>
            </div>
            {trialActive && (
              <p className="text-sm text-muted-foreground mt-1">
                Free trial ends in {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'}.
              </p>
            )}
            {!trialActive && business.subscription_status === 'free' && (
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;re on the Free plan. Upgrade anytime to unlock more features.
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className={`p-5 border ${effectivePlan === 'pro' ? 'border-primary ring-1 ring-primary/10' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Pro Plan
              </h3>
              <p className="text-sm text-muted-foreground">₱499 / month</p>
            </div>
            {effectivePlan === 'pro' && !trialActive ? (
              <Badge>Current</Badge>
            ) : effectivePlan !== 'pro' && !trialActive ? (
              <Button size="sm">Upgrade</Button>
            ) : (
              <Badge variant="outline">Trialing</Badge>
            )}
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {['Unlimited services', 'Custom branding', 'Multi-service booking', 'Smart scheduling', 'Customer management'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </Card>

        <Card className={`p-5 border ${effectivePlan === 'business' ? 'border-violet-500 ring-1 ring-violet-500/10' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Crown className="w-4 h-4 text-violet-500" />
                Business Plan
              </h3>
              <p className="text-sm text-muted-foreground">₱999 / month</p>
            </div>
            {effectivePlan === 'business' ? (
              <Badge>Current</Badge>
            ) : (
              <Button size="sm" variant="outline">Upgrade</Button>
            )}
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {['Everything in Pro', 'Payments integration', 'Advanced analytics', 'Priority support', 'Team/staff features (soon)'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-violet-500" />
                {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Billing integration with payment gateways is coming soon. For now, contact support to upgrade or change your plan.
      </p>
    </div>
  );
}
