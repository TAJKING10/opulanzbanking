import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'fr'],

  // Default locale
  defaultLocale: 'en',

  // Always show locale prefix in URL
  localePrefix: 'always',
});

// Export type-safe navigation utilities
export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
