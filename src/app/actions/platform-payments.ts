'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  businessDefaultPaymentMethodSchema,
  depositTypeSchema,
  normalizeBusinessRegionPaymentConfig,
} from '@/lib/business-payment-settings';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import type { Json, Tables } from '@/lib/supabase/database.types';

const booleanFromFormSchema = z.preprocess((value) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}, z.boolean().optional());

const nonNegativeNumberFromFormSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.number().min(0).optional());

const adminBusinessPaymentUpdateSchema = z.object({
  businessId: z.string().uuid(),
  country: z.string().trim().min(2).max(64).optional(),
  currency: z.string().trim().max(8).optional().or(z.literal('')),
  defaultPaymentMethod: businessDefaultPaymentMethodSchema.optional(),
  depositRequired: booleanFromFormSchema,
  depositType: depositTypeSchema.optional(),
  depositAmount: nonNegativeNumberFromFormSchema,
  gcashAccountName: z.string().trim().optional(),
  gcashNumber: z.string().trim().optional(),
  gcashQrImageUrl: z.string().trim().url('Invalid GCash QR URL').optional().or(z.literal('')),
  gcashInstructions: z.string().trim().optional(),
  momoAccountName: z.string().trim().optional(),
  momoNumber: z.string().trim().optional(),
  momoInstructions: z.string().trim().optional(),
  manualInstructions: z.string().trim().optional(),
});

export type PlatformBusinessPaymentRow = Pick<
  Tables<'businesses'>,
  | 'id'
  | 'name'
  | 'country'
  | 'currency'
  | 'default_payment_method'
  | 'payment_settings'
  | 'updated_at'
> & {
  owner: Pick<Tables<'profiles'>, 'id' | 'email' | 'full_name'> | null;
};

export async function getPlatformBusinessPaymentRows(): Promise<PlatformBusinessPaymentRow[]> {
  await requirePlatformAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('businesses')
    .select(
      'id, name, country, currency, default_payment_method, payment_settings, updated_at, owner:profiles!businesses_owner_id_fkey(id, email, full_name)'
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PlatformBusinessPaymentRow[];
}

export async function updateBusinessPaymentConfigByAdmin(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const parsed = adminBusinessPaymentUpdateSchema.safeParse({
    businessId: formData.get('businessId'),
    country: formData.get('country'),
    currency: formData.get('currency'),
    defaultPaymentMethod: formData.get('defaultPaymentMethod'),
    depositRequired: formData.get('depositRequired'),
    depositType: formData.get('depositType'),
    depositAmount: formData.get('depositAmount'),
    gcashAccountName: formData.get('gcashAccountName'),
    gcashNumber: formData.get('gcashNumber'),
    gcashQrImageUrl: formData.get('gcashQrImageUrl'),
    gcashInstructions: formData.get('gcashInstructions'),
    momoAccountName: formData.get('momoAccountName'),
    momoNumber: formData.get('momoNumber'),
    momoInstructions: formData.get('momoInstructions'),
    manualInstructions: formData.get('manualInstructions'),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid update request.',
    };
  }

  const payload = parsed.data;
  const { data: currentBusiness, error: currentError } = await supabase
    .from('businesses')
    .select('id, country, currency, default_payment_method, payment_settings')
    .eq('id', payload.businessId)
    .single();

  if (currentError || !currentBusiness) {
    return {
      success: false as const,
      error: currentError?.message ?? 'Business not found.',
    };
  }

  const normalizedRegionPayment = normalizeBusinessRegionPaymentConfig({
    country: payload.country ?? currentBusiness.country,
    currency: payload.currency || currentBusiness.currency,
    defaultPaymentMethod:
      payload.defaultPaymentMethod ?? currentBusiness.default_payment_method,
    paymentSettingsRaw: currentBusiness.payment_settings ?? null,
    depositRequired: payload.depositRequired,
    depositType: payload.depositType,
    depositAmount: payload.depositAmount,
    gcashAccountName: payload.gcashAccountName,
    gcashNumber: payload.gcashNumber,
    gcashQrImageUrl: payload.gcashQrImageUrl,
    gcashInstructions: payload.gcashInstructions,
    momoAccountName: payload.momoAccountName,
    momoNumber: payload.momoNumber,
    momoInstructions: payload.momoInstructions,
    manualInstructions: payload.manualInstructions,
  });

  const { error } = await supabase
    .from('businesses')
    .update({
      country: normalizedRegionPayment.country,
      currency: normalizedRegionPayment.currency,
      default_payment_method: normalizedRegionPayment.defaultPaymentMethod,
      payment_settings:
        normalizedRegionPayment.paymentSettings as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.businessId);

  if (error && /column .* does not exist/i.test(error.message)) {
    return {
      success: false as const,
      error:
        'Payment configuration columns are missing in this database. Run the latest migrations first.',
    };
  }

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath('/platform/payments');
  revalidatePath('/platform/businesses');
  return { success: true as const };
}
