import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // ---------------------------------------------------------
  // 1. /api/cron/* Protection
  // ---------------------------------------------------------
  if (path.startsWith('/api/cron')) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim() === '') {
      return new NextResponse(JSON.stringify({ error: 'Service Unavailable - Missing Secret' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret.trim()}`) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // ---------------------------------------------------------
  // 2. /api/admin/* Protection
  // ---------------------------------------------------------
  if (path.startsWith('/api/admin') && !path.startsWith('/api/admin/auth')) {
    const adminSecret = process.env.ADMIN_API_SECRET;
    const strategyKey = process.env.D_STRATEGY_KEY;
    
    if (!adminSecret || adminSecret.trim() === '' || !strategyKey || strategyKey.trim() === '') {
      return new NextResponse(JSON.stringify({ error: 'Service Unavailable - Missing Secret' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    const authHeader = request.headers.get('authorization');
    const hasBearer = authHeader === `Bearer ${adminSecret.trim()}`;
    
    const authCookie = request.cookies.get('D_STRATEGY_KEY');
    const hasCookie = authCookie && authCookie.value === strategyKey.trim();

    if (!hasBearer && !hasCookie) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // ---------------------------------------------------------
  // 3. /admin/* Page Protection (UI)
  // ---------------------------------------------------------
  if (path.startsWith('/admin') && !path.startsWith('/admin/login') && !path.startsWith('/api/')) {
    const authCookie = request.cookies.get('D_STRATEGY_KEY');
    const serverKey = process.env.D_STRATEGY_KEY;
    
    if (!serverKey || !authCookie || authCookie.value !== serverKey.trim()) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

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
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/cron/:path*'],
};
