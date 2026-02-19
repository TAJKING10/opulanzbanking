import { redirect } from 'next/navigation';

/**
 * Root page redirect
 * Redirects / to /en (default locale)
 *
 * Users visiting the root domain will automatically be redirected to English version
 * You can change this to /fr if you want French as default
 */
export default function RootPage() {
  redirect('/en');
}
