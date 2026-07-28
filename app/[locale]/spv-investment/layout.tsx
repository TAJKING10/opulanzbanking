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
    pathname: '/spv-investment',
    title:
      locale === 'fr'
        ? 'Plateforme d\'Investissement SPV — Immobilier & Private Equity | Opulanz'
        : 'SPV Investment Platform — Real Estate & Private Equity | Opulanz',
    description:
      locale === 'fr'
        ? 'Investissez dans l\'immobilier et le private equity via des véhicules SPV structurés avec Opulanz. Accès simplifié aux actifs alternatifs pour investisseurs qualifiés.'
        : 'Invest in real estate and private equity through structured SPV vehicles with Opulanz. Simplified access to alternative assets for qualified investors.',
  });
}

export default function SpvInvestmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
