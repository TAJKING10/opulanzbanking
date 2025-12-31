"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { TrendingUp, PieChart, Shield, Target, CheckCircle, Wallet, BarChart3, Users } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvestmentAdvisoryPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const services = [
    {
      icon: PieChart,
      title: t('investmentAdvisory.services.portfolioDiversification.title'),
      description: t('investmentAdvisory.services.portfolioDiversification.description'),
    },
    {
      icon: BarChart3,
      title: t('investmentAdvisory.services.investmentStrategy.title'),
      description: t('investmentAdvisory.services.investmentStrategy.description'),
    },
    {
      icon: Users,
      title: t('investmentAdvisory.services.retirementPlanning.title'),
      description: t('investmentAdvisory.services.retirementPlanning.description'),
    },
  ];

  const benefits = [
    t('investmentAdvisory.benefits.1'),
    t('investmentAdvisory.benefits.2'),
    t('investmentAdvisory.benefits.3'),
    t('investmentAdvisory.benefits.4'),
    t('investmentAdvisory.benefits.5'),
    t('investmentAdvisory.benefits.6'),
    t('investmentAdvisory.benefits.7'),
  ];

  const investmentOptions = [
    {
      title: t('investmentAdvisory.investmentOptions.equities.title'),
      description: t('investmentAdvisory.investmentOptions.equities.description'),
      risk: t('investmentAdvisory.investmentOptions.equities.risk'),
    },
    {
      title: t('investmentAdvisory.investmentOptions.fixedIncome.title'),
      description: t('investmentAdvisory.investmentOptions.fixedIncome.description'),
      risk: t('investmentAdvisory.investmentOptions.fixedIncome.risk'),
    },
    {
      title: t('investmentAdvisory.investmentOptions.alternative.title'),
      description: t('investmentAdvisory.investmentOptions.alternative.description'),
      risk: t('investmentAdvisory.investmentOptions.alternative.risk'),
    },
    {
      title: t('investmentAdvisory.investmentOptions.sustainable.title'),
      description: t('investmentAdvisory.investmentOptions.sustainable.description'),
      risk: t('investmentAdvisory.investmentOptions.sustainable.risk'),
    },
  ];

  return (
    <>
      <Hero
        title={t('services.investment.title')}
        subtitle={t('services.investment.description')}
        primaryCta={{
          label: t('investmentAdvisory.hero.primaryCta'),
          href: `/${locale}/investment-advisory/schedule`,
        }}
        secondaryCta={{
          label: t('investmentAdvisory.hero.secondaryCta'),
          href: "#services",
        }}
      />

      {/* Services Section */}
      <section id="services" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('investmentAdvisory.services.overline')}
            title={t('investmentAdvisory.services.title')}
            description={t('investmentAdvisory.services.description')}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="border-none shadow-sm">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-grayMed">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                {t('investmentAdvisory.whyChoose.title')}
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                {t('investmentAdvisory.whyChoose.description')}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <Link href={`/${locale}/investment-advisory/schedule`}>{t('investmentAdvisory.whyChoose.cta')}</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                  <p className="text-brand-dark">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment Options Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('investmentAdvisory.investmentOptions.overline')}
            title={t('investmentAdvisory.investmentOptions.title')}
            description={t('investmentAdvisory.investmentOptions.description')}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {investmentOptions.map((option) => (
              <Card key={option.title} className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-brand-grayMed">{option.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-dark">{t('investmentAdvisory.investmentOptions.riskLevel')}</span>
                    <span className="text-xs text-brand-grayMed">{option.risk}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-brand-gold">€2.5B+</div>
              <p className="text-sm text-brand-grayMed">{t('investmentAdvisory.stats.aum')}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-brand-gold">5,000+</div>
              <p className="text-sm text-brand-grayMed">{t('investmentAdvisory.stats.clients')}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-brand-gold">25+</div>
              <p className="text-sm text-brand-grayMed">{t('investmentAdvisory.stats.experience')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('investmentAdvisory.cta.title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t('investmentAdvisory.cta.description')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/investment-advisory/schedule`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {t('investmentAdvisory.cta.schedule')}
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {t('investmentAdvisory.cta.learnMore')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
