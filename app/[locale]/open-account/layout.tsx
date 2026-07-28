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
    pathname: '/open-account',
    title:
      locale === 'fr'
        ? 'Ouvrir un Compte de Paiement — Particulier ou Entreprise | Opulanz'
        : 'Open a Payment Account — Individual or Business | Opulanz',
    description:
      locale === 'fr'
        ? 'Ouvrez un compte de paiement réglementé en ligne avec Opulanz. Compte IBAN, virements SEPA, cartes de paiement — pour particuliers et entreprises en France et au Luxembourg.'
        : 'Open a regulated payment account online with Opulanz. IBAN account, SEPA transfers, payment cards — for individuals and businesses in France and Luxembourg.',
  });
}

export default function OpenAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
