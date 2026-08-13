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
    pathname: '/mortgage/apply',
    title:
      locale === 'fr'
        ? 'Demande de Crédit Immobilier | Opulanz'
        : 'Mortgage Application | Opulanz',
    description:
      locale === 'fr'
        ? 'Déposez votre dossier de crédit immobilier en ligne. Pré-qualification, collecte de documents et soumission aux banques partenaires en France et au Luxembourg.'
        : 'Submit your mortgage application online. Pre-qualification, document collection and submission to partner banks in France and Luxembourg.',
  });
}

export default function MortgageApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
