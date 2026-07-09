import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opulanz',
  description: 'Opulanz Banking Platform',
};

// Minimal pass-through — every real route is handled by app/[locale]/layout.tsx
// which sets <html lang={locale}> correctly.  Rendering <html lang="en"> here
// would override that and produce a language-attribute mismatch for /fr routes.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.ReactElement;
}
