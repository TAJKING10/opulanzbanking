"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calculator, FileText, PieChart, Users, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvoicingAccountingPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const p = useTranslations("accounting.page");

  const featureItems = [
    { icon: FileText,    key: "invoicing" },
    { icon: Calculator,  key: "bookkeeping" },
    { icon: PieChart,    key: "reporting" },
    { icon: Users,       key: "payroll" },
    { icon: Shield,      key: "compliance" },
    { icon: TrendingUp,  key: "planning" },
  ] as const;

  const benefits: string[] = p.raw("whyUs.benefits") as string[];

  return (
    <>
      <PageGuidance
        pageKey="invoicing-accounting"
        locale={locale}
        title="Invoicing & Accounting"
        description="Streamline your business finances with our accounting tools."
        steps={[
          { content: "Welcome to Invoicing & Accounting. This platform handles your invoices, bookkeeping, payroll, and financial reporting — all in one place." },
          { title: "Platform Features", content: "These cards highlight the core features — automated invoicing, real-time bookkeeping, payroll management, and tax reporting.", target: "#features", position: "top" },
          { title: "Get Started", content: "Click 'Get Started' to begin your onboarding. You can import existing data from QuickBooks, Xero, or Excel.", target: "a[href*='onboarding']", position: "bottom" },
        ]}
        tip="You can import existing data from QuickBooks, Xero, or Excel during onboarding."
      />
      <Hero
        title={t("services.accounting.title")}
        subtitle={t("services.accounting.description")}
        primaryCta={{
          label: p("hero.getStarted"),
          href: `/${locale}/invoicing-accounting/onboarding`,
        }}
        secondaryCta={{
          label: p("hero.learnMore"),
          href: "#features",
        }}
      />

      {/* Features Section */}
      <section id="features" className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={p("features.overline")}
            title={p("features.title")}
            description={p("features.description")}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureItems.map(({ icon: Icon, key }) => (
              <Card key={key} className="border-none shadow-sm">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                    <Icon className="h-6 w-6 text-brand-gold" />
                  </div>
                  <CardTitle className="text-xl">{p(`features.items.${key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-grayMed">{p(`features.items.${key}.description`)}</p>
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
                <Link href={`/${locale}/invoicing-accounting/onboarding`}>{p("whyUs.cta")}</Link>
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
              href={`/${locale}/invoicing-accounting/onboarding`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {p("cta.getStarted")}
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {p("cta.contactSales")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
