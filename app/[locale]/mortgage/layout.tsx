import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/app/[locale]/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata({
    locale,
    pathname: '/mortgage',
    title:
      locale === 'fr'
        ? 'Crédit Immobilier — France & Luxembourg | Opulanz'
        : 'Mortgage Solutions — France & Luxembourg | Opulanz',
    description:
      locale === 'fr'
        ? 'Opulanz accompagne votre projet immobilier en France et au Luxembourg. Intermédiaire en crédit agréé ACPR (ORIAS n° 21003660), accès multi-banques, conseils personnalisés.'
        : 'Opulanz guides your property purchase in France and Luxembourg. ACPR-registered credit intermediary (ORIAS n° 21003660), multi-bank access, and personalised advice.',
  });
}

export default function MortgageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
