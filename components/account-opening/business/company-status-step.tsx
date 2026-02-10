"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, PlusCircle } from "lucide-react";

interface CompanyStatusStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function CompanyStatusStep({ data, onUpdate, onNext }: CompanyStatusStepProps) {
  const t = useTranslations("accountForms.business.companyStatus");

  const [companyStatus, setCompanyStatus] = React.useState(data.companyStatus || "");
  const [companyName, setCompanyName] = React.useState(data.companyName || "");
  const [registrationNumber, setRegistrationNumber] = React.useState(data.registrationNumber || "");

  const handleStatusChange = (value: string) => {
    setCompanyStatus(value);
    onUpdate({ companyStatus: value });
  };

  const canContinue =
    (companyStatus === "existing" && companyName && registrationNumber) ||
    companyStatus === "new";

  // Update parent with validation status
  React.useEffect(() => {
    if (companyStatus === "existing" && companyName && registrationNumber) {
      onUpdate({ companyName, registrationNumber, isCompanyStepValid: canContinue });
    } else {
      onUpdate({ isCompanyStepValid: canContinue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyStatus, companyName, registrationNumber, canContinue]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("description")}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            {t("question")}
          </h3>

          <RadioGroup value={companyStatus} onValueChange={handleStatusChange} className="space-y-4">
            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                companyStatus === "existing"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleStatusChange("existing")}
            >
              <RadioGroupItem value="existing" id="existing" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="existing"
                    className="cursor-pointer text-base font-semibold text-brand-dark"
                  >
                    {t("existingTitle")}
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">
                  {t("existingDesc")}
                </p>
              </div>
            </div>

            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                companyStatus === "new"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleStatusChange("new")}
            >
              <RadioGroupItem value="new" id="new" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="new"
                    className="cursor-pointer text-base font-semibold text-brand-dark"
                  >
                    {t("newTitle")}
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">
                  {t("newDesc")}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {companyStatus === "existing" && (
          <div className="space-y-4 rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <h4 className="font-semibold text-brand-dark">{t("companyDetails")}</h4>

            <div className="space-y-2">
              <Label htmlFor="companyName">{t("companyName")} *</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("companyNamePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">{t("registrationNumber")} *</Label>
              <Input
                id="registrationNumber"
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder={t("registrationNumberPlaceholder")}
                required
              />
            </div>
          </div>
        )}

        {companyStatus === "new" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("formationServiceTitle")}</h4>
            <p className="text-sm text-blue-800">
              {t("formationServiceDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
