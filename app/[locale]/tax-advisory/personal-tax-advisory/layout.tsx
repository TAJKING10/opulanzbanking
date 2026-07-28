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
    pathname: '/tax-advisory/personal-tax-advisory',
    title:
      locale === 'fr'
        ? 'Conseil Fiscal Personnel — Particuliers & Expatriés | Opulanz'
        : 'Personal Tax Advisory — Individuals & Expats | Opulanz',
    description:
      locale === 'fr'
        ? 'Conseil fiscal personnalisé pour particuliers, expatriés et non-résidents en France et au Luxembourg. Optimisation fiscale, déclarations et planification patrimoniale.'
        : 'Personalised tax advice for individuals, expats, and non-residents in France and Luxembourg. Tax optimisation, filings, and wealth planning tailored to your situation.',
  });
}

export default function PersonalTaxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
