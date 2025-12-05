"use client";

import * as React from "react";
import { Building2, Briefcase } from "lucide-react";
import { WelcomeStepProps } from "@/shared/types/step-props";

type BusinessWelcomeStepProps = WelcomeStepProps;

export function BusinessWelcomeStep({ data, onUpdate, onNext }: BusinessWelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Welcome to Business Banking</h2>
        <p className="text-brand-grayMed">
          Let's get started with opening your business bank account. This process should take about 15-20 minutes.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 flex-shrink-0 text-brand-gold" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-brand-dark">Business Account Opening</h3>
              <p className="text-sm text-brand-grayMed">
                Whether you have an existing company or want to start a new one, we'll guide you through
                the process of opening a business bank account with Opulanz Partner Bank.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">What you'll need:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Company registration documents (if existing company)</li>
            <li>• Information about directors and beneficial owners (UBOs)</li>
            <li>• Identity documents for all directors and UBOs</li>
            <li>• Proof of business address</li>
            <li>• Company formation details (if starting a new company)</li>
          </ul>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-amber-900">Processing Time</h4>
          <p className="text-sm text-amber-800">
            Business account applications typically take 5-10 business days to review. We may contact you
            for additional information during the review process.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-brand-gold px-8 py-3 text-base font-semibold text-white transition-all hover:bg-brand-goldDark"
        >
          Start Application
        </button>
      </div>
    </div>
  );
}
