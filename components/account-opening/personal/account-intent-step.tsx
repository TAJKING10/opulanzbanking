"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";

interface AccountIntentStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function AccountIntentStep({ data, onUpdate, onNext }: AccountIntentStepProps) {
  const [residence, setResidence] = React.useState(data.residence || "");
  const [country, setCountry] = React.useState(data.country || "");

  const handleResidenceChange = (value: string) => {
    setResidence(value);
    onUpdate({ residence: value });
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    onUpdate({ country: value });
  };

  const handleContinue = () => {
    if (residence && (residence === "non-resident" || country)) {
      onNext();
    }
  };

  const isFormValid = residence && (residence === "non-resident" || country);

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

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!isFormValid}
          className="bg-brand-gold text-white hover:bg-brand-goldDark"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
