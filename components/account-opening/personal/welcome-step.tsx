"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Landmark } from "lucide-react";

interface WelcomeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function WelcomeStep({ data, onUpdate, onNext }: WelcomeStepProps) {
  const [mode, setMode] = React.useState(data.mode || "");

  const handleModeChange = (value: string) => {
    setMode(value);
    onUpdate({ mode: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Welcome to Opulanz</h2>
        <p className="text-brand-grayMed">
          Let's get started with opening your personal bank account. This should take about 10 minutes.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            What type of account are you opening?
          </h3>

          <RadioGroup value={mode} onValueChange={handleModeChange} className="space-y-4">
            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                mode === "current"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleModeChange("current")}
            >
              <RadioGroupItem value="current" id="current" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="current"
                    className="text-base font-semibold text-brand-dark cursor-pointer"
                  >
                    Current / Everyday Account
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">
                  Standard personal banking for daily transactions, payments, and savings.
                  Suitable for residents and non-residents.
                </p>
              </div>
            </div>

            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                mode === "private"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleModeChange("private")}
            >
              <RadioGroupItem value="private" id="private" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Landmark className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="private"
                    className="text-base font-semibold text-brand-dark cursor-pointer"
                  >
                    Private Banking
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">
                  Wealth management and private banking services for high-net-worth individuals.
                  Minimum deposit typically required.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">What happens next?</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• We'll collect your personal information</li>
            <li>• Verify your identity and contact details</li>
            <li>• Match you with Opulanz Partner Bank</li>
            <li>• Complete the account opening process</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
