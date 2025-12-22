"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Building2, FileText } from "lucide-react";

interface CompanyFormationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function CompanyFormationStep({ data, onUpdate, onNext }: CompanyFormationStepProps) {
  const t = useTranslations("accountOpening.business.companyFormationStep");
  const [proposedName, setProposedName] = React.useState(data.proposedCompanyName || "");
  const [businessActivity, setBusinessActivity] = React.useState(data.businessActivity || "");
  const [shareCapital, setShareCapital] = React.useState(data.shareCapital || "");

  const isFormationStepValid = proposedName && businessActivity && shareCapital;

  // Get jurisdiction name for subtitle and helper text
  const getJurisdictionName = () => {
    const jurisdictionMap: { [key: string]: string } = {
      LU: "Luxembourg",
      FR: "France",
      FI: "Finland"
    };
    return jurisdictionMap[data.jurisdiction] || data.jurisdiction;
  };

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      proposedCompanyName: proposedName,
      businessActivity,
      shareCapital,
      isFormationStepValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposedName, businessActivity, shareCapital, isFormationStepValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("subtitle", { jurisdiction: getJurisdictionName() })}
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 flex-shrink-0 text-brand-gold" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-brand-dark">{t("companyFormationService.title")}</h3>
              <p className="text-sm text-brand-grayMed">
                {t("companyFormationService.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedName">{t("proposedCompanyName")} {t("required")}</Label>
          <Input
            id="proposedName"
            type="text"
            value={proposedName}
            onChange={(e) => setProposedName(e.target.value)}
            placeholder={t("proposedCompanyNamePlaceholder")}
          />
          <p className="text-xs text-brand-grayMed">
            {t("proposedCompanyNameHelper")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessActivity">{t("businessActivity")} {t("required")}</Label>
          <Textarea
            id="businessActivity"
            value={businessActivity}
            onChange={(e) => setBusinessActivity(e.target.value)}
            placeholder={t("businessActivityPlaceholder")}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareCapital">{t("shareCapital")} {t("required")}</Label>
          <Input
            id="shareCapital"
            type="text"
            value={shareCapital}
            onChange={(e) => setShareCapital(e.target.value)}
            placeholder={t("shareCapitalPlaceholder")}
          />
          <p className="text-xs text-brand-grayMed">
            {t("shareCapitalHelper")}
            {data.jurisdiction === "LU" && ` ${t("shareCapitalRequirements.luxembourg")}`}
            {data.jurisdiction === "FR" && ` ${t("shareCapitalRequirements.france")}`}
            {data.jurisdiction === "FI" && ` ${t("shareCapitalRequirements.finland")}`}
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <FileText className="h-4 w-4" />
            {t("whatsIncluded.title")}
          </h4>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• {t("whatsIncluded.item1")}</li>
            <li>• {t("whatsIncluded.item2")}</li>
            <li>• {t("whatsIncluded.item3")}</li>
            <li>• {t("whatsIncluded.item4")}</li>
            <li>• {t("whatsIncluded.item5")}</li>
            <li>• {t("whatsIncluded.item6")}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("formationTimeline.title")}</h4>
          <p className="text-sm text-blue-800">
            {t("formationTimeline.description")}
          </p>
        </div>
      </div>
    </div>
  );
}
