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
    pathname: '/invoicing-accounting',
    title:
      locale === 'fr'
        ? 'Comptabilité & Facturation — Services au Luxembourg | Opulanz'
        : 'Accounting & Invoicing Services — Luxembourg | Opulanz',
    description:
      locale === 'fr'
        ? 'Services de comptabilité et facturation pour entreprises et indépendants au Luxembourg. Facturation automatisée, comptabilité, paie et tableaux de bord financiers.'
        : 'Accounting and invoicing services for businesses and freelancers in Luxembourg. Automated invoicing, bookkeeping, payroll, and financial dashboards.',
  });
}

export default function InvoicingAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
