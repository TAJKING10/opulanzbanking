"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Globe, MapPin, Coins, TrendingUp, AlertTriangle, FileText } from "lucide-react";

interface AccountIntentStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function AccountIntentStep({ data, onUpdate, onNext }: AccountIntentStepProps) {
  const t = useTranslations("accountForms.personal.intent");
  const tc = useTranslations("accountForms.common");

  const [residence, setResidence] = React.useState(data.residence || "");
  const [country, setCountry] = React.useState(data.country || "");
  const [currencies, setCurrencies] = React.useState<string[]>(data.currencies || []);
  const [monthlyTransfers, setMonthlyTransfers] = React.useState<number>(data.monthlyTransfers || 5000);
  const [sourceOfFunds, setSourceOfFunds] = React.useState(data.sourceOfFunds || "");
  const [sourceOfFundsOther, setSourceOfFundsOther] = React.useState(data.sourceOfFundsOther || "");
  const [pepScreening, setPepScreening] = React.useState(data.pepScreening || false);

  const handleResidenceChange = (value: string) => {
    setResidence(value);
    onUpdate({ residence: value });
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    onUpdate({ country: value });
  };

  const handleCurrencyToggle = (currency: string, checked: boolean) => {
    const newCurrencies = checked
      ? [...currencies, currency]
      : currencies.filter((c) => c !== currency);
    setCurrencies(newCurrencies);
    onUpdate({ currencies: newCurrencies });
  };

  const handleMonthlyTransfersChange = (value: number[]) => {
    setMonthlyTransfers(value[0]);
    onUpdate({ monthlyTransfers: value[0] });
  };

  const handleSourceOfFundsChange = (value: string) => {
    setSourceOfFunds(value);
    onUpdate({ sourceOfFunds: value });
    if (value !== "other") {
      setSourceOfFundsOther("");
      onUpdate({ sourceOfFundsOther: "" });
    }
  };

  const handleSourceOfFundsOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceOfFundsOther(e.target.value);
    onUpdate({ sourceOfFundsOther: e.target.value });
  };

  const handlePepScreeningChange = (checked: boolean) => {
    setPepScreening(checked);
    onUpdate({ pepScreening: checked });
  };

  const isFormValid =
    residence &&
    (residence === "non-resident" || country) &&
    currencies.length > 0 &&
    sourceOfFunds &&
    (sourceOfFunds !== "other" || sourceOfFundsOther.trim());

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({ isIntentStepValid: isFormValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormValid]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {/* Residence Status */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            {t("residenceQuestion")}
          </h3>

          <RadioGroup value={residence} onValueChange={handleResidenceChange} className="space-y-4">
            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                residence === "resident-europe"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleResidenceChange("resident-europe")}
            >
              <RadioGroupItem value="resident-europe" id="resident-europe" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="resident-europe"
                  className="text-base font-semibold text-brand-dark cursor-pointer"
                >
                  {t("residentEurope")}
                </Label>
                <p className="mt-1 text-sm text-brand-grayMed">{t("residentEuropeDesc")}</p>
              </div>
            </div>

            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                residence === "non-resident"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleResidenceChange("non-resident")}
            >
              <RadioGroupItem value="non-resident" id="non-resident" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="non-resident"
                  className="text-base font-semibold text-brand-dark cursor-pointer"
                >
                  {t("nonResident")}
                </Label>
                <p className="mt-1 text-sm text-brand-grayMed">{t("nonResidentDesc")}</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Country Selection (only for residents) */}
        {residence === "resident-europe" && (
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-gold" />
              <span>{t("countryQuestion")} *</span>
            </Label>
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder={t("selectCountry")} />
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
            <p className="text-xs text-brand-grayMed">{t("countryHelp")}</p>
          </div>
        )}

        {/* Currencies Multi-Select */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold text-brand-dark">
            <Coins className="h-4 w-4 text-brand-gold" />
            <span>{t("currenciesQuestion")} *</span>
          </Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {["EUR", "USD", "GBP", "Other"].map((currency) => (
              <div
                key={currency}
                className={`flex items-center space-x-2 rounded-lg border-2 p-3 transition-all ${
                  currencies.includes(currency)
                    ? "border-brand-gold bg-brand-gold/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Checkbox
                  id={`currency-${currency}`}
                  checked={currencies.includes(currency)}
                  onCheckedChange={(checked) => handleCurrencyToggle(currency, checked as boolean)}
                />
                <Label
                  htmlFor={`currency-${currency}`}
                  className="cursor-pointer font-medium text-brand-dark"
                >
                  {currency}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-grayMed">{t("currenciesHelp")}</p>
        </div>

        {/* Monthly Transfers Slider */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold text-brand-dark">
            <TrendingUp className="h-4 w-4 text-brand-gold" />
            <span>{t("monthlyTransfers")}</span>
          </Label>
          <div className="space-y-4">
            <Slider
              value={[monthlyTransfers]}
              onValueChange={handleMonthlyTransfersChange}
              min={0}
              max={1000000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span className="text-brand-grayMed">€0</span>
              <span className="font-semibold text-brand-gold">{formatCurrency(monthlyTransfers)}</span>
              <span className="text-brand-grayMed">€1M+</span>
            </div>
          </div>
          <p className="text-xs text-brand-grayMed">{t("monthlyTransfersHelp")}</p>
        </div>

        {/* Source of Funds */}
        <div className="space-y-3">
          <Label htmlFor="source-of-funds" className="flex items-center gap-2 text-base font-semibold text-brand-dark">
            <FileText className="h-4 w-4 text-brand-gold" />
            <span>{t("sourceOfFunds")} *</span>
          </Label>
          <Select value={sourceOfFunds} onValueChange={handleSourceOfFundsChange}>
            <SelectTrigger id="source-of-funds" className="w-full">
              <SelectValue placeholder={t("selectSourceOfFunds")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">{tc("salary")}</SelectItem>
              <SelectItem value="dividends">{tc("dividends")}</SelectItem>
              <SelectItem value="business-income">{tc("businessIncome")}</SelectItem>
              <SelectItem value="asset-sale">{tc("assetSale")}</SelectItem>
              <SelectItem value="savings">{tc("savings")}</SelectItem>
              <SelectItem value="other">{tc("other")}</SelectItem>
            </SelectContent>
          </Select>

          {sourceOfFunds === "other" && (
            <Input
              type="text"
              placeholder={t("specifySourceOfFunds")}
              value={sourceOfFundsOther}
              onChange={handleSourceOfFundsOtherChange}
              className="w-full"
            />
          )}
          <p className="text-xs text-brand-grayMed">{t("sourceOfFundsHelp")}</p>
        </div>

        {/* PEP Screening */}
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="pep-screening" className="flex items-center gap-2 text-base font-semibold text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("pepTitle")}</span>
              </Label>
              <p className="mt-2 text-sm text-amber-800">{t("pepDescription")}</p>
            </div>
            <Switch
              id="pep-screening"
              checked={pepScreening}
              onCheckedChange={handlePepScreeningChange}
              className="mt-1"
            />
          </div>
          {!pepScreening && (
            <p className="mt-3 text-xs text-amber-700">{t("pepWarning")}</p>
          )}
        </div>

        {/* Information Box */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
            <Globe className="h-4 w-4" />
            {t("whyNeeded")}
          </h4>
          <p className="text-sm text-blue-800">{t("whyNeededDesc")}</p>
        </div>

        {/* Private Banking Notice */}
        {data.mode === "private" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-amber-900">{t("privateBankingNotice")}</h4>
            <p className="text-sm text-amber-800">{t("privateBankingNoticeDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
