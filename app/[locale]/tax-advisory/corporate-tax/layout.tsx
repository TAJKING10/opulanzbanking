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
    pathname: '/tax-advisory/corporate-tax',
    title:
      locale === 'fr'
        ? 'Conseil Fiscal pour Entreprises — France & Luxembourg | Opulanz'
        : 'Corporate Tax Advisory — France & Luxembourg | Opulanz',
    description:
      locale === 'fr'
        ? 'Conseil fiscal pour entreprises en France et au Luxembourg. Optimisation fiscale, conformité IS, TVA et stratégies de holding pour PME et multinationales.'
        : 'Corporate tax advisory for businesses in France and Luxembourg. Tax optimisation, corporate income tax, VAT compliance, and holding structures for SMEs and groups.',
  });
}

export default function CorporateTaxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
