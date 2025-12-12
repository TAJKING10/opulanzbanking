"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, FileText, Users, CreditCard, CheckCircle } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyFormationWizard } from "@/components/company-formation/company-formation-wizard";
import type { CompanyFormType } from "@/types/company-formation";

export default function CompanyFormationPage() {
  const t = useTranslations('companyFormation');
  const [selectedForm, setSelectedForm] = React.useState<CompanyFormType | null>(null);

  const companyForms = [
    {
      id: "SARL" as const,
      name: "SARL",
      fullName: t('forms.sarl.fullName'),
      minCapital: t('forms.sarl.minCapital'),
      minShareholders: 1,
      liability: t('forms.sarl.liability'),
      features: [
        t('forms.sarl.features.common'),
        t('forms.sarl.features.flexible'),
        t('forms.sarl.features.capital'),
        t('forms.sarl.features.suitable'),
      ],
    },
    {
      id: "SARL-S" as const,
      name: "SARL-S",
      fullName: t('forms.sarls.fullName'),
      minCapital: t('forms.sarls.minCapital'),
      minShareholders: 1,
      liability: t('forms.sarl.liability'),
      features: [
        t('forms.sarls.features.capital'),
        t('forms.sarls.features.formation'),
        t('forms.sarls.features.startups'),
        t('forms.sarls.features.max'),
      ],
    },
    {
      id: "SA" as const,
      name: "SA",
      fullName: t('forms.sa.fullName'),
      minCapital: t('forms.sa.minCapital'),
      minShareholders: 1,
      liability: t('forms.sarl.liability'),
      features: [
        t('forms.sa.features.public'),
        t('forms.sa.features.board'),
        t('forms.sa.features.credibility'),
        t('forms.sa.features.suitable'),
      ],
    },
    {
      id: "SCSp" as const,
      name: "SCSp",
      fullName: t('forms.scsp.fullName'),
      minCapital: t('forms.scsp.minCapital'),
      minShareholders: 2,
      liability: "Mixed",
      features: [
        t('forms.scsp.features.transparent'),
        t('forms.scsp.features.funds'),
        t('forms.scsp.features.flexible'),
        t('forms.scsp.features.liability'),
      ],
    },
    {
      id: "SOLE" as const,
      name: t('forms.soleProprietor'),
      fullName: t('forms.soleProprietor'),
      minCapital: t('forms.scsp.minCapital'),
      minShareholders: 1,
      liability: "Unlimited",
      features: [
        "Simplest structure",
        "No separate legal entity",
        "Full control",
        "Personal liability",
      ],
    },
  ];

  if (selectedForm) {
    return (
      <CompanyFormationWizard
        initialFormType={selectedForm}
        onBack={() => setSelectedForm(null)}
      />
    );
  }

  return (
    <>
      <Hero
        title="Company Formation in Luxembourg"
        subtitle={t('subtitle')}
      />

      {/* Company Types Selection */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Choose Your Company Form"
            description={t('description')}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {companyForms.map((form) => (
              <Card
                key={form.id}
                className="card-hover group cursor-pointer border-2 border-brand-grayLight transition-all hover:border-brand-gold hover:shadow-lg"
                onClick={() => setSelectedForm(form.id)}
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-goldLight">
                    <Building2 className="h-7 w-7 text-brand-goldDark" />
                  </div>
                  <CardTitle className="text-xl">{form.name}</CardTitle>
                  <p className="text-sm text-brand-grayMed">{form.fullName}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Min. Capital:</span>
                      <span className="font-semibold text-brand-dark">
                        {form.minCapital}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Shareholders:</span>
                      <span className="font-semibold text-brand-dark">
                        Min. {form.minShareholders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Liability:</span>
                      <span className="font-semibold text-brand-dark">
                        {form.liability}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2 border-t border-brand-grayLight pt-4">
                    {form.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-brand-grayMed"
                      >
                        <span className="text-brand-gold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group-hover:border-brand-gold group-hover:bg-brand-goldLight/10 group-hover:text-brand-gold"
                  >
                    Start Formation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t('process.title')}
            description={t('process.description')}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "Company Type", desc: "Select your legal structure" },
              { icon: FileText, title: t('steps.details.title'), desc: t('steps.details.description') },
              { icon: Users, title: t('steps.shareholders.title'), desc: t('steps.shareholders.description') },
              { icon: CreditCard, title: t('steps.capital.title'), desc: t('steps.capital.description') },
              { icon: FileText, title: "Activity", desc: "Business activity details" },
              { icon: Building2, title: "Notary", desc: "Notary preferences" },
              { icon: FileText, title: "Documents", desc: "Upload required docs" },
              { icon: CheckCircle, title: "Submit", desc: "Review and submit" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 font-bold text-brand-dark">{item.title}</h3>
                  <p className="text-sm text-brand-grayMed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t('benefits.title')}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CheckCircle className="mb-4 h-12 w-12 text-brand-gold" />
                <CardTitle>{t('benefits.expertGuidance.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed">
                  {t('benefits.expertGuidance.description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="mb-4 h-12 w-12 text-brand-gold" />
                <CardTitle>{t('benefits.fastEfficient.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed">
                  {t('benefits.fastEfficient.description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="mb-4 h-12 w-12 text-brand-gold" />
                <CardTitle>{t('benefits.fullService.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed">
                  {t('benefits.fullService.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
