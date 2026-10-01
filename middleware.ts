import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') || '';
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

  // Canonical host: apex → www (skip local, Azure slots, and Capacitor)
  if (
    isProduction &&
    (host === 'opulanz.com' || host === 'opulanz.com:443')
  ) {
    const url = req.nextUrl.clone();
    url.host = 'www.opulanz.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  // Trailing-slash consistency (except root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, '') || '/';
    return NextResponse.redirect(url, 308);
  }



  // Admin panel bypasses i18n entirely
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Protect /dashboard routes — require auth_token cookie
  if (pathname.match(/\/[a-z]{2}\/dashboard/)) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  // Protect SPV Investor Portal routes — require spv_investor_token cookie
  if (pathname.match(/\/[a-z]{2}\/spv-investment\/portal\/.+/)) {
    const token = req.cookies.get('spv_investor_token')?.value;
    if (!token) {
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/spv-investment/portal`, req.url));
    }
  }

  // Protect SPV Admin routes — require spv_admin_token cookie
  if (pathname.match(/\/[a-z]{2}\/spv-investment\/admin\/.+/)) {
    const token = req.cookies.get('spv_admin_token')?.value;
    if (!token) {
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/spv-investment/admin`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
