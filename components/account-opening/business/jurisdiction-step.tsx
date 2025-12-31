"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Info } from "lucide-react";

interface JurisdictionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function JurisdictionStep({ data, onUpdate, onNext }: JurisdictionStepProps) {
  const t = useTranslations("accountOpening.business.jurisdictionStep");
  const [jurisdiction, setJurisdiction] = React.useState(data.jurisdiction || "");

  const handleJurisdictionChange = (value: string) => {
    setJurisdiction(value);
    onUpdate({ jurisdiction: value });
  };

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({ isJurisdictionStepValid: !!jurisdiction });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jurisdiction]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          {data.companyStatus === "existing" ? t("titleExisting") : t("titleNew")}
        </h2>
        <p className="text-brand-grayMed">
          {data.companyStatus === "existing" ? t("subtitleExisting") : t("subtitleNew")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="jurisdiction" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-gold" />
            <span>{t("selectJurisdiction")} {t("required")}</span>
          </Label>
          <Select value={jurisdiction} onValueChange={handleJurisdictionChange}>
            <SelectTrigger id="jurisdiction" className="w-full">
              <SelectValue placeholder={t("selectJurisdictionPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LU">{t("jurisdictions.luxembourg")}</SelectItem>
              <SelectItem value="FR">{t("jurisdictions.france")}</SelectItem>
              <SelectItem value="FI">{t("jurisdictions.finland")}</SelectItem>
              <SelectItem value="BE">{t("jurisdictions.belgium")}</SelectItem>
              <SelectItem value="DE">{t("jurisdictions.germany")}</SelectItem>
              <SelectItem value="NL">{t("jurisdictions.netherlands")}</SelectItem>
              <SelectItem value="ES">{t("jurisdictions.spain")}</SelectItem>
              <SelectItem value="IT">{t("jurisdictions.italy")}</SelectItem>
              <SelectItem value="PT">{t("jurisdictions.portugal")}</SelectItem>
              <SelectItem value="AT">{t("jurisdictions.austria")}</SelectItem>
              <SelectItem value="OTHER">{t("jurisdictions.other")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            {t("helperText")}
          </p>
        </div>

        {jurisdiction && (
          <div className="rounded-lg border border-brand-grayLight bg-white p-6">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-brand-dark">
              <Info className="h-5 w-5 text-brand-gold" />
              {t("jurisdictionInfo.title")}
            </h4>

            {jurisdiction === "LU" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("jurisdictionInfo.luxembourg")}</p>
              </div>
            )}

            {jurisdiction === "FR" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("jurisdictionInfo.france")}</p>
              </div>
            )}

            {jurisdiction === "FI" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("jurisdictionInfo.finland")}</p>
              </div>
            )}

            {!["LU", "FR", "FI"].includes(jurisdiction) && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("jurisdictionInfo.general")}</p>
              </div>
            )}
          </div>
        )}

        {data.companyStatus === "new" && jurisdiction && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("formationTimeline.title")}</h4>
            <p className="text-sm text-blue-800">
              {t("formationTimeline.description", {
                jurisdiction: jurisdiction === "LU" ? t("jurisdictions.luxembourg") :
                             jurisdiction === "FR" ? t("jurisdictions.france") :
                             jurisdiction === "FI" ? t("jurisdictions.finland") :
                             jurisdiction
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
