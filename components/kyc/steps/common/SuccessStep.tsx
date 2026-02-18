"use client";

import React from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function SuccessStep() {
  const { data, resetWizard } = useKYCWizard();
  const t = useTranslations('investmentAdvisory.success');
  const applicationId = (data as any).applicationId;
  const envelopeId = (data as any).envelopeId;

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-brand-dark mb-4">{t('title')}</h2>
        <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="bg-brand-goldLight/10 border border-brand-gold/30 rounded-xl p-8 max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold text-brand-dark mb-4">{t('nextSteps.title')}</h3>
        <ul className="space-y-3 text-left">
          {([1, 2, 3, 4] as const).map((n) => (
            <li key={n} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                {n}
              </div>
              <div>
                <p className="text-sm text-brand-dark font-semibold">{t(`nextSteps.step${n}.title`)}</p>
                <p className="text-sm text-brand-grayMed">{t(`nextSteps.step${n}.description`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-brand-grayLight rounded-xl p-6 max-w-2xl mx-auto mb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-brand-gold" />
            <div className="text-center">
              <p className="text-sm font-semibold text-brand-dark">{t('reference.title')}</p>
              <p className="text-xs text-brand-grayMed font-mono">
                {applicationId ? `APP-${applicationId}` : t('reference.processing')}
              </p>
            </div>
          </div>
          {envelopeId && (
            <div className="pt-4 border-t border-brand-grayLight">
              <p className="text-xs text-brand-grayMed mb-1">{t('reference.envelopeId')}</p>
              <p className="text-xs text-brand-dark font-mono break-all">{envelopeId}</p>
              <p className="text-xs text-brand-grayMed mt-2">
                {t('reference.checkEmail')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-brand-gold hover:bg-brand-goldDark"
        >
          {t('actions.home')}
        </Button>
        <Button
          onClick={resetWizard}
          variant="outline"
        >
          {t('actions.new')}
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-brand-grayLight">
        <p className="text-sm text-brand-grayMed">
          {t('contactSupport').split('support@opulanz.com')[0]}
          <a href="mailto:support@opulanz.com" className="text-brand-gold hover:underline">support@opulanz.com</a>
        </p>
      </div>
    </div>
  );
}
