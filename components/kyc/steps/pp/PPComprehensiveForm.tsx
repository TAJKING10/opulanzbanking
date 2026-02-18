"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PPComprehensiveForm() {
  const { data, updateData, nextStep, prevStep } = useKYCWizard();
  const tInd = useTranslations('investmentAdvisory.individual');

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    family: true,
    financial: true,
    origin: true,
    patrimony: true,
    investment: true,
    mission: true,
    consents: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Form state
  const [formData, setFormData] = useState({
    // Identity
    title: (data as any)?.holders?.holder1?.title || 'Mr.',
    firstName: (data as any)?.holders?.holder1?.firstName || '',
    lastName: (data as any)?.holders?.holder1?.lastName || '',
    dateOfBirth: (data as any)?.holders?.holder1?.dateOfBirth || '',
    placeOfBirth: (data as any)?.holders?.holder1?.placeOfBirth || '',
    nationality: (data as any)?.holders?.holder1?.nationality || '',
    maritalStatus: (data as any)?.holders?.holder1?.maritalStatus || 'single',

    // Address
    addressLine1: (data as any)?.holders?.holder1?.address?.line1 || '',
    addressLine2: (data as any)?.holders?.holder1?.address?.line2 || '',
    city: (data as any)?.holders?.holder1?.address?.city || '',
    postalCode: (data as any)?.holders?.holder1?.address?.postalCode || '',
    country: (data as any)?.holders?.holder1?.address?.country || '',

    // Tax Residency
    taxCountry: (data as any)?.holders?.holder1?.taxResidency?.country || '',
    taxIdentificationNumber: (data as any)?.holders?.holder1?.taxResidency?.taxIdentificationNumber || '',

    // Professional Situation
    professionalStatus: (data as any)?.holders?.holder1?.professionalSituation?.status || '',
    employerName: (data as any)?.holders?.holder1?.professionalSituation?.employerName || '',
    position: (data as any)?.holders?.holder1?.professionalSituation?.position || '',
    sector: (data as any)?.holders?.holder1?.professionalSituation?.sector || '',

    // Joint Holder
    hasJointHolder: (data as any)?.holders?.holder2 ? true : false,

    // Family Information
    numberOfDependents: (data as any)?.family?.numberOfDependents || 0,

    // Financial Situation
    annualIncome: (data as any)?.financialSituation?.annualIncome || '',
    incomeSource: (data as any)?.financialSituation?.incomeSource || '',
    totalAssets: (data as any)?.financialSituation?.totalAssets || '',
    liquidAssets: (data as any)?.financialSituation?.liquidAssets || '',
    realEstateValue: (data as any)?.financialSituation?.realEstateValue || '',
    outstandingDebts: (data as any)?.financialSituation?.outstandingDebts || '',

    // Origin of Funds
    originOfFunds: (data as any)?.originOfFunds?.primary || '',
    originDetails: (data as any)?.originOfFunds?.details || '',

    // Investment Knowledge
    investmentExperience: (data as any)?.investmentProfile?.experience || 'beginner',
    knownProducts: (data as any)?.investmentProfile?.knownProducts || [],

    // Investment Objectives
    investmentHorizon: (data as any)?.investmentProfile?.investmentHorizon || '',
    investmentObjective: (data as any)?.investmentProfile?.objective || '',
    expectedReturn: (data as any)?.investmentProfile?.expectedReturn || '',

    // Risk Profile
    riskTolerance: (data as any)?.investmentProfile?.riskTolerance || 'moderate',
    maxLossAcceptable: (data as any)?.investmentProfile?.maxLossAcceptable || '',

    // Mission Type
    missionType: (data as any)?.missionType || 'advisory',
    initialInvestment: (data as any)?.initialInvestment || '',

    // Consents
    consentDataProcessing: false,
    consentKYC: false,
    consentElectronic: false,
    consentMarketing: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const structuredData = {
      holders: {
        holder1: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          placeOfBirth: formData.placeOfBirth,
          nationality: formData.nationality,
          maritalStatus: formData.maritalStatus,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          taxResidency: {
            country: formData.taxCountry,
            taxIdentificationNumber: formData.taxIdentificationNumber,
          },
          professionalSituation: {
            status: formData.professionalStatus,
            employerName: formData.employerName,
            position: formData.position,
            sector: formData.sector,
          },
        },
      },
      family: {
        numberOfDependents: formData.numberOfDependents,
      },
      financialSituation: {
        annualIncome: formData.annualIncome,
        incomeSource: formData.incomeSource,
        totalAssets: formData.totalAssets,
        liquidAssets: formData.liquidAssets,
        realEstateValue: formData.realEstateValue,
        outstandingDebts: formData.outstandingDebts,
      },
      originOfFunds: {
        primary: formData.originOfFunds,
        details: formData.originDetails,
      },
      investmentProfile: {
        experience: formData.investmentExperience,
        knownProducts: formData.knownProducts,
        investmentHorizon: formData.investmentHorizon,
        objective: formData.investmentObjective,
        expectedReturn: formData.expectedReturn,
        riskTolerance: formData.riskTolerance,
        maxLossAcceptable: formData.maxLossAcceptable,
      },
      missionType: formData.missionType,
      initialInvestment: formData.initialInvestment,
      consents: {
        dataProcessing: formData.consentDataProcessing,
        kyc: formData.consentKYC,
        electronic: formData.consentElectronic,
        marketing: formData.consentMarketing,
      },
    };

    updateData(structuredData as any);
    nextStep();
  };

  const SectionHeader = ({ title, section }: { title: string; section: keyof typeof expandedSections }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-brand-gold/10 rounded-lg mb-4 hover:bg-brand-gold/20 transition-colors"
    >
      <h3 className="text-lg font-semibold text-brand-dark">{title}</h3>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-6">{tInd('title')}</h2>
      <p className="text-brand-grayMed mb-8">{tInd('subtitle')}</p>

      <form className="space-y-6">
        {/* IDENTITY SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.identity')} section="identity" />
          {expandedSections.identity && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.title')} *</label>
                  <select
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="Mr.">{tInd('options.titles.mr')}</option>
                    <option value="Mrs.">{tInd('options.titles.mrs')}</option>
                    <option value="Ms.">{tInd('options.titles.ms')}</option>
                    <option value="Dr.">{tInd('options.titles.dr')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.firstName')} *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.lastName')} *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.dateOfBirth')} *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.placeOfBirth')} *</label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder={tInd('helpers.placeOfBirthHint')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.nationality')} *</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.maritalStatus')} *</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="single">{tInd('options.maritalStatus.single')}</option>
                    <option value="married">{tInd('options.maritalStatus.married')}</option>
                    <option value="divorced">{tInd('options.maritalStatus.divorced')}</option>
                    <option value="widowed">{tInd('options.maritalStatus.widowed')}</option>
                    <option value="civil_partnership">{tInd('options.maritalStatus.civilPartnership')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">{tInd('sections.address')}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.addressLine1')} *</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.addressLine2')}</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => handleChange('addressLine2', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.city')} *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.postalCode')} *</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.country')} *</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">{tInd('sections.taxResidency')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.taxCountry')} *</label>
                    <input
                      type="text"
                      value={formData.taxCountry}
                      onChange={(e) => handleChange('taxCountry', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.taxId')} *</label>
                    <input
                      type="text"
                      value={formData.taxIdentificationNumber}
                      onChange={(e) => handleChange('taxIdentificationNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">{tInd('sections.professional')}</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.professionalStatus')} *</label>
                      <select
                        value={formData.professionalStatus}
                        onChange={(e) => handleChange('professionalStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      >
                        <option value="">{tInd('options.professionalStatus.select')}</option>
                        <option value="employed">{tInd('options.professionalStatus.employed')}</option>
                        <option value="self-employed">{tInd('options.professionalStatus.selfEmployed')}</option>
                        <option value="retired">{tInd('options.professionalStatus.retired')}</option>
                        <option value="unemployed">{tInd('options.professionalStatus.unemployed')}</option>
                        <option value="student">{tInd('options.professionalStatus.student')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.sector')}</label>
                      <input
                        type="text"
                        value={formData.sector}
                        onChange={(e) => handleChange('sector', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        placeholder={tInd('helpers.sectorHint')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.employerName')}</label>
                      <input
                        type="text"
                        value={formData.employerName}
                        onChange={(e) => handleChange('employerName', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.position')}</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAMILY SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.family')} section="family" />
          {expandedSections.family && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.numberOfDependents')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.numberOfDependents}
                  onChange={(e) => handleChange('numberOfDependents', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                />
              </div>
            </div>
          )}
        </div>

        {/* FINANCIAL SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.financial')} section="financial" />
          {expandedSections.financial && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.annualIncome')} *</label>
                  <input
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleChange('annualIncome', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="e.g., 75000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.incomeSource')} *</label>
                  <select
                    value={formData.incomeSource}
                    onChange={(e) => handleChange('incomeSource', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="">{tInd('options.incomeSource.select')}</option>
                    <option value="salary">{tInd('options.incomeSource.salary')}</option>
                    <option value="business">{tInd('options.incomeSource.business')}</option>
                    <option value="investments">{tInd('options.incomeSource.investments')}</option>
                    <option value="pension">{tInd('options.incomeSource.pension')}</option>
                    <option value="inheritance">{tInd('options.incomeSource.inheritance')}</option>
                    <option value="other">{tInd('options.incomeSource.other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.totalAssets')}</label>
                  <input
                    type="number"
                    value={formData.totalAssets}
                    onChange={(e) => handleChange('totalAssets', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="e.g., 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.liquidAssets')}</label>
                  <input
                    type="number"
                    value={formData.liquidAssets}
                    onChange={(e) => handleChange('liquidAssets', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="Cash, savings, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.realEstateValue')}</label>
                  <input
                    type="number"
                    value={formData.realEstateValue}
                    onChange={(e) => handleChange('realEstateValue', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.outstandingDebts')}</label>
                  <input
                    type="number"
                    value={formData.outstandingDebts}
                    onChange={(e) => handleChange('outstandingDebts', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="Mortgages, loans, etc."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ORIGIN OF FUNDS SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.origin')} section="origin" />
          {expandedSections.origin && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.originOfFunds')} *</label>
                <select
                  value={formData.originOfFunds}
                  onChange={(e) => handleChange('originOfFunds', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="">{tInd('options.originOfFunds.select')}</option>
                  <option value="savings">{tInd('options.originOfFunds.savings')}</option>
                  <option value="sale_of_assets">{tInd('options.originOfFunds.saleOfAssets')}</option>
                  <option value="inheritance">{tInd('options.originOfFunds.inheritance')}</option>
                  <option value="business_income">{tInd('options.originOfFunds.businessIncome')}</option>
                  <option value="investment_returns">{tInd('options.originOfFunds.investmentReturns')}</option>
                  <option value="other">{tInd('options.originOfFunds.other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.originDetails')}</label>
                <textarea
                  value={formData.originDetails}
                  onChange={(e) => handleChange('originDetails', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  rows={3}
                  placeholder={tInd('helpers.originDetailsHint')}
                />
              </div>
            </div>
          )}
        </div>

        {/* INVESTMENT PROFILE SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.investment')} section="investment" />
          {expandedSections.investment && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-brand-dark mb-3">{tInd('sections.investmentKnowledge')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.investmentExperience')} *</label>
                    <select
                      value={formData.investmentExperience}
                      onChange={(e) => handleChange('investmentExperience', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="beginner">{tInd('options.investmentExperience.beginner')}</option>
                      <option value="intermediate">{tInd('options.investmentExperience.intermediate')}</option>
                      <option value="advanced">{tInd('options.investmentExperience.advanced')}</option>
                      <option value="expert">{tInd('options.investmentExperience.expert')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.riskTolerance')} *</label>
                    <select
                      value={formData.riskTolerance}
                      onChange={(e) => handleChange('riskTolerance', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="conservative">{tInd('options.riskTolerance.conservative')}</option>
                      <option value="moderate">{tInd('options.riskTolerance.moderate')}</option>
                      <option value="aggressive">{tInd('options.riskTolerance.aggressive')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-brand-dark mb-3">{tInd('sections.investmentObjectives')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.investmentHorizon')} *</label>
                    <select
                      value={formData.investmentHorizon}
                      onChange={(e) => handleChange('investmentHorizon', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="">{tInd('options.investmentHorizon.select')}</option>
                      <option value="short">{tInd('options.investmentHorizon.short')}</option>
                      <option value="medium">{tInd('options.investmentHorizon.medium')}</option>
                      <option value="long">{tInd('options.investmentHorizon.long')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.investmentObjective')} *</label>
                    <select
                      value={formData.investmentObjective}
                      onChange={(e) => handleChange('investmentObjective', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="">{tInd('options.investmentObjective.select')}</option>
                      <option value="capital_preservation">{tInd('options.investmentObjective.preservation')}</option>
                      <option value="income_generation">{tInd('options.investmentObjective.income')}</option>
                      <option value="capital_growth">{tInd('options.investmentObjective.growth')}</option>
                      <option value="balanced">{tInd('options.investmentObjective.balanced')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.expectedReturn')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.expectedReturn}
                      onChange={(e) => handleChange('expectedReturn', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      placeholder="e.g., 5.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.maxLoss')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.maxLossAcceptable}
                      onChange={(e) => handleChange('maxLossAcceptable', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      placeholder="e.g., 10.0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MISSION TYPE SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.mission')} section="mission" />
          {expandedSections.mission && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.missionType')} *</label>
                <select
                  value={formData.missionType}
                  onChange={(e) => handleChange('missionType', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="advisory">{tInd('options.missionType.advisory')}</option>
                  <option value="management">{tInd('options.missionType.management')}</option>
                </select>
                <p className="text-xs text-brand-grayMed mt-2">
                  {formData.missionType === 'advisory'
                    ? tInd('helpers.advisoryDescription')
                    : tInd('helpers.managementDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{tInd('fields.initialInvestment')} *</label>
                <input
                  type="number"
                  value={formData.initialInvestment}
                  onChange={(e) => handleChange('initialInvestment', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  placeholder="e.g., 50000"
                  required
                />
                <p className="text-xs text-brand-grayMed mt-2">{tInd('helpers.minimumInvestment')}</p>
              </div>
            </div>
          )}
        </div>

        {/* CONSENTS SECTION */}
        <div>
          <SectionHeader title={tInd('sectionTitles.consents')} section="consents" />
          {expandedSections.consents && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.consentDataProcessing}
                  onChange={(e) => handleChange('consentDataProcessing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
                  required
                />
                <span className="text-sm text-brand-dark">
                  <strong>Data Processing *:</strong> {tInd('consents.dataProcessing')}
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.consentKYC}
                  onChange={(e) => handleChange('consentKYC', e.target.checked)}
                  className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
                  required
                />
                <span className="text-sm text-brand-dark">
                  <strong>KYC/AML *:</strong> {tInd('consents.kyc')}
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.consentElectronic}
                  onChange={(e) => handleChange('consentElectronic', e.target.checked)}
                  className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
                  required
                />
                <span className="text-sm text-brand-dark">
                  <strong>Electronic Signature *:</strong> {tInd('consents.electronic')}
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.consentMarketing}
                  onChange={(e) => handleChange('consentMarketing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
                />
                <span className="text-sm text-brand-dark">
                  <strong>Marketing:</strong> {tInd('consents.marketing')}
                </span>
              </label>
            </div>
          )}
        </div>
      </form>

      <WizardNavigation
        onNext={handleSubmit}
        onPrev={prevStep}
        canGoPrev={true}
        canGoNext={true}
        nextLabel={tInd('continueToReview')}
      />
    </div>
  );
}
