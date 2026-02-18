"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";

interface InvestmentProfileStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function InvestmentProfileStep({ data, onUpdate, onNext }: InvestmentProfileStepProps) {
  const t = useTranslations("insurance.investmentProfile");
  const [formState, setFormState] = React.useState({
    investmentHorizon: data.investmentHorizon || "",
    investmentKnowledge: data.investmentKnowledge || "",
    investmentExperience: data.investmentExperience || "",
    riskTolerance: data.riskTolerance || 3,
    investmentObjective: data.investmentObjective || "",
    expectedReturn: data.expectedReturn || "",
    liquidityNeeds: data.liquidityNeeds || "",
  });

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Suitability check
  const suitabilityWarning = React.useMemo(() => {
    const horizon = formState.investmentHorizon;
    const risk = formState.riskTolerance;

    if (horizon === "short" && risk >= 4) {
      return t("warningHighRiskShort");
    }
    if (horizon === "long" && risk <= 2) {
      return t("warningLowRiskLong");
    }
    return null;
  }, [formState.investmentHorizon, formState.riskTolerance, t]);

  // Validation
  const isFormValid = React.useMemo(() => {
    return (
      formState.investmentHorizon &&
      formState.investmentKnowledge &&
      formState.investmentExperience &&
      formState.investmentObjective &&
      formState.expectedReturn &&
      formState.liquidityNeeds
    );
  }, [formState]);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      ...formState,
      isInvestmentStepValid: isFormValid,
      suitabilityWarning: suitabilityWarning,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid, suitabilityWarning]);

  const getRiskLabel = (value: number) => {
    const labels = [
      t("risk.veryConservative"),
      t("risk.conservative"),
      t("risk.moderate"),
      t("risk.growth"),
      t("risk.aggressive"),
    ];
    return labels[value - 1] || t("risk.moderate");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("subtitle")}
        </p>
      </div>

      {/* Investment Horizon */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-brand-dark">{t("horizon.title")}</h3>
          <Info className="h-4 w-4 text-brand-grayMed" />
        </div>

        <RadioGroup value={formState.investmentHorizon} onValueChange={(value) => updateField("investmentHorizon", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="short" id="horizon-short" />
              <div className="flex-1">
                <Label htmlFor="horizon-short" className="cursor-pointer font-medium">
                  {t("horizon.short")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("horizon.shortDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="medium" id="horizon-medium" />
              <div className="flex-1">
                <Label htmlFor="horizon-medium" className="cursor-pointer font-medium">
                  {t("horizon.medium")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("horizon.mediumDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="long" id="horizon-long" />
              <div className="flex-1">
                <Label htmlFor="horizon-long" className="cursor-pointer font-medium">
                  {t("horizon.long")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("horizon.longDesc")}
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Investment Knowledge */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("knowledge.title")}</h3>

        <RadioGroup value={formState.investmentKnowledge} onValueChange={(value) => updateField("investmentKnowledge", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="none" id="knowledge-none" />
              <div className="flex-1">
                <Label htmlFor="knowledge-none" className="cursor-pointer font-medium">
                  {t("knowledge.none")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("knowledge.noneDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="basic" id="knowledge-basic" />
              <div className="flex-1">
                <Label htmlFor="knowledge-basic" className="cursor-pointer font-medium">
                  {t("knowledge.basic")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("knowledge.basicDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="good" id="knowledge-good" />
              <div className="flex-1">
                <Label htmlFor="knowledge-good" className="cursor-pointer font-medium">
                  {t("knowledge.good")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("knowledge.goodDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="advanced" id="knowledge-advanced" />
              <div className="flex-1">
                <Label htmlFor="knowledge-advanced" className="cursor-pointer font-medium">
                  {t("knowledge.advanced")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("knowledge.advancedDesc")}
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Investment Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("experience.title")}</h3>

        <RadioGroup value={formState.investmentExperience} onValueChange={(value) => updateField("investmentExperience", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="none" id="experience-none" />
              <div className="flex-1">
                <Label htmlFor="experience-none" className="cursor-pointer font-medium">
                  {t("experience.none")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("experience.noneDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="limited" id="experience-limited" />
              <div className="flex-1">
                <Label htmlFor="experience-limited" className="cursor-pointer font-medium">
                  {t("experience.limited")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("experience.limitedDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="moderate" id="experience-moderate" />
              <div className="flex-1">
                <Label htmlFor="experience-moderate" className="cursor-pointer font-medium">
                  {t("experience.moderate")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("experience.moderateDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="extensive" id="experience-extensive" />
              <div className="flex-1">
                <Label htmlFor="experience-extensive" className="cursor-pointer font-medium">
                  {t("experience.extensive")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("experience.extensiveDesc")}
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-dark">{t("riskTolerance.title")}</h3>
          <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-sm font-medium text-brand-gold">
            {getRiskLabel(formState.riskTolerance)}
          </span>
        </div>

        <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
          <p className="mb-6 text-sm text-brand-grayMed">
            {t("riskTolerance.description")}
          </p>

          <div className="space-y-6">
            <Slider
              value={[formState.riskTolerance]}
              onValueChange={([value]) => updateField("riskTolerance", value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />

            <div className="grid grid-cols-5 gap-2 text-xs text-center">
              <div className="text-brand-grayMed">{t("risk.veryConservative")}</div>
              <div className="text-brand-grayMed">{t("risk.conservative")}</div>
              <div className="text-brand-grayMed">{t("risk.moderate")}</div>
              <div className="text-brand-grayMed">{t("risk.growth")}</div>
              <div className="text-brand-grayMed">{t("risk.aggressive")}</div>
            </div>
          </div>
        </div>

        {suitabilityWarning && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              {suitabilityWarning}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Investment Objective */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("objective.title")}</h3>

        <RadioGroup value={formState.investmentObjective} onValueChange={(value) => updateField("investmentObjective", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="preservation" id="objective-preservation" />
              <div className="flex-1">
                <Label htmlFor="objective-preservation" className="cursor-pointer font-medium">
                  {t("objective.preservation")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("objective.preservationDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="income" id="objective-income" />
              <div className="flex-1">
                <Label htmlFor="objective-income" className="cursor-pointer font-medium">
                  {t("objective.income")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("objective.incomeDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="balanced" id="objective-balanced" />
              <div className="flex-1">
                <Label htmlFor="objective-balanced" className="cursor-pointer font-medium">
                  {t("objective.balanced")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("objective.balancedDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="growth" id="objective-growth" />
              <div className="flex-1">
                <Label htmlFor="objective-growth" className="cursor-pointer font-medium">
                  {t("objective.growth")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("objective.growthDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="aggressive" id="objective-aggressive" />
              <div className="flex-1">
                <Label htmlFor="objective-aggressive" className="cursor-pointer font-medium">
                  {t("objective.aggressive")}
                </Label>
                <p className="text-sm text-brand-grayMed">
                  {t("objective.aggressiveDesc")}
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Expected Return */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("expectedReturn.title")}</h3>

        <RadioGroup value={formState.expectedReturn} onValueChange={(value) => updateField("expectedReturn", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="low" id="return-low" />
              <div className="flex-1">
                <Label htmlFor="return-low" className="cursor-pointer font-medium">
                  {t("expectedReturn.low")}
                </Label>
                <p className="text-sm text-brand-grayMed">{t("expectedReturn.lowDesc")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="moderate" id="return-moderate" />
              <div className="flex-1">
                <Label htmlFor="return-moderate" className="cursor-pointer font-medium">
                  {t("expectedReturn.moderate")}
                </Label>
                <p className="text-sm text-brand-grayMed">{t("expectedReturn.moderateDesc")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="high" id="return-high" />
              <div className="flex-1">
                <Label htmlFor="return-high" className="cursor-pointer font-medium">
                  {t("expectedReturn.high")}
                </Label>
                <p className="text-sm text-brand-grayMed">{t("expectedReturn.highDesc")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="very-high" id="return-very-high" />
              <div className="flex-1">
                <Label htmlFor="return-very-high" className="cursor-pointer font-medium">
                  {t("expectedReturn.veryHigh")}
                </Label>
                <p className="text-sm text-brand-grayMed">{t("expectedReturn.veryHighDesc")}</p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Liquidity Needs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("liquidity.title")}</h3>

        <RadioGroup value={formState.liquidityNeeds} onValueChange={(value) => updateField("liquidityNeeds", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="immediate" id="liquidity-immediate" />
              <div className="flex-1">
                <Label htmlFor="liquidity-immediate" className="cursor-pointer font-medium">
                  {t("liquidity.high")}
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="medium" id="liquidity-medium" />
              <div className="flex-1">
                <Label htmlFor="liquidity-medium" className="cursor-pointer font-medium">
                  {t("liquidity.medium")}
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="low" id="liquidity-low" />
              <div className="flex-1">
                <Label htmlFor="liquidity-low" className="cursor-pointer font-medium">
                  {t("liquidity.low")}
                </Label>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="space-y-1 text-sm text-blue-800">
            <p className="font-semibold">{t("mifidTitle")}</p>
            <p>
              {t("mifidText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
