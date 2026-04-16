import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Admin Supabase client that bypasses Row Level Security.
 * ONLY use this in server-side code (server actions, route handlers).
 * NEVER import this in client components or expose to the browser.
 *
 * Required env var: SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix)
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
        'Add SUPABASE_SERVICE_ROLE_KEY to your .env.local to enable the public booking flow.'
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
