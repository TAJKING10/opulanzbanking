"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  FileText,
  Shield,
  Users,
  CheckCircle,
  Lock,
  Building2,
  Globe,
  ArrowRight,
  ClipboardList,
  Send,
  PenLine,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MortgagePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations("mortgage");
  const tCommon = useTranslations("common");

  const steps = [
    { num: 1, icon: ClipboardList, titleKey: "howItWorks.step1.title", descKey: "howItWorks.step1.description" },
    { num: 2, icon: FileText,      titleKey: "howItWorks.step2.title", descKey: "howItWorks.step2.description" },
    { num: 3, icon: Send,          titleKey: "howItWorks.step3.title", descKey: "howItWorks.step3.description" },
    { num: 4, icon: PenLine,       titleKey: "howItWorks.step4.title", descKey: "howItWorks.step4.description" },
  ] as const;

  const features = [
    { icon: Globe,     titleKey: "features.expertise.title", descKey: "features.expertise.description" },
    { icon: Lock,      titleKey: "features.secure.title",    descKey: "features.secure.description" },
    { icon: Building2, titleKey: "features.multibank.title", descKey: "features.multibank.description" },
    { icon: CheckCircle, titleKey: "features.tracking.title", descKey: "features.tracking.description" },
  ] as const;

  const benefits = [
    t("overview.benefit1"),
    t("overview.benefit2"),
    t("overview.benefit3"),
    t("overview.benefit4"),
    t("overview.benefit5"),
  ];

  const luFacts = [
    t("markets.lu.fact1"),
    t("markets.lu.fact2"),
    t("markets.lu.fact3"),
    t("markets.lu.fact4"),
  ];

  const frFacts = [
    t("markets.fr.fact1"),
    t("markets.fr.fact2"),
    t("markets.fr.fact3"),
    t("markets.fr.fact4"),
  ];

  return (
    <>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={{
          label: t("hero.primaryCta"),
          href: `/${locale}/support`,
        }}
        secondaryCta={{
          label: t("hero.secondaryCta"),
          href: "#how-it-works",
        }}
      />

      {/* Overview */}
      <section
        id="overview"
        className="relative bg-gradient-to-b from-white via-gray-50/30 to-gray-50 py-12 md:py-16 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
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
                {(["badge1", "badge2", "badge3"] as const).map((key) => (
                  <div
                    key={key}
                    className="group inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-brand-grayLight hover:border-brand-gold/40 transition-all hover:shadow-md"
                  >
                    <Home className="h-4 w-4 text-brand-gold" />
                    <span className="text-sm font-semibold text-brand-dark">
                      {t(`overview.${key}` as any)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 divide-x divide-brand-grayLight border border-brand-grayLight rounded-2xl overflow-hidden mt-4">
                {[
                  { num: "19+", label: "Years of expertise" },
                  { num: "12+", label: "Partner banks" },
                  { num: "2",   label: "Markets covered" },
                  { num: "24h", label: "Response time" },
                ].map((s) => (
                  <div key={s.label} className="bg-white py-5 px-4 text-center">
                    <div className="text-2xl font-extrabold text-brand-gold tracking-tight leading-none mb-1">{s.num}</div>
                    <div className="text-xs text-brand-grayMed leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl blur-xl transform translate-x-4 translate-y-4" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-brand-grayLight/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark">
                    {t("overview.whyTitle")}
                  </h3>
                </div>
                <div className="space-y-4">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-brand-gold/5 transition-colors"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                        <span className="text-xs font-bold text-brand-gold">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-sm text-brand-dark leading-relaxed pt-0.5">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative bg-white py-12 md:py-16 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30" />

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t("howItWorks.overline")}
            title={t("howItWorks.title")}
            align="center"
            className="mb-12"
          />
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="group text-center relative">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                      <Icon className="h-7 w-7 relative z-10" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent" />
                    </div>
                  </div>
                  <div className="mb-2 text-xs font-bold text-brand-gold/60 uppercase tracking-widest">
                    Step {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2 group-hover:text-brand-gold transition-colors">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-brand-grayMed leading-relaxed">
                    {t(step.descKey)}
                  </p>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 -translate-x-1/2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-gold/40 via-brand-gold/20 to-brand-gold/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative bg-gradient-to-b from-gray-50 to-white py-12 md:py-16"
      >
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
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 translate-y-2 blur-sm" />
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-grayLight/50 group-hover:-translate-y-1 group-hover:border-brand-gold/30">
                    <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                      <Icon className="relative z-10 h-7 w-7 text-brand-gold group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-brand-dark group-hover:text-brand-gold transition-colors">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-brand-grayMed leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Markets — France & Luxembourg */}
      <section className="relative bg-white py-12 md:py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-goldLight/10 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t("markets.overline")}
            title={t("markets.title")}
            description={t("markets.description")}
            className="mb-10"
          />

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Luxembourg */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2" />
              <Card className="relative border-none shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-white/80 backdrop-blur-sm h-full">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🇱🇺</span>
                    <div>
                      <CardTitle className="text-xl group-hover:text-brand-gold transition-colors">
                        {t("markets.lu.title")}
                      </CardTitle>
                      <p className="text-sm text-brand-grayMed mt-1">
                        {t("markets.lu.subtitle")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {luFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-brand-grayMed">
                        <ArrowRight className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* France */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2" />
              <Card className="relative border-none shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-white/80 backdrop-blur-sm h-full">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🇫🇷</span>
                    <div>
                      <CardTitle className="text-xl group-hover:text-brand-gold transition-colors">
                        {t("markets.fr.title")}
                      </CardTitle>
                      <p className="text-sm text-brand-grayMed mt-1">
                        {t("markets.fr.subtitle")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {frFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-brand-grayMed">
                        <ArrowRight className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cross-border — two-panel card */}
          <div className="rounded-2xl overflow-hidden border border-brand-gold/20 shadow-lg grid md:grid-cols-[260px_1fr]">
            {/* Gold left panel */}
            <div className="relative bg-gradient-to-br from-brand-goldDark via-brand-gold to-[#C8A96A] p-8 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/7 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div className="text-xs font-bold tracking-widest uppercase text-white/70 mb-2">Coverage</div>
                <div className="text-xl font-extrabold text-white leading-tight">Cross-Border<br />Expertise</div>
              </div>
              <div className="relative z-10 flex flex-col gap-2 mt-8">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-2 text-sm font-bold text-white">
                  🇱🇺 Luxembourg
                </div>
                <div className="pl-4">
                  <ArrowRight className="h-4 w-4 text-white/50 rotate-90" />
                </div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-2 text-sm font-bold text-white">
                  🇫🇷 France
                </div>
              </div>
            </div>

            {/* Content right panel */}
            <div className="bg-white p-8 flex flex-col justify-center gap-5">
              <h3 className="text-xl font-bold text-brand-dark">
                {t("markets.crossborder.title")}
              </h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">
                {t("markets.crossborder.description")}
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "Luxembourg residents purchasing property in France",
                  "French nationals acquiring property in Luxembourg",
                  "International professionals in the Greater Region",
                ].map((profile) => (
                  <div key={profile} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-brand-grayLight text-sm text-brand-dark">
                    <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                    {profile}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal notice */}
      <div className="bg-gray-50 py-6 px-6">
        <div className="container mx-auto max-w-7xl">
          <p className="text-xs text-brand-grayMed text-center leading-relaxed">
            {t("legal")}
          </p>
        </div>
      </div>

      {/* CTA */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t("cta.title")}
              </h2>
              <p className="mx-auto max-w-2xl text-balance text-lg text-white/90">
                {t("cta.description")}
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
              <Link
                href={`/${locale}/support`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
              >
                {t("cta.primaryButton")}
              </Link>
              <Link
                href={`/${locale}/support`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl border-2 border-white bg-white/10 px-8 text-base font-semibold text-white transition-all hover:bg-white/20"
              >
                {t("cta.secondaryButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
