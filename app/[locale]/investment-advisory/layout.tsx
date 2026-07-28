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

export default function InvestmentAdvisoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
