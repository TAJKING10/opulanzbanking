import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Poppins } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/shared/components/footer';
import { GoogleProvider } from '@/components/google-provider';
import { TawkChat } from '@/components/tawk-chat';
import { LiveChat } from '@/components/live-chat';
import { VideoPopup } from '@/components/video-popup';
import { routing } from '@/i18n/routing';
import { generateSEOMetadata } from './metadata';
import { CapacitorInit } from '@/components/capacitor-init';
import { JsonLd } from '@/components/seo/json-ld';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo-schema';
import '@/app/globals.css';

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  // 'swap' keeps text visible during load; explicit fallback fonts with similar
  // metrics reduce the cumulative layout shift (CLS) before Poppins arrives.
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#b59354',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateSEOMetadata({
    locale,
    pathname: '',
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={poppins.className}>
      <head>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Opulanz" />
        <link rel="apple-touch-icon" href="/images/opulanz-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/opulanz-logo.png" />
        <link rel="apple-touch-startup-image" href="/images/opulanz-logo.png" />
      </head>
      <body className="flex min-h-screen flex-col">
        <GoogleProvider>
          <NextIntlClientProvider messages={messages}>
            <CapacitorInit />
            <Header locale={locale} />
            <main className="flex-1 pt-16 md:pt-20">{children}</main>
            <Footer locale={locale} />
            <VideoPopup locale={locale} />
            <TawkChat />
            <LiveChat />
          </NextIntlClientProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
