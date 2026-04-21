import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getPostAuthRoute } from '@/lib/auth-routing';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next') ?? '';

  // Only honour 'next' for password-reset — all other post-auth routing is
  // handled by getPostAuthRoute() so new and returning users land correctly.
  const trustedNext = rawNext === '/reset-password' ? rawNext : null;

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  let authError = false;

  if (tokenHash && type) {
    // Magic-link / email-confirmation token flow
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) authError = true;
  } else if (code) {
    // PKCE flow (OAuth, magic link with PKCE, email confirmation)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) authError = true;
  } else {
    authError = true;
  }

  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Session is now established — get the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Ensure profile row exists, enriching it with OAuth provider metadata.
  // We preserve any name/avatar the user has already set explicitly.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const metadata   = user.user_metadata  as Record<string, unknown>;
  const appMeta    = user.app_metadata   as Record<string, unknown>;

  const providerName =
    (metadata.full_name as string | undefined) ??
    (metadata.name      as string | undefined) ??
    null;

  const providerAvatar =
    (metadata.avatar_url as string | undefined) ??
    (metadata.picture    as string | undefined) ??
    null;

  const authProvider = (appMeta.provider as string | undefined) ?? null;

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email:            user.email ?? '',
      full_name:        existingProfile?.full_name   ?? providerName,
      avatar_url:       existingProfile?.avatar_url  ?? providerAvatar,
      auth_provider:    authProvider,
      last_sign_in_at:  new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  // Honour trusted 'next' param (password reset only)
  if (trustedNext) {
    return NextResponse.redirect(`${origin}${trustedNext}`);
  }

  // Smart routing: determines /platform, /onboarding, /onboarding?resume=1, or /dashboard
  const route = await getPostAuthRoute(supabase, user.id, user.email ?? '');
  return NextResponse.redirect(`${origin}${route}`);
}
