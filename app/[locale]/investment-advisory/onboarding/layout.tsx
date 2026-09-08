import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investor Profile & Onboarding (MiFID II) | Opulanz',
  description:
    'Complete your investor profile, risk assessment, and electronic signature for Opulanz Investment Advisory.',
  robots: { index: false, follow: false },
};

export default function InvestmentAdvisoryOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
