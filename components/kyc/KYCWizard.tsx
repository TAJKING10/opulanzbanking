"use client";

import React from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardProgress } from './WizardProgress';

// Step components
import { ClientTypeStep } from './steps/ClientTypeStep';
import { PPComprehensiveForm } from './steps/pp/PPComprehensiveForm';
import { PMComprehensiveForm } from './steps/pm/PMComprehensiveForm';
import { ReviewStep } from './steps/common/ReviewStep';
import { SuccessStep } from './steps/common/SuccessStep';

// Simplified 4-step flow for Individual (PP)
const PP_STEPS = [
  { key: 'type', label: 'Client Type', component: ClientTypeStep },
  { key: 'information', label: 'Information', component: PPComprehensiveForm },
  { key: 'review', label: 'Review', component: ReviewStep },
  { key: 'success', label: 'Complete', component: SuccessStep },
];

// Simplified 4-step flow for Company (PM)
const PM_STEPS = [
  { key: 'type', label: 'Client Type', component: ClientTypeStep },
  { key: 'information', label: 'Information', component: PMComprehensiveForm },
  { key: 'review', label: 'Review', component: ReviewStep },
  { key: 'success', label: 'Complete', component: SuccessStep },
];

export function KYCWizard() {
  const { currentStep, clientType } = useKYCWizard();

  const steps = clientType === 'PP' ? PP_STEPS : clientType === 'PM' ? PM_STEPS : [PP_STEPS[0]];
  const CurrentStepComponent = steps[currentStep]?.component || ClientTypeStep;

  return (
    <div>
      {clientType && currentStep > 0 && (
        <WizardProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps.map(s => s.label)}
        />
      )}

      <div className="mt-6">
        <CurrentStepComponent />
      </div>
    </div>
  );
}
