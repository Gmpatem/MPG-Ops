import type { Tables } from '@/lib/supabase/database.types';

export type PlanTier = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'free';

const TRIAL_DAYS = 14;

export const PLAN_LIMITS: Record<
  PlanTier,
  {
    maxServices: number | null;
    maxStaff: number | null;
    customBranding: boolean;
    multiServiceBooking: boolean;
    payments: boolean;
    analytics: boolean;
    prioritySupport: boolean;
  }
> = {
  free: {
    maxServices: 10,
    maxStaff: 1,
    customBranding: false,
    multiServiceBooking: false,
    payments: false,
    analytics: false,
    prioritySupport: false,
  },
  pro: {
    maxServices: null,
    maxStaff: 1,
    customBranding: true,
    multiServiceBooking: true,
    payments: false,
    analytics: false,
    prioritySupport: false,
  },
  business: {
    maxServices: null,
    maxStaff: null,
    customBranding: true,
    multiServiceBooking: true,
    payments: true,
    analytics: true,
    prioritySupport: true,
  },
};

export function getTrialEndDate(startedAt: Date): Date {
  const d = new Date(startedAt);
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}

export function getTrialDaysLeft(business: Tables<'businesses'>): number {
  if (business.subscription_status !== 'trialing' || !business.trial_ends_at) return 0;
  const end = new Date(business.trial_ends_at);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function isTrialActive(business: Tables<'businesses'>): boolean {
  if (business.subscription_status !== 'trialing') return false;
  if (!business.trial_ends_at) return false;
  return new Date(business.trial_ends_at) > new Date();
}

export function getEffectivePlan(business: Tables<'businesses'>): PlanTier {
  if (isTrialActive(business)) {
    return (business.plan_tier as PlanTier) || 'pro';
  }
  if (business.subscription_status === 'active') {
    return (business.plan_tier as PlanTier) || 'free';
  }
  // If trial expired and not active, fallback to free
  if (business.subscription_status === 'expired') {
    return 'free';
  }
  return (business.plan_tier as PlanTier) || 'free';
}

export function canUseFeature(
  business: Tables<'businesses'>,
  requiredPlan: PlanTier
): boolean {
  const effective = getEffectivePlan(business);
  const tiers: PlanTier[] = ['free', 'pro', 'business'];
  return tiers.indexOf(effective) >= tiers.indexOf(requiredPlan);
}

export function formatPlanLabel(plan: PlanTier): string {
  switch (plan) {
    case 'free':
      return 'Free';
    case 'pro':
      return 'Pro';
    case 'business':
      return 'Business';
    default:
      return 'Free';
  }
}

export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  switch (status) {
    case 'trialing':
      return 'Free Trial';
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'free':
      return 'Free Plan';
    default:
      return 'Free Plan';
  }
}
