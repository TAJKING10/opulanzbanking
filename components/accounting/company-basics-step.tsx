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

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const checkValidity = () => {
    // Check if all required fields are filled without setting errors
    if (!data.companyType) return false;
    if (data.companyType === "other" && !data.companyTypeOther) return false;
    if (!data.countryOfIncorporation) return false;
    if (!data.dateOfIncorporation) return false;
    if (!data.shareCapitalAmount || data.shareCapitalAmount <= 0) return false;
    if (!data.legalName) return false;

    return true;
  };

  // Check validation whenever data changes (without showing errors)
  React.useEffect(() => {
    const isValid = checkValidity();
    onUpdate({ isStep1Valid: isValid });
  }, [data.companyType, data.companyTypeOther, data.countryOfIncorporation, data.dateOfIncorporation, data.shareCapitalAmount, data.legalName]);

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
            <SelectTrigger>
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
        </div>

        {/* Other Company Type */}
        {data.companyType === "other" && (
          <div>
            <Label className="text-sm font-medium text-brand-dark">
              {t('accounting.companyBasics.fields.companyTypeOther')} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={data.companyTypeOther || ""}
              onChange={(e) => updateField("companyTypeOther", e.target.value)}
              placeholder={t('accounting.companyBasics.placeholders.companyTypeOther')}
              maxLength={80}
            />
          </div>
        )}

        {/* Country of Incorporation */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.countryOfIncorporation')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.countryOfIncorporation || ""}
            onValueChange={(value) =>
              updateField("countryOfIncorporation", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('accounting.companyBasics.placeholders.country')} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date of Incorporation */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.dateOfIncorporation')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={data.dateOfIncorporation || ""}
            onChange={(e) => updateField("dateOfIncorporation", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            placeholder={t('accounting.companyBasics.placeholders.date')}
          />
        </div>

        {/* Share Capital */}
        <CurrencyAmount
          label={t('accounting.companyBasics.fields.shareCapital')}
          amount={data.shareCapitalAmount || 0}
          currency={data.shareCapitalCurrency || "EUR"}
          onAmountChange={(amount) =>
            updateField("shareCapitalAmount", amount)
          }
          onCurrencyChange={(currency) =>
            updateField("shareCapitalCurrency", currency)
          }
          required
        />

        {/* Legal Name */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.legalName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.legalName || ""}
            onChange={(e) => updateField("legalName", e.target.value)}
            placeholder={t('accounting.companyBasics.placeholders.legalName')}
          />
        </div>

        {/* Trade Name */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.tradeName')}
          </Label>
          <Input
            value={data.tradeName || ""}
            onChange={(e) => updateField("tradeName", e.target.value)}
            placeholder={t('accounting.companyBasics.placeholders.tradeName')}
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            {t('accounting.companyBasics.hints.tradeName')}
          </p>
        </div>

        {/* Registration Number */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.registrationNumber')}
          </Label>
          <Input
            value={data.registrationNumber || ""}
            onChange={(e) => updateField("registrationNumber", e.target.value)}
            placeholder={t('accounting.companyBasics.placeholders.registrationNumber')}
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            {t('accounting.companyBasics.hints.registrationNumber')}
          </p>
        </div>

        {/* VAT Number */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.companyBasics.fields.vatNumber')}
          </Label>
          <Input
            value={data.vatNumber || ""}
            onChange={(e) => updateField("vatNumber", e.target.value)}
            placeholder={t('accounting.companyBasics.placeholders.vatNumber')}
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            {t('accounting.companyBasics.hints.vatNumber')}
          </p>
        </div>
      </div>
    </div>
  );
}
