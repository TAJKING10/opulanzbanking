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
    pathname: '/tax-advisory/tax-compliance',
    title:
      locale === 'fr'
        ? 'Services de Conformité Fiscale pour Entreprises | Opulanz'
        : 'Tax Compliance Services for Businesses | Opulanz',
    description:
      locale === 'fr'
        ? 'Services de conformité fiscale pour entreprises en France et au Luxembourg. Déclarations TVA, obligations déclaratives et veille réglementaire fiscale.'
        : 'Tax compliance services for businesses in France and Luxembourg. VAT filings, regulatory reporting, and ongoing fiscal obligations managed by our experts.',
  });
}

export default function TaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
