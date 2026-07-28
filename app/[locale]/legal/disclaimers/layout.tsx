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
    pathname: '/legal/disclaimers',
    title: locale === 'fr' ? 'Avertissements | Opulanz' : 'Disclaimers | Opulanz',
    description:
      locale === 'fr'
        ? 'Avertissements légaux d\'Opulanz sur les risques d\'investissement, les performances passées et les limites de nos conseils financiers.'
        : 'Legal disclaimers from Opulanz on investment risks, past performance, and the limitations of our financial advice.',
  });
}

export default function DisclaimersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
