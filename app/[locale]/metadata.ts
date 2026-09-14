import { Metadata } from 'next';
import { hreflangLanguages } from '@/lib/hreflang';
import { baseUrl } from '@/lib/site-url';

export { baseUrl };

export function ogImageForLocale(locale: string) {
  return {
    url: `${baseUrl}/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt:
      locale === 'fr'
        ? 'Opulanz — Plateforme financière et business européenne'
        : 'Opulanz — European financial and business platform',
  };
}

/** Fallback for older imports; prefer ogImageForLocale(locale). */
export const OG_IMAGE = ogImageForLocale('en');

interface GenerateMetadataProps {
  locale: string;
  pathname?: string;
  title?: string;
  description?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
}

export function generateSEOMetadata({
  locale,
  pathname = '',
  title,
  description,
  noIndex = false,
  ogType = 'website',
}: GenerateMetadataProps): Metadata {
  const defaultTitle =
    locale === 'fr'
      ? 'Opulanz — Plateforme financière & business | Luxembourg & Europe'
      : 'Opulanz — Financial & Business Platform | Luxembourg & Europe';
  const defaultDescription =
    locale === 'fr'
      ? 'Plateforme financière et business européenne basée au Luxembourg : services de paiement, comptabilité, création de société, conseil en investissement, assurance et solutions transfrontalières.'
      : 'Luxembourg-based European financial and business platform for companies and entrepreneurs: payment services, accounting, company formation, investment advisory, insurance and cross-border solutions.';

  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDescription;
  const path = pathname.startsWith('/') || pathname === '' ? pathname : `/${pathname}`;
  const url = `${baseUrl}/${locale}${path}`;
  const ogImage = ogImageForLocale(locale);
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(baseUrl),
    applicationName: 'Opulanz',
    authors: [{ name: 'Opulanz', url: baseUrl }],
    creator: 'Opulanz',
    publisher: 'Groupe Advensys Luxembourg S.A.',
    category: 'finance',
    referrer: 'origin-when-cross-origin',
    formatDetection: { telephone: false, email: false, address: false },
    alternates: {
      canonical: url,
      languages: hreflangLanguages(path),
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: 'Opulanz',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      type: ogType,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage.url],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}
