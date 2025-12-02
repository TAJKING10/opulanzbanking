"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardProgress } from './WizardProgress';

// Step components
import { ClientTypeStep } from './steps/ClientTypeStep';
import { PPIdentityStep } from './steps/pp/PPIdentityStep';
import { PPFamilyStep } from './steps/pp/PPFamilyStep';
import {
  PPFinancialStep,
  PPOriginOfFundsStep,
  PPPatrimonyStep,
  PPRetirementStep,
  PPKnowledgeStep,
  PPObjectivesStep,
  PPRiskStep,
  PPConsentsStep
} from './steps/StepTemplate';

import {
  PMCompanyIdentityStep,
  PMRepresentativesStep,
  PMFATCAStep,
  PMFinancialStep as PMFinancialStepTemplate,
  PMOriginOfFundsStep as PMOriginOfFundsStepTemplate,
  PMKnowledgeStep as PMKnowledgeStepTemplate,
  PMPortfolioManagementStep,
  PMObjectivesStep as PMObjectivesStepTemplate,
  PMConsentsStep as PMConsentsStepTemplate
} from './steps/pm/PMSteps';

// Alias to avoid name conflicts
const PMFinancialStep = PMFinancialStepTemplate;
const PMOriginOfFundsStep = PMOriginOfFundsStepTemplate;
const PMKnowledgeStep = PMKnowledgeStepTemplate;
const PMObjectivesStep = PMObjectivesStepTemplate;
const PMConsentsStep = PMConsentsStepTemplate;

import { MissionStep } from './steps/common/MissionStep';
import { DocumentsStep } from './steps/common/DocumentsStep';
import { ReviewStep } from './steps/common/ReviewStep';
import { SuccessStep } from './steps/common/SuccessStep';

const PP_STEPS = [
  { key: 'type', label: 'Type', component: ClientTypeStep },
  { key: 'identity', label: 'Identity', component: PPIdentityStep },
  { key: 'family', label: 'Family', component: PPFamilyStep },
  { key: 'financial', label: 'Financial', component: PPFinancialStep },
  { key: 'origin', label: 'Origin of Funds', component: PPOriginOfFundsStep },
  { key: 'patrimony', label: 'Patrimony', component: PPPatrimonyStep },
  { key: 'retirement', label: 'Retirement', component: PPRetirementStep },
  { key: 'knowledge', label: 'Knowledge', component: PPKnowledgeStep },
  { key: 'objectives', label: 'Objectives', component: PPObjectivesStep },
  { key: 'risk', label: 'Risk Profile', component: PPRiskStep },
  { key: 'mission', label: 'Mission', component: MissionStep },
  { key: 'documents', label: 'Documents', component: DocumentsStep },
  { key: 'consents', label: 'Consents', component: PPConsentsStep },
  { key: 'review', label: 'Review', component: ReviewStep },
  { key: 'success', label: 'Complete', component: SuccessStep },
];

const PM_STEPS = [
  { key: 'type', label: 'Type', component: ClientTypeStep },
  { key: 'company', label: 'Company', component: PMCompanyIdentityStep },
  { key: 'representatives', label: 'Representatives', component: PMRepresentativesStep },
  { key: 'fatca', label: 'FATCA & UBO', component: PMFATCAStep },
  { key: 'financial', label: 'Financial', component: PMFinancialStep },
  { key: 'origin', label: 'Origin of Funds', component: PMOriginOfFundsStep },
  { key: 'knowledge', label: 'Knowledge', component: PMKnowledgeStep },
  { key: 'portfolio', label: 'Portfolio Mgmt', component: PMPortfolioManagementStep },
  { key: 'objectives', label: 'Objectives', component: PMObjectivesStep },
  { key: 'mission', label: 'Mission', component: MissionStep },
  { key: 'documents', label: 'Documents', component: DocumentsStep },
  { key: 'consents', label: 'Consents', component: PMConsentsStep },
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
