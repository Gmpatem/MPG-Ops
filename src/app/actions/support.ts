'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { getSupportSession, setSupportSession, clearSupportSession } from '@/lib/support-session';
import { logAuditEvent } from '@/app/actions/platform';

export async function startSupportSession(businessId: string) {
  const { user } = await requirePlatformAdmin();
  const admin = createAdminClient();

  const { data: business, error } = await admin
    .from('businesses')
    .select('id, name, owner_id, owner:profiles!businesses_owner_id_fkey(email)')
    .eq('id', businessId)
    .single();

  if (error || !business) throw new Error('Business not found');

  const ownerEmail = (business.owner as unknown as { email: string } | null)?.email ?? 'unknown';

  await setSupportSession({
    adminId: user.id,
    targetBusinessId: business.id,
    targetBusinessName: business.name,
    targetUserId: business.owner_id,
    targetUserEmail: ownerEmail,
    startedAt: new Date().toISOString(),
  });

  await logAuditEvent('support_mode_started', business.owner_id, business.id, {
    business_name: business.name,
  });

  redirect(`/platform/support/${businessId}`);
}

export async function endSupportSession() {
  await requirePlatformAdmin();
  const session = await getSupportSession();

  if (session) {
    const durationMinutes = Math.round(
      (Date.now() - new Date(session.startedAt).getTime()) / 60_000
    );
    await logAuditEvent('support_mode_ended', session.targetUserId, session.targetBusinessId, {
      business_name: session.targetBusinessName,
      duration_minutes: durationMinutes,
    });
  }

  await clearSupportSession();
  redirect('/platform/businesses');
}

export async function startUserSupportSession(userId: string) {
  const { user } = await requirePlatformAdmin();
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .single();

  if (error || !profile) throw new Error('User not found');

  // Find primary business for this user (owner first, else any membership)
  const { data: membership } = await admin
    .from('business_members')
    .select('business_id, role, businesses!business_members_business_id_fkey(id, name)')
    .eq('user_id', userId)
    .order('role', { ascending: true }) // 'owner' sorts before 'staff'
    .limit(1)
    .maybeSingle();

  const biz = (membership?.businesses as unknown as { id: string; name: string } | null);

  if (!biz) {
    // User has no business — open diagnostics instead
    redirect(`/platform/diagnostics?email=${encodeURIComponent(profile.email)}`);
  }

  await setSupportSession({
    adminId: user.id,
    targetBusinessId: biz.id,
    targetBusinessName: biz.name,
    targetUserId: userId,
    targetUserEmail: profile.email,
    startedAt: new Date().toISOString(),
  });

  await logAuditEvent('support_mode_started', userId, biz.id, {
    triggered_from: 'user_page',
    business_name: biz.name,
  });

  redirect(`/platform/support/${biz.id}`);
}
