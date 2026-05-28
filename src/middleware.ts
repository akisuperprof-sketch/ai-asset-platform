import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We only protect the /admin path. Note that /admin/login is the exception.
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin') && !path.startsWith('/admin/login') && !path.startsWith('/api/admin')) {
    const authCookie = request.cookies.get('D_STRATEGY_KEY');
    const serverKey = process.env.D_STRATEGY_KEY;
    
    // If there's no server key configured or the cookie is missing/invalid, redirect to login
    if (!serverKey || !authCookie || authCookie.value !== serverKey.trim()) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If user is already authenticated and tries to access /admin/login, redirect to /admin/studio
  if (path.startsWith('/admin/login')) {
    const authCookie = request.cookies.get('D_STRATEGY_KEY');
    const serverKey = process.env.D_STRATEGY_KEY;
    
    if (serverKey && authCookie && authCookie.value === serverKey.trim()) {
      return NextResponse.redirect(new URL('/admin/studio', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
