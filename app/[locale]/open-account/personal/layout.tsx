import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/noindex';

export const metadata: Metadata = noIndexMetadata;

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
