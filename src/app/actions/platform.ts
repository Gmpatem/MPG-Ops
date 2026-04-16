'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserPlatformAdmin } from '@/lib/platform-admin';
import type { Tables } from '@/lib/supabase/database.types';

// ─── Guards ───────────────────────────────────────────────────────────────────

async function guardAdmin() {
  const ok = await isCurrentUserPlatformAdmin();
  if (!ok) throw new Error('Unauthorized');
}

// ─── Businesses ─────────────────────────────────────────────────────────────────

export async function getAllBusinesses(): Promise<Tables<'businesses'>[]> {
  await guardAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateBusinessPlan(
  businessId: string,
  planTier: 'free' | 'pro' | 'business',
  subscriptionStatus: 'trialing' | 'active' | 'expired' | 'free'
) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('businesses')
    .update({ plan_tier: planTier, subscription_status: subscriptionStatus, updated_at: new Date().toISOString() })
    .eq('id', businessId);
  if (error) return { error: error.message };
  revalidatePath('/platform/businesses');
  return { success: true };
}

// ─── Users ──────────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<Tables<'profiles'>[]> {
  await guardAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function toggleUserPlatformAdmin(userId: string, isAdmin: boolean) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_platform_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) return { error: error.message };
  revalidatePath('/platform/users');
  return { success: true };
}

// ─── Metrics ────────────────────────────────────────────────────────────────────

export async function getPlatformMetrics(): Promise<{
  totalBusinesses: number;
  totalUsers: number;
  trialingBusinesses: number;
  activePaidBusinesses: number;
  freeBusinesses: number;
}> {
  await guardAdmin();
  const supabase = await createClient();

  const { count: totalBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: trialingBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'trialing');
  const { count: activePaidBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active');
  const { count: freeBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'free');

  return {
    totalBusinesses: totalBusinesses || 0,
    totalUsers: totalUsers || 0,
    trialingBusinesses: trialingBusinesses || 0,
    activePaidBusinesses: activePaidBusinesses || 0,
    freeBusinesses: freeBusinesses || 0,
  };
}
