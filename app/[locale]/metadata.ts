import { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
// Strip internal hostnames from canonical/OG URLs so search engines never
// index staging addresses. Fall back to the branded domain only when the
// env var is explicitly set to a real public host.
export const baseUrl =
  rawBaseUrl && !rawBaseUrl.includes('localhost') && !rawBaseUrl.includes('azurewebsites.net')
    ? rawBaseUrl.replace(/\/$/, '')
    : 'https://www.opulanz.com';

export const OG_IMAGE = {
  url: `${baseUrl}/images/opulanz-og-image.png`,
  width: 1200,
  height: 630,
  alt: 'Opulanz — European financial and business platform',
};

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
      ? 'Opulanz — Plateforme Financière & Business Européenne | Luxembourg'
      : 'Opulanz — Luxembourg Financial & Business Platform | Europe';
  const defaultDescription =
    locale === 'fr'
      ? 'Plateforme financière et business européenne basée au Luxembourg : services de paiement, comptabilité, création de société, conseil en investissement, assurance et solutions transfrontalières.'
      : 'Luxembourg-based European financial and business platform for companies and entrepreneurs: payment services, accounting, company formation, investment advisory, insurance and cross-border solutions.';

  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDescription;
  const path = pathname.startsWith('/') || pathname === '' ? pathname : `/${pathname}`;
  const url = `${baseUrl}/${locale}${path}`;

  const languages: Record<string, string> = {
    'x-default': `${baseUrl}/en${path}`,
  };
  routing.locales.forEach((loc) => {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  });

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
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: 'Opulanz',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      type: ogType,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [OG_IMAGE.url],
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
