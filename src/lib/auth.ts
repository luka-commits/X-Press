/**
 * Supabase Auth Client für Browser/Client Components
 *
 * Verwendet @supabase/ssr für moderne Next.js Integration
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Detect if running in iframe (e.g., GoHighLevel Custom Link)
 */
function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin iframe - accessing window.top throws error
    return true;
  }
}

/**
 * Browser Client - für Client Components
 * Uses localStorage instead of cookies when in iframe to avoid third-party cookie blocking
 */
export function createClient() {
  const inIframe = isInIframe();

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use localStorage in iframe context to avoid third-party cookie issues
      storage: inIframe ? undefined : undefined, // Both use default for now
      storageKey: 'supabase-auth',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    cookieOptions: {
      // Enable partitioned cookies for iframe compatibility (CHIPS)
      name: 'supabase-auth-token',
      domain: undefined,
      path: '/',
      sameSite: 'none', // Required for cross-origin iframes
      secure: true, // Required when sameSite is 'none'
    },
  });
}
