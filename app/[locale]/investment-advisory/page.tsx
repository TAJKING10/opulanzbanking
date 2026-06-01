"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PieChart, BarChart3, Users, CheckCircle } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvestmentAdvisoryPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const p = useTranslations("investmentAdvisory.page");

  const serviceItems = [
    { icon: PieChart, key: "portfolio" },
    { icon: BarChart3, key: "strategy" },
    { icon: Users,    key: "retirement" },
  ] as const;

  const optionKeys = ["equities", "fixedIncome", "alternative", "sustainable"] as const;

  const benefits: string[] = p.raw("whyUs.benefits") as string[];

  return (
    <>
      <PageGuidance
        pageKey="investment-advisory"
        title="Investment Advisory"
        description="Grow your wealth with personalized investment strategies."
        steps={[
          { content: "Welcome to Investment Advisory. Our MiFID II-compliant advisors will build a strategy tailored to your goals and risk profile." },
          { title: "Our Services", content: "Here are all our investment services — portfolio management, retirement planning, ESG investing, and more. Browse and choose what fits your needs.", target: "#services", position: "top" },
          { title: "Schedule a Meeting", content: "Ready to get started? Click this button to schedule a free discovery call with one of our certified advisors.", target: "a[href*='investment-advisory/schedule']", position: "bottom" },
        ]}
        tip="All our advisors are MiFID II compliant and regulated by AMF/CSSF."
      />
      <Hero
        title={t("services.investment.title")}
        subtitle={t("services.investment.description")}
        primaryCta={{
          label: p("hero.scheduleMeeting"),
          href: `/${locale}/investment-advisory/schedule`,
        }}
        secondaryCta={{
          label: p("hero.ourServices"),
          href: "#services",
        }}
      />

      {/* Services Section */}
      <section id="services" className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={p("services.overline")}
            title={p("services.title")}
            description={p("services.description")}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceItems.map(({ icon: Icon, key }) => (
              <Card key={key} className="border-none shadow-sm">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                    <Icon className="h-6 w-6 text-brand-gold" />
                  </div>
                  <CardTitle className="text-xl">{p(`services.items.${key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-grayMed">{p(`services.items.${key}.description`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                {p("whyUs.title")}
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                {p("whyUs.description")}
              </p>
              <Button asChild size="lg" className="bg-brand-gold text-white hover:bg-brand-goldDark">
                <Link href={`/${locale}/investment-advisory/schedule`}>{p("whyUs.cta")}</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                  <p className="text-brand-dark">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment Options Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={p("options.overline")}
            title={p("options.title")}
            description={p("options.description")}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {optionKeys.map((key) => (
              <Card key={key} className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{p(`options.items.${key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-brand-grayMed">{p(`options.items.${key}.description`)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-dark">{p("options.riskLabel")}:</span>
                    <span className="text-xs text-brand-grayMed">{p(`options.items.${key}.risk`)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {(["aum", "clients", "experience"] as const).map((key) => (
              <div key={key} className="text-center">
                <div className="mb-2 text-4xl font-bold text-brand-gold">{p(`stats.${key}.value`)}</div>
                <p className="text-sm text-brand-grayMed">{p(`stats.${key}.label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {p("cta.title")}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {p("cta.description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/investment-advisory/schedule`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {p("cta.scheduleMeeting")}
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {p("cta.contactSupport")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
