"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ReviewStep() {
  const { data, prevStep, nextStep } = useKYCWizard();
  const [showJSON, setShowJSON] = useState(false);

  const handleSubmit = () => {
    // Log to console for demo
    console.log('=== OPULANZ KYC SUBMISSION ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('============================');

    // In production, this would send to backend
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Review & Confirm</h2>

      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white border border-brand-grayLight rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-dark mb-4">Application Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-brand-grayLight">
              <span className="text-sm font-semibold text-brand-dark">Client Type:</span>
              <span className="text-sm text-brand-grayMed">
                {data.clientType === 'PP' ? 'Individual' : 'Company'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-brand-grayLight">
              <span className="text-sm font-semibold text-brand-dark">Email:</span>
              <span className="text-sm text-brand-grayMed">
                {(data as any).basicContact?.email || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-brand-grayLight">
              <span className="text-sm font-semibold text-brand-dark">Mobile:</span>
              <span className="text-sm text-brand-grayMed">
                {(data as any).basicContact?.mobile || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-sm font-semibold text-brand-dark">Preferred Language:</span>
              <span className="text-sm text-brand-grayMed">
                {data.preferredLanguage === 'fr' ? 'Français' : 'English'}
              </span>
            </div>
          </div>

          {data.clientType === 'PP' && (data as any).holders?.holder1 && (
            <div className="mt-6 pt-6 border-t border-brand-grayLight">
              <h4 className="font-semibold text-brand-dark mb-3">Primary Holder</h4>
              <div className="space-y-2">
                <p className="text-sm text-brand-grayMed">
                  <strong>Name:</strong> {(data as any).holders.holder1.title} {(data as any).holders.holder1.firstName} {(data as any).holders.holder1.lastName}
                </p>
                <p className="text-sm text-brand-grayMed">
                  <strong>Date of Birth:</strong> {(data as any).holders.holder1.dateOfBirth || 'N/A'}
                </p>
                <p className="text-sm text-brand-grayMed">
                  <strong>Nationality:</strong> {(data as any).holders.holder1.nationality || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation */}
        <div className="bg-brand-goldLight/10 border border-brand-gold/30 rounded-lg p-6">
          <h4 className="font-semibold text-brand-dark mb-3">Declaration</h4>
          <p className="text-sm text-brand-grayMed mb-4">
            I hereby confirm that all information provided is true and accurate to the best of my knowledge.
            I understand that this information will be used for regulatory compliance (KYC/AML) purposes
            and to generate the required documentation for my investment account.
          </p>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
              required
            />
            <span className="text-sm text-brand-dark">
              I confirm that I have reviewed all information and agree to the terms
            </span>
          </label>
        </div>
      </div>

      <WizardNavigation
        onNext={handleSubmit}
        onPrev={prevStep}
        canGoPrev={true}
        canGoNext={true}
        nextLabel="Submit Application"
      />
    </div>
  );
}
