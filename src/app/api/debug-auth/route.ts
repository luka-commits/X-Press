import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only for this debug endpoint
        },
      },
    }
  );

  // Try to get session and user
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  return NextResponse.json({
    cookies: {
      count: allCookies.length,
      names: allCookies.map((c) => c.name),
      hasSupabaseCookie: allCookies.some(
        (c) => c.name.includes('supabase') || c.name.includes('auth')
      ),
      cookieDetails: allCookies.map((c) => ({
        name: c.name,
        valueLength: c.value.length,
        valuePreview: c.value.substring(0, 50) + '...',
      })),
    },
    session: {
      exists: !!sessionData.session,
      error: sessionError?.message || null,
    },
    user: {
      exists: !!userData.user,
      email: userData.user?.email || null,
      error: userError?.message || null,
    },
  });
}
