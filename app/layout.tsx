import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opulanz',
  description: 'Opulanz Banking Platform',
};

/**
 * Root Layout (Required by Next.js App Router)
 *
 * This is the top-level layout that wraps the entire application.
 * Every Next.js App Router application MUST have a root layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
