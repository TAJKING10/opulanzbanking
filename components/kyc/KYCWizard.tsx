"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardProgress } from './WizardProgress';

// Step components
import { ClientTypeStep } from './steps/ClientTypeStep';
import { PPComprehensiveForm } from './steps/pp/PPComprehensiveForm';
import { PMComprehensiveForm } from './steps/pm/PMComprehensiveForm';
import { ReviewStep } from './steps/common/ReviewStep';
import { SuccessStep } from './steps/common/SuccessStep';

// Simplified 4-step flow for Individual (PP)
function useSteps() {
  const t = useTranslations('investmentAdvisory.wizard.steps');
  return {
    PP_STEPS: [
      { key: 'type', label: t('clientType'), component: ClientTypeStep },
      { key: 'information', label: t('information'), component: PPComprehensiveForm },
      { key: 'review', label: t('review'), component: ReviewStep },
      { key: 'success', label: t('complete'), component: SuccessStep },
    ],
    PM_STEPS: [
      { key: 'type', label: t('clientType'), component: ClientTypeStep },
      { key: 'information', label: t('information'), component: PMComprehensiveForm },
      { key: 'review', label: t('review'), component: ReviewStep },
      { key: 'success', label: t('complete'), component: SuccessStep },
    ]
  };
}



export function KYCWizard() {
  const { currentStep, clientType } = useKYCWizard();
  const { PP_STEPS, PM_STEPS } = useSteps();

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
