import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

type BusinessSetupSummary = Pick<
  Database['public']['Tables']['businesses']['Row'],
  'id' | 'setup_completed_at' | 'first_service_created_at'
>;

export type UserOnboardingState = 'NEW' | 'PARTIAL' | 'COMPLETE';

/**
 * Resolves onboarding state using the current schema:
 * - NEW: no owned business and no business membership
 * - PARTIAL: has business/membership but setup is incomplete
 * - COMPLETE: has business and setup_completed_at + first_service_created_at are set
 */
export async function getUserOnboardingState(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserOnboardingState> {
  const [ownedBusinessResult, membershipResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, setup_completed_at, first_service_created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<BusinessSetupSummary>(),
    supabase
      .from('business_members')
      .select('business_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const ownedBusiness = ownedBusinessResult.data;
  const membership = membershipResult.data;

  if (!ownedBusiness && !membership) {
    return 'NEW';
  }

  let business: BusinessSetupSummary | null = ownedBusiness ?? null;

  if (!business && membership?.business_id) {
    const { data: memberBusiness } = await supabase
      .from('businesses')
      .select('id, setup_completed_at, first_service_created_at')
      .eq('id', membership.business_id)
      .maybeSingle<BusinessSetupSummary>();

    business = memberBusiness ?? null;
  }

  if (!business) {
    return 'PARTIAL';
  }

  const isComplete =
    business.setup_completed_at !== null &&
    business.first_service_created_at !== null;

  return isComplete ? 'COMPLETE' : 'PARTIAL';
}

/**
 * Determines the correct post-auth route for a signed-in user.
 * Checks platform admin status, then business membership and setup completeness.
 *
 * Pass the already-established Supabase server client so the session is
 * visible (avoids cookie-visibility issues in route handlers).
 */
export async function getPostAuthRoute(
  supabase: SupabaseClient<Database>,
  userId: string,
  userEmail: string
): Promise<string> {
  // 1. Platform admin via env whitelist (fast, no DB)
  const whitelist = (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (userEmail && whitelist.includes(userEmail.toLowerCase())) {
    return '/platform';
  }

  // 2. Platform admin via DB flag
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.is_platform_admin) {
    return '/platform';
  }

  const state = await getUserOnboardingState(supabase, userId);

  if (state === 'NEW') {
    return '/onboarding';
  }

  if (state === 'PARTIAL') {
    return '/onboarding?resume=1';
  }

  return '/dashboard';
}
