"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";

interface FinancialProfileStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const EMPLOYMENT_STATUSES = [
  { value: "employed", labelKey: "employmentStatuses.employed" },
  { value: "self-employed", labelKey: "employmentStatuses.selfEmployed" },
  { value: "retired", labelKey: "employmentStatuses.retired" },
  { value: "unemployed", labelKey: "employmentStatuses.unemployed" },
  { value: "student", labelKey: "employmentStatuses.student" },
];

const INCOME_RANGES = [
  { value: "0-25k", label: "\u20ac0 - \u20ac25,000" },
  { value: "25k-50k", label: "\u20ac25,000 - \u20ac50,000" },
  { value: "50k-100k", label: "\u20ac50,000 - \u20ac100,000" },
  { value: "100k-250k", label: "\u20ac100,000 - \u20ac250,000" },
  { value: "250k-500k", label: "\u20ac250,000 - \u20ac500,000" },
  { value: "500k+", label: "\u20ac500,000+" },
];

const ASSET_RANGES = [
  { value: "0-50k", label: "\u20ac0 - \u20ac50,000" },
  { value: "50k-100k", label: "\u20ac50,000 - \u20ac100,000" },
  { value: "100k-250k", label: "\u20ac100,000 - \u20ac250,000" },
  { value: "250k-500k", label: "\u20ac250,000 - \u20ac500,000" },
  { value: "500k-1m", label: "\u20ac500,000 - \u20ac1,000,000" },
  { value: "1m-2m", label: "\u20ac1,000,000 - \u20ac2,000,000" },
  { value: "2m+", label: "\u20ac2,000,000+" },
];

const SOURCE_OF_FUNDS_KEYS = [
  { value: "salary", labelKey: "sourceOfFunds.salary" },
  { value: "business", labelKey: "sourceOfFunds.business" },
  { value: "inheritance", labelKey: "sourceOfFunds.inheritance" },
  { value: "investments", labelKey: "sourceOfFunds.investments" },
  { value: "savings", labelKey: "sourceOfFunds.savings" },
  { value: "property", labelKey: "sourceOfFunds.property" },
  { value: "gift", labelKey: "sourceOfFunds.gift" },
  { value: "other", labelKey: "sourceOfFunds.other" },
];

export function FinancialProfileStep({ data, onUpdate, onNext }: FinancialProfileStepProps) {
  const t = useTranslations("insurance.financialProfile");
  const [formState, setFormState] = React.useState({
    employmentStatus: data.employmentStatus || "",
    occupation: data.occupation || "",
    employer: data.employer || "",
    annualIncome: data.annualIncome || "",
    totalAssets: data.totalAssets || "",
    liquidAssets: data.liquidAssets || "",
    sourceOfFunds: data.sourceOfFunds || "",
    sourceOfFundsDetails: data.sourceOfFundsDetails || "",
    sourceOfWealth: data.sourceOfWealth || "",
    sourceOfWealthDetails: data.sourceOfWealthDetails || "",
    isPEP: data.isPEP || false,
    pepDetails: data.pepDetails || "",
  });

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  const isFormValid = React.useMemo(() => {
    const baseValid =
      formState.employmentStatus &&
      formState.annualIncome &&
      formState.totalAssets &&
      formState.liquidAssets &&
      formState.sourceOfFunds &&
      formState.sourceOfWealth;

    const occupationValid =
      !["employed", "self-employed"].includes(formState.employmentStatus) || formState.occupation;

    const employerValid = formState.employmentStatus !== "employed" || formState.employer;

    const sofDetailsValid = formState.sourceOfFunds !== "other" || formState.sourceOfFundsDetails.trim();

    const sowDetailsValid = formState.sourceOfWealth !== "other" || formState.sourceOfWealthDetails.trim();

    const pepValid = !formState.isPEP || formState.pepDetails.trim();

    return baseValid && occupationValid && employerValid && sofDetailsValid && sowDetailsValid && pepValid;
  }, [formState]);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      ...formState,
      isFinancialStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("subtitle")}
        </p>
      </div>

      {/* Employment Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">{t("employmentInfo")}</h3>

        <div className="space-y-2">
          <Label htmlFor="employmentStatus">{t("employmentStatusLabel")}</Label>
          <Select
            value={formState.employmentStatus}
            onValueChange={(value) => updateField("employmentStatus", value)}
          >
            <SelectTrigger id="employmentStatus">
              <SelectValue placeholder={t("selectEmploymentStatus")} />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {["employed", "self-employed"].includes(formState.employmentStatus) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="occupation">{t("occupation")}</Label>
              <Input
                id="occupation"
                type="text"
                value={formState.occupation}
                onChange={(e) => updateField("occupation", e.target.value)}
                placeholder={t("occupationPlaceholder")}
                required
              />
            </div>

            {formState.employmentStatus === "employed" && (
              <div className="space-y-2">
                <Label htmlFor="employer">{t("employer")}</Label>
                <Input
                  id="employer"
                  type="text"
                  value={formState.employer}
                  onChange={(e) => updateField("employer", e.target.value)}
                  placeholder={t("employerPlaceholder")}
                  required
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Financial Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">{t("financialInfo")}</h3>

        <div className="space-y-2">
          <Label htmlFor="annualIncome">{t("annualIncome")}</Label>
          <Select value={formState.annualIncome} onValueChange={(value) => updateField("annualIncome", value)}>
            <SelectTrigger id="annualIncome">
              <SelectValue placeholder={t("selectAnnualIncome")} />
            </SelectTrigger>
            <SelectContent>
              {INCOME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAssets">{t("totalAssets")}</Label>
          <Select value={formState.totalAssets} onValueChange={(value) => updateField("totalAssets", value)}>
            <SelectTrigger id="totalAssets">
              <SelectValue placeholder={t("selectTotalAssets")} />
            </SelectTrigger>
            <SelectContent>
              {ASSET_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            {t("totalAssetsDesc")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="liquidAssets">{t("liquidAssets")}</Label>
          <Select value={formState.liquidAssets} onValueChange={(value) => updateField("liquidAssets", value)}>
            <SelectTrigger id="liquidAssets">
              <SelectValue placeholder={t("selectLiquidAssets")} />
            </SelectTrigger>
            <SelectContent>
              {ASSET_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            {t("liquidAssetsDesc")}
          </p>
        </div>
      </div>

      {/* Source of Funds */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">{t("sourceOfFundsWealth")}</h3>

        <div className="space-y-2">
          <Label htmlFor="sourceOfFunds">{t("sourceOfFundsLabel")}</Label>
          <Select value={formState.sourceOfFunds} onValueChange={(value) => updateField("sourceOfFunds", value)}>
            <SelectTrigger id="sourceOfFunds">
              <SelectValue placeholder={t("selectSourceOfFunds")} />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OF_FUNDS_KEYS.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {t(source.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            {t("sourceOfFundsDesc")}
          </p>
        </div>

        {formState.sourceOfFunds === "other" && (
          <div className="space-y-2">
            <Label htmlFor="sourceOfFundsDetails">{t("pleaseSpecify")}</Label>
            <Textarea
              id="sourceOfFundsDetails"
              value={formState.sourceOfFundsDetails}
              onChange={(e) => updateField("sourceOfFundsDetails", e.target.value)}
              placeholder={t("sourceOfFundsDetailsPlaceholder")}
              rows={3}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="sourceOfWealth">{t("sourceOfWealthLabel")}</Label>
          <Select value={formState.sourceOfWealth} onValueChange={(value) => updateField("sourceOfWealth", value)}>
            <SelectTrigger id="sourceOfWealth">
              <SelectValue placeholder={t("selectSourceOfWealth")} />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OF_FUNDS_KEYS.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {t(source.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            {t("sourceOfWealthDesc")}
          </p>
        </div>

        {formState.sourceOfWealth === "other" && (
          <div className="space-y-2">
            <Label htmlFor="sourceOfWealthDetails">{t("pleaseSpecify")}</Label>
            <Textarea
              id="sourceOfWealthDetails"
              value={formState.sourceOfWealthDetails}
              onChange={(e) => updateField("sourceOfWealthDetails", e.target.value)}
              placeholder={t("sourceOfWealthDetailsPlaceholder")}
              rows={3}
              required
            />
          </div>
        )}
      </div>

      {/* PEP Screening */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">{t("politicalExposure")}</h3>

        <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
          <RadioGroup
            value={formState.isPEP ? "yes" : "no"}
            onValueChange={(value) => updateField("isPEP", value === "yes")}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="no" id="pep-no" />
                <div>
                  <Label htmlFor="pep-no" className="cursor-pointer font-medium">
                    {t("pepNo")}
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="yes" id="pep-yes" />
                <div>
                  <Label htmlFor="pep-yes" className="cursor-pointer font-medium">
                    {t("pepYes")}
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-5 w-5 text-blue-600" />
              <div className="space-y-1 text-sm text-blue-800">
                <p className="font-semibold">{t("pepInfoTitle")}</p>
                <p>
                  {t("pepInfoText")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {formState.isPEP && (
          <div className="space-y-2">
            <Label htmlFor="pepDetails">{t("pepDetailsLabel")}</Label>
            <Textarea
              id="pepDetails"
              value={formState.pepDetails}
              onChange={(e) => updateField("pepDetails", e.target.value)}
              placeholder={t("pepDetailsPlaceholder")}
              rows={4}
              required
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="space-y-1 text-sm text-blue-800">
            <p className="font-semibold">{t("amlTitle")}</p>
            <p>
              {t("amlText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
