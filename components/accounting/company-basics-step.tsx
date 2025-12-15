"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyAmount } from "./currency-amount";

const COMPANY_TYPES = [
  { value: "sarl", label: "SARL" },
  { value: "sarl-s", label: "SARL-S" },
  { value: "sa", label: "SA" },
  { value: "scsp", label: "SCSp" },
  { value: "sole-trader", label: "Sole Trader" },
  { value: "ltd", label: "Ltd" },
  { value: "ab", label: "AB" },
  { value: "sia", label: "SIA" },
  { value: "other", label: "Other" },
];

const COUNTRIES = [
  { code: "LU", name: "Luxembourg" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "GB", name: "United Kingdom" },
  { code: "LV", name: "Latvia" },
  { code: "US", name: "United States" },
];

interface CompanyBasicsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function CompanyBasicsStep({
  data,
  onUpdate,
  onNext,
}: CompanyBasicsStepProps) {
  const t = useTranslations();
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.companyType) newErrors.companyType = t('accounting.companyBasics.errors.companyTypeRequired');
    if (data.companyType === "other" && !data.companyTypeOther)
      newErrors.companyTypeOther = t('accounting.companyBasics.errors.specifyRequired');
    if (!data.countryOfIncorporation)
      newErrors.countryOfIncorporation = t('accounting.companyBasics.errors.countryRequired');
    if (!data.dateOfIncorporation)
      newErrors.dateOfIncorporation = t('accounting.companyBasics.errors.dateRequired');
    if (!data.shareCapitalAmount || data.shareCapitalAmount <= 0)
      newErrors.shareCapitalAmount = t('accounting.companyBasics.errors.shareCapitalRequired');
    if (!data.legalName) newErrors.legalName = t('accounting.companyBasics.errors.legalNameRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          {t('accounting.companyBasics.title')}
        </h2>
        <p className="text-brand-grayMed">
          {t('accounting.companyBasics.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Company Type */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.companyType')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.companyType || ""}
            onValueChange={(value) => updateField("companyType", value)}
          >
            <SelectTrigger
              className={errors.companyType ? "border-red-500" : ""}
            >
              <SelectValue placeholder={t('accounting.companyBasics.placeholders.companyType')} />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyType && (
            <p className="mt-1 text-xs text-red-500">{errors.companyType}</p>
          )}
        </div>

        {/* Other Company Type */}
        {data.companyType === "other" && (
          <div>
            <Label className="text-sm font-medium text-brand-dark">
              Specify Company Type <span className="text-red-500">*</span>
            </Label>
            <Input
              value={data.companyTypeOther || ""}
              onChange={(e) => updateField("companyTypeOther", e.target.value)}
              placeholder="Enter company type"
              maxLength={80}
              className={errors.companyTypeOther ? "border-red-500" : ""}
            />
            {errors.companyTypeOther && (
              <p className="mt-1 text-xs text-red-500">
                {errors.companyTypeOther}
              </p>
            )}
          </div>
        )}

        {/* Country of Incorporation */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Country of Incorporation <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.countryOfIncorporation || ""}
            onValueChange={(value) =>
              updateField("countryOfIncorporation", value)
            }
          >
            <SelectTrigger
              className={errors.countryOfIncorporation ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryOfIncorporation && (
            <p className="mt-1 text-xs text-red-500">
              {errors.countryOfIncorporation}
            </p>
          )}
        </div>

        {/* Date of Incorporation */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Date of Incorporation <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={data.dateOfIncorporation || ""}
            onChange={(e) => updateField("dateOfIncorporation", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={errors.dateOfIncorporation ? "border-red-500" : ""}
          />
          {errors.dateOfIncorporation && (
            <p className="mt-1 text-xs text-red-500">
              {errors.dateOfIncorporation}
            </p>
          )}
        </div>

        {/* Share Capital */}
        <CurrencyAmount
          label="Share Capital"
          amount={data.shareCapitalAmount || 0}
          currency={data.shareCapitalCurrency || "EUR"}
          onAmountChange={(amount) =>
            updateField("shareCapitalAmount", amount)
          }
          onCurrencyChange={(currency) =>
            updateField("shareCapitalCurrency", currency)
          }
          required
          error={errors.shareCapitalAmount}
        />

        {/* Legal Name */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Registered Name (Legal) <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.legalName || ""}
            onChange={(e) => updateField("legalName", e.target.value)}
            placeholder="Company Legal Name S.A."
            className={errors.legalName ? "border-red-500" : ""}
          />
          {errors.legalName && (
            <p className="mt-1 text-xs text-red-500">{errors.legalName}</p>
          )}
        </div>

        {/* Trade Name */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Trade Name (Optional)
          </Label>
          <Input
            value={data.tradeName || ""}
            onChange={(e) => updateField("tradeName", e.target.value)}
            placeholder="Trading as..."
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            If different from legal name
          </p>
        </div>

        {/* Registration Number */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Registration Number (Optional)
          </Label>
          <Input
            value={data.registrationNumber || ""}
            onChange={(e) => updateField("registrationNumber", e.target.value)}
            placeholder="RCS B123456"
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            Company registration or RCS number
          </p>
        </div>

        {/* VAT Number */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            VAT Number (Optional)
          </Label>
          <Input
            value={data.vatNumber || ""}
            onChange={(e) => updateField("vatNumber", e.target.value)}
            placeholder="LU12345678"
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            If you don't have a VAT number yet, leave blank
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="rounded-lg bg-brand-gold px-6 py-3 font-semibold text-white transition-all hover:bg-brand-goldDark"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
