import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Debug: Log all cookies received
  const allCookies = request.cookies.getAll();
  console.log('[Middleware] Path:', request.nextUrl.pathname);
  console.log('[Middleware] Cookies received:', allCookies.map((c) => c.name).join(', '));
  console.log(
    '[Middleware] Auth cookie exists:',
    allCookies.some((c) => c.name.includes('supabase') || c.name.includes('auth'))
  );

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log('[Middleware] getAll called, returning:', cookies.length, 'cookies');
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log(
            '[Middleware] setAll called with:',
            cookiesToSet.map((c) => c.name).join(', ')
          );
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('[Middleware] User found:', user ? user.email : 'null');

  // Ungeschützte Routes
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth');

  // Redirect to login if not authenticated and not on auth route
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect to home if authenticated and on login page
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
