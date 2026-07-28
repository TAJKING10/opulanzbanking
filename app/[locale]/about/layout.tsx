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

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
