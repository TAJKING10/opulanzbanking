import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

  // Hide/Redirect spv-investment in production
  if (isProduction && pathname.includes('/spv-investment')) {
    const segments = pathname.split('/');
    const locale = segments[1] || 'en';
    const redirectLocale = ['en', 'fr'].includes(locale) ? locale : 'en';
    return NextResponse.redirect(new URL(`/${redirectLocale}`, req.url));
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

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
