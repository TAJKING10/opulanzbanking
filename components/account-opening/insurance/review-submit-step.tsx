"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  EUR: "\u20ac Euro",
  USD: "$ US Dollar",
  GBP: "\u00a3 British Pound",
  CHF: "CHF Swiss Franc",
};

export function ReviewSubmitStep({ data, onUpdate, locale }: ReviewSubmitStepProps) {
  const t = useTranslations("insurance.reviewSubmit");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [applicationId, setApplicationId] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const appId = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log("Submitting life insurance application:", data);

      const applicationPayload = {
        type: "insurance",
        status: "submitted",
        payload: {
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
          investmentHorizon: data.investmentHorizon,
          investmentKnowledge: data.investmentKnowledge,
          investmentExperience: data.investmentExperience,
          riskTolerance: data.riskTolerance,
          investmentObjective: data.investmentObjective,
          expectedReturn: data.expectedReturn,
          liquidityNeeds: data.liquidityNeeds,
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
          beneficiaries: data.beneficiaries || [],
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
          applicationId: appId,
          submittedAt: new Date().toISOString(),
        }
      };

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit life insurance application to backend');
      }

      const result = await response.json();
      console.log("Life insurance application saved to Azure database:", result);

      setApplicationId(appId);
      localStorage.removeItem("insurance-application-progress");
      setSubmitSuccess(true);
      onUpdate({ submitted: true, applicationId: appId });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(t("submitError"));
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
          <h2 className="text-3xl font-bold text-brand-dark">{t("success.title")}</h2>
          <p className="text-lg text-brand-grayMed">{t("success.subtitle")}</p>
        </div>

        <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
          <p className="mb-2 text-sm font-semibold text-brand-dark">{t("success.applicationId")}:</p>
          <p className="text-2xl font-bold text-brand-gold">{applicationId}</p>
          <p className="mt-3 text-sm text-brand-grayMed">{t("success.saveReference")}</p>
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-lg font-semibold text-brand-dark">{t("success.whatsNext")}</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">1</div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">{t("success.step1Title")}</p>
                <p className="text-sm text-brand-grayMed">{t("success.step1Desc", { email: data.email })}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">2</div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">{t("success.step2Title")}</p>
                <p className="text-sm text-brand-grayMed">{t("success.step2Desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">3</div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">{t("success.step3Title")}</p>
                <p className="text-sm text-brand-grayMed">{t("success.step3Desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">4</div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">{t("success.step4Title")}</p>
                <p className="text-sm text-brand-grayMed">{t("success.step4Desc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PayPal Payment Section */}
        <div className="rounded-lg border-2 border-brand-gold bg-gradient-to-b from-white to-brand-gold/5 p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-brand-dark">{t("success.completePayment")}</h3>
              <p className="mt-2 text-brand-grayMed">{t("success.paymentDesc")}</p>
            </div>

            <div className="rounded-lg border border-brand-grayLight bg-white p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-grayLight pb-4">
                  <span className="text-lg font-semibold text-brand-dark">{t("success.premiumAmount")}:</span>
                  <span className="text-2xl font-bold text-brand-gold">
                    {data.premiumType === "single" ? (
                      <>
                        {data.currency === "EUR" ? "\u20ac" : data.currency === "USD" ? "$" : ""}
                        {parseFloat(data.singlePremiumAmount || "0").toLocaleString()}
                      </>
                    ) : (
                      <>
                        {data.currency === "EUR" ? "\u20ac" : data.currency === "USD" ? "$" : ""}
                        {parseFloat(data.regularPremiumAmount || "0").toLocaleString()}
                        <span className="ml-2 text-base font-normal text-brand-grayMed">
                          / {data.regularPremiumFrequency}
                        </span>
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-brand-grayMed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t("success.secureProcessing")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t("success.policyActivation")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t("success.instantReceipt")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <form action="https://www.paypal.com/ncp/payment/RDXD9J28Z94BL" method="post" target="_blank" className="inline-flex flex-col items-center justify-center gap-2">
                <button type="submit" className="min-w-[11.625rem] rounded border-none bg-[#FFD140] px-8 py-3 text-base font-bold leading-5 text-black transition-all hover:bg-[#FFC520] focus:outline-none focus:ring-2 focus:ring-[#FFD140] focus:ring-offset-2" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
                  {t("success.payWithPaypal")}
                </button>
                <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt={t("success.acceptedMethods")} className="h-8" />
                <div className="text-xs text-brand-grayMed">
                  {t("success.securedBy")}{" "}
                  <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="PayPal" className="inline h-3.5 align-middle" />
                </div>
              </form>
              <p className="text-center text-sm text-brand-grayMed">{t("success.afterPayment", { email: data.email })}</p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-5 w-5 text-amber-600" />
                <div className="space-y-1 text-left text-sm text-amber-800">
                  <p className="font-semibold">{t("success.important")}</p>
                  <p>{t("success.importantText")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-left text-sm text-blue-800">
              <p className="font-semibold">{t("success.needHelp")}</p>
              <p>
                {t("success.needHelpText")}{" "}
                <a href="mailto:insurance@opulanz.com" className="font-semibold underline">insurance@opulanz.com</a>{" "}
                {t("success.orCall")}{" "}
                <a href="tel:+352123456789" className="font-semibold">+352 123 456 789</a>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" onClick={() => router.push(`/${locale}`)} className="flex-1 bg-brand-gold text-white hover:bg-brand-goldDark">
            {t("success.returnHome")}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="flex-1">
            {t("success.printConfirmation")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("subtitle")}</p>
      </div>

      {data.suitabilityWarning && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            <strong>{t("suitabilityNotice")}:</strong> {data.suitabilityWarning}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">{t("sections.personalInfo")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.name")}</p>
              <p className="font-medium text-brand-dark">{data.title} {data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.dateOfBirth")}</p>
              <p className="font-medium text-brand-dark">{data.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.nationality")}</p>
              <p className="font-medium text-brand-dark">{COUNTRIES[data.nationality] || data.nationality}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.email")}</p>
              <p className="font-medium text-brand-dark">{data.email}</p>
            </div>
          </div>
        </div>

        {/* Financial Profile */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">{t("sections.financialProfile")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.employmentStatus")}</p>
              <p className="font-medium text-brand-dark capitalize">{data.employmentStatus}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.annualIncome")}</p>
              <p className="font-medium text-brand-dark">{data.annualIncome}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.totalAssets")}</p>
              <p className="font-medium text-brand-dark">{data.totalAssets}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.sourceOfFunds")}</p>
              <p className="font-medium text-brand-dark capitalize">{data.sourceOfFunds?.replace("-", " ")}</p>
            </div>
          </div>
        </div>

        {/* Investment Profile */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">{t("sections.investmentProfile")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.investmentHorizon")}</p>
              <p className="font-medium text-brand-dark capitalize">{data.investmentHorizon}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.investmentKnowledge")}</p>
              <p className="font-medium text-brand-dark capitalize">{data.investmentKnowledge}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.riskTolerance")}</p>
              <p className="font-medium text-brand-dark">
                {["Very Conservative", "Conservative", "Moderate", "Growth", "Aggressive"][(data.riskTolerance || 3) - 1]}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.investmentObjective")}</p>
              <p className="font-medium text-brand-dark capitalize">{data.investmentObjective?.replace("-", " ")}</p>
            </div>
          </div>
        </div>

        {/* Premium Details */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">{t("sections.premiumDetails")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.currency")}</p>
              <p className="font-medium text-brand-dark">{CURRENCIES[data.currency]}</p>
            </div>
            <div>
              <p className="text-sm text-brand-grayMed">{t("labels.premiumType")}</p>
              <p className="font-medium text-brand-dark capitalize">{data.premiumType}</p>
            </div>
            {data.premiumType === "single" && (
              <div>
                <p className="text-sm text-brand-grayMed">{t("labels.premiumAmount")}</p>
                <p className="font-medium text-brand-dark">
                  {data.currency === "EUR" ? "\u20ac" : data.currency === "USD" ? "$" : ""}
                  {parseFloat(data.singlePremiumAmount || "0").toLocaleString()}
                </p>
              </div>
            )}
            {data.premiumType === "regular" && (
              <>
                <div>
                  <p className="text-sm text-brand-grayMed">{t("labels.premiumAmount")}</p>
                  <p className="font-medium text-brand-dark">
                    {data.currency === "EUR" ? "\u20ac" : data.currency === "USD" ? "$" : ""}
                    {parseFloat(data.regularPremiumAmount || "0").toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-brand-grayMed">{t("labels.frequency")}</p>
                  <p className="font-medium text-brand-dark capitalize">{data.regularPremiumFrequency}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Beneficiaries */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">{t("sections.beneficiaries")}</h3>
          {data.beneficiaries && data.beneficiaries.length > 0 ? (
            <div className="space-y-3">
              {data.beneficiaries.map((beneficiary: any, index: number) => (
                <div key={beneficiary.id} className="flex items-center justify-between rounded-lg border border-brand-grayLight bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-brand-dark">{beneficiary.firstName} {beneficiary.lastName}</p>
                    <p className="text-sm text-brand-grayMed capitalize">{beneficiary.type} &bull; {beneficiary.relationship.replace("-", " ")}</p>
                  </div>
                  <p className="text-lg font-bold text-brand-gold">{beneficiary.percentage}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-grayMed">{t("noBeneficiaries")}</p>
          )}
        </div>
      </div>

      {submitError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800">{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="mb-4 flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="flex-1 space-y-1 text-sm text-blue-800">
            <p className="font-semibold">{t("beforeSubmit")}</p>
            <p>{t("beforeSubmitText")}</p>
          </div>
        </div>

        <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-brand-gold text-white hover:bg-brand-goldDark disabled:opacity-50">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submitApplication")
          )}
        </Button>
      </div>
    </div>
  );
}
