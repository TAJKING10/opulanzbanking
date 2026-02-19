"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, Clock, FileText } from "lucide-react";

interface SubmissionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  locale: string;
}

export function SubmissionStep({ data, onUpdate, locale }: SubmissionStepProps) {
  const tc = useTranslations("accountForms.common");

  const [submitted, setSubmitted] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState("");

  React.useEffect(() => {
    // Submit application to backend
    const submitApplication = async () => {
      try {
        const appId = `OPL-P-${Date.now()}`;

        // Internal routing logic
        const route = determineRoute(data);
        console.log("Application routed to:", route);
        console.log("Application data:", data);

        // Prepare payload for backend
        const applicationPayload = {
          type: "individual",
          status: "submitted",
          payload: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            accountIntent: data.accountIntent,
            residence: data.residence,
            country: data.country,
            currencies: data.currencies,
            monthlyTransfers: data.monthlyTransfers,
            sourceOfFunds: data.sourceOfFunds,
            sourceOfFundsOther: data.sourceOfFundsOther,
            pepScreening: data.pepScreening,
            mode: data.mode,
            route: route,
            applicationId: appId,
            submittedAt: new Date().toISOString(),
            documents: data.documents?.map((doc: any) => ({
              name: doc.name,
              type: doc.type,
              size: doc.size
            })) || [],
            consents: data.consents
          }
        };

        const response = await fetch('http://localhost:5000/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationPayload),
        });

        if (!response.ok) {
          throw new Error('Failed to submit application to backend');
        }

        const result = await response.json();
        console.log("Application saved to Azure database:", result);

        setApplicationId(appId);
        setSubmitted(true);

        localStorage.removeItem("personal-account-progress");
      } catch (error) {
        console.error("Error submitting application:", error);
        const appId = `OPL-P-${Date.now()}`;
        setApplicationId(appId);
        setSubmitted(true);
        localStorage.removeItem("personal-account-progress");
      }
    };

    submitApplication();
  }, [data]);

  const determineRoute = (applicationData: any) => {
    const { country, mode, residence } = applicationData;

    if (mode === "private") {
      return "ROUTE_C_PRIVATE_BANKING";
    }

    if (residence === "resident-europe") {
      if (country === "LU" || country === "FR") {
        return "ROUTE_A_OLKY";
      } else if (country === "FI") {
        return "ROUTE_B_NARVI";
      }
    }

    return "ROUTE_A_OLKY";
  };

  return (
    <div className="space-y-8">
      {submitted ? (
        <>
          {/* Success State */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">{tc("applicationSubmitted")}</h2>
            <p className="text-lg text-brand-grayMed">{tc("applicationSubmittedDesc")}</p>
          </div>

          {/* Application ID */}
          <div className="rounded-lg border border-brand-grayLight bg-brand-gold/5 p-6 text-center">
            <p className="mb-2 text-sm font-medium text-brand-dark">{tc("applicationReference")}</p>
            <p className="text-2xl font-bold text-brand-gold">{applicationId}</p>
            <p className="mt-2 text-xs text-brand-grayMed">{tc("saveReference")}</p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-dark">{tc("whatHappensNext")}</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{tc("emailConfirmation")}</p>
                  <p className="mt-1 text-sm text-brand-grayMed">{tc("emailConfirmationDesc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{tc("bankReview")}</p>
                  <p className="mt-1 text-sm text-brand-grayMed">{tc("bankReviewDesc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{tc("accountActivation")}</p>
                  <p className="mt-1 text-sm text-brand-grayMed">{tc("accountActivationDesc")}</p>
                </div>
              </div>

              {data.uploadLater && (
                <div className="flex items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <FileText className="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">{tc("docUploadPending")}</p>
                    <p className="mt-1 text-sm text-amber-800">{tc("docUploadPendingDesc")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-dark">{tc("quickActions")}</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
                <Mail className="h-8 w-8 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{tc("checkEmail")}</p>
                  <p className="text-xs text-brand-grayMed">{tc("confirmationSentTo")} {data.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
                <Clock className="h-8 w-8 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{tc("expectedTimeline")}</p>
                  <p className="text-xs text-brand-grayMed">{tc("reviewTimeline")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
            <Button asChild className="min-w-48 bg-brand-gold text-white hover:bg-brand-goldDark">
              <Link href={`/${locale}`}>
                {tc("returnToHomepage")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="min-w-48">
              <Link href={`/${locale}/support`}>{tc("contactSupport")}</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-900">
              <strong>{tc("needHelp")}</strong> {tc("supportHours")}{" "}
              <a href="mailto:support@opulanz.com" className="underline">
                support@opulanz.com
              </a>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Loading State */}
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-brand-gold border-t-transparent"></div>
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">{tc("submittingApplication")}</h2>
            <p className="text-lg text-brand-grayMed">{tc("submittingWait")}</p>
          </div>
        </>
      )}
    </div>
  );
}
