import { baseUrl } from '@/lib/site-url';

export type Locale = string;

export function pageUrl(locale: string, pathname = ''): string {
  const path = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : '';
  return `${baseUrl}/${locale}${path}`;
}

const REGISTERED_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '2 Rue Edward Steichen',
  postalCode: 'L-2540',
  addressLocality: 'Luxembourg',
  addressCountry: 'LU',
};

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'FinancialService'],
    '@id': `${baseUrl}/#organization`,
    name: 'Opulanz',
    legalName: 'Groupe Advensys Luxembourg S.A.',
    alternateName: ['Opulanz Banking', 'Groupe Advensys Luxembourg'],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/opulanz-logo.png`,
    },
    image: `${baseUrl}/en/opengraph-image`,
    description:
      'Luxembourg-based European financial and business platform for companies and entrepreneurs: payment services, accounting, company formation, investment advisory, insurance and cross-border business solutions. Opulanz is a brand of Groupe Advensys Luxembourg S.A. and is not a credit institution; client funds are not held by Opulanz.',
    slogan: 'European financial and business services, in one place.',
    areaServed: [
      { '@type': 'Country', name: 'Luxembourg' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'AdministrativeArea', name: 'European Union' },
    ],
    email: 'contact@opulanz.com',
    telephone: '+352-28-79-76-26',
    address: REGISTERED_ADDRESS,
    location: [
      {
        '@type': 'Place',
        name: 'Registered office — Luxembourg',
        address: REGISTERED_ADDRESS,
      },
      {
        '@type': 'Place',
        name: 'Opulanz Clervaux',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '34, Grand-rue',
          postalCode: 'L-9710',
          addressLocality: 'Clervaux',
          addressCountry: 'LU',
        },
      },
      {
        '@type': 'Place',
        name: 'Opulanz Paris',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '66 Avenue des Champs-Élysées',
          postalCode: '75008',
          addressLocality: 'Paris',
          addressCountry: 'FR',
        },
      },
    ],
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
    knowsAbout: [
      'Payment accounts',
      'SEPA transfers',
      'Company formation in Luxembourg',
      'Tax advisory',
      'Investment advisory',
      'Life insurance',
      'Mortgage intermediation',
      'Accounting and invoicing',
    ],
    knowsLanguage: ['en', 'fr'],
    brand: { '@type': 'Brand', name: 'Opulanz' },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Groupe Advensys Luxembourg S.A.',
      identifier: 'RCS B197138',
    },
    subOrganization: {
      '@type': 'Organization',
      name: 'Advensys Insurance-Finance SARL',
      identifier: 'ORIAS 21003660',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Opulanz services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Payment accounts', url: `${baseUrl}/en/open-account` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Company formation assistance', url: `${baseUrl}/en/company-formation` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tax advisory', url: `${baseUrl}/en/tax-advisory` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Investment advisory', url: `${baseUrl}/en/investment-advisory` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Life insurance', url: `${baseUrl}/en/life-insurance` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mortgage intermediation', url: `${baseUrl}/en/mortgage` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Accounting and invoicing', url: `${baseUrl}/en/invoicing-accounting` } },
      ],
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
    inLanguage: ['en', 'fr', 'en-US', 'fr-FR'],
    publisher: { '@id': `${baseUrl}/#organization` },
    isFamilyFriendly: true,
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
    publisher: { '@id': `${baseUrl}/#organization` },
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
    serviceType: name,
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
