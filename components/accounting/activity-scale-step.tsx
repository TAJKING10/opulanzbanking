"use client";

import * as React from "react";
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

const BUSINESS_ACTIVITIES = [
  { value: "62.01", label: "IT consulting & fintech services" },
  { value: "70.10", label: "Activities of head offices" },
  { value: "64.20", label: "Activities of holding companies" },
  { value: "70.22", label: "Business and management consultancy" },
  { value: "46.90", label: "Non-specialised wholesale trade" },
  { value: "68.20", label: "Renting and operating of own or leased real estate" },
  { value: "82.99", label: "Other business support service activities" },
];

interface ActivityScaleStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function ActivityScaleStep({
  data,
  onUpdate,
  onNext,
}: ActivityScaleStepProps) {
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.businessActivity)
      newErrors.businessActivity = "Business activity is required";
    if (!data.turnoverLastFYAmount || data.turnoverLastFYAmount < 0)
      newErrors.turnoverLastFYAmount = "Annual turnover is required";
    if (
      !data.turnoverCurrentFYAmount ||
      data.turnoverCurrentFYAmount < 0
    )
      newErrors.turnoverCurrentFYAmount = "Projected turnover is required";
    if (data.employeesFTE === undefined || data.employeesFTE < 0)
      newErrors.employeesFTE = "Number of employees is required";

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
          Activity & Scale
        </h2>
        <p className="text-brand-grayMed">
          Help us understand your business activity and financial scale.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Activity */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Business Activity <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.businessActivity || ""}
            onValueChange={(value) => updateField("businessActivity", value)}
          >
            <SelectTrigger
              className={errors.businessActivity ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select business activity" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_ACTIVITIES.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  {activity.label} (NACE {activity.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessActivity && (
            <p className="mt-1 text-xs text-red-500">
              {errors.businessActivity}
            </p>
          )}
        </div>

        {/* Annual Turnover (Last FY) */}
        <CurrencyAmount
          label="Annual Turnover (Last FY)"
          amount={data.turnoverLastFYAmount || 0}
          currency={data.turnoverLastFYCurrency || "EUR"}
          onAmountChange={(amount) =>
            updateField("turnoverLastFYAmount", amount)
          }
          onCurrencyChange={(currency) =>
            updateField("turnoverLastFYCurrency", currency)
          }
          required
          error={errors.turnoverLastFYAmount}
          helpText="Use your last approved financial year for turnover"
        />

        {/* Projected Turnover (Current FY) */}
        <CurrencyAmount
          label="Projected Turnover (Current FY)"
          amount={data.turnoverCurrentFYAmount || 0}
          currency={data.turnoverCurrentFYCurrency || "EUR"}
          onAmountChange={(amount) =>
            updateField("turnoverCurrentFYAmount", amount)
          }
          onCurrencyChange={(currency) =>
            updateField("turnoverCurrentFYCurrency", currency)
          }
          required
          error={errors.turnoverCurrentFYAmount}
          helpText="Expected turnover for the current financial year"
        />

        {/* Number of Employees */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            Number of Employees (FTE) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={data.employeesFTE || ""}
            onChange={(e) =>
              updateField("employeesFTE", parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className={errors.employeesFTE ? "border-red-500" : ""}
          />
          {errors.employeesFTE && (
            <p className="mt-1 text-xs text-red-500">{errors.employeesFTE}</p>
          )}
          <p className="mt-1 text-xs text-brand-grayMed">
            Full-time equivalent employees
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
