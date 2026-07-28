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

export default function TaxAdvisoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
