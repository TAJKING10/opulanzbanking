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
    pathname: '/tax-advisory',
    title:
      locale === 'fr'
        ? 'Conseil Fiscal — Services Fiscaux Personnels & Entreprises | Opulanz'
        : 'Tax Advisory — Personal & Corporate Tax Services | Opulanz',
    description:
      locale === 'fr'
        ? 'Conseillers fiscaux certifiés pour particuliers et entreprises. Déclarations de revenus, fiscalité des entreprises, conformité TVA et planification fiscale transfrontalière.'
        : 'Certified tax advisors for individuals and businesses. Tax returns, corporate tax, VAT compliance, and cross-border tax planning in France and Luxembourg.',
  });
}

export default async function TaxAdvisoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Conseil fiscal' : 'Tax advisory';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/tax-advisory"
        name={name}
        description={
          isFr
            ? 'Conseillers fiscaux pour particuliers et entreprises en France et au Luxembourg.'
            : 'Tax advisors for individuals and businesses in France and Luxembourg.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name: isFr ? 'Services' : 'Services', path: '/services' },
          { name, path: '/tax-advisory' },
        ]}
      />
      {children}
    </>
  );
}
