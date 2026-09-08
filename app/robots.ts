import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.opulanz.com';

const isStaging =
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ||
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';

const PRIVATE_PATHS = [
  '/admin',
  '/api/',
  '/*/dashboard',
  '/*/auth/',
  '/*/login',
  '/*/signup',
  '/*/kyc',
  '/*/investment-advisory-test',
  '/*/investment-advisory/onboarding',
  '/*/investment-advisory/schedule',
  '/*/spv-investment/portal',
  '/*/spv-investment/admin',
  '/*/mortgage/apply',
  '/*/open-account/start',
  '/*/open-account/individual',
  '/*/open-account/company',
  '/*/open-account/business',
  '/*/open-account/personal',
  '/*/open-account/warm-referral',
  '/*/invoicing-accounting/onboarding',
  '/*/invoicing-accounting/confirmation',
  '/*/tax-advisory/booking',
  '/*/tax-advisory/schedule',
  '/*/tax-advisory/confirmation',
  '/*/life-insurance/schedule',
  '/*/life-insurance/confirmation',
];

export default function robots(): MetadataRoute.Robots {
  if (isStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
