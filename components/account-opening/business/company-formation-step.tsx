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
  const t = useTranslations("accountForms.business.formation");

  const [proposedName, setProposedName] = React.useState(data.proposedCompanyName || "");
  const [businessActivity, setBusinessActivity] = React.useState(data.businessActivity || "");
  const [shareCapital, setShareCapital] = React.useState(data.shareCapital || "");

  const isFormationStepValid = proposedName && businessActivity && shareCapital;

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
          {t("serviceDesc")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 flex-shrink-0 text-brand-gold" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-brand-dark">{t("serviceTitle")}</h3>
              <p className="text-sm text-brand-grayMed">
                {t("serviceDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedName">{t("proposedName")} *</Label>
          <Input
            id="proposedName"
            type="text"
            value={proposedName}
            onChange={(e) => setProposedName(e.target.value)}
            placeholder={t("proposedNamePlaceholder")}
          />
          <p className="text-xs text-brand-grayMed">
            {t("proposedNameHelp")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessActivity">{t("businessActivity")} *</Label>
          <Textarea
            id="businessActivity"
            value={businessActivity}
            onChange={(e) => setBusinessActivity(e.target.value)}
            placeholder={t("businessActivityPlaceholder")}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareCapital">{t("shareCapital")} *</Label>
          <Input
            id="shareCapital"
            type="text"
            value={shareCapital}
            onChange={(e) => setShareCapital(e.target.value)}
            placeholder={t("shareCapitalPlaceholder")}
          />
          <p className="text-xs text-brand-grayMed">
            {t("shareCapitalHelp")}
            {data.jurisdiction === "LU" && ` ${t("luxembourgMin")}`}
            {data.jurisdiction === "FR" && ` ${t("franceMin")}`}
            {data.jurisdiction === "FI" && ` ${t("finlandMin")}`}
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <FileText className="h-4 w-4" />
            {t("whatsIncluded")}
          </h4>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• {t("included1")}</li>
            <li>• {t("included2")}</li>
            <li>• {t("included3")}</li>
            <li>• {t("included4")}</li>
            <li>• {t("included5")}</li>
            <li>• {t("included6")}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("timelineTitle")}</h4>
          <p className="text-sm text-blue-800">
            {t("timelineDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
