"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function PMComprehensiveForm() {
  const { data, updateData, nextStep, prevStep } = useKYCWizard();

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState({
    company: true,
    representatives: true,
    financial: true,
    origin: true,
    investment: true,
    mission: true,
    consents: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Form state
  const [formData, setFormData] = useState({
    // Company Identity
    legalName: (data as any)?.company?.legalName || '',
    tradingName: (data as any)?.company?.tradingName || '',
    legalForm: (data as any)?.company?.legalForm || '',
    registrationNumber: (data as any)?.company?.registrationNumber || '',
    registrationCountry: (data as any)?.company?.registrationCountry || '',
    taxIdentificationNumber: (data as any)?.company?.taxIdentificationNumber || '',
    dateOfIncorporation: (data as any)?.company?.dateOfIncorporation || '',

    // Registered Address
    addressLine1: (data as any)?.company?.registeredAddress?.line1 || '',
    addressLine2: (data as any)?.company?.registeredAddress?.line2 || '',
    city: (data as any)?.company?.registeredAddress?.city || '',
    postalCode: (data as any)?.company?.registeredAddress?.postalCode || '',
    country: (data as any)?.company?.registeredAddress?.country || '',

    // Company Details
    sector: (data as any)?.company?.sector || '',
    numberOfEmployees: (data as any)?.company?.numberOfEmployees || '',
    website: (data as any)?.company?.website || '',

    // Representative 1 (Main contact)
    rep1Title: '',
    rep1FirstName: '',
    rep1LastName: '',
    rep1Position: '',
    rep1Email: '',
    rep1Mobile: '',
    rep1DateOfBirth: '',
    rep1Nationality: '',

    // FATCA/CRS
    usPerson: false,
    taxResidentCountries: '',

    // UBO Information
    hasBeneficialOwners: true,
    uboName: '',
    uboOwnershipPercentage: '',

    // Financial Information
    annualRevenue: '',
    totalAssets: '',
    sourceOfRevenue: '',

    // Origin of Funds
    originOfFunds: '',
    originDetails: '',

    // Investment Profile
    investmentExperience: 'beginner',
    riskTolerance: 'moderate',
    investmentHorizon: '',
    investmentObjective: '',
    expectedReturn: '',
    maxLossAcceptable: '',

    // Mission Type
    missionType: 'advisory',
    initialInvestment: '',

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
      company: {
        legalName: formData.legalName,
        tradingName: formData.tradingName,
        legalForm: formData.legalForm,
        registrationNumber: formData.registrationNumber,
        registrationCountry: formData.registrationCountry,
        taxIdentificationNumber: formData.taxIdentificationNumber,
        dateOfIncorporation: formData.dateOfIncorporation,
        registeredAddress: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        sector: formData.sector,
        numberOfEmployees: formData.numberOfEmployees,
        website: formData.website,
      },
      representatives: [
        {
          title: formData.rep1Title,
          firstName: formData.rep1FirstName,
          lastName: formData.rep1LastName,
          position: formData.rep1Position,
          email: formData.rep1Email,
          mobile: formData.rep1Mobile,
          dateOfBirth: formData.rep1DateOfBirth,
          nationality: formData.rep1Nationality,
        },
      ],
      fatcaCrs: {
        usPerson: formData.usPerson,
        taxResidentCountries: formData.taxResidentCountries.split(',').map(c => c.trim()),
      },
      beneficialOwners: formData.hasBeneficialOwners ? [
        {
          name: formData.uboName,
          ownershipPercentage: parseFloat(formData.uboOwnershipPercentage) || 0,
        },
      ] : [],
      financialSituation: {
        annualRevenue: formData.annualRevenue,
        totalAssets: formData.totalAssets,
        sourceOfRevenue: formData.sourceOfRevenue,
      },
      originOfFunds: {
        primary: formData.originOfFunds,
        details: formData.originDetails,
      },
      investmentProfile: {
        experience: formData.investmentExperience,
        riskTolerance: formData.riskTolerance,
        investmentHorizon: formData.investmentHorizon,
        objective: formData.investmentObjective,
        expectedReturn: formData.expectedReturn,
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
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Company Client Information</h2>
      <p className="text-brand-grayMed mb-8">
        Please provide all required information about your company. All sections must be completed.
      </p>

      <form className="space-y-6">
        {/* COMPANY IDENTITY SECTION */}
        <div>
          <SectionHeader title="1. Company Identity" section="company" />
          {expandedSections.company && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Legal Name *</label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => handleChange('legalName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Trading Name</label>
                  <input
                    type="text"
                    value={formData.tradingName}
                    onChange={(e) => handleChange('tradingName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="If different from legal name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Legal Form *</label>
                  <select
                    value={formData.legalForm}
                    onChange={(e) => handleChange('legalForm', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="">Select legal form</option>
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SA">SA</option>
                    <option value="SCI">SCI</option>
                    <option value="GmbH">GmbH</option>
                    <option value="Ltd">Ltd</option>
                    <option value="LLC">LLC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Date of Incorporation *</label>
                  <input
                    type="date"
                    value={formData.dateOfIncorporation}
                    onChange={(e) => handleChange('dateOfIncorporation', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Registration Number *</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="e.g., SIREN, Company Number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Registration Country *</label>
                  <input
                    type="text"
                    value={formData.registrationCountry}
                    onChange={(e) => handleChange('registrationCountry', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Number of Employees</label>
                  <input
                    type="number"
                    value={formData.numberOfEmployees}
                    onChange={(e) => handleChange('numberOfEmployees', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Industry/Sector *</label>
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="e.g., Technology, Finance, Retail"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">Registered Address</h4>
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
            </div>
          )}
        </div>

        {/* REPRESENTATIVES SECTION */}
        <div>
          <SectionHeader title="2. Authorized Representatives & Beneficial Owners" section="representatives" />
          {expandedSections.representatives && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-brand-dark mb-3">Main Contact / Legal Representative</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Title *</label>
                      <select
                        value={formData.rep1Title}
                        onChange={(e) => handleChange('rep1Title', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      >
                        <option value="">Select</option>
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
                        value={formData.rep1FirstName}
                        onChange={(e) => handleChange('rep1FirstName', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.rep1LastName}
                        onChange={(e) => handleChange('rep1LastName', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Position *</label>
                      <input
                        type="text"
                        value={formData.rep1Position}
                        onChange={(e) => handleChange('rep1Position', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        placeholder="e.g., CEO, Managing Director"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        value={formData.rep1DateOfBirth}
                        onChange={(e) => handleChange('rep1DateOfBirth', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Nationality *</label>
                      <input
                        type="text"
                        value={formData.rep1Nationality}
                        onChange={(e) => handleChange('rep1Nationality', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.rep1Email}
                        onChange={(e) => handleChange('rep1Email', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Mobile *</label>
                      <input
                        type="tel"
                        value={formData.rep1Mobile}
                        onChange={(e) => handleChange('rep1Mobile', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">Ultimate Beneficial Owner (UBO)</h4>
                <p className="text-sm text-brand-grayMed mb-4">
                  Individual(s) who ultimately own or control more than 25% of the company
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">UBO Full Name *</label>
                    <input
                      type="text"
                      value={formData.uboName}
                      onChange={(e) => handleChange('uboName', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Ownership Percentage (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.uboOwnershipPercentage}
                      onChange={(e) => handleChange('uboOwnershipPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">FATCA & CRS Information</h4>
                <div className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.usPerson}
                      onChange={(e) => handleChange('usPerson', e.target.checked)}
                      className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
                    />
                    <span className="text-sm text-brand-dark">
                      The company or any UBO is a US person for tax purposes
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Tax Resident Countries *
                    </label>
                    <input
                      type="text"
                      value={formData.taxResidentCountries}
                      onChange={(e) => handleChange('taxResidentCountries', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      placeholder="Separate multiple countries with commas"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FINANCIAL SECTION */}
        <div>
          <SectionHeader title="3. Financial Information" section="financial" />
          {expandedSections.financial && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Annual Revenue (EUR) *</label>
                  <input
                    type="number"
                    value={formData.annualRevenue}
                    onChange={(e) => handleChange('annualRevenue', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder="e.g., 1000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Total Assets (EUR)</label>
                  <input
                    type="number"
                    value={formData.totalAssets}
                    onChange={(e) => handleChange('totalAssets', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Primary Source of Revenue *</label>
                <select
                  value={formData.sourceOfRevenue}
                  onChange={(e) => handleChange('sourceOfRevenue', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="">Select source</option>
                  <option value="products">Product Sales</option>
                  <option value="services">Services</option>
                  <option value="trading">Trading</option>
                  <option value="investments">Investments</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="other">Other</option>
                </select>
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
                  <option value="retained_earnings">Retained Earnings</option>
                  <option value="shareholder_contributions">Shareholder Contributions</option>
                  <option value="business_operations">Business Operations</option>
                  <option value="sale_of_assets">Sale of Assets</option>
                  <option value="financing">Debt/Equity Financing</option>
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
                  placeholder="Provide additional context about the origin of investment funds"
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
                      <option value="beginner">Limited (Less than 2 years)</option>
                      <option value="intermediate">Moderate (2-5 years)</option>
                      <option value="advanced">Substantial (5-10 years)</option>
                      <option value="expert">Extensive (More than 10 years)</option>
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
                      placeholder="e.g., 6.0"
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
                      placeholder="e.g., 15.0"
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
                  placeholder="e.g., 100000"
                  required
                />
                <p className="text-xs text-brand-grayMed mt-2">Minimum for corporate clients: €50,000</p>
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
                  <strong>Data Processing *:</strong> I consent on behalf of the company to the processing of personal and company data in accordance with GDPR and French data protection laws
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
                  <strong>KYC/AML Compliance *:</strong> I authorize Opulanz to perform necessary KYC/AML checks on the company and its representatives, and share information with regulatory authorities if required
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
                  <strong>Electronic Signature *:</strong> I agree on behalf of the company to sign documents electronically via DocuSign and accept that electronic signatures have the same legal validity as handwritten signatures
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
