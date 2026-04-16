'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getCurrentBusinessId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .single();
  return membership?.business_id ?? null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceWithPublicFields {
  id: string;
  name: string;
  category: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  // Public presentation fields (require migration 002)
  show_on_public_booking: boolean;
  is_featured: boolean;
  public_title: string | null;
  public_description: string | null;
  promo_badge: string | null;
  promo_text: string | null;
  display_order: number;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const servicePublicSchema = z.object({
  show_on_public_booking: z.boolean(),
  is_featured: z.boolean(),
  public_title: z.string().max(80, 'Public title must be 80 characters or fewer').optional(),
  public_description: z.string().max(200, 'Public description must be 200 characters or fewer').optional(),
  promo_badge: z.string().max(30, 'Promo badge must be 30 characters or fewer').optional(),
  promo_text: z.string().max(120, 'Promo text must be 120 characters or fewer').optional(),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export type ServicePublicInput = z.infer<typeof servicePublicSchema>;

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Fetch all services for the current business with their public presentation fields.
 * Ordered by display_order ASC, then name ASC.
 * Requires migration 002 to be applied.
 */
export async function getServicesForPublicManagement(): Promise<ServiceWithPublicFields[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('services')
    .select('id, name, category, price, duration_minutes, is_active, show_on_public_booking, is_featured, public_title, public_description, promo_badge, promo_text, display_order')
    .eq('business_id', businessId)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) return [];

  // Provide safe defaults for any rows that predate the migration
  return data.map((row): ServiceWithPublicFields => ({
    id: row.id,
    name: row.name,
    category: row.category ?? null,
    price: row.price,
    duration_minutes: row.duration_minutes,
    is_active: row.is_active ?? true,
    show_on_public_booking: row.show_on_public_booking ?? true,
    is_featured: row.is_featured ?? false,
    public_title: row.public_title ?? null,
    public_description: row.public_description ?? null,
    promo_badge: row.promo_badge ?? null,
    promo_text: row.promo_text ?? null,
    display_order: row.display_order ?? 0,
  }));
}

/**
 * Update public presentation settings for a single service.
 * Auth-gated: only the business owner can update their own services.
 * Requires migration 002 to be applied.
 */
export async function updateServicePublicSettings(
  serviceId: string,
  input: ServicePublicInput
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) return { error: 'No business found' };

  const parsed = servicePublicSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { error } = await supabase
    .from('services')
    .update({
      show_on_public_booking: parsed.data.show_on_public_booking,
      is_featured: parsed.data.is_featured,
      public_title: parsed.data.public_title?.trim() || null,
      public_description: parsed.data.public_description?.trim() || null,
      promo_badge: parsed.data.promo_badge?.trim() || null,
      promo_text: parsed.data.promo_text?.trim() || null,
      display_order: parsed.data.display_order,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .eq('business_id', businessId);

  if (error) return { error: error.message };

  revalidatePath('/services/public');
  revalidatePath('/services');
  return { success: true };
}
