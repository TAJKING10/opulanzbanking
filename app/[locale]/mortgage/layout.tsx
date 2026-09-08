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

export default async function MortgageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Crédit immobilier' : 'Mortgage solutions';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/mortgage"
        name={name}
        description={
          isFr
            ? 'Intermédiaire en crédit agréé ACPR pour vos projets immobiliers en France et au Luxembourg.'
            : 'ACPR-registered credit intermediary for property finance in France and Luxembourg.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name: isFr ? 'Services' : 'Services', path: '/services' },
          { name, path: '/mortgage' },
        ]}
      />
      {children}
    </>
  );
}
