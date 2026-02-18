"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AccountOpeningLayout } from "@/components/account-opening/account-opening-layout";
import { Step } from "@/components/account-opening/stepper";

// Import step components
import { PolicyholderTaxStep } from "@/components/account-opening/insurance/policyholder-tax-step";
import { FinancialProfileStep } from "@/components/account-opening/insurance/financial-profile-step";
import { InvestmentProfileStep } from "@/components/account-opening/insurance/investment-profile-step";
import { PremiumPaymentsStep } from "@/components/account-opening/insurance/premium-payments-step";
import { BeneficiariesStep } from "@/components/account-opening/insurance/beneficiaries-step";
import { ComplianceDeclarationsStep } from "@/components/account-opening/insurance/compliance-declarations-step";
import { ReviewSubmitStep } from "@/components/account-opening/insurance/review-submit-step";

export default function InsurancePage() {
  const t = useTranslations("insurance");
  const params = useParams();
  const locale = params.locale as string;

  const INSURANCE_STEPS: Step[] = [
    { id: 1, label: t("steps.personal.label"), description: t("steps.personal.description") },
    { id: 2, label: t("steps.financial.label"), description: t("steps.financial.description") },
    { id: 3, label: t("steps.investment.label"), description: t("steps.investment.description") },
    { id: 4, label: t("steps.premium.label"), description: t("steps.premium.description") },
    { id: 5, label: t("steps.beneficiaries.label"), description: t("steps.beneficiaries.description") },
    { id: 6, label: t("steps.compliance.label"), description: t("steps.compliance.description") },
    { id: 7, label: t("steps.review.label"), description: t("steps.review.description") },
  ];

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, any>>({
    // Step 1: Policyholder & Tax
    title: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
    taxResidentLU: true,
    additionalTaxResidencies: [],

    // Step 2: Financial Profile
    employmentStatus: "",
    occupation: "",
    employer: "",
    annualIncome: "",
    totalAssets: "",
    liquidAssets: "",
    sourceOfFunds: "",
    sourceOfFundsDetails: "",
    sourceOfWealth: "",
    sourceOfWealthDetails: "",
    isPEP: false,
    pepDetails: "",

    // Step 3: Investment Profile
    investmentHorizon: "",
    investmentKnowledge: "",
    investmentExperience: "",
    riskTolerance: 3,
    investmentObjective: "",
    expectedReturn: "",
    liquidityNeeds: "",

    // Step 4: Premium & Payments
    currency: "EUR",
    premiumType: "",
    singlePremiumAmount: "",
    regularPremiumAmount: "",
    regularPremiumFrequency: "",
    paymentMethod: "",
    accountHolder: "",
    iban: "",
    bic: "",
    bankName: "",

    // Step 5: Beneficiaries
    beneficiaries: [],

    // Step 6: Compliance & Declarations
    healthDeclaration: false,
    accuracyDeclaration: false,
    taxComplianceDeclaration: false,
    amlDeclaration: false,
    dataProcessingConsent: false,
    termsAndConditions: false,
    electronicSignature: false,
    marketingConsent: false,
    complianceDocuments: [],
    uploadLater: false,

    // Validation flags
    isPolicyholderStepValid: false,
    isFinancialStepValid: false,
    isInvestmentStepValid: false,
    isPremiumStepValid: false,
    isBeneficiariesStepValid: false,
    isComplianceStepValid: false,
  });

  // Load saved progress
  React.useEffect(() => {
    const saved = localStorage.getItem("insurance-application-progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setCurrentStep(parsed.currentStep || 1);
      } catch (e) {
        console.error("Failed to load saved progress", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save progress
  React.useEffect(() => {
    if (!formData.submitted) {
      localStorage.setItem(
        "insurance-application-progress",
        JSON.stringify({ formData, currentStep })
      );
    }
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < INSURANCE_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepChange = (stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Check if current step allows navigation
  const canProceed = () => { return true; }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PolicyholderTaxStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <FinancialProfileStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <InvestmentProfileStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <PremiumPaymentsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <BeneficiariesStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <ComplianceDeclarationsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 7:
        return (
          <ReviewSubmitStep
            data={formData}
            onUpdate={updateFormData}
            locale={locale}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AccountOpeningLayout
      title={t("title")}
      description={t("description")}
      steps={INSURANCE_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onBack={handleBack}
      canGoNext={currentStep < INSURANCE_STEPS.length && canProceed()}
      canGoBack={currentStep > 1 && !formData.submitted}
      isLoading={isLoading}
      hideNavigation={currentStep === INSURANCE_STEPS.length && formData.submitted}
    >
      {renderStep()}
    </AccountOpeningLayout>
  );
}
