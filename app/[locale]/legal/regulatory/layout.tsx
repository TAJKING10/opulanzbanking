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
    pathname: '/legal/regulatory',
    title:
      locale === 'fr'
        ? 'Statut Réglementaire & Licences | Opulanz'
        : 'Regulatory Status & Licences | Opulanz',
    description:
      locale === 'fr'
        ? 'Statut réglementaire d\'Opulanz : agréments ACPR, AMF, ORIAS et CSSF. Informations sur nos licences et obligations de conformité financière.'
        : 'Opulanz regulatory status: ACPR, AMF, ORIAS, and CSSF authorisations. Details on our licences and financial compliance obligations.',
  });
}

export default function RegulatoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
