"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';

export function ReviewStep() {
  const { data, prevStep, nextStep, updateData } = useKYCWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('=== OPULANZ KYC SUBMISSION ===');
      console.log('Sending data to backend:', JSON.stringify(data, null, 2));

      const response = await fetch('http://localhost:5000/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      console.log('✅ Application submitted successfully:', result);

      // Store the application ID and envelope ID for the success page
      updateData({
        applicationId: result.applicationId,
        envelopeId: result.envelopeId,
      });

      // Move to success step
      nextStep();
    } catch (err) {
      console.error('❌ Submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIndividual = data.clientType === 'PP';
  const isCompany = data.clientType === 'PM';

  const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2 border-b border-brand-grayLight">
        <span className="text-sm font-semibold text-brand-dark">{label}:</span>
        <span className="text-sm text-brand-grayMed">{value}</span>
      </div>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mt-6 pt-6 border-t border-brand-grayLight first:mt-0 first:pt-0 first:border-t-0">
      <h4 className="font-semibold text-brand-dark mb-3 text-lg">{title}</h4>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Review & Confirm</h2>
      <p className="text-brand-grayMed mb-6">Please review all information carefully before submitting.</p>

      <div className="space-y-6">
        {/* Complete Application Details */}
        <div className="bg-white border border-brand-grayLight rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-dark mb-4">Complete Application Details</h3>

          {/* Basic Information */}
          <div className="space-y-2">
            <DetailRow label="Client Type" value={isIndividual ? 'Individual' : 'Company'} />
            <DetailRow label="Email" value={(data as any).basicContact?.email || (data as any).representatives?.[0]?.email} />
            <DetailRow label="Mobile" value={(data as any).basicContact?.mobile || (data as any).representatives?.[0]?.mobile} />
            <DetailRow label="Preferred Language" value={data.preferredLanguage === 'fr' ? 'Français' : 'English'} />
          </div>

          {/* INDIVIDUAL CLIENT DETAILS */}
          {isIndividual && (data as any).holders?.holder1 && (
            <>
              <SectionHeader title="Personal Identity" />
              <div className="space-y-2">
                <DetailRow label="Full Name" value={`${(data as any).holders.holder1.title} ${(data as any).holders.holder1.firstName} ${(data as any).holders.holder1.lastName}`} />
                <DetailRow label="Date of Birth" value={(data as any).holders.holder1.dateOfBirth} />
                <DetailRow label="Place of Birth" value={(data as any).holders.holder1.placeOfBirth} />
                <DetailRow label="Nationality" value={(data as any).holders.holder1.nationality} />
                <DetailRow label="Marital Status" value={(data as any).holders.holder1.maritalStatus} />
              </div>

              {(data as any).holders.holder1.address && (
                <>
                  <SectionHeader title="Residential Address" />
                  <div className="space-y-2">
                    <DetailRow label="Address Line 1" value={(data as any).holders.holder1.address.line1} />
                    {(data as any).holders.holder1.address.line2 && (
                      <DetailRow label="Address Line 2" value={(data as any).holders.holder1.address.line2} />
                    )}
                    <DetailRow label="City" value={(data as any).holders.holder1.address.city} />
                    <DetailRow label="Postal Code" value={(data as any).holders.holder1.address.postalCode} />
                    <DetailRow label="Country" value={(data as any).holders.holder1.address.country} />
                  </div>
                </>
              )}

              {(data as any).holders.holder1.taxResidency && (
                <>
                  <SectionHeader title="Tax Residency" />
                  <div className="space-y-2">
                    <DetailRow label="Tax Residence Country" value={(data as any).holders.holder1.taxResidency.country} />
                    <DetailRow label="Tax ID Number" value={(data as any).holders.holder1.taxResidency.taxIdentificationNumber} />
                  </div>
                </>
              )}

              {(data as any).holders.holder1.professionalSituation && (
                <>
                  <SectionHeader title="Professional Situation" />
                  <div className="space-y-2">
                    <DetailRow label="Status" value={(data as any).holders.holder1.professionalSituation.status} />
                    <DetailRow label="Employer" value={(data as any).holders.holder1.professionalSituation.employerName} />
                    <DetailRow label="Position" value={(data as any).holders.holder1.professionalSituation.position} />
                    <DetailRow label="Sector" value={(data as any).holders.holder1.professionalSituation.sector} />
                  </div>
                </>
              )}

              {(data as any).family && (
                <>
                  <SectionHeader title="Family Situation" />
                  <div className="space-y-2">
                    <DetailRow label="Number of Dependents" value={(data as any).family.numberOfDependents?.toString()} />
                  </div>
                </>
              )}

              {(data as any).financialSituation && (
                <>
                  <SectionHeader title="Financial Situation" />
                  <div className="space-y-2">
                    <DetailRow label="Annual Income" value={(data as any).financialSituation.annualIncome ? `€${parseFloat((data as any).financialSituation.annualIncome).toLocaleString()}` : undefined} />
                    <DetailRow label="Income Source" value={(data as any).financialSituation.incomeSource} />
                    <DetailRow label="Total Assets" value={(data as any).financialSituation.totalAssets ? `€${parseFloat((data as any).financialSituation.totalAssets).toLocaleString()}` : undefined} />
                    <DetailRow label="Liquid Assets" value={(data as any).financialSituation.liquidAssets ? `€${parseFloat((data as any).financialSituation.liquidAssets).toLocaleString()}` : undefined} />
                    <DetailRow label="Real Estate Value" value={(data as any).financialSituation.realEstateValue ? `€${parseFloat((data as any).financialSituation.realEstateValue).toLocaleString()}` : undefined} />
                    <DetailRow label="Outstanding Debts" value={(data as any).financialSituation.outstandingDebts ? `€${parseFloat((data as any).financialSituation.outstandingDebts).toLocaleString()}` : undefined} />
                  </div>
                </>
              )}

              {(data as any).originOfFunds && (
                <>
                  <SectionHeader title="Origin of Funds" />
                  <div className="space-y-2">
                    <DetailRow label="Primary Origin" value={(data as any).originOfFunds.primary} />
                    {(data as any).originOfFunds.details && (
                      <div className="py-2">
                        <p className="text-sm font-semibold text-brand-dark mb-1">Additional Details:</p>
                        <p className="text-sm text-brand-grayMed">{(data as any).originOfFunds.details}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* COMPANY CLIENT DETAILS */}
          {isCompany && (data as any).company && (
            <>
              <SectionHeader title="Company Identity" />
              <div className="space-y-2">
                <DetailRow label="Legal Name" value={(data as any).company.legalName} />
                <DetailRow label="Trading Name" value={(data as any).company.tradingName} />
                <DetailRow label="Legal Form" value={(data as any).company.legalForm} />
                <DetailRow label="Registration Number" value={(data as any).company.registrationNumber} />
                <DetailRow label="Registration Country" value={(data as any).company.registrationCountry} />
                <DetailRow label="Tax ID Number" value={(data as any).company.taxIdentificationNumber} />
                <DetailRow label="Date of Incorporation" value={(data as any).company.dateOfIncorporation} />
                <DetailRow label="Sector" value={(data as any).company.sector} />
                <DetailRow label="Number of Employees" value={(data as any).company.numberOfEmployees?.toString()} />
                <DetailRow label="Website" value={(data as any).company.website} />
              </div>

              {(data as any).company.registeredAddress && (
                <>
                  <SectionHeader title="Registered Address" />
                  <div className="space-y-2">
                    <DetailRow label="Address Line 1" value={(data as any).company.registeredAddress.line1} />
                    {(data as any).company.registeredAddress.line2 && (
                      <DetailRow label="Address Line 2" value={(data as any).company.registeredAddress.line2} />
                    )}
                    <DetailRow label="City" value={(data as any).company.registeredAddress.city} />
                    <DetailRow label="Postal Code" value={(data as any).company.registeredAddress.postalCode} />
                    <DetailRow label="Country" value={(data as any).company.registeredAddress.country} />
                  </div>
                </>
              )}

              {(data as any).representatives?.[0] && (
                <>
                  <SectionHeader title="Legal Representative" />
                  <div className="space-y-2">
                    <DetailRow label="Full Name" value={`${(data as any).representatives[0].title} ${(data as any).representatives[0].firstName} ${(data as any).representatives[0].lastName}`} />
                    <DetailRow label="Position" value={(data as any).representatives[0].position} />
                    <DetailRow label="Date of Birth" value={(data as any).representatives[0].dateOfBirth} />
                    <DetailRow label="Nationality" value={(data as any).representatives[0].nationality} />
                    <DetailRow label="Email" value={(data as any).representatives[0].email} />
                    <DetailRow label="Mobile" value={(data as any).representatives[0].mobile} />
                  </div>
                </>
              )}

              {(data as any).beneficialOwners && (data as any).beneficialOwners.length > 0 && (
                <>
                  <SectionHeader title="Ultimate Beneficial Owner (UBO)" />
                  <div className="space-y-2">
                    <DetailRow label="UBO Name" value={(data as any).beneficialOwners[0].name} />
                    <DetailRow label="Ownership %" value={`${(data as any).beneficialOwners[0].ownershipPercentage}%`} />
                  </div>
                </>
              )}

              {(data as any).fatcaCrs && (
                <>
                  <SectionHeader title="FATCA & CRS" />
                  <div className="space-y-2">
                    <DetailRow label="US Person" value={(data as any).fatcaCrs.usPerson ? 'Yes' : 'No'} />
                    <DetailRow label="Tax Resident Countries" value={(data as any).fatcaCrs.taxResidentCountries?.join(', ')} />
                  </div>
                </>
              )}

              {(data as any).financialSituation && (
                <>
                  <SectionHeader title="Financial Information" />
                  <div className="space-y-2">
                    <DetailRow label="Annual Revenue" value={(data as any).financialSituation.annualRevenue ? `€${parseFloat((data as any).financialSituation.annualRevenue).toLocaleString()}` : undefined} />
                    <DetailRow label="Total Assets" value={(data as any).financialSituation.totalAssets ? `€${parseFloat((data as any).financialSituation.totalAssets).toLocaleString()}` : undefined} />
                    <DetailRow label="Source of Revenue" value={(data as any).financialSituation.sourceOfRevenue} />
                  </div>
                </>
              )}

              {(data as any).originOfFunds && (
                <>
                  <SectionHeader title="Origin of Funds" />
                  <div className="space-y-2">
                    <DetailRow label="Primary Origin" value={(data as any).originOfFunds.primary} />
                    {(data as any).originOfFunds.details && (
                      <div className="py-2">
                        <p className="text-sm font-semibold text-brand-dark mb-1">Additional Details:</p>
                        <p className="text-sm text-brand-grayMed">{(data as any).originOfFunds.details}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* INVESTMENT PROFILE (Both PP and PM) */}
          {(data as any).investmentProfile && (
            <>
              <SectionHeader title="Investment Profile" />
              <div className="space-y-2">
                <DetailRow label="Investment Experience" value={(data as any).investmentProfile.experience} />
                <DetailRow label="Risk Tolerance" value={(data as any).investmentProfile.riskTolerance} />
                <DetailRow label="Investment Horizon" value={(data as any).investmentProfile.investmentHorizon} />
                <DetailRow label="Investment Objective" value={(data as any).investmentProfile.objective} />
                <DetailRow label="Expected Annual Return" value={(data as any).investmentProfile.expectedReturn ? `${(data as any).investmentProfile.expectedReturn}%` : undefined} />
                <DetailRow label="Max Acceptable Loss" value={(data as any).investmentProfile.maxLossAcceptable ? `${(data as any).investmentProfile.maxLossAcceptable}%` : undefined} />
              </div>
            </>
          )}

          {/* SERVICE INFORMATION */}
          {(data as any).missionType && (
            <>
              <SectionHeader title="Service Details" />
              <div className="space-y-2">
                <DetailRow label="Service Type" value={(data as any).missionType === 'advisory' ? 'Investment Advisory (Conseil)' : 'Portfolio Management (Gestion sous mandat)'} />
                <DetailRow label="Initial Investment" value={(data as any).initialInvestment ? `€${parseFloat((data as any).initialInvestment).toLocaleString()}` : undefined} />
              </div>
            </>
          )}

          {/* CONSENTS */}
          {(data as any).consents && (
            <>
              <SectionHeader title="Consents & Authorizations" />
              <div className="space-y-2">
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ Data Processing Consent: {(data as any).consents.dataProcessing ? 'Granted' : 'Not granted'}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ KYC/AML Compliance: {(data as any).consents.kyc ? 'Granted' : 'Not granted'}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ Electronic Signature: {(data as any).consents.electronic ? 'Granted' : 'Not granted'}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ Marketing Communications: {(data as any).consents.marketing ? 'Granted' : 'Not granted'}
                  </p>
                </div>
              </div>
            </>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">Submission Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Message */}
        {isSubmitting && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-800">Submitting Application...</h4>
                <p className="text-sm text-blue-700">Generating documents and preparing signature request</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <WizardNavigation
        onNext={handleSubmit}
        onPrev={prevStep}
        canGoPrev={!isSubmitting}
        canGoNext={!isSubmitting}
        nextLabel={isSubmitting ? "Submitting..." : "Submit Application"}
      />
    </div>
  );
}
