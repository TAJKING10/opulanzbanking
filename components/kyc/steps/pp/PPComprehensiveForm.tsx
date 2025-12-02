"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

export function PPComprehensiveForm() {
  const { data, updateData, nextStep, prevStep } = useKYCWizard();

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
    // Structure the data according to the KYC type
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

    updateData(structuredData);
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
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Individual Client Information</h2>
      <p className="text-brand-grayMed mb-8">
        Please provide all required information below. All sections must be completed.
      </p>

      <form className="space-y-6">
        {/* IDENTITY SECTION */}
        <div>
          <SectionHeader title="1. Personal Identity" section="identity" />
          {expandedSections.identity && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Title *</label>
                  <select
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Last Name *</label>
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
                  <label className="block text-sm font-medium text-brand-dark mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Place of Birth *</label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="City, Country"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Nationality *</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Marital Status *</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="civil_partnership">Civil Partnership</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">Residential Address</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => handleChange('addressLine2', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Postal Code *</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Country *</label>
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
                <h4 className="font-semibold text-brand-dark mb-3">Tax Residency</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Tax Residence Country *</label>
                    <input
                      type="text"
                      value={formData.taxCountry}
                      onChange={(e) => handleChange('taxCountry', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Tax Identification Number *</label>
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
                <h4 className="font-semibold text-brand-dark mb-3">Professional Situation</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Professional Status *</label>
                      <select
                        value={formData.professionalStatus}
                        onChange={(e) => handleChange('professionalStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      >
                        <option value="">Select status</option>
                        <option value="employed">Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="student">Student</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Sector/Industry</label>
                      <input
                        type="text"
                        value={formData.sector}
                        onChange={(e) => handleChange('sector', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        placeholder="e.g., Technology, Finance, Healthcare"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Employer Name</label>
                      <input
                        type="text"
                        value={formData.employerName}
                        onChange={(e) => handleChange('employerName', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Position/Title</label>
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
          <SectionHeader title="2. Family Situation" section="family" />
          {expandedSections.family && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Number of Dependents</label>
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
          <SectionHeader title="3. Financial Situation" section="financial" />
          {expandedSections.financial && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Annual Income (EUR) *</label>
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
                  <label className="block text-sm font-medium text-brand-dark mb-2">Income Source *</label>
                  <select
                    value={formData.incomeSource}
                    onChange={(e) => handleChange('incomeSource', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="">Select source</option>
                    <option value="salary">Salary</option>
                    <option value="business">Business Income</option>
                    <option value="investments">Investment Income</option>
                    <option value="pension">Pension</option>
                    <option value="inheritance">Inheritance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Total Assets (EUR)</label>
                  <input
                    type="number"
                    value={formData.totalAssets}
                    onChange={(e) => handleChange('totalAssets', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="e.g., 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Liquid Assets (EUR)</label>
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
                  <label className="block text-sm font-medium text-brand-dark mb-2">Real Estate Value (EUR)</label>
                  <input
                    type="number"
                    value={formData.realEstateValue}
                    onChange={(e) => handleChange('realEstateValue', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Outstanding Debts (EUR)</label>
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
          <SectionHeader title="4. Origin of Funds" section="origin" />
          {expandedSections.origin && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Primary Origin of Funds *</label>
                <select
                  value={formData.originOfFunds}
                  onChange={(e) => handleChange('originOfFunds', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="">Select origin</option>
                  <option value="savings">Savings</option>
                  <option value="sale_of_assets">Sale of Assets</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="business_income">Business Income</option>
                  <option value="investment_returns">Investment Returns</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Additional Details</label>
                <textarea
                  value={formData.originDetails}
                  onChange={(e) => handleChange('originDetails', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  rows={3}
                  placeholder="Provide additional context about the origin of your investment funds"
                />
              </div>
            </div>
          )}
        </div>

        {/* INVESTMENT PROFILE SECTION */}
        <div>
          <SectionHeader title="5. Investment Profile" section="investment" />
          {expandedSections.investment && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-brand-dark mb-3">Investment Knowledge & Experience</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Investment Experience *</label>
                    <select
                      value={formData.investmentExperience}
                      onChange={(e) => handleChange('investmentExperience', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="beginner">Beginner (Less than 2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="advanced">Advanced (5-10 years)</option>
                      <option value="expert">Expert (More than 10 years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Risk Tolerance *</label>
                    <select
                      value={formData.riskTolerance}
                      onChange={(e) => handleChange('riskTolerance', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="conservative">Conservative - Preserve capital</option>
                      <option value="moderate">Moderate - Balanced growth</option>
                      <option value="aggressive">Aggressive - Maximum growth</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-brand-dark mb-3">Investment Objectives</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Investment Horizon *</label>
                    <select
                      value={formData.investmentHorizon}
                      onChange={(e) => handleChange('investmentHorizon', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="">Select horizon</option>
                      <option value="short">Short-term (Less than 3 years)</option>
                      <option value="medium">Medium-term (3-7 years)</option>
                      <option value="long">Long-term (More than 7 years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Primary Objective *</label>
                    <select
                      value={formData.investmentObjective}
                      onChange={(e) => handleChange('investmentObjective', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="">Select objective</option>
                      <option value="capital_preservation">Capital Preservation</option>
                      <option value="income_generation">Income Generation</option>
                      <option value="capital_growth">Capital Growth</option>
                      <option value="balanced">Balanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Expected Annual Return (%)</label>
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
                    <label className="block text-sm font-medium text-brand-dark mb-2">Max Acceptable Loss (%)</label>
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
          <SectionHeader title="6. Service Type & Initial Investment" section="mission" />
          {expandedSections.mission && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Type of Service *</label>
                <select
                  value={formData.missionType}
                  onChange={(e) => handleChange('missionType', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="advisory">Investment Advisory (Conseil)</option>
                  <option value="management">Portfolio Management (Gestion sous mandat)</option>
                </select>
                <p className="text-xs text-brand-grayMed mt-2">
                  {formData.missionType === 'advisory'
                    ? 'We provide recommendations, you make the final decisions'
                    : 'We manage your portfolio with discretionary authority'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Initial Investment Amount (EUR) *</label>
                <input
                  type="number"
                  value={formData.initialInvestment}
                  onChange={(e) => handleChange('initialInvestment', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  placeholder="e.g., 50000"
                  required
                />
                <p className="text-xs text-brand-grayMed mt-2">Minimum: €10,000</p>
              </div>
            </div>
          )}
        </div>

        {/* CONSENTS SECTION */}
        <div>
          <SectionHeader title="7. Consents & Authorizations" section="consents" />
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
                  <strong>Data Processing *:</strong> I consent to the processing of my personal data in accordance with GDPR and French data protection laws
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
                  <strong>KYC/AML Compliance *:</strong> I authorize Opulanz to perform necessary KYC/AML checks and share information with regulatory authorities if required
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
                  <strong>Electronic Signature *:</strong> I agree to sign documents electronically via DocuSign and accept that electronic signatures have the same legal validity as handwritten signatures
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
                  <strong>Marketing Communications:</strong> I agree to receive marketing communications about Opulanz services and products (optional)
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
        nextLabel="Continue to Review"
      />
    </div>
  );
}
