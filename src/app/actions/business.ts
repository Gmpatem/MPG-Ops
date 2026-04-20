'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Tables, Json } from '@/lib/supabase/database.types';
import {
  businessCountrySchema,
  businessDefaultPaymentMethodSchema,
  depositTypeSchema,
  normalizeBusinessRegionPaymentConfig,
} from '@/lib/business-payment-settings';
import { uploadBusinessPaymentQrImage } from '@/lib/supabase/payment-storage';

// ─── Public Site Settings ─────────────────────────────────────────────────────

export interface PublicSiteSettings {
  headline?: string;      // max 80 chars
  subtitle?: string;      // max 120 chars
  instructions?: string;  // max 300 chars
  accent?: 'default' | 'blue' | 'green' | 'purple' | 'rose';
}

const publicSiteSettingsSchema = z.object({
  headline: z.string().max(80, 'Headline must be 80 characters or fewer').optional(),
  subtitle: z.string().max(120, 'Subtitle must be 120 characters or fewer').optional(),
  instructions: z.string().max(300, 'Instructions must be 300 characters or fewer').optional(),
  accent: z.enum(['default', 'blue', 'green', 'purple', 'rose']).optional(),
});

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

const businessUpdateSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  country: businessCountrySchema.optional(),
  currency: z.string().trim().max(8).optional().or(z.literal('')),
  defaultPaymentMethod: businessDefaultPaymentMethodSchema.optional(),
  depositRequired: booleanFromFormSchema,
  depositType: depositTypeSchema.optional(),
  depositAmount: nonNegativeNumberFromFormSchema,
  gcashAccountName: z.string().trim().optional(),
  gcashNumber: z.string().trim().optional(),
  gcashQrImageUrl: z.string().trim().url('Invalid GCash QR image URL').optional().or(z.literal('')),
  gcashInstructions: z.string().trim().optional(),
  momoAccountName: z.string().trim().optional(),
  momoNumber: z.string().trim().optional(),
  momoInstructions: z.string().trim().optional(),
  manualInstructions: z.string().trim().optional(),
});

export async function updateBusiness(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const data = businessUpdateSchema.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
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

  // Parse operating hours if provided
  let operatingHours: Record<string, unknown> | undefined;
  const rawHours = formData.get('operating_hours');
  if (rawHours && typeof rawHours === 'string') {
    try {
      operatingHours = JSON.parse(rawHours);
    } catch {
      // ignore malformed JSON
    }
  }

  const { data: currentBusiness } = await supabase
    .from('businesses')
    .select('id, country, currency, default_payment_method, payment_settings')
    .eq('owner_id', user.id)
    .single();

  let uploadedGcashQrImageUrl: string | null = null;
  const maybeGcashQrFile = formData.get('gcashQrFile');
  if (maybeGcashQrFile instanceof File && maybeGcashQrFile.size > 0) {
    try {
      uploadedGcashQrImageUrl = await uploadBusinessPaymentQrImage(
        user.id,
        maybeGcashQrFile
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload GCash QR image';
      return { error: message };
    }
  }

  const normalizedRegionPayment = normalizeBusinessRegionPaymentConfig({
    country: data.country ?? currentBusiness?.country,
    currency: data.currency || currentBusiness?.currency,
    defaultPaymentMethod:
      data.defaultPaymentMethod ?? currentBusiness?.default_payment_method,
    paymentSettingsRaw: currentBusiness?.payment_settings ?? null,
    depositRequired: data.depositRequired,
    depositType: data.depositType,
    depositAmount: data.depositAmount,
    gcashAccountName: data.gcashAccountName,
    gcashNumber: data.gcashNumber,
    gcashQrImageUrl: uploadedGcashQrImageUrl ?? data.gcashQrImageUrl,
    gcashInstructions: data.gcashInstructions,
    momoAccountName: data.momoAccountName,
    momoNumber: data.momoNumber,
    momoInstructions: data.momoInstructions,
    manualInstructions: data.manualInstructions,
  });

  const updatePayload: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    updated_at: string;
    country: string;
    currency: string;
    default_payment_method: string;
    payment_settings: Json;
    operating_hours?: Json;
  } = {
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    updated_at: new Date().toISOString(),
    country: normalizedRegionPayment.country,
    currency: normalizedRegionPayment.currency,
    default_payment_method: normalizedRegionPayment.defaultPaymentMethod,
    payment_settings:
      normalizedRegionPayment.paymentSettings as unknown as Json,
  };

  if (operatingHours !== undefined) {
    updatePayload.operating_hours = operatingHours as Json;
  }

  const { error } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('owner_id', user.id);

  if (error && /column .* does not exist/i.test(error.message)) {
    const { error: fallbackError } = await supabase
      .from('businesses')
      .update({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        updated_at: new Date().toISOString(),
        ...(operatingHours !== undefined
          ? { operating_hours: operatingHours as Json }
          : {}),
      })
      .eq('owner_id', user.id);

    if (fallbackError) {
      return { error: fallbackError.message };
    }
  } else if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updatePublicSiteSettings(
  settings: PublicSiteSettings
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = publicSiteSettingsSchema.safeParse(settings);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid settings' };
  }

  const { error } = await supabase
    .from('businesses')
    .update({
      public_site_settings: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/settings/public-site');
  revalidatePath('/settings');
  return { success: true };
}

export const getCurrentBusiness = cache(async function getCurrentBusiness(): Promise<Tables<'businesses'> | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // 1. Try owner lookup first
  const { data: ownedBusiness } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (ownedBusiness) {
    return ownedBusiness;
  }

  // 2. Fall back to business_members lookup
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) {
    return null;
  }

  const { data: memberBusiness } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', membership.business_id)
    .single();

  return memberBusiness ?? null;
});
