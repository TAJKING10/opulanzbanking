"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewSubmitStepProps {
  data: any;
  onUpdate: (data: any) => void;
  locale: string;
}

const COUNTRIES: Record<string, string> = {
  LU: "Luxembourg",
  FR: "France",
  BE: "Belgium",
  DE: "Germany",
  NL: "Netherlands",
  IT: "Italy",
  ES: "Spain",
  PT: "Portugal",
  AT: "Austria",
  CH: "Switzerland",
  GB: "United Kingdom",
  US: "United States",
};

const CURRENCIES: Record<string, string> = {
  EUR: "€ Euro",
  USD: "$ US Dollar",
  GBP: "£ British Pound",
  CHF: "CHF Swiss Franc",
};

export function ReviewSubmitStep({ data, onUpdate, locale }: ReviewSubmitStepProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [applicationId, setApplicationId] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Generate application ID
      const appId = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log("Submitting life insurance application:", data);

      // Prepare payload for Azure backend
      const applicationPayload = {
        type: "insurance",
        status: "submitted",
        payload: {
          // Personal Information & Tax
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          placeOfBirth: data.placeOfBirth,
          nationality: data.nationality,
          email: data.email,
          phone: data.phone,
          address: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
          },
          taxResidentLU: data.taxResidentLU,
          additionalTaxResidencies: data.additionalTaxResidencies || [],

          // Financial Profile
          employmentStatus: data.employmentStatus,
          occupation: data.occupation,
          employer: data.employer,
          annualIncome: data.annualIncome,
          totalAssets: data.totalAssets,
          liquidAssets: data.liquidAssets,
          sourceOfFunds: data.sourceOfFunds,
          sourceOfFundsDetails: data.sourceOfFundsDetails,
          sourceOfWealth: data.sourceOfWealth,
          sourceOfWealthDetails: data.sourceOfWealthDetails,
          isPEP: data.isPEP,
          pepDetails: data.pepDetails,

          // Investment Profile
          investmentHorizon: data.investmentHorizon,
          investmentKnowledge: data.investmentKnowledge,
          investmentExperience: data.investmentExperience,
          riskTolerance: data.riskTolerance,
          investmentObjective: data.investmentObjective,
          expectedReturn: data.expectedReturn,
          liquidityNeeds: data.liquidityNeeds,

          // Premium & Payments
          currency: data.currency,
          premiumType: data.premiumType,
          singlePremiumAmount: data.singlePremiumAmount,
          regularPremiumAmount: data.regularPremiumAmount,
          regularPremiumFrequency: data.regularPremiumFrequency,
          paymentMethod: data.paymentMethod,
          bankDetails: {
            accountHolder: data.accountHolder,
            iban: data.iban,
            bic: data.bic,
            bankName: data.bankName,
          },

          // Beneficiaries
          beneficiaries: data.beneficiaries || [],

          // Compliance & Declarations
          declarations: {
            healthDeclaration: data.healthDeclaration,
            accuracyDeclaration: data.accuracyDeclaration,
            taxComplianceDeclaration: data.taxComplianceDeclaration,
            amlDeclaration: data.amlDeclaration,
            dataProcessingConsent: data.dataProcessingConsent,
            termsAndConditions: data.termsAndConditions,
            electronicSignature: data.electronicSignature,
            marketingConsent: data.marketingConsent,
          },
          complianceDocuments: data.complianceDocuments?.map((doc: any) => ({
            name: doc.name,
            type: doc.type,
            size: doc.size
          })) || [],
          uploadLater: data.uploadLater,

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
        throw new Error('Failed to submit life insurance application to backend');
      }

      const result = await response.json();
      console.log("Life insurance application saved to Azure database:", result);

      setApplicationId(appId);

      // Clear saved progress
      localStorage.removeItem("insurance-application-progress");

      setSubmitSuccess(true);
      onUpdate({ submitted: true, applicationId: appId });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        "An error occurred while submitting your application. Please try again or contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-brand-dark">Application Submitted!</h2>
          <p className="text-lg text-brand-grayMed">
            Thank you for your life insurance application
          </p>
        </div>

        <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
          <p className="mb-2 text-sm font-semibold text-brand-dark">Your Application ID:</p>
          <p className="text-2xl font-bold text-brand-gold">{applicationId}</p>
          <p className="mt-3 text-sm text-brand-grayMed">
            Please save this reference number for your records
          </p>
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-lg font-semibold text-brand-dark">What Happens Next?</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">Email Confirmation</p>
                <p className="text-sm text-brand-grayMed">
                  You'll receive a confirmation email at {data.email} within a few minutes with your
                  application details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">Document Review</p>
                <p className="text-sm text-brand-grayMed">
                  Our compliance team will review your application and documents within 3-5 business
                  days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">Medical Underwriting</p>
                <p className="text-sm text-brand-grayMed">
                  Depending on your premium amount and age, we may request additional medical
                  information or examination.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                4
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">Policy Issuance</p>
                <p className="text-sm text-brand-grayMed">
                  Once approved, your policy will be issued and you'll receive your policy documents
                  and payment instructions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-left text-sm text-blue-800">
              <p className="font-semibold">Need Help?</p>
              <p>
                If you have questions about your application, contact our client services team at{" "}
                <a href="mailto:insurance@opulanz.com" className="font-semibold underline">
                  insurance@opulanz.com
                </a>{" "}
                or call{" "}
                <a href="tel:+352123456789" className="font-semibold">
                  +352 123 456 789
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => router.push(`/${locale}`)}
            className="flex-1 bg-brand-gold text-white hover:bg-brand-goldDark"
          >
            Return to Home
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
          >
            Print Confirmation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Review & Submit</h2>
        <p className="text-brand-grayMed">
          Please review your information before submitting your application.
        </p>
      </div>

      {/* Suitability Warning */}
      {data.suitabilityWarning && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            <strong>Suitability Notice:</strong> {data.suitabilityWarning}
          </AlertDescription>
        </Alert>
      )}

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">Personal Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">Name</p>
              <p className="font-medium text-brand-dark">
                {data.title} {data.firstName} {data.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Date of Birth</p>
              <p className="font-medium text-brand-dark">{data.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Nationality</p>
              <p className="font-medium text-brand-dark">
                {COUNTRIES[data.nationality] || data.nationality}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Email</p>
              <p className="font-medium text-brand-dark">{data.email}</p>
            </div>
          </div>
        </div>

        {/* Financial Profile */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">Financial Profile</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">Employment Status</p>
              <p className="font-medium text-brand-dark capitalize">{data.employmentStatus}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Annual Income</p>
              <p className="font-medium text-brand-dark">{data.annualIncome}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Total Assets</p>
              <p className="font-medium text-brand-dark">{data.totalAssets}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Source of Funds</p>
              <p className="font-medium text-brand-dark capitalize">
                {data.sourceOfFunds.replace("-", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Investment Profile */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">Investment Profile</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">Investment Horizon</p>
              <p className="font-medium text-brand-dark capitalize">{data.investmentHorizon}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Investment Knowledge</p>
              <p className="font-medium text-brand-dark capitalize">{data.investmentKnowledge}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Risk Tolerance</p>
              <p className="font-medium text-brand-dark">
                {["Very Conservative", "Conservative", "Moderate", "Growth", "Aggressive"][
                  (data.riskTolerance || 3) - 1
                ]}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Investment Objective</p>
              <p className="font-medium text-brand-dark capitalize">
                {data.investmentObjective?.replace("-", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Details */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">Premium Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">Currency</p>
              <p className="font-medium text-brand-dark">{CURRENCIES[data.currency]}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">Premium Type</p>
              <p className="font-medium text-brand-dark capitalize">{data.premiumType}</p>
            </div>
            {data.premiumType === "single" && (
              <div>
                <p className="text-sm text-brand-grayMed">Premium Amount</p>
                <p className="font-medium text-brand-dark">
                  {data.currency === "EUR" ? "€" : data.currency === "USD" ? "$" : ""}
                  {parseFloat(data.singlePremiumAmount || "0").toLocaleString()}
                </p>
              </div>
            )}
            {data.premiumType === "regular" && (
              <>
                <div>
                  <p className="text-sm text-brand-grayMed">Premium Amount</p>
                  <p className="font-medium text-brand-dark">
                    {data.currency === "EUR" ? "€" : data.currency === "USD" ? "$" : ""}
                    {parseFloat(data.regularPremiumAmount || "0").toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-brand-grayMed">Frequency</p>
                  <p className="font-medium text-brand-dark capitalize">
                    {data.regularPremiumFrequency}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Beneficiaries */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">Beneficiaries</h3>
          {data.beneficiaries && data.beneficiaries.length > 0 ? (
            <div className="space-y-3">
              {data.beneficiaries.map((beneficiary: any, index: number) => (
                <div
                  key={beneficiary.id}
                  className="flex items-center justify-between rounded-lg border border-brand-grayLight bg-gray-50 p-3"
                >
                  <div>
                    <p className="font-medium text-brand-dark">
                      {beneficiary.firstName} {beneficiary.lastName}
                    </p>
                    <p className="text-sm text-brand-grayMed capitalize">
                      {beneficiary.type} • {beneficiary.relationship.replace("-", " ")}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-brand-gold">{beneficiary.percentage}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-grayMed">No beneficiaries designated</p>
          )}
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800">{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="mb-4 flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="flex-1 space-y-1 text-sm text-blue-800">
            <p className="font-semibold">Before You Submit</p>
            <p>
              By submitting this application, you confirm that all information provided is accurate
              and complete. You also acknowledge that you have read and agreed to all declarations
              and terms and conditions.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-brand-gold text-white hover:bg-brand-goldDark disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
}
