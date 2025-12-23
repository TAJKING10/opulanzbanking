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
  const t = useTranslations();

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const checkValidity = () => {
    if (!data.businessActivity) return false;
    if (!data.turnoverLastFYAmount || data.turnoverLastFYAmount < 0) return false;
    if (!data.turnoverCurrentFYAmount || data.turnoverCurrentFYAmount < 0) return false;
    if (data.employeesFTE === undefined || data.employeesFTE < 0) return false;

    return true;
  };

  // Check validation whenever data changes
  React.useEffect(() => {
    const isValid = checkValidity();
    onUpdate({ isStep2Valid: isValid });
  }, [
    data.businessActivity,
    data.turnoverLastFYAmount,
    data.turnoverCurrentFYAmount,
    data.employeesFTE,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          {t('accounting.activityScale.title')}
        </h2>
        <p className="text-brand-grayMed">
          {t('accounting.activityScale.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Activity */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.activityScale.fields.businessActivity')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.businessActivity || ""}
            onValueChange={(value) => updateField("businessActivity", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('accounting.activityScale.placeholders.businessActivity')} />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_ACTIVITIES.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  {activity.label} (NACE {activity.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Annual Turnover (Last FY) */}
        <CurrencyAmount
          label={t('accounting.activityScale.fields.turnoverLastFY')}
          amount={data.turnoverLastFYAmount || 0}
          currency={data.turnoverLastFYCurrency || "EUR"}
          onAmountChange={(amount) =>
            updateField("turnoverLastFYAmount", amount)
          }
          onCurrencyChange={(currency) =>
            updateField("turnoverLastFYCurrency", currency)
          }
          required
          helpText={t('accounting.activityScale.hints.turnoverLastFY')}
        />

        {/* Projected Turnover (Current FY) */}
        <CurrencyAmount
          label={t('accounting.activityScale.fields.turnoverCurrentFY')}
          amount={data.turnoverCurrentFYAmount || 0}
          currency={data.turnoverCurrentFYCurrency || "EUR"}
          onAmountChange={(amount) =>
            updateField("turnoverCurrentFYAmount", amount)
          }
          onCurrencyChange={(currency) =>
            updateField("turnoverCurrentFYCurrency", currency)
          }
          required
          helpText={t('accounting.activityScale.hints.turnoverCurrentFY')}
        />

        {/* Number of Employees */}
        <div>
          <Label className="text-sm font-medium text-brand-dark">
            {t('accounting.activityScale.fields.employees')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={data.employeesFTE === undefined || data.employeesFTE === 0 ? "" : data.employeesFTE}
            onChange={(e) =>
              updateField("employeesFTE", e.target.value === "" ? undefined : parseInt(e.target.value))
            }
            placeholder=""
          />
          <p className="mt-1 text-xs text-brand-grayMed">
            {t('accounting.activityScale.hints.employees')}
          </p>
        </div>
      </div>
    </div>
  );
}
