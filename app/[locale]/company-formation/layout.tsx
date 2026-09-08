import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/app/[locale]/metadata';
import { PageJsonLd } from '@/components/seo/page-json-ld';

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

export default async function CompanyFormationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? "Création d'entreprise" : 'Company formation assistance';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/company-formation"
        name={name}
        description={
          isFr
            ? 'Créez votre entreprise au Luxembourg ou en France avec accompagnement juridique.'
            : 'Register your company in Luxembourg or France with legal and regulatory support.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name: isFr ? 'Services' : 'Services', path: '/services' },
          { name, path: '/company-formation' },
        ]}
      />
      {children}
    </>
  );
}
