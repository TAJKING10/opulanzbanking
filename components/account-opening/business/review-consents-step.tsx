"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, User, Mail, Phone, MapPin, FileText } from "lucide-react";

interface BusinessReviewConsentsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function BusinessReviewConsentsStep({ data, onUpdate, onNext }: BusinessReviewConsentsStepProps) {
  const t = useTranslations("accountOpening.business.reviewConsentsStep");
  const [consents, setConsents] = React.useState({
    processing: data.consents?.processing || false,
    dataSharing: data.consents?.dataSharing || false,
    marketing: data.consents?.marketing || false,
  });

  const handleConsentChange = (consent: keyof typeof consents, checked: boolean) => {
    const newConsents = { ...consents, [consent]: checked };
    setConsents(newConsents);

    // Log consent with metadata (in real app, send to backend)
    console.log("Consent logged:", {
      type: consent,
      value: checked,
      timestamp: new Date().toISOString(),
      ip: "user-ip-here",
      userAgent: navigator.userAgent,
    });
  };

  const isReviewStepValid = consents.processing && consents.dataSharing;

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({ consents, isReviewStepValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewStepValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Review Summary */}
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">{t("applicationSummary")}</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-dark">{t("fullName")}</p>
                <p className="text-sm text-brand-grayMed">
                  {data.firstName} {data.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-dark">{t("email")}</p>
                <p className="text-sm text-brand-grayMed">{data.email}</p>
                {data.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {t("verified")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-dark">{t("phone")}</p>
                <p className="text-sm text-brand-grayMed">{data.phone}</p>
                {data.phoneVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {t("verified")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-dark">{t("residence")}</p>
                <p className="text-sm text-brand-grayMed">
                  {data.residence === "resident-europe"
                    ? t("europeanResident", { country: data.country })
                    : t("nonResident")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-dark">{t("accountType")}</p>
                <p className="text-sm text-brand-grayMed">
                  {data.mode === "current" ? t("accountTypes.current") : t("accountTypes.privateBanking")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-dark">{t("documents")}</p>
                <p className="text-sm text-brand-grayMed">
                  {data.uploadLater
                    ? t("documentsStatus.uploadLater")
                    : t("documentsStatus.uploaded", { count: data.documents?.length || 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Consents */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brand-dark">{t("requiredConsents")}</h3>

          <div className="space-y-4">
            {/* Processing Consent */}
            <div
              className={`rounded-lg border-2 p-4 transition-all ${
                consents.processing
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent-processing"
                  checked={consents.processing}
                  onCheckedChange={(checked) => handleConsentChange("processing", checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="consent-processing" className="cursor-pointer font-semibold text-brand-dark">
                    {t("processingConsent.title")} {t("required")}
                  </Label>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    {t("processingConsent.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Sharing Consent */}
            <div
              className={`rounded-lg border-2 p-4 transition-all ${
                consents.dataSharing
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent-sharing"
                  checked={consents.dataSharing}
                  onCheckedChange={(checked) => handleConsentChange("dataSharing", checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="consent-sharing" className="cursor-pointer font-semibold text-brand-dark">
                    {t("dataSharingConsent.title")} {t("required")}
                  </Label>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    {t("dataSharingConsent.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Marketing Consent (Optional) */}
            <div
              className={`rounded-lg border-2 p-4 transition-all ${
                consents.marketing
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent-marketing"
                  checked={consents.marketing}
                  onCheckedChange={(checked) => handleConsentChange("marketing", checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="consent-marketing" className="cursor-pointer font-semibold text-brand-dark">
                    {t("marketingConsent.title")}
                  </Label>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    {t("marketingConsent.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("dataRights.title")}</h4>
          <p className="text-sm text-blue-800">
            {t("dataRights.description")}
          </p>
        </div>

        {!isReviewStepValid && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="text-sm text-red-900">
              {t("validationError")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
