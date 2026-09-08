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
    pathname: '/services',
    title:
      locale === 'fr'
        ? 'Nos Services — Paiement, Conseil & Business | Opulanz'
        : 'Our Services — Payment, Advisory & Business | Opulanz',
    description:
      locale === 'fr'
        ? "Explorez tous les services Opulanz : comptes de paiement, création d'entreprise, conseil fiscal, conseil en investissement et assurance vie en France et au Luxembourg."
        : 'Explore all Opulanz services: payment accounts, company formation, tax advisory, investment advisory, and life insurance in France and Luxembourg.',
  });
}

export default async function ServicesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Nos services' : 'Our Services';

  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/services"
        name={name}
        description={
          isFr
            ? 'Comptes de paiement, création d’entreprise, conseil fiscal, investissement et assurance vie.'
            : 'Payment accounts, company formation, tax advisory, investment advisory, and life insurance.'
        }
        pageType="CollectionPage"
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name, path: '/services' },
        ]}
      />
      {children}
    </>
  );
}
