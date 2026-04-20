'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import type { Tables } from '@/lib/supabase/database.types';

const createSupportRequestSchema = z.object({
  category: z
    .enum(['general', 'payment_issue', 'configuration', 'account', 'booking'])
    .default('general'),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  contactEmail: z.string().trim().email().optional().or(z.literal('')),
});

const updateSupportRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type SupportRequestRow = Tables<'support_requests'>;

export type PlatformSupportRequest = Tables<'support_requests'> & {
  business: Pick<Tables<'businesses'>, 'id' | 'name' | 'country' | 'default_payment_method'> | null;
  submitted_by: Pick<Tables<'profiles'>, 'id' | 'email' | 'full_name'> | null;
};

async function getCurrentUserBusinessId(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: memberBusiness } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberBusiness?.business_id) return memberBusiness.business_id;

  const { data: ownedBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .limit(1)
    .maybeSingle();

  return ownedBusiness?.id ?? null;
}

export async function createSupportRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: 'Not authenticated.' };
  }

  const businessId = await getCurrentUserBusinessId(user.id);
  if (!businessId) {
    return {
      success: false as const,
      error: 'No business was found for your account.',
    };
  }

  const parsed = createSupportRequestSchema.safeParse({
    category: formData.get('category'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    contactEmail: formData.get('contactEmail'),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Please check your inputs.',
    };
  }

  const payload = parsed.data;
  const { error } = await supabase.from('support_requests').insert({
    business_id: businessId,
    submitted_by_user_id: user.id,
    contact_email: payload.contactEmail || user.email || null,
    category: payload.category,
    subject: payload.subject,
    message: payload.message,
    status: 'open',
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath('/settings/support');
  revalidatePath('/platform/support-requests');
  return { success: true as const };
}

export async function getMySupportRequests(limit = 20): Promise<SupportRequestRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const businessId = await getCurrentUserBusinessId(user.id);
  if (!businessId) return [];

  const safeLimit = Math.max(1, Math.min(limit, 100));
  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) return [];
  return data ?? [];
}

export async function getPlatformSupportRequests(limit = 200): Promise<PlatformSupportRequest[]> {
  await requirePlatformAdmin();
  const admin = createAdminClient();
  const safeLimit = Math.max(1, Math.min(limit, 500));

  const { data, error } = await admin
    .from('support_requests')
    .select(`
      *,
      business:businesses!support_requests_business_id_fkey(id, name, country, default_payment_method),
      submitted_by:profiles!support_requests_submitted_by_user_id_fkey(id, email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PlatformSupportRequest[];
}

export async function updateSupportRequestByAdmin(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const parsed = updateSupportRequestSchema.safeParse({
    requestId: formData.get('requestId'),
    status: formData.get('status'),
    adminNotes: formData.get('adminNotes'),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid request update.',
    };
  }

  const payload = parsed.data;
  const { error } = await supabase
    .from('support_requests')
    .update({
      status: payload.status,
      admin_notes: payload.adminNotes || null,
      updated_at: new Date().toISOString(),
      resolved_at:
        payload.status === 'resolved' || payload.status === 'closed'
          ? new Date().toISOString()
          : null,
    })
    .eq('id', payload.requestId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath('/platform/support-requests');
  revalidatePath('/settings/support');
  return { success: true as const };
}
