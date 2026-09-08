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
    pathname: '/invoicing-accounting',
    title:
      locale === 'fr'
        ? 'Comptabilité & Facturation — Services au Luxembourg | Opulanz'
        : 'Accounting & Invoicing Services — Luxembourg | Opulanz',
    description:
      locale === 'fr'
        ? 'Services de comptabilité et facturation pour entreprises et indépendants au Luxembourg. Facturation automatisée, comptabilité, paie et tableaux de bord financiers.'
        : 'Accounting and invoicing services for businesses and freelancers in Luxembourg. Automated invoicing, bookkeeping, payroll, and financial dashboards.',
  });
}

export default async function InvoicingAccountingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Comptabilité et facturation' : 'Accounting & invoicing';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/invoicing-accounting"
        name={name}
        description={
          isFr
            ? 'Comptabilité, facturation et tableaux de bord pour entreprises au Luxembourg.'
            : 'Accounting, invoicing and financial dashboards for businesses in Luxembourg.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name: isFr ? 'Services' : 'Services', path: '/services' },
          { name, path: '/invoicing-accounting' },
        ]}
      />
      {children}
    </>
  );
}
