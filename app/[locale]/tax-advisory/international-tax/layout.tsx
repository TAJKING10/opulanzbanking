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
    pathname: '/tax-advisory/international-tax',
    title:
      locale === 'fr'
        ? 'Planification Fiscale Internationale & Conseil | Opulanz'
        : 'International Tax Planning & Advisory | Opulanz',
    description:
      locale === 'fr'
        ? 'Conseil en fiscalité internationale pour expatriés, entreprises multinationales et investisseurs transfrontaliers. Expertise France, Luxembourg et Union Européenne.'
        : 'International tax advisory for expats, multinationals, and cross-border investors. Expert guidance covering France, Luxembourg, and European tax treaties.',
  });
}

export default function InternationalTaxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
