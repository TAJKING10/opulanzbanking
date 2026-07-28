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
    pathname: '/legal/terms',
    title:
      locale === 'fr' ? 'Conditions Générales d\'Utilisation | Opulanz' : 'Terms & Conditions | Opulanz',
    description:
      locale === 'fr'
        ? 'Conditions générales d\'utilisation des services Opulanz. Droits, obligations et modalités d\'accès à nos services financiers réglementés.'
        : 'Terms and conditions for Opulanz services. Rights, obligations, and conditions of access to our regulated financial services.',
  });
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
