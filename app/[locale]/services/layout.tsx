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
    pathname: '/services',
    title:
      locale === 'fr'
        ? 'Nos Services — Paiement, Conseil & Business | Opulanz'
        : 'Our Services — Payment, Advisory & Business | Opulanz',
    description:
      locale === 'fr'
        ? 'Explorez tous les services Opulanz : comptes de paiement, création d\'entreprise, conseil fiscal, conseil en investissement et assurance vie en France et au Luxembourg.'
        : 'Explore all Opulanz services: payment accounts, company formation, tax advisory, investment advisory, and life insurance in France and Luxembourg.',
  });
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
