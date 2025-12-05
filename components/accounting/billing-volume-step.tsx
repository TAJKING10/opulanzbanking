"use client";

import * as React from "react";
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
  onValidate?: (isValid: boolean) => void;
}

export function BillingVolumeStep({
  data,
  onUpdate,
  onNext,
  onValidate,
}: BillingVolumeStepProps) {
  const [payrollNeeded, setPayrollNeeded] = React.useState(
    data.payrollNeeded || false
  );
  const [multiCurrency, setMultiCurrency] = React.useState(
    data.multiCurrencyEnabled || false
  );
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<string[]>(
    data.multiCurrencies || []
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (data.salesInvoicesMonth === undefined || data.salesInvoicesMonth === null || data.salesInvoicesMonth === "") {
      newErrors.salesInvoicesMonth = "Average monthly sales invoices is required";
    }
    
    if (data.purchaseInvoicesMonth === undefined || data.purchaseInvoicesMonth === null || data.purchaseInvoicesMonth === "") {
      newErrors.purchaseInvoicesMonth = "Average monthly purchase invoices is required";
    }
    
    if (
      payrollNeeded &&
      (!data.payrollEmployees || data.payrollEmployees < 1)
    )
      newErrors.payrollEmployees =
        "Number of employees on payroll must be at least 1";
    if (multiCurrency && selectedCurrencies.length === 0)
      newErrors.multiCurrencies = "Please select at least one currency";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (onValidate) {
      const newErrors: Record<string, string> = {};

      if (data.salesInvoicesMonth === undefined || data.salesInvoicesMonth === null || data.salesInvoicesMonth === "") {
        newErrors.salesInvoicesMonth = "Average monthly sales invoices is required";
      }
      
      if (data.purchaseInvoicesMonth === undefined || data.purchaseInvoicesMonth === null || data.purchaseInvoicesMonth === "") {
        newErrors.purchaseInvoicesMonth = "Average monthly purchase invoices is required";
      }
      
      if (
        payrollNeeded &&
        (!data.payrollEmployees || data.payrollEmployees < 1)
      )
        newErrors.payrollEmployees =
          "Number of employees on payroll must be at least 1";
      if (multiCurrency && selectedCurrencies.length === 0)
        newErrors.multiCurrencies = "Please select at least one currency";

      const isValid = Object.keys(newErrors).length === 0;
      onValidate(isValid);
    }
  }, [data, payrollNeeded, multiCurrency, selectedCurrencies, onValidate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          Billing Volume
        </h2>
        <p className="text-brand-grayMed">
          Help us understand your transaction volume to recommend the right
          accounting package.
        </p>
      </div>

      <div className="space-y-4">
        {/* Average Monthly Sales Invoices */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Avg. Monthly Sales Invoices <span className="text-red-500">*</span>
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
            className={errors.salesInvoicesMonth ? "border-red-500" : ""}
          />
          {errors.salesInvoicesMonth && (
            <p className="mt-1 text-xs text-red-500">
              {errors.salesInvoicesMonth}
            </p>
          )}
          <p className="mt-1 text-xs text-brand-grayMed">
            Number of outgoing invoices per month
          </p>
        </div>

        {/* Average Monthly Purchase Invoices */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Avg. Monthly Purchase Invoices{" "}
            <span className="text-red-500">*</span>
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
            className={errors.purchaseInvoicesMonth ? "border-red-500" : ""}
          />
          {errors.purchaseInvoicesMonth && (
            <p className="mt-1 text-xs text-red-500">
              {errors.purchaseInvoicesMonth}
            </p>
          )}
          <p className="mt-1 text-xs text-brand-grayMed">
            Number of incoming invoices per month
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
              Payroll processing needed?
            </Label>
          </div>

          {payrollNeeded && (
            <div>
              <Label className="text-sm font-medium text-brand-dark">
                Number of Employees on Payroll{" "}
                <span className="text-red-500">*</span>
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
                className={errors.payrollEmployees ? "border-red-500" : ""}
              />
              {errors.payrollEmployees && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.payrollEmployees}
                </p>
              )}
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
              Multi-currency bookkeeping needed?
            </Label>
          </div>

          {multiCurrency && (
            <div>
              <Label className="text-sm font-medium text-brand-dark">
                Select Currencies <span className="text-red-500">*</span>
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
              {errors.multiCurrencies && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.multiCurrencies}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
