import type { Metadata } from 'next';
import { baseUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Opulanz — Financial & Business Platform | Luxembourg & Europe',
    template: '%s',
  },
  description:
    'Luxembourg-based European financial and business platform for companies and entrepreneurs.',
  // Root `/` is a locale redirect shell — do not index it.
  robots: { index: false, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.ReactElement;
}
