import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from '@/lib/seo-schema';
import { JsonLd } from './json-ld';

type WebPageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';

interface PageJsonLdProps {
  locale: string;
  pathname: string;
  name: string;
  description: string;
  pageType?: WebPageType;
  breadcrumbs?: { name: string; path: string }[];
  service?: boolean;
  faq?: { question: string; answer: string }[];
}

export function PageJsonLd({
  locale,
  pathname,
  name,
  description,
  pageType = 'WebPage',
  breadcrumbs,
  service,
  faq,
}: PageJsonLdProps) {
  const graph: Record<string, unknown>[] = [
    webPageJsonLd({ locale, pathname, name, description, type: pageType }),
  ];

  if (breadcrumbs?.length) {
    graph.push(breadcrumbJsonLd(locale, breadcrumbs));
  }
  if (service) {
    graph.push(serviceJsonLd({ locale, pathname, name, description }));
  }
  if (faq?.length) {
    graph.push(faqJsonLd(faq));
  }

  return <JsonLd data={graph} />;
}
