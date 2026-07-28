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
    pathname: '/legal/privacy',
    title: locale === 'fr' ? 'Politique de Confidentialité | Opulanz' : 'Privacy Policy | Opulanz',
    description:
      locale === 'fr'
        ? 'Politique de confidentialité d\'Opulanz : comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.'
        : 'Opulanz privacy policy: how we collect, use, and protect your personal data in compliance with GDPR.',
  });
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
