import { createClient } from '@/lib/supabase/server';

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
