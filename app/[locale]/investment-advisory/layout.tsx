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
    pathname: '/investment-advisory',
    title:
      locale === 'fr'
        ? 'Conseil en Investissement — Gestion de Patrimoine Conforme MiFID II'
        : 'Investment Advisory — MiFID II Compliant Wealth Management | Opulanz',
    description:
      locale === 'fr'
        ? 'Conseil en investissement conforme MiFID II et gestion de patrimoine personnalisée. Stratégies sur actions, obligations, ETF et investissements ESG en France et au Luxembourg.'
        : 'MiFID II-compliant investment advisory and personalised wealth management. Strategies covering equities, bonds, ETFs, and ESG investments in France and Luxembourg.',
  });
}

export default async function InvestmentAdvisoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Conseil en investissement' : 'Investment advisory';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/investment-advisory"
        name={name}
        description={
          isFr
            ? 'Conseil en investissement conforme MiFID II et gestion de patrimoine personnalisée.'
            : 'MiFID II-compliant investment advisory and personalised wealth management.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name: isFr ? 'Services' : 'Services', path: '/services' },
          { name, path: '/investment-advisory' },
        ]}
      />
      {children}
    </>
  );
}
