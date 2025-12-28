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
      firstName: "",
      lastName: "",
      role: "",
      email: "",
      phone: "",
    },
    accountingContact: null,
    hasAccountingContact: false,

    // Billing Volume
    salesInvoicesMonth: 0,
    purchaseInvoicesMonth: 0,
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
    if (currentStep < ACCOUNTING_STEPS.length) {
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

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const appId = `OPL-ACC-${Date.now()}`;

      console.log("Submitting accounting onboarding:", formData);

      // Prepare payload for Azure backend
      const applicationPayload = {
        type: "accounting",
        status: "submitted",
        payload: {
          // Company Basics
          companyType: formData.companyType,
          companyTypeOther: formData.companyTypeOther,
          countryOfIncorporation: formData.countryOfIncorporation,
          dateOfIncorporation: formData.dateOfIncorporation,
          shareCapital: {
            amount: formData.shareCapitalAmount,
            currency: formData.shareCapitalCurrency
          },
          legalName: formData.legalName,
          tradeName: formData.tradeName,
          registrationNumber: formData.registrationNumber,
          vatNumber: formData.vatNumber,

          // Activity & Scale
          businessActivity: formData.businessActivity,
          turnoverLastFY: {
            amount: formData.turnoverLastFYAmount,
            currency: formData.turnoverLastFYCurrency
          },
          turnoverCurrentFY: {
            amount: formData.turnoverCurrentFYAmount,
            currency: formData.turnoverCurrentFYCurrency
          },
          employeesFTE: formData.employeesFTE,

          // Contacts & Addresses
          registeredAddress: formData.registeredAddress,
          operatingAddress: formData.operatingAddress,
          sameAsRegistered: formData.sameAsRegistered,
          primaryContact: formData.primaryContact,
          accountingContact: formData.accountingContact,
          hasAccountingContact: formData.hasAccountingContact,

          // Billing Volume
          salesInvoicesMonth: formData.salesInvoicesMonth,
          purchaseInvoicesMonth: formData.purchaseInvoicesMonth,
          payrollNeeded: formData.payrollNeeded,
          payrollEmployees: formData.payrollEmployees,
          multiCurrencyEnabled: formData.multiCurrencyEnabled,
          multiCurrencies: formData.multiCurrencies,

          // Documents
          documents: formData.documents?.map((doc: any) => ({
            name: doc.name,
            type: doc.type,
            size: doc.size
          })) || [],

          // Consent
          consent: formData.consent,

          // Metadata
          applicationId: appId,
          submittedAt: new Date().toISOString(),
        }
      };

      // Submit to Azure backend API
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit accounting onboarding to backend');
      }

      const result = await response.json();
      console.log("Accounting onboarding saved to Azure database:", result);

      // Clear saved progress
      localStorage.removeItem("accounting-onboarding-progress");

      // Store application data in sessionStorage for confirmation page
      const confirmationData = {
        applicationId: appId,
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        email: formData.primaryContact?.email,
        primaryContactName: `${formData.primaryContact?.firstName || ''} ${formData.primaryContact?.lastName || ''}`.trim(),
        primaryContactPhone: formData.primaryContact?.phone,
        companyType: formData.companyType,
        registrationNumber: formData.registrationNumber,
        vatNumber: formData.vatNumber,
        submittedAt: new Date().toISOString(),
      };

      sessionStorage.setItem('accounting-application', JSON.stringify(confirmationData));

      // Redirect to professional confirmation page
      router.push(`/${locale}/invoicing-accounting/confirmation?ref=${appId}`);
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
          />
        );
      case 2:
        return (
          <ActivityScaleStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <ContactsAddressesStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <BillingVolumeStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
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
      canGoNext={currentStep < ACCOUNTING_STEPS.length}
      canGoBack={currentStep > 1}
      isLoading={isLoading}
      hideNavigation={currentStep === ACCOUNTING_STEPS.length}
    >
      {renderStep()}
    </AccountOpeningLayout>
  );
}
