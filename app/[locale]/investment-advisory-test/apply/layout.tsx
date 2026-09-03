import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advisory Request | Investment Advisory Test | Opulanz",
  description:
    "Complete the MiFID II investor profile questionnaire for the Opulanz investment advisory service.",
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

export default function IATApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
