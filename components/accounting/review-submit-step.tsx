"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Building2, TrendingUp, Users, FileText } from "lucide-react";

interface ReviewSubmitStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onSubmit: () => void;
}

export function ReviewSubmitStep({
  data,
  onUpdate,
  onSubmit,
}: ReviewSubmitStepProps) {
  const [consent, setConsent] = React.useState(data.consent || false);

  const handleConsentChange = (checked: boolean) => {
    setConsent(checked);
    onUpdate({ consent: checked });
  };

  const handleSubmit = () => {
    if (consent) {
      onSubmit();
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          Review & Submit
        </h2>
        <p className="text-brand-grayMed">
          Please review your information before submitting your accounting
          onboarding request.
        </p>
      </div>

      {/* Summary Section */}
      <div className="space-y-6">
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-brand-dark">
            Application Summary
          </h3>

          <div className="space-y-4">
            {/* Company Basics */}
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark">Company</p>
                <p className="text-sm text-brand-grayMed">{data.legalName}</p>
                <p className="text-xs text-brand-grayMed">
                  {data.companyType?.toUpperCase()} • {data.countryOfIncorporation} •
                  Incorporated {data.dateOfIncorporation}
                </p>
              </div>
            </div>

            {/* Activity & Scale */}
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark">
                  Business Activity
                </p>
                <p className="text-sm text-brand-grayMed">
                  NACE {data.businessActivity}
                </p>
                <p className="text-xs text-brand-grayMed">
                  Last FY Turnover:{" "}
                  {formatCurrency(
                    data.turnoverLastFYAmount,
                    data.turnoverLastFYCurrency
                  )}{" "}
                  • Projected:{" "}
                  {formatCurrency(
                    data.turnoverCurrentFYAmount,
                    data.turnoverCurrentFYCurrency
                  )}
                </p>
              </div>
            </div>

            {/* Employees */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark">Team Size</p>
                <p className="text-sm text-brand-grayMed">
                  {data.employeesFTE} FTE employees
                </p>
              </div>
            </div>

            {/* Contacts */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark">
                  Primary Contact
                </p>
                <p className="text-sm text-brand-grayMed">
                  {data.primaryContact?.firstName}{" "}
                  {data.primaryContact?.lastName} ({data.primaryContact?.role})
                </p>
                <p className="text-xs text-brand-grayMed">
                  {data.primaryContact?.email} • {data.primaryContact?.phone}
                </p>
              </div>
            </div>

            {/* Billing Volume */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 flex-shrink-0 text-brand-gold" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark">
                  Monthly Volume
                </p>
                <p className="text-sm text-brand-grayMed">
                  Sales: {data.salesInvoicesMonth} invoices • Purchases:{" "}
                  {data.purchaseInvoicesMonth} invoices
                </p>
                {data.payrollNeeded && (
                  <p className="text-xs text-brand-grayMed">
                    Payroll: {data.payrollEmployees} employees
                  </p>
                )}
                {data.multiCurrencyEnabled && (
                  <p className="text-xs text-brand-grayMed">
                    Multi-currency: {data.multiCurrencies?.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Documents */}
            {data.documents && data.documents.length > 0 && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 flex-shrink-0 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-dark">
                    Documents
                  </p>
                  <p className="text-sm text-brand-grayMed">
                    {data.documents.length} document(s) uploaded
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Consent Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brand-dark">
            Required Consent
          </h3>

          <div
            className={`rounded-lg border-2 p-4 transition-all ${
              consent
                ? "border-brand-gold bg-brand-gold/5"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={handleConsentChange}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="consent"
                  className="cursor-pointer font-semibold text-brand-dark"
                >
                  I agree to data processing for bookkeeping onboarding *
                </Label>
                <p className="mt-1 text-sm text-brand-grayMed">
                  I consent to Opulanz processing my data for bookkeeping
                  onboarding purposes. This includes sharing information with
                  our accounting partners. See our{" "}
                  <a
                    href="/legal/privacy"
                    className="text-brand-gold underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/legal/terms"
                    className="text-brand-gold underline"
                    target="_blank"
                  >
                    Terms of Service
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {!consent && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="text-sm text-red-900">
                You must accept the consent to submit your application.
              </div>
            </div>
          )}
        </div>

        {/* GDPR Notice */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">
            Your Data Rights
          </h4>
          <p className="text-sm text-blue-800">
            Under GDPR, you have the right to access, rectify, erase, or port
            your data. You can also object to processing and withdraw consent
            at any time.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!consent}
          className={`rounded-lg px-6 py-3 font-semibold text-white transition-all ${
            consent
              ? "bg-brand-gold hover:bg-brand-goldDark"
              : "cursor-not-allowed bg-gray-300"
          }`}
        >
          {consent ? "Confirm & Send" : "Accept Consent to Continue"}
        </button>
      </div>
    </div>
  );
}
