"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Landmark } from "lucide-react";

interface WelcomeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function WelcomeStep({ data, onUpdate, onNext }: WelcomeStepProps) {
  const t = useTranslations("accountForms.personal.welcome");
  const [mode, setMode] = React.useState(data.mode || "");

  const handleModeChange = (value: string) => {
    setMode(value);
    onUpdate({ mode: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            {t("accountTypeQuestion")}
          </h3>

          <RadioGroup value={mode} onValueChange={handleModeChange} className="space-y-4">
            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                mode === "current"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleModeChange("current")}
            >
              <RadioGroupItem value="current" id="current" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="current"
                    className="text-base font-semibold text-brand-dark cursor-pointer"
                  >
                    {t("currentTitle")}
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">{t("currentDesc")}</p>
              </div>
            </div>

            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                mode === "private"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleModeChange("private")}
            >
              <RadioGroupItem value="private" id="private" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Landmark className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="private"
                    className="text-base font-semibold text-brand-dark cursor-pointer"
                  >
                    {t("privateTitle")}
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">{t("privateDesc")}</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("whatNext")}</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• {t("nextStep1")}</li>
            <li>• {t("nextStep2")}</li>
            <li>• {t("nextStep3")}</li>
            <li>• {t("nextStep4")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
