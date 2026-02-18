"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import { useTranslations } from 'next-intl';

export function ReviewStep() {
  const { data, prevStep, nextStep, updateData } = useKYCWizard();
  const tReview = useTranslations('investmentAdvisory.review');
  const tInd = useTranslations('investmentAdvisory.individual');
  const tComp = useTranslations('investmentAdvisory.company');
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

      updateData({
        applicationId: result.applicationId,
        envelopeId: result.envelopeId,
      });

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
      <h2 className="text-2xl font-bold text-brand-dark mb-6">{tReview('title')}</h2>
      <p className="text-brand-grayMed mb-6">{tReview('subtitle')}</p>

      <div className="space-y-6">
        {/* Complete Application Details */}
        <div className="bg-white border border-brand-grayLight rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-dark mb-4">{tReview('completeSectionTitle')}</h3>

          {/* Basic Information */}
          <div className="space-y-2">
            <DetailRow label={tReview('clientTypeLabel')} value={isIndividual ? tReview('individualType') : tReview('companyType')} />
            <DetailRow label={tReview('emailLabel')} value={(data as any).basicContact?.email || (data as any).representatives?.[0]?.email} />
            <DetailRow label={tReview('mobileLabel')} value={(data as any).basicContact?.mobile || (data as any).representatives?.[0]?.mobile} />
            <DetailRow label={tReview('preferredLanguageLabel')} value={data.preferredLanguage === 'fr' ? 'Français' : 'English'} />
          </div>

          {/* INDIVIDUAL CLIENT DETAILS */}
          {isIndividual && (data as any).holders?.holder1 && (
            <>
              <SectionHeader title={tInd('sections.identity')} />
              <div className="space-y-2">
                <DetailRow label={tReview('fullNameLabel')} value={`${(data as any).holders.holder1.title} ${(data as any).holders.holder1.firstName} ${(data as any).holders.holder1.lastName}`} />
                <DetailRow label={tInd('fields.dateOfBirth')} value={(data as any).holders.holder1.dateOfBirth} />
                <DetailRow label={tInd('fields.placeOfBirth')} value={(data as any).holders.holder1.placeOfBirth} />
                <DetailRow label={tInd('fields.nationality')} value={(data as any).holders.holder1.nationality} />
                <DetailRow label={tInd('fields.maritalStatus')} value={(data as any).holders.holder1.maritalStatus} />
              </div>

              {(data as any).holders.holder1.address && (
                <>
                  <SectionHeader title={tInd('sections.address')} />
                  <div className="space-y-2">
                    <DetailRow label={tInd('fields.addressLine1')} value={(data as any).holders.holder1.address.line1} />
                    {(data as any).holders.holder1.address.line2 && (
                      <DetailRow label={tInd('fields.addressLine2')} value={(data as any).holders.holder1.address.line2} />
                    )}
                    <DetailRow label={tInd('fields.city')} value={(data as any).holders.holder1.address.city} />
                    <DetailRow label={tInd('fields.postalCode')} value={(data as any).holders.holder1.address.postalCode} />
                    <DetailRow label={tInd('fields.country')} value={(data as any).holders.holder1.address.country} />
                  </div>
                </>
              )}

              {(data as any).holders.holder1.taxResidency && (
                <>
                  <SectionHeader title={tInd('sections.taxResidency')} />
                  <div className="space-y-2">
                    <DetailRow label={tInd('fields.taxCountry')} value={(data as any).holders.holder1.taxResidency.country} />
                    <DetailRow label={tInd('fields.taxId')} value={(data as any).holders.holder1.taxResidency.taxIdentificationNumber} />
                  </div>
                </>
              )}

              {(data as any).holders.holder1.professionalSituation && (
                <>
                  <SectionHeader title={tInd('sections.professional')} />
                  <div className="space-y-2">
                    <DetailRow label={tReview('statusLabel')} value={(data as any).holders.holder1.professionalSituation.status} />
                    <DetailRow label={tReview('employerLabel')} value={(data as any).holders.holder1.professionalSituation.employerName} />
                    <DetailRow label={tReview('positionLabel')} value={(data as any).holders.holder1.professionalSituation.position} />
                    <DetailRow label={tInd('fields.sector')} value={(data as any).holders.holder1.professionalSituation.sector} />
                  </div>
                </>
              )}

              {(data as any).family && (
                <>
                  <SectionHeader title={tInd('sections.family')} />
                  <div className="space-y-2">
                    <DetailRow label={tInd('fields.numberOfDependents')} value={(data as any).family.numberOfDependents?.toString()} />
                  </div>
                </>
              )}

              {(data as any).financialSituation && (
                <>
                  <SectionHeader title={tInd('sections.financial')} />
                  <div className="space-y-2">
                    <DetailRow label={tInd('fields.annualIncome')} value={(data as any).financialSituation.annualIncome ? `€${parseFloat((data as any).financialSituation.annualIncome).toLocaleString()}` : undefined} />
                    <DetailRow label={tInd('fields.incomeSource')} value={(data as any).financialSituation.incomeSource} />
                    <DetailRow label={tInd('fields.totalAssets')} value={(data as any).financialSituation.totalAssets ? `€${parseFloat((data as any).financialSituation.totalAssets).toLocaleString()}` : undefined} />
                    <DetailRow label={tInd('fields.liquidAssets')} value={(data as any).financialSituation.liquidAssets ? `€${parseFloat((data as any).financialSituation.liquidAssets).toLocaleString()}` : undefined} />
                    <DetailRow label={tInd('fields.realEstateValue')} value={(data as any).financialSituation.realEstateValue ? `€${parseFloat((data as any).financialSituation.realEstateValue).toLocaleString()}` : undefined} />
                    <DetailRow label={tInd('fields.outstandingDebts')} value={(data as any).financialSituation.outstandingDebts ? `€${parseFloat((data as any).financialSituation.outstandingDebts).toLocaleString()}` : undefined} />
                  </div>
                </>
              )}

              {(data as any).originOfFunds && (
                <>
                  <SectionHeader title={tInd('sections.origin')} />
                  <div className="space-y-2">
                    <DetailRow label={tInd('fields.originOfFunds')} value={(data as any).originOfFunds.primary} />
                    {(data as any).originOfFunds.details && (
                      <div className="py-2">
                        <p className="text-sm font-semibold text-brand-dark mb-1">{tReview('additionalDetails')}</p>
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
              <SectionHeader title={tReview('companyIdentitySection')} />
              <div className="space-y-2">
                <DetailRow label={tComp('fields.legalName')} value={(data as any).company.legalName} />
                <DetailRow label={tComp('fields.tradingName')} value={(data as any).company.tradingName} />
                <DetailRow label={tComp('fields.legalForm')} value={(data as any).company.legalForm} />
                <DetailRow label={tComp('fields.registrationNumber')} value={(data as any).company.registrationNumber} />
                <DetailRow label={tComp('fields.registrationCountry')} value={(data as any).company.registrationCountry} />
                <DetailRow label={tComp('fields.taxIdentificationNumber')} value={(data as any).company.taxIdentificationNumber} />
                <DetailRow label={tComp('fields.dateOfIncorporation')} value={(data as any).company.dateOfIncorporation} />
                <DetailRow label={tComp('fields.industrySector')} value={(data as any).company.sector} />
                <DetailRow label={tComp('fields.numberOfEmployees')} value={(data as any).company.numberOfEmployees?.toString()} />
                <DetailRow label={tComp('fields.website')} value={(data as any).company.website} />
              </div>

              {(data as any).company.registeredAddress && (
                <>
                  <SectionHeader title={tReview('registeredAddressSection')} />
                  <div className="space-y-2">
                    <DetailRow label={tComp('fields.addressLine1')} value={(data as any).company.registeredAddress.line1} />
                    {(data as any).company.registeredAddress.line2 && (
                      <DetailRow label={tComp('fields.addressLine2')} value={(data as any).company.registeredAddress.line2} />
                    )}
                    <DetailRow label={tComp('fields.city')} value={(data as any).company.registeredAddress.city} />
                    <DetailRow label={tComp('fields.postalCode')} value={(data as any).company.registeredAddress.postalCode} />
                    <DetailRow label={tComp('fields.country')} value={(data as any).company.registeredAddress.country} />
                  </div>
                </>
              )}

              {(data as any).representatives?.[0] && (
                <>
                  <SectionHeader title={tReview('legalRepresentativeSection')} />
                  <div className="space-y-2">
                    <DetailRow label={tReview('fullNameLabel')} value={`${(data as any).representatives[0].title} ${(data as any).representatives[0].firstName} ${(data as any).representatives[0].lastName}`} />
                    <DetailRow label={tComp('fields.position')} value={(data as any).representatives[0].position} />
                    <DetailRow label={tComp('fields.dateOfBirth')} value={(data as any).representatives[0].dateOfBirth} />
                    <DetailRow label={tComp('fields.nationality')} value={(data as any).representatives[0].nationality} />
                    <DetailRow label={tReview('emailLabel')} value={(data as any).representatives[0].email} />
                    <DetailRow label={tReview('mobileLabel')} value={(data as any).representatives[0].mobile} />
                  </div>
                </>
              )}

              {(data as any).beneficialOwners && (data as any).beneficialOwners.length > 0 && (
                <>
                  <SectionHeader title={tReview('uboSection')} />
                  <div className="space-y-2">
                    <DetailRow label={tReview('uboNameLabel')} value={(data as any).beneficialOwners[0].name} />
                    <DetailRow label={tReview('ownershipLabel')} value={`${(data as any).beneficialOwners[0].ownershipPercentage}%`} />
                  </div>
                </>
              )}

              {(data as any).fatcaCrs && (
                <>
                  <SectionHeader title={tReview('fatcaCrsSection')} />
                  <div className="space-y-2">
                    <DetailRow label={tReview('usPersonLabel')} value={(data as any).fatcaCrs.usPerson ? tReview('yesLabel') : tReview('noLabel')} />
                    <DetailRow label={tReview('taxResidentCountriesLabel')} value={(data as any).fatcaCrs.taxResidentCountries?.join(', ')} />
                  </div>
                </>
              )}

              {(data as any).financialSituation && (
                <>
                  <SectionHeader title={tReview('financialInfoSection')} />
                  <div className="space-y-2">
                    <DetailRow label={tReview('annualRevenueLabel')} value={(data as any).financialSituation.annualRevenue ? `€${parseFloat((data as any).financialSituation.annualRevenue).toLocaleString()}` : undefined} />
                    <DetailRow label={tComp('fields.totalAssets')} value={(data as any).financialSituation.totalAssets ? `€${parseFloat((data as any).financialSituation.totalAssets).toLocaleString()}` : undefined} />
                    <DetailRow label={tReview('sourceOfRevenueLabel')} value={(data as any).financialSituation.sourceOfRevenue} />
                  </div>
                </>
              )}

              {(data as any).originOfFunds && (
                <>
                  <SectionHeader title={tInd('sections.origin')} />
                  <div className="space-y-2">
                    <DetailRow label={tInd('fields.originOfFunds')} value={(data as any).originOfFunds.primary} />
                    {(data as any).originOfFunds.details && (
                      <div className="py-2">
                        <p className="text-sm font-semibold text-brand-dark mb-1">{tReview('additionalDetails')}</p>
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
              <SectionHeader title={tReview('investmentProfileSection')} />
              <div className="space-y-2">
                <DetailRow label={tReview('investmentExperienceLabel')} value={(data as any).investmentProfile.experience} />
                <DetailRow label={tReview('riskToleranceLabel')} value={(data as any).investmentProfile.riskTolerance} />
                <DetailRow label={tReview('investmentHorizonLabel')} value={(data as any).investmentProfile.investmentHorizon} />
                <DetailRow label={tReview('investmentObjectiveLabel')} value={(data as any).investmentProfile.objective} />
                <DetailRow label={tReview('expectedReturnLabel')} value={(data as any).investmentProfile.expectedReturn ? `${(data as any).investmentProfile.expectedReturn}%` : undefined} />
                <DetailRow label={tReview('maxLossLabel')} value={(data as any).investmentProfile.maxLossAcceptable ? `${(data as any).investmentProfile.maxLossAcceptable}%` : undefined} />
              </div>
            </>
          )}

          {/* SERVICE INFORMATION */}
          {(data as any).missionType && (
            <>
              <SectionHeader title={tReview('serviceDetailsSection')} />
              <div className="space-y-2">
                <DetailRow label={tReview('serviceTypeLabel')} value={(data as any).missionType === 'advisory' ? tInd('options.missionType.advisory') : tInd('options.missionType.management')} />
                <DetailRow label={tReview('initialInvestmentLabel')} value={(data as any).initialInvestment ? `€${parseFloat((data as any).initialInvestment).toLocaleString()}` : undefined} />
              </div>
            </>
          )}

          {/* CONSENTS */}
          {(data as any).consents && (
            <>
              <SectionHeader title={tReview('consentsSection')} />
              <div className="space-y-2">
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ {tReview('dataProcessingConsentLabel')}: {(data as any).consents.dataProcessing ? tReview('grantedLabel') : tReview('notGrantedLabel')}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ {tReview('kycComplianceLabel')}: {(data as any).consents.kyc ? tReview('grantedLabel') : tReview('notGrantedLabel')}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ {tReview('electronicSignatureLabel')}: {(data as any).consents.electronic ? tReview('grantedLabel') : tReview('notGrantedLabel')}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-sm text-brand-grayMed">
                    ✓ {tReview('marketingLabel')}: {(data as any).consents.marketing ? tReview('grantedLabel') : tReview('notGrantedLabel')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Confirmation */}
        <div className="bg-brand-goldLight/10 border border-brand-gold/30 rounded-lg p-6">
          <h4 className="font-semibold text-brand-dark mb-3">{tReview('declaration.title')}</h4>
          <p className="text-sm text-brand-grayMed mb-4">
            {tReview('declaration.text')}
          </p>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
              required
            />
            <span className="text-sm text-brand-dark">
              {tReview('declaration.checkbox')}
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
                <h4 className="text-sm font-semibold text-red-800 mb-1">{tReview('errorTitle')}</h4>
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
                <h4 className="text-sm font-semibold text-blue-800">{tReview('submittingTitle')}</h4>
                <p className="text-sm text-blue-700">{tReview('submittingDescription')}</p>
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
        nextLabel={isSubmitting ? tReview('submitting') : tReview('submit')}
      />
    </div>
  );
}
