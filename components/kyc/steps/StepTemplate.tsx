"use client";

import React from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../WizardNavigation';

interface StepTemplateProps {
  title: string;
  description: string;
  fields?: Array<{ label: string; type: string; key: string }>;
}

export function StepTemplate({ title, description, fields = [] }: StepTemplateProps) {
  const { updateData, nextStep, prevStep } = useKYCWizard();

  const handleSubmit = () => {
    // Template implementation - data collection to be added
    updateData({} as any);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-6">{title}</h2>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Template Step:</strong> {description}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            This step will collect detailed information. Full implementation pending.
          </p>
        </div>

        {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <WizardNavigation
        onNext={handleSubmit}
        onPrev={prevStep}
        canGoPrev={true}
        canGoNext={true}
      />
    </div>
  );
}

// Reusable step generators
export const PPFinancialStep = () => (
  <StepTemplate
    title="Financial Situation"
    description="Income range, net worth, asset allocation, tax situation"
    fields={[
      { label: "Income Range", type: "select", key: "incomeRange" },
      { label: "Estimated Net Worth", type: "select", key: "netWorth" },
    ]}
  />
);

export const PPOriginOfFundsStep = () => (
  <StepTemplate
    title="Origin of Funds"
    description="Planned investment amount, nature of assets, economic origin, banking details"
    fields={[
      { label: "Planned Investment Amount", type: "number", key: "investmentAmount" },
      { label: "Origin Bank Name", type: "text", key: "bankName" },
    ]}
  />
);

export const PPPatrimonyStep = () => (
  <StepTemplate
    title="Detailed Patrimony"
    description="Financial assets, real estate, professional assets, debts & loans"
  />
);

export const PPRetirementStep = () => (
  <StepTemplate
    title="Retirement & Insurance"
    description="Retirement schemes, protection insurance, target retirement date"
  />
);

export const PPKnowledgeStep = () => (
  <StepTemplate
    title="Investment Knowledge & Experience"
    description="Experience with various financial instruments (equities, bonds, funds, etc.)"
  />
);

export const PPObjectivesStep = () => (
  <StepTemplate
    title="Investment Objectives"
    description="Goals prioritization, investment horizon, ESG preferences"
  />
);

export const PPRiskStep = () => (
  <StepTemplate
    title="Risk Profile"
    description="Risk tolerance, past experience with losses, acceptable loss percentage"
  />
);

export const PPConsentsStep = () => (
  <StepTemplate
    title="Consents & Declarations"
    description="Regulatory consents, GDPR, AML declarations, signature metadata"
  />
);
