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
    pathname: '/contact',
    title:
      locale === 'fr'
        ? 'Contactez-nous — Opulanz'
        : 'Contact Us — Opulanz',
    description:
      locale === 'fr'
        ? "Contactez l'équipe Opulanz par téléphone, e-mail ou chat en direct. Nos bureaux sont à Luxembourg, Paris et Riga."
        : 'Reach the Opulanz team by phone, email, or live chat. Our offices are in Luxembourg, Paris, and Riga.',
  });
}

export default async function ContactLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Contactez-nous' : 'Contact Us';

  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/contact"
        name={name}
        description={
          isFr
            ? "Contactez Opulanz par téléphone, e-mail ou chat en direct."
            : 'Contact Opulanz by phone, email, or live chat.'
        }
        pageType="ContactPage"
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name, path: '/contact' },
        ]}
      />
      {children}
    </>
  );
}
