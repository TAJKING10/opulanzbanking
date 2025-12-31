"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';

export function PPFamilyStep() {
  const { updateData, nextStep, prevStep } = useKYCWizard();
  const [maritalStatus, setMaritalStatus] = useState('single');

  const handleSubmit = () => {
    updateData({
      familySituation: {
        maritalStatus,
        marriageContractOrPACSConventionExists: false,
        priorDonations: {
          donationsBetweenSpouses: [],
          donationsToChildrenOrGrandchildren: []
        },
        children: []
      }
    } as any);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Family & Civil Status</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-3">
            Marital Status <span className="text-red-500">*</span>
          </label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="pacs">PACS</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="cohabitation">Cohabitation</option>
          </select>
        </div>

        <div className="bg-brand-grayLight/30 p-4 rounded-lg">
          <p className="text-sm text-brand-grayMed">
            Additional family information fields (children, donations, etc.) would be collected here.
            This is a template implementation - full fields to be added.
          </p>
        </div>
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
