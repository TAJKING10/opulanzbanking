"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calculator, Scale, TrendingUp, Heart, Building2, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const tPage = useTranslations("servicesPage");

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
  ];

  const features = [
    {
      icon: Calculator,
      title: tPage("featuresSection.expertFinancial.title"),
      description: tPage("featuresSection.expertFinancial.description"),
    },
    {
      icon: Scale,
      title: tPage("featuresSection.taxOptimization.title"),
      description: tPage("featuresSection.taxOptimization.description"),
    },
    {
      icon: TrendingUp,
      title: tPage("featuresSection.investmentManagement.title"),
      description: tPage("featuresSection.investmentManagement.description"),
    },
    {
      icon: Heart,
      title: tPage("featuresSection.insuranceSolutions.title"),
      description: tPage("featuresSection.insuranceSolutions.description"),
    },
    {
      icon: Building2,
      title: tPage("featuresSection.companyFormation.title"),
      description: tPage("featuresSection.companyFormation.description"),
    },
    {
      icon: CreditCard,
      title: tPage("featuresSection.bankingServices.title"),
      description: tPage("featuresSection.bankingServices.description"),
    },
  ];

  const whyChooseUs = [
    tPage("whyChooseUs.reasons.regulated"),
    tPage("whyChooseUs.reasons.expertise"),
    tPage("whyChooseUs.reasons.personalized"),
    tPage("whyChooseUs.reasons.competitive"),
    tPage("whyChooseUs.reasons.multilingual"),
    tPage("whyChooseUs.reasons.digital"),
    tPage("whyChooseUs.reasons.comprehensive"),
  ];

  return (
    <>
      <Hero
        title={tPage("hero.title")}
        subtitle={tPage("hero.subtitle")}
        primaryCta={{
          label: tPage("hero.primaryCta"),
          href: `/${locale}/open-account`,
        }}
        secondaryCta={{
          label: tPage("hero.secondaryCta"),
          href: "#services",
        }}
      />

      {/* Services Grid Section */}
      <section id="services" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={tPage("servicesSection.overline")}
            title={tPage("servicesSection.title")}
            description={tPage("servicesSection.description")}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={tPage("featuresSection.overline")}
            title={tPage("featuresSection.title")}
            description={tPage("featuresSection.description")}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-none shadow-sm">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-grayMed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                {tPage("whyChooseUs.title")}
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                {tPage("whyChooseUs.paragraph1")}
              </p>
              <p className="mb-8 text-lg text-brand-grayMed">
                {tPage("whyChooseUs.paragraph2")}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <a href={`/${locale}/open-account`}>{tPage("whyChooseUs.cta")}</a>
              </Button>
            </div>
            <div className="space-y-4">
              {whyChooseUs.map((reason) => (
                <div key={reason} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                  <p className="text-brand-dark">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={tPage("regulatorySection.overline")}
            title={tPage("regulatorySection.title")}
            description={tPage("regulatorySection.description")}
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
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {tPage("ctaSection.title")}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {tPage("ctaSection.description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/open-account`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {tPage("ctaSection.openAccount")}
            </a>
            <a
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {tPage("ctaSection.contactUs")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
