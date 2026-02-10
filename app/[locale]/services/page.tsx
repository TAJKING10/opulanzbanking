"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calculator, Scale, TrendingUp, Heart, Building2, CreditCard, CheckCircle } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const services = [
    {
      title: t('services.accounting.title'),
      description: t('services.accounting.description'),
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop',
      href: `/${locale}/invoicing-accounting`,
    },
    {
      title: t('nav.openAccount'),
      description: t('home.services.banking.description'),
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop',
      href: `/${locale}/open-account`,
    },
    {
      title: t('nav.companyFormation'),
      description: t('home.services.formation.description'),
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: `/${locale}/company-formation`,
    },
    {
      title: t('services.tax.title'),
      description: t('services.tax.description'),
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
      href: `/${locale}/tax-advisory`,
    },
    {
      title: t('services.investment.title'),
      description: t('services.investment.description'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      href: `/${locale}/investment-advisory`,
    },
    {
      title: t('services.lifeInsurance.title'),
      description: t('services.lifeInsurance.description'),
      image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=500&fit=crop',
      href: `/${locale}/life-insurance`,
    },
    {
      title: t('services.spvInvestment.title'),
      description: t('services.spvInvestment.description'),
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
      href: `/${locale}/spv-investment`,
    },
  ];

  const featureKeys = [
    { key: "expertFinancial", icon: Calculator },
    { key: "taxOptimization", icon: Scale },
    { key: "investmentManagement", icon: TrendingUp },
    { key: "insuranceSolutions", icon: Heart },
    { key: "companyFormation", icon: Building2 },
    { key: "bankingServices", icon: CreditCard },
  ];

  const reasonKeys = [
    "regulated",
    "expertise",
    "personalized",
    "competitive",
    "multilingual",
    "digital",
    "comprehensive",
  ];

  return (
    <>
      <Hero
        title={t('servicesPage.hero.title')}
        subtitle={t('servicesPage.hero.subtitle')}
        primaryCta={{
          label: t('servicesPage.hero.primaryCta'),
          href: `/${locale}/open-account`,
        }}
        secondaryCta={{
          label: t('servicesPage.hero.secondaryCta'),
          href: "#services",
        }}
      />

      {/* Services Grid Section */}
      <section id="services" className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('servicesPage.grid.overline')}
            title={t('servicesPage.grid.title')}
            description={t('servicesPage.grid.description')}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('servicesPage.features.overline')}
            title={t('servicesPage.features.title')}
            description={t('servicesPage.features.description')}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.key} className="border-none shadow-sm">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <CardTitle className="text-xl">
                      {t(`servicesPage.features.${feature.key}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-grayMed">
                      {t(`servicesPage.features.${feature.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                {t('servicesPage.whyChooseUs.title')}
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                {t('servicesPage.whyChooseUs.paragraph1')}
              </p>
              <p className="mb-8 text-lg text-brand-grayMed">
                {t('servicesPage.whyChooseUs.paragraph2')}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <a href={`/${locale}/open-account`}>{t('servicesPage.whyChooseUs.cta')}</a>
              </Button>
            </div>
            <div className="space-y-4">
              {reasonKeys.map((key) => (
                <div key={key} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                  <p className="text-brand-dark">
                    {t(`servicesPage.whyChooseUs.reasons.${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('servicesPage.regulatory.overline')}
            title={t('servicesPage.regulatory.title')}
            description={t('servicesPage.regulatory.description')}
          />
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="text-center">
                <div className="mb-4 text-4xl font-bold text-brand-gold">ACPR</div>
                <CardTitle>{t('home.regulatory.france')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-brand-grayMed">{t('home.regulatory.acpr')}</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="text-center">
                <div className="mb-4 text-4xl font-bold text-brand-gold">AMF</div>
                <CardTitle>{t('home.regulatory.france')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-brand-grayMed">{t('home.regulatory.amf')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('servicesPage.cta.title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t('servicesPage.cta.subtitle')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/open-account`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {t('servicesPage.cta.openAccount')}
            </a>
            <a
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {t('servicesPage.cta.contactUs')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
