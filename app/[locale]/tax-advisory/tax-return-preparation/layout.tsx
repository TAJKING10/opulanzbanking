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
    pathname: '/tax-advisory/tax-return-preparation',
    title:
      locale === 'fr'
        ? 'Préparation de Déclaration Fiscale | Conseil Fiscal Opulanz'
        : 'Tax Return Preparation Service | Opulanz Tax Advisory',
    description:
      locale === 'fr'
        ? 'Service de préparation des déclarations fiscales pour particuliers et entreprises en France et au Luxembourg. Nos experts gèrent toute la procédure pour vous.'
        : 'Professional tax return preparation for individuals and businesses in France and Luxembourg. Our certified advisors handle the full filing process for you.',
  });
}

export default function TaxReturnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
