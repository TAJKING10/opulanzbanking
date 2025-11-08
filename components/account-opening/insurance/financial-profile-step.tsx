"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";

interface FinancialProfileStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const EMPLOYMENT_STATUSES = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "retired", label: "Retired" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
];

const INCOME_RANGES = [
  { value: "0-25k", label: "€0 - €25,000" },
  { value: "25k-50k", label: "€25,000 - €50,000" },
  { value: "50k-100k", label: "€50,000 - €100,000" },
  { value: "100k-250k", label: "€100,000 - €250,000" },
  { value: "250k-500k", label: "€250,000 - €500,000" },
  { value: "500k+", label: "€500,000+" },
];

const ASSET_RANGES = [
  { value: "0-50k", label: "€0 - €50,000" },
  { value: "50k-100k", label: "€50,000 - €100,000" },
  { value: "100k-250k", label: "€100,000 - €250,000" },
  { value: "250k-500k", label: "€250,000 - €500,000" },
  { value: "500k-1m", label: "€500,000 - €1,000,000" },
  { value: "1m-2m", label: "€1,000,000 - €2,000,000" },
  { value: "2m+", label: "€2,000,000+" },
];

const SOURCE_OF_FUNDS = [
  { value: "salary", label: "Salary / Employment Income" },
  { value: "business", label: "Business Income" },
  { value: "inheritance", label: "Inheritance" },
  { value: "investments", label: "Investment Returns" },
  { value: "savings", label: "Savings" },
  { value: "property", label: "Property Sale" },
  { value: "gift", label: "Gift" },
  { value: "other", label: "Other" },
];

export function FinancialProfileStep({ data, onUpdate, onNext }: FinancialProfileStepProps) {
  const [formState, setFormState] = React.useState({
    employmentStatus: data.employmentStatus || "",
    occupation: data.occupation || "",
    employer: data.employer || "",
    annualIncome: data.annualIncome || "",
    totalAssets: data.totalAssets || "",
    liquidAssets: data.liquidAssets || "",
    sourceOfFunds: data.sourceOfFunds || "",
    sourceOfFundsDetails: data.sourceOfFundsDetails || "",
    sourceOfWealth: data.sourceOfWealth || "",
    sourceOfWealthDetails: data.sourceOfWealthDetails || "",
    isPEP: data.isPEP || false,
    pepDetails: data.pepDetails || "",
  });

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  const isFormValid = React.useMemo(() => {
    const baseValid =
      formState.employmentStatus &&
      formState.annualIncome &&
      formState.totalAssets &&
      formState.liquidAssets &&
      formState.sourceOfFunds &&
      formState.sourceOfWealth;

    // If employed or self-employed, occupation is required
    const occupationValid =
      !["employed", "self-employed"].includes(formState.employmentStatus) || formState.occupation;

    // If employed, employer is required
    const employerValid = formState.employmentStatus !== "employed" || formState.employer;

    // If source is "other", details are required
    const sofDetailsValid = formState.sourceOfFunds !== "other" || formState.sourceOfFundsDetails.trim();

    const sowDetailsValid = formState.sourceOfWealth !== "other" || formState.sourceOfWealthDetails.trim();

    // If PEP, details are required
    const pepValid = !formState.isPEP || formState.pepDetails.trim();

    return baseValid && occupationValid && employerValid && sofDetailsValid && sowDetailsValid && pepValid;
  }, [formState]);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      ...formState,
      isFinancialStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Financial Profile</h2>
        <p className="text-brand-grayMed">
          Help us understand your financial situation and the source of funds for this investment.
        </p>
      </div>

      {/* Employment Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Employment Information</h3>

        <div className="space-y-2">
          <Label htmlFor="employmentStatus">Employment Status *</Label>
          <Select
            value={formState.employmentStatus}
            onValueChange={(value) => updateField("employmentStatus", value)}
          >
            <SelectTrigger id="employmentStatus">
              <SelectValue placeholder="Select employment status" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {["employed", "self-employed"].includes(formState.employmentStatus) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation / Job Title *</Label>
              <Input
                id="occupation"
                type="text"
                value={formState.occupation}
                onChange={(e) => updateField("occupation", e.target.value)}
                placeholder="e.g., Financial Analyst, Business Owner"
                required
              />
            </div>

            {formState.employmentStatus === "employed" && (
              <div className="space-y-2">
                <Label htmlFor="employer">Employer Name *</Label>
                <Input
                  id="employer"
                  type="text"
                  value={formState.employer}
                  onChange={(e) => updateField("employer", e.target.value)}
                  placeholder="Name of your employer"
                  required
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Financial Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Financial Information</h3>

        <div className="space-y-2">
          <Label htmlFor="annualIncome">Annual Income *</Label>
          <Select value={formState.annualIncome} onValueChange={(value) => updateField("annualIncome", value)}>
            <SelectTrigger id="annualIncome">
              <SelectValue placeholder="Select annual income range" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAssets">Total Assets *</Label>
          <Select value={formState.totalAssets} onValueChange={(value) => updateField("totalAssets", value)}>
            <SelectTrigger id="totalAssets">
              <SelectValue placeholder="Select total assets range" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            Include all assets: savings, investments, property, business interests, etc.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="liquidAssets">Liquid Assets *</Label>
          <Select value={formState.liquidAssets} onValueChange={(value) => updateField("liquidAssets", value)}>
            <SelectTrigger id="liquidAssets">
              <SelectValue placeholder="Select liquid assets range" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            Assets readily convertible to cash: bank accounts, stocks, bonds, etc.
          </p>
        </div>
      </div>

      {/* Source of Funds */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Source of Funds & Wealth</h3>

        <div className="space-y-2">
          <Label htmlFor="sourceOfFunds">Source of Funds for This Investment *</Label>
          <Select value={formState.sourceOfFunds} onValueChange={(value) => updateField("sourceOfFunds", value)}>
            <SelectTrigger id="sourceOfFunds">
              <SelectValue placeholder="Select source of funds" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OF_FUNDS.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            Where will the money for the insurance premium come from?
          </p>
        </div>

        {formState.sourceOfFunds === "other" && (
          <div className="space-y-2">
            <Label htmlFor="sourceOfFundsDetails">Please specify *</Label>
            <Textarea
              id="sourceOfFundsDetails"
              value={formState.sourceOfFundsDetails}
              onChange={(e) => updateField("sourceOfFundsDetails", e.target.value)}
              placeholder="Provide details about the source of funds"
              rows={3}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="sourceOfWealth">Source of Wealth *</Label>
          <Select value={formState.sourceOfWealth} onValueChange={(value) => updateField("sourceOfWealth", value)}>
            <SelectTrigger id="sourceOfWealth">
              <SelectValue placeholder="Select source of wealth" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OF_FUNDS.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            How did you accumulate your overall wealth?
          </p>
        </div>

        {formState.sourceOfWealth === "other" && (
          <div className="space-y-2">
            <Label htmlFor="sourceOfWealthDetails">Please specify *</Label>
            <Textarea
              id="sourceOfWealthDetails"
              value={formState.sourceOfWealthDetails}
              onChange={(e) => updateField("sourceOfWealthDetails", e.target.value)}
              placeholder="Provide details about the source of wealth"
              rows={3}
              required
            />
          </div>
        )}
      </div>

      {/* PEP Screening */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Political Exposure</h3>

        <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
          <RadioGroup
            value={formState.isPEP ? "yes" : "no"}
            onValueChange={(value) => updateField("isPEP", value === "yes")}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="no" id="pep-no" />
                <div>
                  <Label htmlFor="pep-no" className="cursor-pointer font-medium">
                    I am not a Politically Exposed Person (PEP)
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="yes" id="pep-yes" />
                <div>
                  <Label htmlFor="pep-yes" className="cursor-pointer font-medium">
                    I am a Politically Exposed Person (PEP)
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-5 w-5 text-blue-600" />
              <div className="space-y-1 text-sm text-blue-800">
                <p className="font-semibold">What is a PEP?</p>
                <p>
                  A Politically Exposed Person is an individual who holds or has held a prominent public function,
                  such as a head of state, senior politician, senior government official, judicial or military
                  official, senior executive of a state-owned corporation, or important political party official.
                  Family members and close associates of PEPs are also considered PEPs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {formState.isPEP && (
          <div className="space-y-2">
            <Label htmlFor="pepDetails">Please provide details *</Label>
            <Textarea
              id="pepDetails"
              value={formState.pepDetails}
              onChange={(e) => updateField("pepDetails", e.target.value)}
              placeholder="Describe your political position, role, or relationship to a PEP"
              rows={4}
              required
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="space-y-1 text-sm text-blue-800">
            <p className="font-semibold">AML/KYC Compliance</p>
            <p>
              This information is required under Luxembourg and EU Anti-Money Laundering regulations. All data
              provided will be kept confidential and used solely for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
