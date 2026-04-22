import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getPostAuthRoute } from '@/lib/auth-routing';
import { ensureProfileForUser } from '@/lib/auth/profile-bootstrap';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next') ?? '';

  // Only honour 'next' for password-reset — all other post-auth routing is
  // handled by getPostAuthRoute() so new and returning users land correctly.
  const trustedNext = rawNext === '/reset-password' ? rawNext : null;

  const pendingCookies: Array<{
    name: string;
    value: string;
    options?: {
      domain?: string;
      expires?: Date;
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
      secure?: boolean;
    };
  }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            pendingCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  const withCookies = (response: NextResponse) => {
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  };

  const redirectTo = (path: string) =>
    withCookies(NextResponse.redirect(new URL(path, request.url)));

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
    return redirectTo('/login?error=auth_callback_failed');
  }

  // Session is now established — get the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo('/login?error=auth_callback_failed');
  }

  const profileResult = await ensureProfileForUser(supabase, user);
  if (!profileResult.ok) {
    return redirectTo('/login?error=profile_bootstrap_failed');
  }

  // Honour trusted 'next' param (password reset only)
  if (trustedNext) {
    return redirectTo(trustedNext);
  }

  // Smart routing: determines /platform, /onboarding, /onboarding?resume=1, or /dashboard
  let route = '/onboarding';
  try {
    route = await getPostAuthRoute(supabase, user.id, user.email ?? '');
  } catch {
    route = '/onboarding';
  }

  return redirectTo(route);
}
