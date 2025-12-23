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

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

interface CurrencyAmountProps {
  label: string;
  amount: number;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export function CurrencyAmount({
  label,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  required = false,
  error,
  helpText,
}: CurrencyAmountProps) {
  const [displayValue, setDisplayValue] = React.useState(
    amount && amount !== 0 ? amount.toLocaleString("en-US") : ""
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const num = raw === "" ? 0 : parseFloat(raw);
    setDisplayValue(raw);
    onAmountChange(num);
  };

  const handleBlur = () => {
    if (amount && amount !== 0) {
      setDisplayValue(amount.toLocaleString("en-US"));
    } else {
      setDisplayValue("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-brand-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={displayValue}
            onChange={handleAmountChange}
            onBlur={handleBlur}
            onFocus={() => setDisplayValue(amount && amount !== 0 ? amount.toString() : "")}
            placeholder=""
            className={error ? "border-red-500" : ""}
          />
        </div>
        <div className="w-32">
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {helpText && <p className="text-xs text-brand-grayMed">{helpText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
