"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  const t = useTranslations('legal.terms');
  const locale = useLocale();

  return (
    <>
      <Hero
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('companyIdentification.title')}</h2>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>{t('companyIdentification.companyName')}:</strong> {t('companyIdentification.companyNameValue')}</p>
                <p><strong>{t('companyIdentification.capital')}:</strong> {t('companyIdentification.capitalValue')}</p>
                <p><strong>{t('companyIdentification.address')}:</strong> {t('companyIdentification.addressValue')}</p>
                <p><strong>{t('companyIdentification.phone')}:</strong> {t('companyIdentification.phoneValue')}</p>
                <p><strong>{t('companyIdentification.email')}:</strong> {t('companyIdentification.emailValue')}</p>
                <p><strong>{t('companyIdentification.website')}:</strong> {t('companyIdentification.websiteValue')}</p>
                <p><strong>{t('companyIdentification.siret')}:</strong> {t('companyIdentification.siretValue')}</p>
                <p><strong>{t('companyIdentification.ape')}:</strong> {t('companyIdentification.apeValue')}</p>
                <p><strong>{t('companyIdentification.vatNumber')}:</strong> {t('companyIdentification.vatNumberValue')}</p>
                <p><strong>{t('companyIdentification.registration')}:</strong> {t('companyIdentification.registrationValue')}</p>
              </div>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('servicesProvided.title')}</h2>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>{t('servicesProvided.investment')}</li>
                <li>{t('servicesProvided.insurance')}</li>
                <li>{t('servicesProvided.banking')}</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('professionalInsurance.title')}</h2>
              <p className="text-brand-grayMed mb-6">
                {t('professionalInsurance.description')}
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('contactInfo.title')}</h2>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>{t('contactInfo.name')}:</strong> {t('contactInfo.nameValue')}</p>
                <p><strong>{t('companyIdentification.address')}:</strong> {t('companyIdentification.addressValue')}</p>
                <p><strong>{t('companyIdentification.phone')}:</strong> {t('companyIdentification.phoneValue')}</p>
                <p><strong>{t('companyIdentification.email')}:</strong> {t('companyIdentification.emailValue')}</p>
              </div>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('intellectualProperty.title')}</h2>
              <p className="text-brand-grayMed mb-6">
                {t('intellectualProperty.trademark')}
              </p>
              <p className="text-brand-grayMed mb-6">
                {t('intellectualProperty.ownership')}
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('generalConditions.title')}</h2>
              <p className="text-brand-grayMed mb-4">
                {t('generalConditions.acceptance')}
              </p>
              <p className="text-brand-grayMed mb-4">
                {t('generalConditions.disclaimer')}
              </p>
              <p className="text-brand-grayMed mb-4">
                {t('generalConditions.modifications')}
              </p>
              <p className="text-brand-grayMed mb-6">
                {t('generalConditions.jurisdiction')}
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t('designHosting.title')}</h2>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>{t('designHosting.design')}:</strong> {t('designHosting.designValue')}</p>
                <p><strong>{t('designHosting.development')}:</strong> {t('designHosting.developmentValue')}</p>
                <p><strong>{t('designHosting.hosting')}:</strong> {t('designHosting.hostingValue')}</p>
              </div>

              <div className="mt-8 p-4 bg-brand-goldLight/20 rounded-lg">
                <p className="text-sm text-brand-grayMed italic">
                  {t('footer.disclaimer')}
                </p>
              </div>

              <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
                {t('footer.lastUpdated')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
