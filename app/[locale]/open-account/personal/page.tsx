"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountOpeningLayout } from "@/components/account-opening/account-opening-layout";
import { Step } from "@/components/account-opening/stepper";

// Import step components (will create these)
import { WelcomeStep } from "@/components/account-opening/personal/welcome-step";
import { IdentityContactStep } from "@/components/account-opening/personal/identity-contact-step";
import { AccountIntentStep } from "@/components/account-opening/personal/account-intent-step";
import { EligibilityDocumentsStep } from "@/components/account-opening/personal/eligibility-documents-step";
import { ReviewConsentsStep } from "@/components/account-opening/personal/review-consents-step";
import { SubmissionStep } from "@/components/account-opening/personal/submission-step";

const PERSONAL_ACCOUNT_STEPS: Step[] = [
  { id: 1, label: "Welcome", description: "Get started" },
  { id: 2, label: "Identity", description: "Your details" },
  { id: 3, label: "Intent", description: "Account type" },
  { id: 4, label: "Documents", description: "Verification" },
  { id: 5, label: "Review", description: "Confirm details" },
  { id: 6, label: "Submit", description: "Final step" },
];

export default function PersonalAccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, any>>({
    accountType: "personal",
    mode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emailVerified: false,
    phoneVerified: false,
    accountIntent: "",
    residence: "",
    country: "",
    currencies: [],
    monthlyTransfers: 5000,
    sourceOfFunds: "",
    sourceOfFundsOther: "",
    pepScreening: false,
    documents: [],
    consents: {
      processing: false,
      dataSharing: false,
      marketing: false,
    },
  });

  // Load saved progress from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("personal-account-progress");
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

  // Save progress to localStorage
  React.useEffect(() => {
    localStorage.setItem(
      "personal-account-progress",
      JSON.stringify({ formData, currentStep })
    );
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < PERSONAL_ACCOUNT_STEPS.length) {
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
  const canProceed = () => {
    if (currentStep === 1) {
      // Welcome step - check if mode is selected
      return !!formData.mode;
    }
    if (currentStep === 2) {
      // Identity step - check if all fields are filled
      const hasAllFields =
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.email?.trim() &&
        formData.phone?.trim();

      console.log("Step 2 validation check:", {
        formData,
        hasAllFields,
        isIdentityStepValid: formData.isIdentityStepValid
      });

      return formData.isIdentityStepValid === true || hasAllFields;
    }
    if (currentStep === 3) {
      // Intent step - check if all required fields are filled
      return formData.isIntentStepValid === true;
    }
    if (currentStep === 4) {
      // Documents step - check if documents are uploaded or upload later is selected
      return formData.isDocumentsStepValid === true;
    }
    if (currentStep === 5) {
      // Review step - check if consents are accepted
      return formData.canContinueReview === true;
    }
    return true; // Other steps handle their own validation
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <IdentityContactStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <AccountIntentStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <EligibilityDocumentsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <ReviewConsentsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <SubmissionStep
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
      title="Open a Personal Account"
      description="Complete your application in 6 simple steps"
      steps={PERSONAL_ACCOUNT_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onBack={handleBack}
      canGoNext={currentStep < PERSONAL_ACCOUNT_STEPS.length && canProceed()}
      canGoBack={currentStep > 1 && currentStep < PERSONAL_ACCOUNT_STEPS.length}
      isLoading={isLoading}
      hideNavigation={currentStep === PERSONAL_ACCOUNT_STEPS.length}
    >
      {renderStep()}
    </AccountOpeningLayout>
  );
}
