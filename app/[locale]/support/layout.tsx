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
    pathname: '/support',
    title:
      locale === 'fr'
        ? 'Assistance Client — Centre d\'Aide Opulanz'
        : 'Customer Support — Opulanz Help Centre',
    description:
      locale === 'fr'
        ? 'Contactez l\'équipe Opulanz pour toute question sur vos comptes, services financiers, ou demandes de renseignements. Support disponible en français et en anglais.'
        : 'Contact the Opulanz team for questions about your accounts, financial services, or general enquiries. Support available in English and French.',
  });
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
