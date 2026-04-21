import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/lib/supabase/database.types';

export type OnboardingStatus = 'new' | 'in_progress' | 'completed';

export interface SetupChecklist {
  business_name: boolean;
  business_type: boolean;
  phone: boolean;
  first_service: boolean;
}

/**
 * Derives the setup checklist from known business fields and a service count.
 * Does NOT hit the database — call with data you already have.
 */
export function computeSetupChecklist(
  business: { name?: string | null; business_type?: string | null; phone?: string | null } | null,
  hasService: boolean
): SetupChecklist {
  return {
    business_name: Boolean(business?.name?.trim()),
    business_type: Boolean(business?.business_type?.trim()),
    phone: Boolean(business?.phone?.trim()),
    first_service: hasService,
  };
}

/** True when all four minimum requirements are met. */
export function isSetupComplete(checklist: SetupChecklist): boolean {
  return (
    checklist.business_name &&
    checklist.business_type &&
    checklist.phone &&
    checklist.first_service
  );
}

/** Completion as a 0–100 integer (useful for progress bars). */
export function setupCompletionPercent(checklist: SetupChecklist): number {
  const values = Object.values(checklist);
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

/**
 * Returns which items are still missing, in display order.
 * Useful for nudge banners or tooltip copy.
 */
export function missingSetupItems(checklist: SetupChecklist): string[] {
  const labels: Record<keyof SetupChecklist, string> = {
    business_name: 'Business name',
    business_type: 'Business type',
    phone: 'Phone number',
    first_service: 'At least one service',
  };
  return (Object.keys(checklist) as (keyof SetupChecklist)[])
    .filter((k) => !checklist[k])
    .map((k) => labels[k]);
}

/**
 * Writes setup checklist + completion timestamps to the DB after an operation
 * that may have changed the setup state (e.g. setupBusiness, addService).
 *
 * Pass the already-established Supabase server client.
 */
export async function syncSetupState(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessId: string,
  checklist: SetupChecklist
): Promise<void> {
  const complete = isSetupComplete(checklist);
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from('businesses').update({
      setup_checklist: checklist as unknown as Json,
      setup_completed_at: complete ? now : null,
    }).eq('id', businessId),

    supabase.from('profiles').update({
      onboarding_status: complete ? 'completed' : 'in_progress',
      onboarding_completed_at: complete ? now : null,
    }).eq('id', userId),
  ]);
}
