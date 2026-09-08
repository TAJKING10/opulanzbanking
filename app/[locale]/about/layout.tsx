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
    pathname: '/about',
    title:
      locale === 'fr'
        ? "À Propos d'Opulanz — 19 Ans d'Expertise Financière"
        : 'About Opulanz — 19+ Years of Financial Expertise | Europe',
    description:
      locale === 'fr'
        ? "Découvrez Opulanz — plus de 19 ans d'expertise financière réglementée en France et au Luxembourg. Comptes de paiement, conseil en investissement, fiscalité et assurance vie."
        : 'Discover Opulanz — over 19 years of regulated financial expertise in France and Luxembourg. Payment accounts, investment advisory, tax consulting, and life insurance.',
  });
}

export default async function AboutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? "À propos d'Opulanz" : 'About Opulanz';
  const description = isFr
    ? "Plus de 19 ans d'expertise financière réglementée en France et au Luxembourg."
    : 'Over 19 years of regulated financial expertise in France and Luxembourg.';

  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/about"
        name={name}
        description={description}
        pageType="AboutPage"
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name, path: '/about' },
        ]}
      />
      {children}
    </>
  );
}
