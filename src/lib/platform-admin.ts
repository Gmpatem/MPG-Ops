import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export async function isCurrentUserPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Fallback env whitelist for bootstrapping or emergencies
  const whitelist = (process.env.PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (whitelist.includes(user.email?.toLowerCase() || '')) {
    return true;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .maybeSingle();

  return !!profile?.is_platform_admin;
}

/**
 * Use in server actions and route handlers that require platform admin access.
 * Throws with a descriptive error if the caller is not an admin.
 */
export async function requirePlatformAdmin(): Promise<{ user: User }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const isAdmin = await isCurrentUserPlatformAdmin();
  if (!isAdmin) throw new Error('Unauthorized: platform admin required');

  return { user };
}
