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
  const t = useTranslations("accountForms.business.jurisdiction");

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
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {data.companyStatus === "existing"
            ? t("existingQuestion")
            : t("newQuestion")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="jurisdiction" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-gold" />
            <span>{t("selectJurisdiction")} *</span>
          </Label>
          <Select value={jurisdiction} onValueChange={handleJurisdictionChange}>
            <SelectTrigger id="jurisdiction" className="w-full">
              <SelectValue placeholder={t("chooseJurisdiction")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LU">Luxembourg</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="FI">Finland</SelectItem>
              <SelectItem value="BE">Belgium</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="NL">Netherlands</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
              <SelectItem value="IT">Italy</SelectItem>
              <SelectItem value="PT">Portugal</SelectItem>
              <SelectItem value="AT">Austria</SelectItem>
              <SelectItem value="OTHER">{t("otherEuCountry")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            {t("jurisdictionHelp")}
          </p>
        </div>

        {jurisdiction && (
          <div className="rounded-lg border border-brand-grayLight bg-white p-6">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-brand-dark">
              <Info className="h-5 w-5 text-brand-gold" />
              {t("jurisdictionInfo")}
            </h4>

            {jurisdiction === "LU" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("luxembourgInfo")}</p>
                <p>{t("luxembourgCapital")}</p>
              </div>
            )}

            {jurisdiction === "FR" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("franceInfo")}</p>
                <p>{t("franceCapital")}</p>
              </div>
            )}

            {jurisdiction === "FI" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("finlandInfo")}</p>
                <p>{t("finlandCapital")}</p>
              </div>
            )}

            {!["LU", "FR", "FI"].includes(jurisdiction) && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>{t("otherInfo")}</p>
              </div>
            )}
          </div>
        )}

        {data.companyStatus === "new" && jurisdiction && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("formationTimeline")}</h4>
            <p className="text-sm text-blue-800">
              {t("formationTimelineDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
