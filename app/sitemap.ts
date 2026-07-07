import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.opulanz.com';

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

type Route = {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
};

const publicRoutes: Route[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/company-formation', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/insurance', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/investment-advisory', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/invoicing-accounting', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/life-insurance', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/open-account', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/spv-investment', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tax-advisory', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tax-advisory/corporate-tax', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tax-advisory/international-tax', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tax-advisory/personal-tax-advisory', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tax-advisory/tax-compliance', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tax-advisory/tax-return-preparation', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/legal/disclaimers', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/mentions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/regulatory', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.4, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    for (const locale of ['en', 'fr'] as const) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  return entries;
}
