"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { User, Building2 } from 'lucide-react';
import type { ClientType, Language } from '@/types/kyc';

export function ClientTypeStep() {
  const t = useTranslations('investmentAdvisory.clientType');
  const tContact = useTranslations('investmentAdvisory.clientType.contact');
  const tCommon = useTranslations('common');
  const { setClientType, updateData, nextStep } = useKYCWizard();
  const [selectedType, setSelectedType] = useState<ClientType | null>(null);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [language, setLanguage] = useState<Language>('fr');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !email || !mobile) return;

    setClientType(selectedType);
    updateData({
      preferredLanguage: language,
      basicContact: { email, mobile }
    } as any);
    nextStep();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-2">{t('welcome')}</h2>
        <p className="text-brand-grayMed">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-3">
            {t('question')}
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedType('PP')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedType === 'PP'
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-brand-grayLight hover:border-brand-gold/50'
              }`}
            >
              <User className="w-12 h-12 mx-auto mb-3 text-brand-gold" />
              <h3 className="font-semibold text-brand-dark mb-1">{t('individual.title')}</h3>
              <p className="text-sm text-brand-grayMed">{t('individual.description')}</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('PM')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedType === 'PM'
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-brand-grayLight hover:border-brand-gold/50'
              }`}
            >
              <Building2 className="w-12 h-12 mx-auto mb-3 text-brand-gold" />
              <h3 className="font-semibold text-brand-dark mb-1">{t('company.title')}</h3>
              <p className="text-sm text-brand-grayMed">{t('company.description')}</p>
            </button>
          </div>
        </div>

        {/* Basic Contact Info */}
        {selectedType && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                {tContact('email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder={tContact('emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                {tContact('mobile')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder={tContact('mobilePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                {tContact('language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!selectedType || !email || !mobile}
            className="px-8 py-3 bg-brand-gold text-white font-semibold rounded-lg hover:bg-brand-goldDark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {tCommon('continue')}
          </button>
        </div>
      </form>
    </div>
  );
}
