"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, Briefcase } from "lucide-react";

interface BusinessWelcomeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function BusinessWelcomeStep({ data, onUpdate, onNext }: BusinessWelcomeStepProps) {
  const t = useTranslations("accountForms.business.welcome");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("description")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 flex-shrink-0 text-brand-gold" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-brand-dark">{t("accountOpeningTitle")}</h3>
              <p className="text-sm text-brand-grayMed">
                {t("accountOpeningDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("whatYouNeed")}</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• {t("need1")}</li>
            <li>• {t("need2")}</li>
            <li>• {t("need3")}</li>
            <li>• {t("need4")}</li>
            <li>• {t("need5")}</li>
          </ul>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-amber-900">{t("processingTime")}</h4>
          <p className="text-sm text-amber-800">
            {t("processingTimeDesc")}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-brand-gold px-8 py-3 text-base font-semibold text-white transition-all hover:bg-brand-goldDark"
        >
          {t("startApplication")}
        </button>
      </div>
    </div>
  );
}
