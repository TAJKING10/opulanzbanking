"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AccountOpeningLayout } from "@/components/account-opening/account-opening-layout";
import { Step } from "@/components/account-opening/stepper";

// Import step components
import { BusinessWelcomeStep } from "@/components/account-opening/business/welcome-step";
import { CompanyStatusStep } from "@/components/account-opening/business/company-status-step";
import { JurisdictionStep } from "@/components/account-opening/business/jurisdiction-step";
import { DirectorsUBOsStep } from "@/components/account-opening/business/directors-ubos-step";
import { CompanyFormationStep } from "@/components/account-opening/business/company-formation-step";
import { BusinessDocumentsStep } from "@/components/account-opening/business/documents-step";
import { BusinessReviewConsentsStep } from "@/components/account-opening/business/review-consents-step";
import { BusinessSubmissionStep } from "@/components/account-opening/business/submission-step";

export default function BusinessAccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations("accountOpening.business");

  const BUSINESS_ACCOUNT_STEPS: Step[] = [
    { id: 1, label: t("steps.welcome.label"), description: t("steps.welcome.description") },
    { id: 2, label: t("steps.company.label"), description: t("steps.company.description") },
    { id: 3, label: t("steps.jurisdiction.label"), description: t("steps.jurisdiction.description") },
    { id: 4, label: t("steps.directors.label"), description: t("steps.directors.description") },
    { id: 5, label: t("steps.formation.label"), description: t("steps.formation.description") },
    { id: 6, label: t("steps.documents.label"), description: t("steps.documents.description") },
    { id: 7, label: t("steps.review.label"), description: t("steps.review.description") },
    { id: 8, label: t("steps.submit.label"), description: t("steps.submit.description") },
  ];

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, any>>({
    accountType: "business",
    companyStatus: "",
    companyName: "",
    registrationNumber: "",
    jurisdiction: "",
    directors: [],
    ubos: [],
    formationNeeded: false,
    formationJurisdiction: "",
    documents: [],
    consents: {
      processing: false,
      dataSharing: false,
      marketing: false,
    },
  });

  // Load saved progress
  React.useEffect(() => {
    const saved = localStorage.getItem("business-account-progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setCurrentStep(parsed.currentStep || 1);
      } catch (e) {
        console.error("Failed to load saved progress", e);
      }
    }
  }, []);

  // Save progress
  React.useEffect(() => {
    localStorage.setItem(
      "business-account-progress",
      JSON.stringify({ formData, currentStep })
    );
  }, [formData, currentStep]);

  const handleNext = () => {
    // Skip company formation step if company already exists
    if (currentStep === 4 && formData.companyStatus === "existing") {
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep < BUSINESS_ACCOUNT_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    // Skip company formation step if company already exists
    if (currentStep === 6 && formData.companyStatus === "existing") {
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
  const canProceed = () => {
    if (currentStep === 1) {
      // Welcome step - always allow since it's just informational
      return true;
    }
    if (currentStep === 2) {
      // Company Status step - check if status is selected and details filled
      return formData.isCompanyStepValid === true;
    }
    if (currentStep === 3) {
      // Jurisdiction step - check if jurisdiction is selected
      return formData.isJurisdictionStepValid === true;
    }
    if (currentStep === 4) {
      // Directors/UBOs step - check if directors and UBOs are filled
      return formData.isDirectorsStepValid === true;
    }
    if (currentStep === 5) {
      // Company Formation step - check if details are filled (only for new companies)
      if (formData.companyStatus === "new") {
        // Fallback validation in case flag isn't set
        const hasAllFields =
          formData.proposedCompanyName?.trim() &&
          formData.businessActivity?.trim() &&
          formData.shareCapital;

        console.log("Step 5 validation check:", {
          formData,
          hasAllFields,
          isFormationStepValid: formData.isFormationStepValid
        });

        return formData.isFormationStepValid === true || hasAllFields;
      }
      return true; // Skip for existing companies
    }
    if (currentStep === 6) {
      // Documents step - check if documents are uploaded or upload later selected
      return formData.isDocumentsStepValid === true;
    }
    if (currentStep === 7) {
      // Review step - check if consents are accepted
      return formData.isReviewStepValid === true;
    }
    return true; // Other steps handle their own validation
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessWelcomeStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <CompanyStatusStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <JurisdictionStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <DirectorsUBOsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <CompanyFormationStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <BusinessDocumentsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 7:
        return (
          <BusinessReviewConsentsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 8:
        return (
          <BusinessSubmissionStep
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
      steps={BUSINESS_ACCOUNT_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onBack={handleBack}
      canGoNext={currentStep < BUSINESS_ACCOUNT_STEPS.length && canProceed()}
      canGoBack={currentStep > 1 && currentStep < BUSINESS_ACCOUNT_STEPS.length}
      isLoading={isLoading}
      hideNavigation={currentStep === BUSINESS_ACCOUNT_STEPS.length}
    >
      {renderStep()}
    </AccountOpeningLayout>
  );
}
