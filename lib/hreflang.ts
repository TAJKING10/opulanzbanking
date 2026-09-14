import { baseUrl } from '@/lib/site-url';

export type AppLocale = 'en' | 'fr' | string;

export function localePath(locale: string, pathname = ''): string {
  const path = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : '';
  return `/${locale}${path}`;
}

export function absoluteUrl(locale: string, pathname = ''): string {
  return `${baseUrl}${localePath(locale, pathname)}`;
}

/** hreflang map: ISO 639 codes plus regional tags used by Google / AI crawlers. */
export function hreflangLanguages(pathname = ''): Record<string, string> {
  const path = pathname.startsWith('/') || pathname === '' ? pathname : `/${pathname}`;
  const en = `${baseUrl}/en${path}`;
  const fr = `${baseUrl}/fr${path}`;
  return {
    'x-default': en,
    en,
    fr,
    'en-US': en,
    'fr-FR': fr,
  };
}
