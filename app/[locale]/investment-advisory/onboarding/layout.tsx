import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Profile & Onboarding (MiFID II) | Opulanz Banking",
  description: "Complete your investor profile, risk assessment, and electronic signature for Opulanz Investment Advisory.",
};

export default function InvestmentAdvisoryOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
