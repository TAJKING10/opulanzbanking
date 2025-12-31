#!/usr/bin/env node
/**
 * Update all KYC wizard components to use translations
 */

const fs = require('fs');
const path = require('path');

console.log('Updating components to use translations...\n');

// 1. Update investment-advisory/schedule/page.tsx
const investmentPagePath = path.join(__dirname, 'app', '[locale]', 'investment-advisory', 'schedule', 'page.tsx');
let investmentPage = fs.readFileSync(investmentPagePath, 'utf8');

investmentPage = investmentPage.replace(
  'import * as React from "react";',
  'import * as React from "react";\nimport { useTranslations } from "next-intl";'
);

investmentPage = investmentPage.replace(
  'export default function InvestmentOnboardingPage() {\n  return (',
  'export default function InvestmentOnboardingPage() {\n  const t = useTranslations(\'investmentAdvisory.onboarding\');\n\n  return ('
);

investmentPage = investmentPage.replace(
  '<span className="text-sm font-semibold text-brand-gold">Investment Advisory Onboarding</span>',
  '<span className="text-sm font-semibold text-brand-gold">{t(\'badge\')}</span>'
);

investmentPage = investmentPage.replace(
  'Client Information & Compliance (KYC)',
  '{t(\'title\')}'
);

investmentPage = investmentPage.replace(
  'To provide you with personalized investment advisory services, we need to collect\n            some information for regulatory compliance and to understand your investment profile.',
  '{t(\'subtitle\')}'
);

investmentPage = investmentPage.replace(
  '🔒 Your information is encrypted and secure. We comply with GDPR and French banking regulations (ACPR, AMF).',
  '🔒 {t(\'securityNotice\')}'
);

fs.writeFileSync(investmentPagePath, investmentPage, 'utf8');
console.log('[OK] Updated investment-advisory/schedule/page.tsx');

// 2. Update WizardProgress.tsx
const wizardProgressPath = path.join(__dirname, 'components', 'kyc', 'WizardProgress.tsx');
let wizardProgress = fs.readFileSync(wizardProgressPath, 'utf8');

wizardProgress = wizardProgress.replace(
  '"use client";\n\nimport React from \'react\';',
  '"use client";\n\nimport React from \'react\';\nimport { useTranslations } from \'next-intl\';'
);

wizardProgress = wizardProgress.replace(
  'export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {\n  const progress = ((currentStep + 1) / totalSteps) * 100;',
  'export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {\n  const t = useTranslations(\'investmentAdvisory.wizard.progress\');\n  const progress = ((currentStep + 1) / totalSteps) * 100;'
);

wizardProgress = wizardProgress.replace(
  '<span>Step {currentStep + 1} of {totalSteps}</span>',
  '<span>{t(\'step\')} {currentStep + 1} {t(\'of\')} {totalSteps}</span>'
);

wizardProgress = wizardProgress.replace(
  '<span>{Math.round(progress)}% Complete</span>',
  '<span>{Math.round(progress)}% {t(\'complete\')}</span>'
);

fs.writeFileSync(wizardProgressPath, wizardProgress, 'utf8');
console.log('[OK] Updated WizardProgress.tsx');

// 3. Update KYCWizard.tsx
const kycWizardPath = path.join(__dirname, 'components', 'kyc', 'KYCWizard.tsx');
let kycWizard = fs.readFileSync(kycWizardPath, 'utf8');

kycWizard = kycWizard.replace(
  'import React from \'react\';',
  'import React from \'react\';\nimport { useTranslations } from \'next-intl\';'
);

kycWizard = kycWizard.replace(
  '// Simplified 4-step flow for Individual (PP)\nconst PP_STEPS = [\n  { key: \'type\', label: \'Client Type\', component: ClientTypeStep },\n  { key: \'information\', label: \'Information\', component: PPComprehensiveForm },\n  { key: \'review\', label: \'Review\', component: ReviewStep },\n  { key: \'success\', label: \'Complete\', component: SuccessStep },\n];',
  '// Simplified 4-step flow for Individual (PP)\nfunction useSteps() {\n  const t = useTranslations(\'investmentAdvisory.wizard.steps\');\n  return {\n    PP_STEPS: [\n      { key: \'type\', label: t(\'clientType\'), component: ClientTypeStep },\n      { key: \'information\', label: t(\'information\'), component: PPComprehensiveForm },\n      { key: \'review\', label: t(\'review\'), component: ReviewStep },\n      { key: \'success\', label: t(\'complete\'), component: SuccessStep },\n    ],\n    PM_STEPS: [\n      { key: \'type\', label: t(\'clientType\'), component: ClientTypeStep },\n      { key: \'information\', label: t(\'information\'), component: PMComprehensiveForm },\n      { key: \'review\', label: t(\'review\'), component: ReviewStep },\n      { key: \'success\', label: t(\'complete\'), component: SuccessStep },\n    ]\n  };\n}'
);

kycWizard = kycWizard.replace(
  '// Simplified 4-step flow for Company (PM)\nconst PM_STEPS = [\n  { key: \'type\', label: \'Client Type\', component: ClientTypeStep },\n  { key: \'information\', label: \'Information\', component: PMComprehensiveForm },\n  { key: \'review\', label: \'Review\', component: ReviewStep },\n  { key: \'success\', label: \'Complete\', component: SuccessStep },\n];',
  ''
);

kycWizard = kycWizard.replace(
  'export function KYCWizard() {\n  const { currentStep, clientType } = useKYCWizard();',
  'export function KYCWizard() {\n  const { currentStep, clientType } = useKYCWizard();\n  const { PP_STEPS, PM_STEPS } = useSteps();'
);

kycWizard = kycWizard.replace(
  'const steps = clientType === \'PP\' ? PP_STEPS : clientType === \'PM\' ? PM_STEPS : [PP_STEPS[0]];',
  'const steps = clientType === \'PP\' ? PP_STEPS : clientType === \'PM\' ? PM_STEPS : [PP_STEPS[0]];'
);

fs.writeFileSync(kycWizardPath, kycWizard, 'utf8');
console.log('[OK] Updated KYCWizard.tsx');

// 4. Update ClientTypeStep.tsx
const clientTypeStepPath = path.join(__dirname, 'components', 'kyc', 'steps', 'ClientTypeStep.tsx');
let clientTypeStep = fs.readFileSync(clientTypeStepPath, 'utf8');

clientTypeStep = clientTypeStep.replace(
  'import React, { useState } from \'react\';',
  'import React, { useState } from \'react\';\nimport { useTranslations } from \'next-intl\';'
);

clientTypeStep = clientTypeStep.replace(
  'export function ClientTypeStep() {\n  const { setClientType, updateData, nextStep } = useKYCWizard();',
  'export function ClientTypeStep() {\n  const t = useTranslations(\'investmentAdvisory.clientType\');\n  const tContact = useTranslations(\'investmentAdvisory.clientType.contact\');\n  const tCommon = useTranslations(\'common\');\n  const { setClientType, updateData, nextStep } = useKYCWizard();'
);

// Replace hardcoded strings
clientTypeStep = clientTypeStep.replace(/<h2 className="text-2xl font-bold text-brand-dark mb-2">Welcome to Opulanz<\/h2>/, '<h2 className="text-2xl font-bold text-brand-dark mb-2">{t(\'welcome\')}</h2>');
clientTypeStep = clientTypeStep.replace(/<p className="text-brand-grayMed">Let's start your investment journey<\/p>/, '<p className="text-brand-grayMed">{t(\'subtitle\')}</p>');
clientTypeStep = clientTypeStep.replace(/Are you an individual or a company\?/, '{t(\'question\')}');
clientTypeStep = clientTypeStep.replace(/<h3 className="font-semibold text-brand-dark mb-1">Individual<\/h3>/, '<h3 className="font-semibold text-brand-dark mb-1">{t(\'individual.title\')}</h3>');
clientTypeStep = clientTypeStep.replace(/<p className="text-sm text-brand-grayMed">Personal investment account<\/p>/, '<p className="text-sm text-brand-grayMed">{t(\'individual.description\')}</p>');
clientTypeStep = clientTypeStep.replace(/<h3 className="font-semibold text-brand-dark mb-1">Company<\/h3>/, '<h3 className="font-semibold text-brand-dark mb-1">{t(\'company.title\')}</h3>');
clientTypeStep = clientTypeStep.replace(/<p className="text-sm text-brand-grayMed">Corporate investment account<\/p>/, '<p className="text-sm text-brand-grayMed">{t(\'company.description\')}</p>');
clientTypeStep = clientTypeStep.replace(/Email Address <span className="text-red-500">\*<\/span>/, '{tContact(\'email\')} <span className="text-red-500">*</span>');
clientTypeStep = clientTypeStep.replace(/Mobile Phone <span className="text-red-500">\*<\/span>/, '{tContact(\'mobile\')} <span className="text-red-500">*</span>');
clientTypeStep = clientTypeStep.replace(/Preferred Language/, '{tContact(\'language\')}');
clientTypeStep = clientTypeStep.replace(/placeholder="your@email.com"/, 'placeholder="{tContact(\'emailPlaceholder\')}"');
clientTypeStep = clientTypeStep.replace(/placeholder="\+33 6 12 34 56 78"/, 'placeholder="{tContact(\'mobilePlaceholder\')}"');
clientTypeStep = clientTypeStep.replace(/Continue/, '{tCommon(\'continue\')}');

fs.writeFileSync(clientTypeStepPath, clientTypeStep, 'utf8');
console.log('[OK] Updated ClientTypeStep.tsx');

console.log('\n[OK] Component updates complete!');
console.log('\nNote: Due to complexity, the following files still need manual review:');
console.log('- PPComprehensiveForm.tsx (very large, ~300 lines of hardcoded text)');
console.log('- PMComprehensiveForm.tsx (very large, ~300 lines of hardcoded text)');
console.log('- ReviewStep.tsx (complex review logic with ~100 labels)');
console.log('- SuccessStep.tsx (success page with ~30 text elements)');
console.log('\nThese files require careful manual updating due to their size and complexity.');
