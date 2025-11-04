"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, PlusCircle } from "lucide-react";

interface CompanyStatusStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function CompanyStatusStep({ data, onUpdate, onNext }: CompanyStatusStepProps) {
  const [companyStatus, setCompanyStatus] = React.useState(data.companyStatus || "");
  const [companyName, setCompanyName] = React.useState(data.companyName || "");
  const [registrationNumber, setRegistrationNumber] = React.useState(data.registrationNumber || "");

  const handleStatusChange = (value: string) => {
    setCompanyStatus(value);
    onUpdate({ companyStatus: value });
  };

  const handleContinue = () => {
    if (companyStatus === "existing" && companyName && registrationNumber) {
      onUpdate({ companyName, registrationNumber });
      onNext();
    } else if (companyStatus === "new") {
      onNext();
    }
  };

  const canContinue =
    (companyStatus === "existing" && companyName && registrationNumber) ||
    companyStatus === "new";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Company Status</h2>
        <p className="text-brand-grayMed">
          Tell us about your company so we can provide the right banking solution.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            Do you have an existing company or want to start a new one?
          </h3>

          <RadioGroup value={companyStatus} onValueChange={handleStatusChange} className="space-y-4">
            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                companyStatus === "existing"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleStatusChange("existing")}
            >
              <RadioGroupItem value="existing" id="existing" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="existing"
                    className="cursor-pointer text-base font-semibold text-brand-dark"
                  >
                    Existing Company
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">
                  I already have a registered company and need a bank account for it.
                </p>
              </div>
            </div>

            <div
              className={`relative flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-6 transition-all ${
                companyStatus === "new"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleStatusChange("new")}
            >
              <RadioGroupItem value="new" id="new" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-6 w-6 text-brand-gold" />
                  <Label
                    htmlFor="new"
                    className="cursor-pointer text-base font-semibold text-brand-dark"
                  >
                    New Company
                  </Label>
                </div>
                <p className="mt-2 text-sm text-brand-grayMed">
                  I want to start a new company and need help with company formation and banking.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {companyStatus === "existing" && (
          <div className="space-y-4 rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <h4 className="font-semibold text-brand-dark">Company Details</h4>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Company Registration Number *</Label>
              <Input
                id="registrationNumber"
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g., B123456"
                required
              />
            </div>
          </div>
        )}

        {companyStatus === "new" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">Company Formation Service</h4>
            <p className="text-sm text-blue-800">
              We'll help you form your company in your chosen jurisdiction and open a bank account
              simultaneously. This streamlined process saves time and ensures everything is set up correctly.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="bg-brand-gold text-white hover:bg-brand-goldDark"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
