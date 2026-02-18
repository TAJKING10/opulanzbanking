"use client";

import { useTranslations } from 'next-intl';
import { StepTemplate } from '../StepTemplate';

export const MissionStep = () => {
  const t = useTranslations('investmentAdvisory.wizard.missionStep');
  return (
    <StepTemplate
      title={t('title')}
      description={t('description')}
    />
  );
};
