import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { noIndexMetadata } from '@/lib/noindex';

export const metadata: Metadata = {
  ...noIndexMetadata,
  robots: { index: false, follow: true },
};

export default function InsurancePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/life-insurance`);
}
