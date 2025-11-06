"use client";

import * as React from "react";
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
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Account Intent</h2>
        <p className="text-brand-grayMed">
          Help us understand your banking needs so we can match you with the right partner bank.
        </p>
      </div>

      <div className="space-y-6">
        {/* Residence Status */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            What is your residence status?
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
                  I am a resident of a European country
                </Label>
                <p className="mt-1 text-sm text-brand-grayMed">
                  You live and pay taxes in a European Union member state
                </p>
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
                  I am a non-resident
                </Label>
                <p className="mt-1 text-sm text-brand-grayMed">
                  You live outside of Europe but want a European bank account
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Country Selection (only for residents) */}
        {residence === "resident-europe" && (
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-gold" />
              <span>Which country do you reside in? *</span>
            </Label>
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select your country" />
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
                <SelectItem value="OTHER">Other EU Country</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-brand-grayMed">
              This helps us match you with the appropriate banking partner
            </p>
          </div>
        )}

        {/* Currencies Multi-Select */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold text-brand-dark">
            <Coins className="h-4 w-4 text-brand-gold" />
            <span>Which currencies do you need? *</span>
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
          <p className="text-xs text-brand-grayMed">
            Select all currencies you plan to use for transactions
          </p>
        </div>

        {/* Monthly Transfers Slider */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold text-brand-dark">
            <TrendingUp className="h-4 w-4 text-brand-gold" />
            <span>Estimated monthly incoming transfers</span>
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
          <p className="text-xs text-brand-grayMed">
            This helps us recommend appropriate account features and limits
          </p>
        </div>

        {/* Source of Funds */}
        <div className="space-y-3">
          <Label htmlFor="source-of-funds" className="flex items-center gap-2 text-base font-semibold text-brand-dark">
            <FileText className="h-4 w-4 text-brand-gold" />
            <span>Source of funds (primary) *</span>
          </Label>
          <Select value={sourceOfFunds} onValueChange={handleSourceOfFundsChange}>
            <SelectTrigger id="source-of-funds" className="w-full">
              <SelectValue placeholder="Select your primary source of funds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="dividends">Dividends</SelectItem>
              <SelectItem value="business-income">Business Income</SelectItem>
              <SelectItem value="asset-sale">Asset Sale</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {sourceOfFunds === "other" && (
            <Input
              type="text"
              placeholder="Please specify your source of funds"
              value={sourceOfFundsOther}
              onChange={handleSourceOfFundsOtherChange}
              className="w-full"
            />
          )}
          <p className="text-xs text-brand-grayMed">
            Required for compliance and anti-money laundering checks
          </p>
        </div>

        {/* PEP Screening */}
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="pep-screening" className="flex items-center gap-2 text-base font-semibold text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                <span>PEP / Sanctions Screening</span>
              </Label>
              <p className="mt-2 text-sm text-amber-800">
                I confirm that I am not a Politically Exposed Person (PEP) or subject to any international
                sanctions. PEPs include government officials, senior politicians, and their close associates.
              </p>
            </div>
            <Switch
              id="pep-screening"
              checked={pepScreening}
              onCheckedChange={handlePepScreeningChange}
              className="mt-1"
            />
          </div>
          {!pepScreening && (
            <p className="mt-3 text-xs text-amber-700">
              If you are a PEP or subject to sanctions, additional verification will be required
            </p>
          )}
        </div>

        {/* Information Box */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
            <Globe className="h-4 w-4" />
            Why we need this information
          </h4>
          <p className="text-sm text-blue-800">
            Based on your residence status and location, we'll match you with Opulanz Partner Bank
            that can best serve your needs and comply with local banking regulations.
          </p>
        </div>

        {/* Private Banking Notice */}
        {data.mode === "private" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-amber-900">Private Banking Selected</h4>
            <p className="text-sm text-amber-800">
              Private banking typically requires a minimum deposit (€100,000+) and provides dedicated
              relationship management, wealth advisory, and investment services.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

