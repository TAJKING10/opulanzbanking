import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'fr'],

  // Default locale
  defaultLocale: 'en',

  // Always show locale prefix in URL
  localePrefix: 'always',

  // Path names for localized routes (optional)
  pathnames: {
    '/': '/',
    '/open-account': {
      en: '/open-account',
      fr: '/ouvrir-compte', // Optional: localized paths
    },
    '/company-formation': {
      en: '/company-formation',
      fr: '/creation-entreprise',
    },
    '/dashboard': '/dashboard',
  },
});

// Export type-safe navigation utilities
export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
