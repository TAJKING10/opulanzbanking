import { baseUrl } from '@/app/[locale]/metadata';

export type Locale = string;

export function pageUrl(locale: string, pathname = ''): string {
  const path = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : '';
  return `${baseUrl}/${locale}${path}`;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${baseUrl}/#organization`,
    name: 'Opulanz',
    legalName: 'Groupe Advensys Luxembourg S.A.',
    url: baseUrl,
    logo: `${baseUrl}/images/opulanz-logo.png`,
    image: `${baseUrl}/images/opulanz-og-image.png`,
    description:
      'Luxembourg-based European financial and business platform for companies and entrepreneurs: payment services, accounting, company formation, investment advisory, insurance and cross-border business solutions.',
    areaServed: ['LU', 'FR', 'EU'],
    email: 'contact@opulanz.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2 Rue Edward Steichen',
      postalCode: 'L-2540',
      addressLocality: 'Luxembourg',
      addressCountry: 'LU',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'contact@opulanz.com',
        telephone: '+352-28-79-76-26',
        availableLanguage: ['English', 'French'],
        areaServed: ['LU', 'FR', 'EU'],
      },
    ],
    parentOrganization: {
      '@type': 'Organization',
      name: 'Groupe Advensys Luxembourg S.A.',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Opulanz',
    inLanguage: ['en', 'fr'],
    publisher: { '@id': `${baseUrl}/#organization` },
  };
}

export function webPageJsonLd({
  locale,
  pathname,
  name,
  description,
  type = 'WebPage',
}: {
  locale: string;
  pathname: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
}) {
  const url = pageUrl(locale, pathname);
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#organization` },
  };
}

export function breadcrumbJsonLd(
  locale: string,
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pageUrl(locale, item.path),
    })),
  };
}

export function serviceJsonLd({
  locale,
  pathname,
  name,
  description,
}: {
  locale: string;
  pathname: string;
  name: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: pageUrl(locale, pathname),
    provider: { '@id': `${baseUrl}/#organization` },
    areaServed: ['LU', 'FR', 'EU'],
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
