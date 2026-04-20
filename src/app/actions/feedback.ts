'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import type { Tables } from '@/lib/supabase/database.types';

const submitFeedbackSchema = z.object({
  businessId: z.string().uuid('Invalid business id'),
  bookingId: z.string().uuid().optional().or(z.literal('')),
  customerName: z.string().trim().max(120).optional().or(z.literal('')),
  customerEmail: z.string().trim().email().optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(4).max(2000),
});

const updateFeedbackSchema = z.object({
  feedbackId: z.string().uuid(),
  status: z.enum(['new', 'reviewed', 'actioned', 'dismissed']),
});

export type PlatformBusinessFeedback = Tables<'business_feedback'> & {
  business: Pick<Tables<'businesses'>, 'id' | 'name' | 'country' | 'default_payment_method'> | null;
};

export async function submitBusinessFeedback(formData: FormData) {
  const parsed = submitFeedbackSchema.safeParse({
    businessId: formData.get('businessId'),
    bookingId: formData.get('bookingId'),
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid feedback input.',
    };
  }

  const admin = createAdminClient();
  const payload = parsed.data;

  const { data: business } = await admin
    .from('businesses')
    .select('id')
    .eq('id', payload.businessId)
    .maybeSingle();

  if (!business) {
    return { success: false as const, error: 'Business not found.' };
  }

  const { error } = await admin.from('business_feedback').insert({
    business_id: payload.businessId,
    booking_id: payload.bookingId || null,
    customer_name: payload.customerName || null,
    customer_email: payload.customerEmail || null,
    rating: payload.rating ?? null,
    comment: payload.comment,
    status: 'new',
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath(`/book/${payload.businessId}/success`);
  revalidatePath('/platform/feedback');
  return { success: true as const };
}

export async function getPlatformFeedback(limit = 300): Promise<PlatformBusinessFeedback[]> {
  await requirePlatformAdmin();
  const admin = createAdminClient();
  const safeLimit = Math.max(1, Math.min(limit, 500));

  const { data, error } = await admin
    .from('business_feedback')
    .select(`
      *,
      business:businesses!business_feedback_business_id_fkey(id, name, country, default_payment_method)
    `)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PlatformBusinessFeedback[];
}

export async function updateFeedbackStatusByAdmin(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const parsed = updateFeedbackSchema.safeParse({
    feedbackId: formData.get('feedbackId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid feedback status.',
    };
  }

  const payload = parsed.data;
  const { error } = await supabase
    .from('business_feedback')
    .update({
      status: payload.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.feedbackId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath('/platform/feedback');
  return { success: true as const };
}
