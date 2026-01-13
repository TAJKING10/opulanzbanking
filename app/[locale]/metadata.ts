import { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';

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
  const defaultTitle = 'Opulanz - Professional Digital Banking';
  const defaultDescription =
    'Trusted digital banking, company formation, and advisory services for entrepreneurs and businesses in France and Luxembourg.';

  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDescription;
  const url = `${baseUrl}/${locale}${pathname}`;

  // Generate alternate language links
  const languages: Record<string, string> = {};
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
          alt: 'Opulanz Banking',
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
