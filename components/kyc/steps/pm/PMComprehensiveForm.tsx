"use client";

import React, { useState } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PMComprehensiveForm() {
  const { data, updateData, nextStep, prevStep } = useKYCWizard();
  const t = useTranslations('investmentAdvisory.company');

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
          title: formData.rep1Title as any,
          firstName: formData.rep1FirstName,
          lastName: formData.rep1LastName,
          position: formData.rep1Position,
          email: formData.rep1Email,
          phone: formData.rep1Mobile,
          dateOfBirth: formData.rep1DateOfBirth,
          nationality: formData.rep1Nationality,
          isPEP: false,
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
      <h2 className="text-2xl font-bold text-brand-dark mb-6">{t('title')}</h2>
      <p className="text-brand-grayMed mb-8">
        {t('subtitle')}
      </p>

      <form className="space-y-6">
        {/* COMPANY IDENTITY SECTION */}
        <div>
          <SectionHeader title={t('sectionTitles.companyIdentity')} section="company" />
          {expandedSections.company && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.legalName')} *</label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => handleChange('legalName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.tradingName')}</label>
                  <input
                    type="text"
                    value={formData.tradingName}
                    onChange={(e) => handleChange('tradingName', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder={t('placeholders.tradingName')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.legalForm')} *</label>
                  <select
                    value={formData.legalForm}
                    onChange={(e) => handleChange('legalForm', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  >
                    <option value="">{t('options.legalForm.select')}</option>
                    <option value="SARL">{t('options.legalForm.sarl')}</option>
                    <option value="SAS">{t('options.legalForm.sas')}</option>
                    <option value="SA">{t('options.legalForm.sa')}</option>
                    <option value="SCI">{t('options.legalForm.sci')}</option>
                    <option value="GmbH">{t('options.legalForm.gmbh')}</option>
                    <option value="Ltd">{t('options.legalForm.ltd')}</option>
                    <option value="LLC">{t('options.legalForm.llc')}</option>
                    <option value="other">{t('options.legalForm.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.dateOfIncorporation')} *</label>
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
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.registrationNumber')} *</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder={t('placeholders.registrationNumber')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.registrationCountry')} *</label>
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
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.taxIdentificationNumber')} *</label>
                  <input
                    type="text"
                    value={formData.taxIdentificationNumber}
                    onChange={(e) => handleChange('taxIdentificationNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.numberOfEmployees')}</label>
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
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.industrySector')} *</label>
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder={t('placeholders.industrySector')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.website')}</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder={t('placeholders.website')}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">{t('subsections.registeredAddress')}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.addressLine1')} *</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.addressLine2')}</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => handleChange('addressLine2', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.city')} *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.postalCode')} *</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.country')} *</label>
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
          <SectionHeader title={t('sectionTitles.representatives')} section="representatives" />
          {expandedSections.representatives && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-brand-dark mb-3">{t('subsections.mainContact')}</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.title')} *</label>
                      <select
                        value={formData.rep1Title}
                        onChange={(e) => handleChange('rep1Title', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      >
                        <option value="">{t('options.title.select')}</option>
                        <option value="Mr.">{t('options.title.mr')}</option>
                        <option value="Mrs.">{t('options.title.mrs')}</option>
                        <option value="Ms.">{t('options.title.ms')}</option>
                        <option value="Dr.">{t('options.title.dr')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.firstName')} *</label>
                      <input
                        type="text"
                        value={formData.rep1FirstName}
                        onChange={(e) => handleChange('rep1FirstName', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.lastName')} *</label>
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
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.position')} *</label>
                      <input
                        type="text"
                        value={formData.rep1Position}
                        onChange={(e) => handleChange('rep1Position', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        placeholder={t('placeholders.position')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.dateOfBirth')} *</label>
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
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.nationality')} *</label>
                      <input
                        type="text"
                        value={formData.rep1Nationality}
                        onChange={(e) => handleChange('rep1Nationality', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.email')} *</label>
                      <input
                        type="email"
                        value={formData.rep1Email}
                        onChange={(e) => handleChange('rep1Email', e.target.value)}
                        className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.mobile')} *</label>
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
                <h4 className="font-semibold text-brand-dark mb-3">{t('subsections.ubo')}</h4>
                <p className="text-sm text-brand-grayMed mb-4">
                  {t('helpers.uboDescription')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.uboFullName')} *</label>
                    <input
                      type="text"
                      value={formData.uboName}
                      onChange={(e) => handleChange('uboName', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.ownershipPercentage')} *</label>
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
                <h4 className="font-semibold text-brand-dark mb-3">{t('subsections.fatcaCrs')}</h4>
                <div className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.usPerson}
                      onChange={(e) => handleChange('usPerson', e.target.checked)}
                      className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
                    />
                    <span className="text-sm text-brand-dark">
                      {t('helpers.usPersonCheckbox')}
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      {t('fields.taxResidentCountries')} *
                    </label>
                    <input
                      type="text"
                      value={formData.taxResidentCountries}
                      onChange={(e) => handleChange('taxResidentCountries', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      placeholder={t('placeholders.taxResidentCountries')}
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
          <SectionHeader title={t('sectionTitles.financial')} section="financial" />
          {expandedSections.financial && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.annualRevenue')} *</label>
                  <input
                    type="number"
                    value={formData.annualRevenue}
                    onChange={(e) => handleChange('annualRevenue', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                    placeholder={t('placeholders.annualRevenue')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.totalAssets')}</label>
                  <input
                    type="number"
                    value={formData.totalAssets}
                    onChange={(e) => handleChange('totalAssets', e.target.value)}
                    className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.primarySourceOfRevenue')} *</label>
                <select
                  value={formData.sourceOfRevenue}
                  onChange={(e) => handleChange('sourceOfRevenue', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="">{t('options.sourceOfRevenue.select')}</option>
                  <option value="products">{t('options.sourceOfRevenue.products')}</option>
                  <option value="services">{t('options.sourceOfRevenue.services')}</option>
                  <option value="trading">{t('options.sourceOfRevenue.trading')}</option>
                  <option value="investments">{t('options.sourceOfRevenue.investments')}</option>
                  <option value="real_estate">{t('options.sourceOfRevenue.realEstate')}</option>
                  <option value="other">{t('options.sourceOfRevenue.other')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ORIGIN OF FUNDS SECTION */}
        <div>
          <SectionHeader title={t('sectionTitles.origin')} section="origin" />
          {expandedSections.origin && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.primaryOriginOfFunds')} *</label>
                <select
                  value={formData.originOfFunds}
                  onChange={(e) => handleChange('originOfFunds', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="">{t('options.originOfFunds.select')}</option>
                  <option value="retained_earnings">{t('options.originOfFunds.retainedEarnings')}</option>
                  <option value="shareholder_contributions">{t('options.originOfFunds.shareholderContributions')}</option>
                  <option value="business_operations">{t('options.originOfFunds.businessOperations')}</option>
                  <option value="sale_of_assets">{t('options.originOfFunds.saleOfAssets')}</option>
                  <option value="financing">{t('options.originOfFunds.financing')}</option>
                  <option value="other">{t('options.originOfFunds.other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.additionalDetails')}</label>
                <textarea
                  value={formData.originDetails}
                  onChange={(e) => handleChange('originDetails', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  rows={3}
                  placeholder={t('placeholders.originDetails')}
                />
              </div>
            </div>
          )}
        </div>

        {/* INVESTMENT PROFILE SECTION */}
        <div>
          <SectionHeader title={t('sectionTitles.investment')} section="investment" />
          {expandedSections.investment && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-brand-dark mb-3">{t('subsections.investmentKnowledge')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.investmentExperience')} *</label>
                    <select
                      value={formData.investmentExperience}
                      onChange={(e) => handleChange('investmentExperience', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="beginner">{t('options.investmentExperience.beginner')}</option>
                      <option value="intermediate">{t('options.investmentExperience.intermediate')}</option>
                      <option value="advanced">{t('options.investmentExperience.advanced')}</option>
                      <option value="expert">{t('options.investmentExperience.expert')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.riskTolerance')} *</label>
                    <select
                      value={formData.riskTolerance}
                      onChange={(e) => handleChange('riskTolerance', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="conservative">{t('options.riskTolerance.conservative')}</option>
                      <option value="moderate">{t('options.riskTolerance.moderate')}</option>
                      <option value="aggressive">{t('options.riskTolerance.aggressive')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-brand-dark mb-3">{t('subsections.investmentObjectives')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.investmentHorizon')} *</label>
                    <select
                      value={formData.investmentHorizon}
                      onChange={(e) => handleChange('investmentHorizon', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="">{t('options.investmentHorizon.select')}</option>
                      <option value="short">{t('options.investmentHorizon.short')}</option>
                      <option value="medium">{t('options.investmentHorizon.medium')}</option>
                      <option value="long">{t('options.investmentHorizon.long')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.primaryObjective')} *</label>
                    <select
                      value={formData.investmentObjective}
                      onChange={(e) => handleChange('investmentObjective', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      required
                    >
                      <option value="">{t('options.investmentObjective.select')}</option>
                      <option value="capital_preservation">{t('options.investmentObjective.capitalPreservation')}</option>
                      <option value="income_generation">{t('options.investmentObjective.incomeGeneration')}</option>
                      <option value="capital_growth">{t('options.investmentObjective.capitalGrowth')}</option>
                      <option value="balanced">{t('options.investmentObjective.balanced')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.expectedAnnualReturn')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.expectedReturn}
                      onChange={(e) => handleChange('expectedReturn', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      placeholder={t('placeholders.expectedReturn')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.maxAcceptableLoss')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.maxLossAcceptable}
                      onChange={(e) => handleChange('maxLossAcceptable', e.target.value)}
                      className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                      placeholder={t('placeholders.maxLoss')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MISSION TYPE SECTION */}
        <div>
          <SectionHeader title={t('sectionTitles.mission')} section="mission" />
          {expandedSections.mission && (
            <div className="bg-white border border-brand-grayLight rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.typeOfService')} *</label>
                <select
                  value={formData.missionType}
                  onChange={(e) => handleChange('missionType', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="advisory">{t('options.missionType.advisory')}</option>
                  <option value="management">{t('options.missionType.management')}</option>
                </select>
                <p className="text-xs text-brand-grayMed mt-2">
                  {formData.missionType === 'advisory'
                    ? t('helpers.advisoryHelper')
                    : t('helpers.managementHelper')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{t('fields.initialInvestmentAmount')} *</label>
                <input
                  type="number"
                  value={formData.initialInvestment}
                  onChange={(e) => handleChange('initialInvestment', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  placeholder={t('placeholders.initialInvestment')}
                  required
                />
                <p className="text-xs text-brand-grayMed mt-2">{t('helpers.minimumInvestment')}</p>
              </div>
            </div>
          )}
        </div>

        {/* CONSENTS SECTION */}
        <div>
          <SectionHeader title={t('sectionTitles.consents')} section="consents" />
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
                  <strong>{t('consents.dataProcessing.label')} *:</strong> {t('consents.dataProcessing.text')}
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
                  <strong>{t('consents.kycCompliance.label')} *:</strong> {t('consents.kycCompliance.text')}
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
                  <strong>{t('consents.electronicSignature.label')} *:</strong> {t('consents.electronicSignature.text')}
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
                  <strong>{t('consents.marketingCommunications.label')}:</strong> {t('consents.marketingCommunications.text')}
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
        nextLabel={t('navigation.continueToReview')}
      />
    </div>
  );
}
