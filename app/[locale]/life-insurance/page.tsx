"use client";

import * as React from "react";
import { Heart, Shield, Users, TrendingUp, CheckCircle, FileText, DollarSign, Briefcase, Clock } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LifeInsurancePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("lifeInsurance");
  const tCommon = useTranslations("common");

  const products = [
    { icon: Clock,       key: "term" },
    { icon: Heart,       key: "whole" },
    { icon: TrendingUp,  key: "universal" },
    { icon: DollarSign,  key: "variable" },
    { icon: Briefcase,   key: "group" },
  ] as const;

  const benefits = [
    t("overview.benefit1"),
    t("overview.benefit2"),
    t("overview.benefit3"),
    t("overview.benefit4"),
    t("overview.benefit5"),
  ];

  const steps = [
    { num: 1, titleKey: "howItWorks.step1.title", descKey: "howItWorks.step1.description" },
    { num: 2, titleKey: "howItWorks.step2.title", descKey: "howItWorks.step2.description" },
    { num: 3, titleKey: "howItWorks.step3.title", descKey: "howItWorks.step3.description" },
    { num: 4, titleKey: "howItWorks.step4.title", descKey: "howItWorks.step4.description" },
  ] as const;

  const features = [
    { icon: Shield,    titleKey: "features.brokers.title", descKey: "features.brokers.description" },
    { icon: FileText,  titleKey: "features.analysis.title", descKey: "features.analysis.description" },
    { icon: TrendingUp,titleKey: "features.wealth.title",  descKey: "features.wealth.description" },
    { icon: Users,     titleKey: "features.support.title", descKey: "features.support.description" },
  ] as const;

  return (
    <>
      <PageGuidance
        pageKey="life-insurance"
        title="Life Insurance"
        description="Explore our life insurance products and find the right coverage for you."
        steps={[
          "Review the different insurance product types below",
          "Click a product to see full details and benefits",
          "Use the 'Get a Quote' button to start your application",
          "A licensed advisor will contact you to finalize your plan",
        ]}
        tip="Term life insurance is the most affordable option for most individuals."
      />
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={{
          label: t("hero.primaryCta"),
          href: `/${locale}/life-insurance/schedule`,
        }}
        secondaryCta={{
          label: tCommon("learnMore"),
          href: "#overview",
        }}
      />

      {/* Overview Section */}
      <section id="overview" className="relative bg-gradient-to-b from-white via-gray-50/30 to-gray-50 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SectionHeading
                overline={t("overview.overline")}
                title={t("overview.title")}
                align="left"
                className="mb-6"
              />
              <p className="text-lg text-brand-grayMed leading-relaxed">
                {t("overview.description")}
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, key: "badge1" },
                  { icon: Users,  key: "badge2" },
                  { icon: Heart,  key: "badge3" },
                ].map(({ icon: Icon, key }) => (
                  <div key={key} className="group inline-flex items-center gap-2 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 px-4 py-2.5 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 transition-all hover:shadow-md">
                    <Icon className="h-5 w-5 text-brand-gold group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-brand-dark">{t(`overview.${key}` as any)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl blur-xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-brand-grayLight/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark">{t("overview.whyBrokerTitle")}</h3>
                </div>
                <div className="space-y-4">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-brand-gold/5 transition-colors">
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
      <section id="products" className="relative bg-gray-50 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t("products.overline")}
            title={t("products.title")}
            description={t("products.description")}
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => {
              const Icon = product.icon;
              return (
                <div key={product.key} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2"></div>
                  <Card className="relative border-none shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold to-brand-goldDark rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-gold/40 bg-brand-gold/10 px-2 py-1 rounded-full">0{idx + 1}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-brand-gold transition-colors">
                        {t(`products.${product.key}.title` as any)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-brand-grayMed leading-relaxed">
                        {t(`products.${product.key}.description` as any)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t("howItWorks.overline")}
            title={t("howItWorks.title")}
            align="center"
            className="mb-12"
          />
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={step.num} className="group text-center relative">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white text-2xl font-bold shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                    <span className="relative z-10">{step.num}</span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-brand-dark mb-2 group-hover:text-brand-gold transition-colors">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-brand-grayMed leading-relaxed">{t(step.descKey)}</p>
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
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t("features.overline")}
            title={t("features.title")}
            description={t("features.description")}
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.titleKey} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 translate-y-2 blur-sm"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-grayLight/50 group-hover:-translate-y-1 group-hover:border-brand-gold/30">
                    <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Icon className="relative z-10 h-7 w-7 text-brand-gold group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-brand-dark group-hover:text-brand-gold transition-colors">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-brand-grayMed leading-relaxed">{t(feature.descKey)}</p>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-gold/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t("cta.title")}
              </h2>
              <p className="mx-auto max-w-2xl text-balance text-lg text-white/90">
                {t("cta.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {(["badge1", "badge2", "badge3"] as const).map((key) => (
                <div key={key} className="text-center bg-white/10 rounded-xl p-4">
                  <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="text-sm text-white font-semibold">{t(`cta.${key}`)}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`/${locale}/life-insurance/schedule`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-lg transition-all hover:bg-gray-50 hover:scale-105"
              >
                {t("cta.primaryButton")}
              </a>
              <a
                href={`/${locale}/life-insurance/schedule`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl border-2 border-white bg-white/10 px-8 text-base font-semibold text-white transition-all hover:bg-white/20"
              >
                {t("cta.secondaryButton")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
