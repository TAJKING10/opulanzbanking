"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { KYCWizardProvider } from "@/contexts/KYCWizardContext";
import { KYCWizard } from "@/components/kyc/KYCWizard";

export default function InvestmentOnboardingPage() {
  const t = useTranslations('investmentAdvisory.onboarding');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-brand-gold/10 rounded-full">
            <span className="text-sm font-semibold text-brand-gold">{t('badge')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <KYCWizardProvider>
            <KYCWizard />
          </KYCWizardProvider>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-grayMed">
            🔒 {t('securityNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
