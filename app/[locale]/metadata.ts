import { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
// Strip internal hostnames from canonical/OG URLs so search engines never
// index staging addresses. Fall back to the branded domain only when the
// env var is explicitly set to a real public host.
export const baseUrl =
  rawBaseUrl && !rawBaseUrl.includes('localhost') && !rawBaseUrl.includes('azurewebsites.net')
    ? rawBaseUrl
    : 'https://www.opulanz.com';

interface GenerateMetadataProps {
  locale: string;
  pathname?: string;
  title?: string;
  description?: string;
}

export function generateSEOMetadata({
  locale,
  pathname = '',
  title,
  description,
}: GenerateMetadataProps): Metadata {
  const defaultTitle = 'Opulanz — Payment & Financial Services | France & Luxembourg';
  const defaultDescription =
    'Regulated payment accounts, company formation, investment advisory, tax consulting, and life insurance for businesses in France and Luxembourg.';

  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDescription;
  const url = `${baseUrl}/${locale}${pathname}`;

  // Generate alternate language links — x-default signals the fallback for unmatched locales
  const languages: Record<string, string> = {
    'x-default': `${baseUrl}/en${pathname}`,
  };
  routing.locales.forEach((loc) => {
    languages[loc] = `${baseUrl}/${loc}${pathname}`;
  });

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(baseUrl),
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
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/opulanz-og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Opulanz Financial Services',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [`${baseUrl}/images/opulanz-og-image.png`],
    },
    robots: {
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
  };
}
