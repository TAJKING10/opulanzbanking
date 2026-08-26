import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.opulanz.com';
const LOCALES = ['en', 'fr'] as const;

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

type Route = {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
};

const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

const publicRoutes: Route[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/open-account', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/company-formation', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tax-advisory', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tax-advisory/tax-return-preparation', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tax-advisory/international-tax', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tax-advisory/corporate-tax', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tax-advisory/tax-compliance', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tax-advisory/personal-tax-advisory', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/investment-advisory', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/mortgage', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/life-insurance', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/invoicing-accounting', priority: 0.7, changeFrequency: 'monthly' },
  ...(isProduction
    ? []
    : [{ path: '/spv-investment', priority: 0.7, changeFrequency: 'monthly' as const }]),
  { path: '/legal/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/mentions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/regulatory', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/disclaimers', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${route.path}`])
          ),
        },
      });
    }
  }

  return entries;
}
