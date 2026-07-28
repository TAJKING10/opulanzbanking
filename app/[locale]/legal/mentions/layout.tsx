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
    pathname: '/legal/mentions',
    title: locale === 'fr' ? 'Mentions Légales | Opulanz' : 'Legal Mentions | Opulanz',
    description:
      locale === 'fr'
        ? 'Mentions légales d\'Opulanz : informations sur l\'éditeur, hébergeur et cadre juridique de nos services financiers.'
        : 'Legal mentions for Opulanz: publisher information, hosting details, and legal framework for our financial services.',
  });
}

export default function MentionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
