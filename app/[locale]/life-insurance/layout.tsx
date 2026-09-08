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
    pathname: '/life-insurance',
    title:
      locale === 'fr'
        ? 'Assurance Vie — Solutions Personnelles & Entreprises | Opulanz'
        : 'Life Insurance Solutions — Personal & Business | Opulanz',
    description:
      locale === 'fr'
        ? 'Solutions d\'assurance vie pour particuliers et entreprises via Opulanz. Assurance temporaire, vie entière et contrats en unités de compte adaptés à votre situation.'
        : 'Life insurance solutions for individuals and businesses through Opulanz. Term life, whole life, and unit-linked policies tailored to your needs in France and Luxembourg.',
  });
}

export default async function LifeInsuranceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Assurance vie' : 'Life insurance';
  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/life-insurance"
        name={name}
        description={
          isFr
            ? "Solutions d'assurance vie pour particuliers et entreprises."
            : 'Life insurance solutions for individuals and businesses.'
        }
        service
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name: isFr ? 'Services' : 'Services', path: '/services' },
          { name, path: '/life-insurance' },
        ]}
      />
      {children}
    </>
  );
}
