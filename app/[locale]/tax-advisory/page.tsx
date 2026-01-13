"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Scale, FileCheck, Briefcase, Globe, CheckCircle, Shield, TrendingDown, UserCheck } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaxAdvisoryPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const services = [
    {
      id: "tax-return-preparation",
      icon: FileCheck,
      title: t('taxAdvisory.services.taxReturn.title'),
      description: t('taxAdvisory.services.taxReturn.description'),
      href: `/${locale}/tax-advisory/booking?service=tax-return-preparation`,
      price: "€299",
      priceValue: 299,
    },
    {
      id: "international-tax",
      icon: Globe,
      title: t('taxAdvisory.services.international.title'),
      description: t('taxAdvisory.services.international.description'),
      href: `/${locale}/tax-advisory/booking?service=international-tax`,
      price: "€250",
      priceValue: 250,
    },
    {
      id: "corporate-tax",
      icon: Briefcase,
      title: t('taxAdvisory.services.corporate.title'),
      description: t('taxAdvisory.services.corporate.description'),
      href: `/${locale}/tax-advisory/booking?service=corporate-tax`,
      price: "€150",
      priceValue: 150,
    },
    {
      id: "tax-compliance",
      icon: Shield,
      title: t('taxAdvisory.services.compliance.title'),
      description: t('taxAdvisory.services.compliance.description'),
      href: `/${locale}/tax-advisory/booking?service=tax-compliance`,
      price: "€250",
      priceValue: 250,
    },
    {
      id: "personal-tax-advisory",
      icon: UserCheck,
      title: t('taxAdvisory.services.personal.title'),
      description: t('taxAdvisory.services.personal.description'),
      href: `/${locale}/tax-advisory/booking?service=personal-tax-advisory`,
      price: "€100",
      priceValue: 100,
    },
  ];

  const benefits = [
    t('taxAdvisory.benefits.1'),
    t('taxAdvisory.benefits.2'),
    t('taxAdvisory.benefits.3'),
    t('taxAdvisory.benefits.4'),
    t('taxAdvisory.benefits.5'),
    t('taxAdvisory.benefits.6'),
    t('taxAdvisory.benefits.7'),
  ];

  return (
    <>
      <Hero
        title={t('services.tax.title')}
        subtitle={t('services.tax.description')}
        primaryCta={{
          label: t('taxAdvisory.hero.primaryCta'),
          href: `/${locale}/tax-advisory/booking`,
        }}
        secondaryCta={{
          label: t('taxAdvisory.hero.secondaryCta'),
          href: "#services",
        }}
      />

      {/* Services Section */}
      <section id="services" className="relative bg-white py-20 md:py-28 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-goldLight/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t('taxAdvisory.services.overline')}
            title={t('taxAdvisory.services.title')}
            description={t('taxAdvisory.services.description')}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.title} href={service.href}>
                  <div className="group relative h-full">
                    {/* 3D shadow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2"></div>
                    <Card className="relative border-none shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 h-full cursor-pointer bg-white/80 backdrop-blur-sm">
                      <CardHeader className="space-y-4">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-xl group-hover:text-brand-gold transition-colors">{service.title}</CardTitle>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-brand-gold group-hover:scale-105 inline-block transition-transform">{service.price}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-brand-grayMed">{service.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative bg-gray-50 py-20 md:py-28 overflow-hidden">
        {/* Decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              {/* 3D-style card effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl blur-xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-brand-grayLight/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                  {t('taxAdvisory.whyChoose.title')}
                </h2>
                <p className="mb-8 text-lg text-brand-grayMed">
                  {t('taxAdvisory.whyChoose.description')}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit}
                  className="group flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-x-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <CheckCircle className="relative mt-1 h-5 w-5 flex-shrink-0 text-brand-gold group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-brand-dark group-hover:text-brand-dark/90 transition-colors">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="relative bg-white py-20 md:py-28 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-goldLight/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t('taxAdvisory.expertise.overline')}
            title={t('taxAdvisory.expertise.title')}
            description={t('taxAdvisory.expertise.description')}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <TrendingDown className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('taxAdvisory.expertise.optimization.title')}</h3>
              <p className="text-sm text-brand-grayMed">{t('taxAdvisory.expertise.optimization.description')}</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <Shield className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('taxAdvisory.expertise.compliance.title')}</h3>
              <p className="text-sm text-brand-grayMed">{t('taxAdvisory.expertise.compliance.description')}</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <Globe className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('taxAdvisory.expertise.international.title')}</h3>
              <p className="text-sm text-brand-grayMed">{t('taxAdvisory.expertise.international.description')}</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <UserCheck className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('taxAdvisory.expertise.personal.title')}</h3>
              <p className="text-sm text-brand-grayMed">{t('taxAdvisory.expertise.personal.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('taxAdvisory.cta.title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t('taxAdvisory.cta.description')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/tax-advisory/booking`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {t('taxAdvisory.cta.schedule')}
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {t('taxAdvisory.cta.contact')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
