"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountOpeningLayout } from "@/components/account-opening/account-opening-layout";
import { Step } from "@/components/account-opening/stepper";

// Import accounting step components
import { CompanyBasicsStep } from "@/components/accounting/company-basics-step";
import { ActivityScaleStep } from "@/components/accounting/activity-scale-step";
import { ContactsAddressesStep } from "@/components/accounting/contacts-addresses-step";
import { BillingVolumeStep } from "@/components/accounting/billing-volume-step";
import { DocumentsStep } from "@/components/accounting/documents-step";
import { ReviewSubmitStep } from "@/components/accounting/review-submit-step";

const ACCOUNTING_STEPS: Step[] = [
  { id: 1, label: "Company", description: "Basic details" },
  { id: 2, label: "Activity", description: "Business & scale" },
  { id: 3, label: "Contacts", description: "Addresses & people" },
  { id: 4, label: "Volume", description: "Billing info" },
  { id: 5, label: "Documents", description: "Optional uploads" },
  { id: 6, label: "Review", description: "Confirm & submit" },
];

export default function AccountingOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStepValid, setIsStepValid] = React.useState(true);
  const [formData, setFormData] = React.useState<Record<string, any>>({
    // Company Basics
    companyType: "",
    companyTypeOther: "",
    countryOfIncorporation: "",
    dateOfIncorporation: "",
    shareCapitalAmount: 0,
    shareCapitalCurrency: "EUR",
    legalName: "",
    tradeName: "",
    registrationNumber: "",
    vatNumber: "",

    // Activity & Scale
    businessActivity: "",
    turnoverLastFYAmount: 0,
    turnoverLastFYCurrency: "EUR",
    turnoverCurrentFYAmount: 0,
    turnoverCurrentFYCurrency: "EUR",
    employeesFTE: 0,

    // Contacts & Addresses
    registeredAddress: {
      street: "",
      city: "",
      postal: "",
      country: "",
    },
    operatingAddress: {
      street: "",
      city: "",
      postal: "",
      country: "",
    },
    sameAsRegistered: false,
    primaryContact: {
      id: "",
      firstName: "",
      lastName: "",
      role: "",
      email: "",
      phone: "",
    },
    accountingContact: null,
    hasAccountingContact: false,

    // Billing Volume
    salesInvoicesMonth: undefined,
    purchaseInvoicesMonth: undefined,
    payrollNeeded: false,
    payrollEmployees: 0,
    multiCurrencyEnabled: false,
    multiCurrencies: [],

    // Documents
    documents: [],

    // Consent
    consent: false,
  });

  // Load saved progress from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("accounting-onboarding-progress");
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
      "accounting-onboarding-progress",
      JSON.stringify({ formData, currentStep })
    );
  }, [formData, currentStep]);

  const handleNext = () => {
    // Only proceed if current step is valid
    if (isStepValid && currentStep < ACCOUNTING_STEPS.length) {
      setCurrentStep(currentStep + 1);
      setIsStepValid(true); // Reset for next step
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

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // In a real app, submit to backend API
      console.log("Submitting accounting onboarding:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear saved progress
      localStorage.removeItem("accounting-onboarding-progress");

      // Redirect to success page or show confirmation
      alert("Application submitted successfully! We'll be in touch soon.");
      router.push(`/${locale}/invoicing-accounting`);
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyBasicsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onValidate={setIsStepValid}
          />
        );
      case 2:
        return (
          <ActivityScaleStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onValidate={setIsStepValid}
          />
        );
      case 3:
        return (
          <ContactsAddressesStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onValidate={setIsStepValid}
          />
        );
      case 4:
        return (
          <BillingVolumeStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onValidate={setIsStepValid}
          />
        );
      case 5:
        return (
          <DocumentsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <ReviewSubmitStep
            data={formData}
            onUpdate={updateFormData}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AccountOpeningLayout
      title="Accounting & Bookkeeping Onboarding"
      description="Complete your application in 6 simple steps"
      steps={ACCOUNTING_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onBack={handleBack}
      canGoNext={currentStep < ACCOUNTING_STEPS.length && isStepValid}
      canGoBack={currentStep > 1}
      isLoading={isLoading}
    >
      {renderStep()}
    </AccountOpeningLayout>
  );
}
