import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Advisory Test | Opulanz",
  description: "Private review prototype for the Opulanz investment advisory service.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function InvestmentAdvisoryTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
