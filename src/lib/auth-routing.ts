import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { createAdminClient } from '@/lib/supabase/admin';

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
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.is_platform_admin) {
    return '/platform';
  }

  // 3. Business membership check
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id, businesses(id, name, business_type)')
    .eq('user_id', userId)
    .maybeSingle();

  if (!membership) {
    return '/onboarding';
  }

  // 4. Business completeness check (name + type are the minimum required fields)
  const biz = membership.businesses as
    | { id: string; name: string | null; business_type: string | null }
    | null;

  if (!biz?.name || !biz?.business_type) {
    return '/onboarding?resume=1';
  }

  return '/dashboard';
}
