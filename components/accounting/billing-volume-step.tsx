"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "CNY"];

interface BillingVolumeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function BillingVolumeStep({
  data,
  onUpdate,
  onNext,
}: BillingVolumeStepProps) {
  const t = useTranslations();
  const [payrollNeeded, setPayrollNeeded] = React.useState(
    data.payrollNeeded || false
  );
  const [multiCurrency, setMultiCurrency] = React.useState(
    data.multiCurrencyEnabled || false
  );
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<string[]>(
    data.multiCurrencies || []
  );

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handlePayrollChange = (checked: boolean) => {
    setPayrollNeeded(checked);
    onUpdate({ payrollNeeded: checked });
    if (!checked) {
      onUpdate({ payrollEmployees: 0 });
    }
  };

  const handleMultiCurrencyChange = (checked: boolean) => {
    setMultiCurrency(checked);
    onUpdate({ multiCurrencyEnabled: checked });
    if (!checked) {
      setSelectedCurrencies([]);
      onUpdate({ multiCurrencies: [] });
    }
  };

  const handleCurrencyToggle = (currency: string) => {
    const newCurrencies = selectedCurrencies.includes(currency)
      ? selectedCurrencies.filter((c) => c !== currency)
      : [...selectedCurrencies, currency];
    setSelectedCurrencies(newCurrencies);
    onUpdate({ multiCurrencies: newCurrencies });
  };

  const checkValidity = () => {
    if (data.salesInvoicesMonth === undefined || data.salesInvoicesMonth < 0) return false;
    if (data.purchaseInvoicesMonth === undefined || data.purchaseInvoicesMonth < 0) return false;
    if (payrollNeeded && (!data.payrollEmployees || data.payrollEmployees < 1)) return false;
    if (multiCurrency && selectedCurrencies.length === 0) return false;

    return true;
  };

  // Check validation whenever data changes
  React.useEffect(() => {
    const isValid = checkValidity();
    onUpdate({ isStep4Valid: isValid });
  }, [
    data.salesInvoicesMonth,
    data.purchaseInvoicesMonth,
    data.payrollEmployees,
    payrollNeeded,
    multiCurrency,
    selectedCurrencies,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          {t('accounting.billingVolume.title')}
        </h2>
        <p className="text-brand-grayMed">
          {t('accounting.billingVolume.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Average Monthly Sales Invoices */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.billingVolume.fields.salesInvoices')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={data.salesInvoicesMonth || ""}
            onChange={(e) =>
              updateField("salesInvoicesMonth", parseInt(e.target.value) || 0)
            }
            placeholder="0"
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            {t('accounting.billingVolume.hints.salesInvoices')}
          </p>
        </div>

        {/* Average Monthly Purchase Invoices */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.billingVolume.fields.purchaseInvoices')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={data.purchaseInvoicesMonth || ""}
            onChange={(e) =>
              updateField(
                "purchaseInvoicesMonth",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="0"
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            {t('accounting.billingVolume.hints.purchaseInvoices')}
          </p>
        </div>

        {/* Payroll Processing */}
        <div className="space-y-3 rounded-lg border border-brand-grayLight p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="payrollNeeded"
              checked={payrollNeeded}
              onCheckedChange={handlePayrollChange}
            />
            <Label
              htmlFor="payrollNeeded"
              className="cursor-pointer text-sm font-medium text-brand-dark"
            >
              {t('accounting.billingVolume.fields.payrollNeeded')}
            </Label>
          </div>

          {payrollNeeded && (
            <div>
              <Label className="text-sm font-medium text-brand-dark">
                {t('accounting.billingVolume.fields.payrollEmployees')} <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={data.payrollEmployees || ""}
                onChange={(e) =>
                  updateField("payrollEmployees", parseInt(e.target.value) || 0)
                }
                placeholder="1"
              />
            </div>
          )}
        </div>

        {/* Multi-currency Bookkeeping */}
        <div className="space-y-3 rounded-lg border border-brand-grayLight p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiCurrency"
              checked={multiCurrency}
              onCheckedChange={handleMultiCurrencyChange}
            />
            <Label
              htmlFor="multiCurrency"
              className="cursor-pointer text-sm font-medium text-brand-dark"
            >
              {t('accounting.billingVolume.fields.multiCurrency')}
            </Label>
          </div>

          {multiCurrency && (
            <div>
              <Label className="text-sm font-medium text-brand-dark">
                {t('accounting.billingVolume.fields.selectCurrencies')} <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-6">
                {CURRENCIES.map((currency) => (
                  <div
                    key={currency}
                    className={`flex items-center space-x-2 rounded-lg border-2 p-2 transition-all ${
                      selectedCurrencies.includes(currency)
                        ? "border-brand-gold bg-brand-gold/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Checkbox
                      id={`currency-${currency}`}
                      checked={selectedCurrencies.includes(currency)}
                      onCheckedChange={() => handleCurrencyToggle(currency)}
                    />
                    <Label
                      htmlFor={`currency-${currency}`}
                      className="cursor-pointer text-sm font-medium text-brand-dark"
                    >
                      {currency}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
