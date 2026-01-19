/**
 * Supabase Auth Client für Browser/Client Components
 *
 * Verwendet @supabase/ssr für moderne Next.js Integration
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser Client - für Client Components
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
