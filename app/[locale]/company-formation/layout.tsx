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
    pathname: '/company-formation',
    title:
      locale === 'fr'
        ? 'Création d\'Entreprise au Luxembourg et en France | Opulanz'
        : 'Company Formation Assistance in Luxembourg & France | Opulanz',
    description:
      locale === 'fr'
        ? 'Créez votre entreprise au Luxembourg ou en France avec Opulanz. SARL, SA, SCSp et plus — dépôt légal, adresse enregistrée et ouverture de compte bancaire inclus.'
        : 'Register your company in Luxembourg or France with Opulanz. SARL, SA, SCSp and more — legal filing, registered address, and bank account setup included.',
  });
}

export default function CompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
