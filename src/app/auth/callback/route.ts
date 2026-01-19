import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Enable iframe-compatible cookies
                const iframeOptions = {
                  ...options,
                  sameSite: 'none' as const,
                  secure: true,
                };
                cookieStore.set(name, value, iframeOptions);
              });
            } catch {
              // Ignore - called from Server Component
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user to create/update profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upsert profile in database
        await prisma.profile.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
            fullName: user.user_metadata?.full_name || null,
          },
          create: {
            id: user.id,
            email: user.email!,
            fullName: user.user_metadata?.full_name || null,
          },
        });
      }

      // Successful login - redirect to the requested page or home
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
