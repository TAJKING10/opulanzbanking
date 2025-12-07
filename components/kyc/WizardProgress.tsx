"use client";

import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-brand-grayMed mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-brand-grayLight rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="hidden md:flex justify-between text-xs">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex-1 text-center ${
              idx <= currentStep ? 'text-brand-gold font-semibold' : 'text-brand-grayMed'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
