'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Tables, Json } from '@/lib/supabase/database.types';

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

const businessUpdateSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
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

  const updatePayload: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    updated_at: string;
    operating_hours?: Json;
  } = {
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    updated_at: new Date().toISOString(),
  };

  if (operatingHours !== undefined) {
    updatePayload.operating_hours = operatingHours as Json;
  }

  const { error } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('owner_id', user.id);

  if (error) {
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
