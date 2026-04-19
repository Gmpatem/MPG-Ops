'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isCurrentUserPlatformAdmin, requirePlatformAdmin } from '@/lib/platform-admin';
import type { Tables, Json } from '@/lib/supabase/database.types';

// ─── Internal guard (kept for backward-compat with inline page actions) ────────

async function guardAdmin() {
  const ok = await isCurrentUserPlatformAdmin();
  if (!ok) throw new Error('Unauthorized');
}

// ─── Audit Logging ─────────────────────────────────────────────────────────────

export async function logAuditEvent(
  action: string,
  targetUserId?: string | null,
  targetBusinessId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { user } = await requirePlatformAdmin();
  const admin = createAdminClient();

  await admin.from('admin_audit_logs').insert({
    admin_user_id: user.id,
    action,
    target_user_id: targetUserId ?? null,
    target_business_id: targetBusinessId ?? null,
    metadata: (metadata ?? null) as Json,
  });
}

export type AuditLogWithRelations = Tables<'admin_audit_logs'> & {
  admin: Pick<Tables<'profiles'>, 'email' | 'full_name'> | null;
  target_user: Pick<Tables<'profiles'>, 'email' | 'full_name'> | null;
  target_business: Pick<Tables<'businesses'>, 'name'> | null;
};

export async function getAuditLogs(limit = 100): Promise<AuditLogWithRelations[]> {
  await guardAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('admin_audit_logs')
    .select(`
      *,
      admin:profiles!admin_audit_logs_admin_user_id_fkey(email, full_name),
      target_user:profiles!admin_audit_logs_target_user_id_fkey(email, full_name),
      target_business:businesses!admin_audit_logs_target_business_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AuditLogWithRelations[];
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

export type BusinessWithDetails = Tables<'businesses'> & {
  owner: Pick<Tables<'profiles'>, 'id' | 'email' | 'full_name'> | null;
  member_count: number;
};

export async function getAllBusinessesEnhanced(): Promise<BusinessWithDetails[]> {
  await guardAdmin();
  const supabase = await createClient();

  const [{ data: businesses, error }, { data: memberRows }] = await Promise.all([
    supabase
      .from('businesses')
      .select('*, owner:profiles!businesses_owner_id_fkey(id, email, full_name)')
      .order('created_at', { ascending: false }),
    supabase.from('business_members').select('business_id'),
  ]);

  if (error) throw new Error(error.message);

  const memberCounts = (memberRows ?? []).reduce<Record<string, number>>((acc, m) => {
    acc[m.business_id] = (acc[m.business_id] || 0) + 1;
    return acc;
  }, {});

  return ((businesses ?? []) as unknown as Array<Tables<'businesses'> & { owner: BusinessWithDetails['owner'] }>).map((b) => ({
    ...b,
    member_count: memberCounts[b.id] ?? 0,
  }));
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
    .update({
      plan_tier: planTier,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId);

  if (error) return { error: error.message };

  await logAuditEvent('business_plan_changed', null, businessId, {
    plan_tier: planTier,
    subscription_status: subscriptionStatus,
  });

  revalidatePath('/platform/businesses');
  revalidatePath(`/platform/support/${businessId}`);
  return { success: true };
}

export type BusinessMember = {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile: Pick<Tables<'profiles'>, 'email' | 'full_name'> | null;
};

export async function getBusinessMembers(businessId: string): Promise<BusinessMember[]> {
  await guardAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('business_members')
    .select('*, profile:profiles!business_members_user_id_fkey(email, full_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BusinessMember[];
}

export type BusinessSupportData = {
  business: Tables<'businesses'>;
  owner: Pick<Tables<'profiles'>, 'id' | 'email' | 'full_name'> | null;
  members: BusinessMember[];
  stats: { bookings: number; services: number; customers: number };
};

export async function getBusinessSupportData(businessId: string): Promise<BusinessSupportData> {
  await guardAdmin();
  const admin = createAdminClient();

  const [
    { data: business, error: bizErr },
    members,
    { count: bookings },
    { count: services },
    { count: customers },
  ] = await Promise.all([
    admin
      .from('businesses')
      .select('*, owner:profiles!businesses_owner_id_fkey(id, email, full_name)')
      .eq('id', businessId)
      .single(),
    getBusinessMembers(businessId),
    admin.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    admin.from('services').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    admin.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
  ]);

  if (bizErr || !business) throw new Error(bizErr?.message ?? 'Business not found');

  const biz = business as unknown as Tables<'businesses'> & { owner: BusinessSupportData['owner'] };

  return {
    business: biz,
    owner: biz.owner,
    members,
    stats: { bookings: bookings ?? 0, services: services ?? 0, customers: customers ?? 0 },
  };
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

export type UserWithMemberships = Tables<'profiles'> & {
  memberships: Array<{
    id: string;
    business_id: string;
    role: string;
    business: Pick<Tables<'businesses'>, 'id' | 'name' | 'plan_tier' | 'subscription_status'> | null;
  }>;
};

export async function getAllUsersEnhanced(): Promise<UserWithMemberships[]> {
  await guardAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memberships:business_members(
        id,
        business_id,
        role,
        business:businesses!business_members_business_id_fkey(id, name, plan_tier, subscription_status)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as UserWithMemberships[];
}

export async function toggleUserPlatformAdmin(userId: string, isAdmin: boolean) {
  await guardAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_platform_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };

  await logAuditEvent(
    isAdmin ? 'platform_admin_granted' : 'platform_admin_revoked',
    userId,
    null,
    { is_platform_admin: isAdmin }
  );

  revalidatePath('/platform/users');
  return { success: true };
}

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string }
) {
  await guardAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };

  await logAuditEvent('user_profile_edited', userId, null, data);

  revalidatePath('/platform/users');
  revalidatePath(`/platform/support`);
  return { success: true };
}

// ─── Diagnostics ────────────────────────────────────────────────────────────────

export type DiagnosticsResult = {
  email: string;
  profile: Tables<'profiles'> | null;
  memberships: Array<{
    id: string;
    business_id: string;
    role: string;
    business: Pick<Tables<'businesses'>, 'id' | 'name' | 'subscription_status'> | null;
  }>;
  issues: string[];
  recommendations: string[];
};

export async function runDiagnostics(email: string): Promise<DiagnosticsResult> {
  await guardAdmin();
  const admin = createAdminClient();

  const normalizedEmail = email.trim().toLowerCase();

  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  const issues: string[] = [];
  const recommendations: string[] = [];
  let memberships: DiagnosticsResult['memberships'] = [];

  if (!profile) {
    issues.push('No profile found for this email.');
    recommendations.push('User may not have completed registration, or may not exist. Ask them to register.');
    return { email: normalizedEmail, profile: null, memberships: [], issues, recommendations };
  }

  const { data: memberRows } = await admin
    .from('business_members')
    .select('id, business_id, role, business:businesses!business_members_business_id_fkey(id, name, subscription_status)')
    .eq('user_id', profile.id);

  memberships = (memberRows ?? []) as unknown as DiagnosticsResult['memberships'];

  if (memberships.length === 0) {
    issues.push('User has no business membership.');
    recommendations.push('User is registered but has not completed onboarding. Direct them to /onboarding.');
  }

  const expiredBusinesses = memberships.filter(
    (m) => m.business?.subscription_status === 'expired'
  );
  if (expiredBusinesses.length > 0) {
    issues.push(`${expiredBusinesses.length} membership(s) on expired subscription.`);
    recommendations.push('Use "Edit Subscription" in Businesses to extend or change plan.');
  }

  if (memberships.length > 1) {
    issues.push(`User belongs to ${memberships.length} businesses — verify this is expected.`);
  }

  if (issues.length === 0) {
    recommendations.push('Account looks healthy.');
  }

  return { email: normalizedEmail, profile, memberships, issues, recommendations };
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
