import type { Metadata } from 'next';
import { DashboardShell } from '@/components/dashboard-shell';
import { noIndexMetadata } from '@/lib/noindex';

export const metadata: Metadata = {
  title: 'Dashboard | Opulanz',
  ...noIndexMetadata,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
