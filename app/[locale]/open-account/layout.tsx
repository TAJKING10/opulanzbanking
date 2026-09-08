import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/app/[locale]/metadata';
import { PageJsonLd } from '@/components/seo/page-json-ld';

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

export default async function OpenAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Ouvrir un compte de paiement' : 'Open a payment account';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/open-account"
        name={name}
        description={
          isFr
            ? 'Ouvrez un compte de paiement réglementé en ligne — IBAN, SEPA et cartes pour particuliers et entreprises.'
            : 'Open a regulated payment account online — IBAN, SEPA transfers and cards for individuals and businesses.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name, path: '/open-account' },
        ]}
      />
      {children}
    </>
  );
}
