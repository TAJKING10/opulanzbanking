"use client";

import React, { useState, useEffect } from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { WizardNavigation } from '../../WizardNavigation';
import type { IndividualHolder, IndividualClientData } from '@/types/kyc';

const INITIAL_HOLDER: Partial<IndividualHolder> = {
  title: 'M.',
  lastName: '',
  firstName: '',
  dateOfBirth: '',
  placeOfBirth: '',
  nationality: '',
  address: { street: '', postalCode: '', city: '', country: 'France' },
  email: '',
  phone: '',
  taxResidenceCountry: 'France',
  USPerson: false,
  professionalSituation: { status: 'employed' },
  legalProtection: { underProtectionRegime: false }
};

export function PPIdentityStep() {
  const { data, updateData, nextStep, prevStep } = useKYCWizard();
  const [holder1, setHolder1] = useState<Partial<IndividualHolder>>(INITIAL_HOLDER);
  const [hasHolder2, setHasHolder2] = useState(false);
  const [holder2, setHolder2] = useState<Partial<IndividualHolder>>(INITIAL_HOLDER);

  useEffect(() => {
    const ppData = data as Partial<IndividualClientData>;
    if (ppData.holders?.holder1) {
      setHolder1(ppData.holders.holder1);
    }
    if (ppData.holders?.holder2) {
      setHolder2(ppData.holders.holder2);
      setHasHolder2(true);
    }
  }, []);

  const handleSubmit = () => {
    const holders: any = { holder1 };
    if (hasHolder2) holders.holder2 = holder2;

    updateData({ holders } as any);
    nextStep();
  };

  const isValid = holder1.lastName && holder1.firstName && holder1.dateOfBirth &&
                  holder1.nationality && holder1.address?.street;

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Identity & Contact Information</h2>

      <div className="space-y-8">
        {/* Holder 1 */}
        <div className="border border-brand-grayLight rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-dark mb-4">Primary Account Holder</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <select
                value={holder1.title}
                onChange={(e) => setHolder1({...holder1, title: e.target.value as any})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
              >
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={holder1.lastName}
                onChange={(e) => setHolder1({...holder1, lastName: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={holder1.firstName}
                onChange={(e) => setHolder1({...holder1, firstName: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Maiden Name (if applicable)
              </label>
              <input
                type="text"
                value={holder1.maidenName || ''}
                onChange={(e) => setHolder1({...holder1, maidenName: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={holder1.dateOfBirth}
                onChange={(e) => setHolder1({...holder1, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Place of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={holder1.placeOfBirth}
                onChange={(e) => setHolder1({...holder1, placeOfBirth: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={holder1.nationality}
                onChange={(e) => setHolder1({...holder1, nationality: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={holder1.email}
                onChange={(e) => setHolder1({...holder1, email: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={holder1.phone}
                onChange={(e) => setHolder1({...holder1, phone: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-brand-dark mb-3">Address</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Street <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={holder1.address?.street}
                  onChange={(e) => setHolder1({...holder1, address: {...holder1.address!, street: e.target.value}})}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={holder1.address?.postalCode}
                  onChange={(e) => setHolder1({...holder1, address: {...holder1.address!, postalCode: e.target.value}})}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={holder1.address?.city}
                  onChange={(e) => setHolder1({...holder1, address: {...holder1.address!, city: e.target.value}})}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={holder1.address?.country}
                  onChange={(e) => setHolder1({...holder1, address: {...holder1.address!, country: e.target.value}})}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Tax Residence Country
              </label>
              <input
                type="text"
                value={holder1.taxResidenceCountry}
                onChange={(e) => setHolder1({...holder1, taxResidenceCountry: e.target.value})}
                className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                US Person (FATCA)
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={holder1.USPerson === false}
                    onChange={() => setHolder1({...holder1, USPerson: false})}
                    className="text-brand-gold focus:ring-brand-gold"
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={holder1.USPerson === true}
                    onChange={() => setHolder1({...holder1, USPerson: true})}
                    className="text-brand-gold focus:ring-brand-gold"
                  />
                  <span>Yes</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-brand-dark mb-3">Professional Situation</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Status
                </label>
                <select
                  value={holder1.professionalSituation?.status}
                  onChange={(e) => setHolder1({...holder1, professionalSituation: {...holder1.professionalSituation!, status: e.target.value as any}})}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                >
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Profession / Job Title
                </label>
                <input
                  type="text"
                  value={holder1.professionalSituation?.profession || ''}
                  onChange={(e) => setHolder1({...holder1, professionalSituation: {...holder1.professionalSituation!, profession: e.target.value}})}
                  className="w-full px-4 py-2 border border-brand-grayLight rounded-lg focus:ring-2 focus:ring-brand-gold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Joint Holder Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasHolder2"
            checked={hasHolder2}
            onChange={(e) => setHasHolder2(e.target.checked)}
            className="h-4 w-4 text-brand-gold focus:ring-brand-gold rounded"
          />
          <label htmlFor="hasHolder2" className="text-sm font-semibold text-brand-dark">
            Add joint account holder
          </label>
        </div>

        {/* Holder 2 - Similar structure (simplified for brevity) */}
        {hasHolder2 && (
          <div className="border border-brand-grayLight rounded-xl p-6">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Joint Account Holder</h3>
            <p className="text-sm text-brand-grayMed mb-4">Please provide the same information for the joint holder...</p>
            {/* Same fields as Holder 1 */}
          </div>
        )}
      </div>

      <WizardNavigation
        onNext={handleSubmit}
        onPrev={prevStep}
        canGoPrev={true}
        canGoNext={isValid}
      />
    </div>
  );
}
