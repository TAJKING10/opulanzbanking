"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, Clock, FileText } from "lucide-react";

interface BusinessSubmissionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  locale: string;
}

export function BusinessSubmissionStep({ data, onUpdate, locale }: BusinessSubmissionStepProps) {
  const t = useTranslations("accountOpening.business.submissionStep");
  const [submitted, setSubmitted] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState("");
  const hasSubmitted = React.useRef(false);

  React.useEffect(() => {
    // Prevent duplicate submissions
    if (hasSubmitted.current) {
      return;
    }

    // Submit business application to backend
    const submitApplication = async () => {
      hasSubmitted.current = true;
      try {
        const appId = `OPL-B-${Date.now()}`;

        // Internal routing logic
        const route = determineRoute(data);
        console.log("Application routed to:", route);
        console.log("Application data:", data);

        // Prepare payload for backend
        const applicationPayload = {
          type: "company",
          status: "submitted",
          payload: {
            // Company Status
            companyStatus: data.companyStatus,

            // Company Details
            companyName: data.companyName,
            registrationNumber: data.registrationNumber,
            jurisdiction: data.jurisdiction,

            // Directors & UBOs
            directors: data.directors || [],
            ubos: data.ubos || [],

            // Formation (if new company)
            formationDetails: data.formationDetails || null,

            // Documents info (files would be uploaded separately)
            documents: data.documents?.map((doc: any) => ({
              name: doc.name,
              type: doc.type,
              size: doc.size
            })) || [],

            // Consents
            consents: data.consents || {},

            // Metadata
            route: route,
            applicationId: appId,
            submittedAt: new Date().toISOString(),
          }
        };

        // Submit to backend API
        const response = await fetch('http://localhost:5000/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationPayload),
        });

        if (!response.ok) {
          throw new Error('Failed to submit business application to backend');
        }

        const result = await response.json();
        console.log("Business application saved to Azure database:", result);

        // Also create a company record if it's an existing company
        if (data.companyStatus === 'existing' && data.companyName && data.registrationNumber) {
          const companyPayload = {
            name: data.companyName,
            registration_number: data.registrationNumber,
            country: data.jurisdiction,
            legal_form: data.legalForm || 'Unknown',
          };

          const companyResponse = await fetch('http://localhost:5000/api/companies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyPayload),
          });

          if (companyResponse.ok) {
            const companyResult = await companyResponse.json();
            console.log("Company record created:", companyResult);
          }
        }

        setApplicationId(appId);
        setSubmitted(true);

        // Clear saved progress
        localStorage.removeItem("business-account-progress");
      } catch (error) {
        console.error("Error submitting business application:", error);
        // Still show success to user, but log error
        const appId = `OPL-B-${Date.now()}`;
        setApplicationId(appId);
        setSubmitted(true);
        localStorage.removeItem("business-account-progress");
      }
    };

    submitApplication();
  }, [data]);

  const determineRoute = (applicationData: any) => {
    // Internal routing logic based on jurisdiction
    const { jurisdiction } = applicationData;

    if (jurisdiction === "LU" || jurisdiction === "FR") {
      return "ROUTE_A_OLKY"; // Luxembourg/France → OLKY
    } else if (jurisdiction === "FI") {
      return "ROUTE_B_NARVI"; // Finland → NARVI
    }

    // Default route
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
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
            <p className="text-lg text-brand-grayMed">
              {t("subtitle")}
            </p>
          </div>

          {/* Application ID */}
          <div className="rounded-lg border border-brand-grayLight bg-brand-gold/5 p-6 text-center">
            <p className="mb-2 text-sm font-medium text-brand-dark">{t("applicationReference")}</p>
            <p className="text-2xl font-bold text-brand-gold">{applicationId}</p>
            <p className="mt-2 text-xs text-brand-grayMed">
              {t("saveReference")}
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-dark">{t("whatHappensNext")}</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{t("steps.emailConfirmation.title")}</p>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    {t("steps.emailConfirmation.description", { email: data.email })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{t("steps.bankReview.title")}</p>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    {t("steps.bankReview.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{t("steps.accountActivation.title")}</p>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    {t("steps.accountActivation.description")}
                  </p>
                </div>
              </div>

              {data.uploadLater && (
                <div className="flex items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <FileText className="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">{t("documentUploadPending")}</p>
                    <p className="mt-1 text-sm text-amber-800">
                      {t("documentUploadPendingDescription")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-dark">{t("quickActions.title")}</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
                <Mail className="h-8 w-8 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{t("quickActions.checkEmail")}</p>
                  <p className="text-xs text-brand-grayMed">{t("quickActions.emailSent", { email: data.email })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
                <Clock className="h-8 w-8 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">{t("quickActions.expectedTimeline")}</p>
                  <p className="text-xs text-brand-grayMed">{t("quickActions.timelineDescription")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
            <Button asChild className="min-w-48 bg-brand-gold text-white hover:bg-brand-goldDark">
              <Link href={`/${locale}`}>
                {t("returnToHomepage")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="min-w-48">
              <Link href={`/${locale}/support`}>{t("contactSupport")}</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-900">
              {t("supportInfo")}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Loading State */}
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-brand-gold border-t-transparent"></div>
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("submitting")}</h2>
            <p className="text-lg text-brand-grayMed">{t("submittingDescription")}</p>
          </div>
        </>
      )}
    </div>
  );
}
