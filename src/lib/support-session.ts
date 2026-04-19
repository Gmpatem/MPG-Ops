import { cookies } from 'next/headers';

export interface SupportSession {
  adminId: string;
  targetBusinessId: string;
  targetBusinessName: string;
  targetUserId: string;
  targetUserEmail: string;
  startedAt: string;
}

const COOKIE_NAME = 'mpgops_support';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export async function getSupportSession(): Promise<SupportSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as SupportSession;
    // Validate shape
    if (!session.adminId || !session.targetBusinessId) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setSupportSession(session: SupportSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function clearSupportSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
