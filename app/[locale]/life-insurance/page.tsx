"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Shield, Users, TrendingUp, CheckCircle, FileText, DollarSign, Briefcase, Clock } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function LifeInsurancePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('lifeInsurance');
  const products = [
    {
      id: "term-life-insurance",
      icon: Clock,
      title: t('products.termLife.title'),
      description: t('products.termLife.description'),
      price: "€199",
      priceValue: 199,
      href: `/${locale}/life-insurance/booking?service=term-life-insurance`,
    },
    {
      id: "whole-life-insurance",
      icon: Heart,
      title: t('products.wholeLife.title'),
      description: t('products.wholeLife.description'),
      price: "€349",
      priceValue: 349,
      href: `/${locale}/life-insurance/booking?service=whole-life-insurance`,
    },
    {
      id: "universal-life-insurance",
      icon: TrendingUp,
      title: t('products.universalLife.title'),
      description: t('products.universalLife.description'),
      price: "€299",
      priceValue: 299,
      href: `/${locale}/life-insurance/booking?service=universal-life-insurance`,
    },
    {
      id: "variable-life-insurance",
      icon: DollarSign,
      title: t('products.variableLife.title'),
      description: t('products.variableLife.description'),
      price: "€399",
      priceValue: 399,
      href: `/${locale}/life-insurance/booking?service=variable-life-insurance`,
    },
    {
      id: "group-life-insurance",
      icon: Briefcase,
      title: t('products.groupLife.title'),
      description: t('products.groupLife.description'),
      price: "€149",
      priceValue: 149,
      href: `/${locale}/life-insurance/booking?service=group-life-insurance`,
    },
  ];

  const benefits = [
    t('overview.benefits.1'),
    t('overview.benefits.2'),
    t('overview.benefits.3'),
    t('overview.benefits.4'),
    t('overview.benefits.5'),
  ];

  return (
    <>
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        primaryCta={{
          label: t('hero.primaryCta'),
          href: `/${locale}/life-insurance/booking`,
        }}
        secondaryCta={{
          label: t('hero.secondaryCta'),
          href: "#products",
        }}
      />

      {/* Overview Section */}
      <section id="overview" className="relative bg-gradient-to-b from-white via-gray-50/30 to-gray-50 py-12 md:py-16 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SectionHeading
                overline={t('overview.overline')}
                title={t('overview.title')}
                align="left"
                className="mb-6"
              />
              <p className="text-lg text-brand-grayMed leading-relaxed">
                {t('overview.description')}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="group inline-flex items-center gap-2 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 px-4 py-2.5 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 transition-all hover:shadow-md">
                  <Shield className="h-5 w-5 text-brand-gold group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-brand-dark">{t('overview.badges.unbiased')}</span>
                </div>
                <div className="group inline-flex items-center gap-2 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 px-4 py-2.5 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 transition-all hover:shadow-md">
                  <Users className="h-5 w-5 text-brand-gold group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-brand-dark">{t('overview.badges.multipleProviders')}</span>
                </div>
                <div className="group inline-flex items-center gap-2 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 px-4 py-2.5 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 transition-all hover:shadow-md">
                  <Heart className="h-5 w-5 text-brand-gold group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-brand-dark">{t('overview.badges.familyProtection')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* 3D-style card effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl blur-xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-brand-grayLight/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark">{t('overview.whyChoose')}</h3>
                </div>
                <div className="space-y-4">
                  {benefits.map((benefit, idx) => (
                    <div key={benefit} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-brand-gold/5 transition-colors">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                        <span className="text-xs font-bold text-brand-gold">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-brand-dark leading-relaxed pt-0.5">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="relative bg-gray-50 py-16 md:py-20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t('products.overline')}
            title={t('products.title')}
            description={t('products.description')}
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => {
              const Icon = product.icon;
              return (
                <Link key={product.id} href={product.href}>
                  <div className="group relative h-full">
                    {/* 3D shadow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2"></div>
                    <Card className="relative border-none shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 h-full cursor-pointer bg-white/80 backdrop-blur-sm">
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="relative">
                            {/* Glowing effect behind icon */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold to-brand-goldDark rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                              <Icon className="h-7 w-7 text-white" />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-brand-gold/40 bg-brand-gold/10 px-2 py-1 rounded-full">0{idx + 1}</span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-brand-gold transition-colors">{product.title}</CardTitle>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-brand-gold group-hover:scale-105 inline-block transition-transform">{product.price}</span>
                          <span className="text-sm text-brand-grayMed ml-2">consultation</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-brand-grayMed leading-relaxed">{product.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-white py-16 md:py-20 overflow-hidden">
        {/* Decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t('process.overline')}
            title={t('process.title')}
            align="center"
            className="mb-12"
          />
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: 1, title: t('process.steps.1.title'), desc: t('process.steps.1.description') },
              { num: 2, title: t('process.steps.2.title'), desc: t('process.steps.2.description') },
              { num: 3, title: t('process.steps.3.title'), desc: t('process.steps.3.description') },
              { num: 4, title: t('process.steps.4.title'), desc: t('process.steps.4.description') }
            ].map((step, idx) => (
              <div key={step.num} className="group text-center relative">
                {/* 3D number circle with glow */}
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white text-2xl font-bold shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                    <span className="relative z-10">{step.num}</span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-brand-dark mb-2 group-hover:text-brand-gold transition-colors">{step.title}</h3>
                <p className="text-sm text-brand-grayMed leading-relaxed">{step.desc}</p>

                {/* Animated connecting line */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 -translate-x-1/2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-gold/40 via-brand-gold/20 to-brand-gold/40"></div>
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-brand-gold to-transparent animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('features.overline')}
            title={t('features.title')}
            description={t('features.description')}
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: t('features.expertBrokers.title'), desc: t('features.expertBrokers.description') },
              { icon: FileText, title: t('features.needsAnalysis.title'), desc: t('features.needsAnalysis.description') },
              { icon: TrendingUp, title: t('features.wealthBuilding.title'), desc: t('features.wealthBuilding.description') },
              { icon: Users, title: t('features.ongoingSupport.title'), desc: t('features.ongoingSupport.description') }
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group relative">
                  {/* 3D layered shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 translate-y-2 blur-sm"></div>

                  <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-grayLight/50 group-hover:-translate-y-1 group-hover:border-brand-gold/30">
                    {/* Animated icon container */}
                    <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Icon className="relative z-10 h-7 w-7 text-brand-gold group-hover:scale-110 transition-transform" />
                    </div>

                    <h3 className="mb-3 text-lg font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{feature.title}</h3>
                    <p className="text-sm text-brand-grayMed leading-relaxed">{feature.desc}</p>

                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-gold/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t('cta.title')}
              </h2>
              <p className="mx-auto max-w-2xl text-balance text-lg text-white/90">
                {t('cta.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center bg-white/10 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">{t('cta.benefits.consultation')}</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">{t('cta.benefits.compare')}</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">{t('cta.benefits.guidance')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`/${locale}/life-insurance/booking`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-lg transition-all hover:bg-gray-50 hover:scale-105"
              >
                {t('cta.primaryButton')}
              </a>
              <a
                href={`/${locale}/life-insurance/booking`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl border-2 border-white bg-white/10 px-8 text-base font-semibold text-white transition-all hover:bg-white/20"
              >
                {t('cta.secondaryButton')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
