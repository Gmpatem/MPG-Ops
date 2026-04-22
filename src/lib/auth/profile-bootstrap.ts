import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { createAdminClient } from '@/lib/supabase/admin';

type ProfileUpsertPayload = Database['public']['Tables']['profiles']['Insert'];

export interface EnsureProfileResult {
  ok: boolean;
  source: 'admin' | 'session';
  error?: string;
}

function getNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getSafeUserEmail(user: User): string {
  return (
    getNonEmptyString(user.email) ??
    getNonEmptyString((user.user_metadata as Record<string, unknown> | null)?.email) ??
    `${user.id}@placeholder.local`
  );
}

function buildProfileUpdatePayload(
  user: User,
  existing: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url' | 'onboarding_status'> | null
): ProfileUpsertPayload {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;

  const providerName =
    getNonEmptyString(metadata.full_name) ??
    getNonEmptyString(metadata.name);

  const providerAvatar =
    getNonEmptyString(metadata.avatar_url) ??
    getNonEmptyString(metadata.picture);

  const authProvider = getNonEmptyString(appMetadata.provider);
  const nowIso = new Date().toISOString();

  return {
    id: user.id,
    email: getSafeUserEmail(user),
    full_name: existing?.full_name ?? providerName,
    avatar_url: existing?.avatar_url ?? providerAvatar,
    auth_provider: authProvider,
    onboarding_status: existing?.onboarding_status ?? 'new',
    last_sign_in_at: nowIso,
    updated_at: nowIso,
  };
}

/**
 * Ensures `public.profiles` is present and aligned for an authenticated user.
 * Uses admin client when available (bypasses RLS for missing-row repair),
 * then falls back to session client.
 */
export async function ensureProfileForUser(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<EnsureProfileResult> {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, onboarding_status')
    .eq('id', user.id)
    .maybeSingle();

  const payload = buildProfileUpdatePayload(user, existingProfile);

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (!error) {
      return { ok: true, source: 'admin' };
    }
  } catch (err) {
    const fallbackMessage =
      err instanceof Error ? err.message : 'Unknown admin bootstrap error';

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (!error) {
      return { ok: true, source: 'session' };
    }

    return {
      ok: false,
      source: 'session',
      error: `${fallbackMessage}; session fallback: ${error.message}`,
    };
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (!error) {
    return { ok: true, source: 'session' };
  }

  return { ok: false, source: 'session', error: error.message };
}
