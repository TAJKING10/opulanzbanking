"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calculator, FileText, PieChart, Users, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvoicingAccountingPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const features = [
    {
      icon: FileText,
      title: "Professional Invoicing",
      description: "Create and send professional invoices with automated payment reminders and tracking.",
    },
    {
      icon: Calculator,
      title: "Bookkeeping Services",
      description: "Comprehensive bookkeeping services to keep your financial records accurate and up-to-date.",
    },
    {
      icon: PieChart,
      title: "Financial Reporting",
      description: "Detailed financial reports and insights to help you make informed business decisions.",
    },
    {
      icon: Users,
      title: "Payroll Management",
      description: "Efficient payroll processing with automated tax calculations and compliance.",
    },
    {
      icon: Shield,
      title: "Compliance & Audit",
      description: "Ensure compliance with local regulations and prepare for audits with confidence.",
    },
    {
      icon: TrendingUp,
      title: "Financial Planning",
      description: "Strategic financial planning and analysis to support your business growth.",
    },
  ];

  const benefits = [
    "Save time with automated invoicing and bookkeeping",
    "Reduce errors with professional accounting expertise",
    "Stay compliant with local tax regulations",
    "Get real-time insights into your financial health",
    "Focus on growing your business while we handle the numbers",
    "Secure cloud-based access to your financial data anytime",
  ];

  return (
    <>
      <Hero
        title={t('services.accounting.title')}
        subtitle={t('services.accounting.description')}
        primaryCta={{
          label: "Get Started",
          href: `/${locale}/invoicing-accounting/onboarding`,
        }}
        secondaryCta={{
          label: t("common.learnMore"),
          href: "#features",
        }}
      />

      {/* Features Section */}
      <section id="features" className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Services"
            title="Complete Accounting Solutions for Your Business"
            description="From invoicing to financial reporting, we provide comprehensive accounting services tailored to your business needs."
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

      {/* Benefits Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                Why Choose Our Accounting Services?
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                We combine cutting-edge technology with expert financial knowledge to deliver accounting
                services that help your business thrive. Our team of certified accountants ensures accuracy,
                compliance, and strategic insights for your financial success.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <Link href={`/${locale}/invoicing-accounting/onboarding`}>Get Started</Link>
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

      {/* CTA Section */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Streamline Your Finances?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Join thousands of businesses that trust us with their accounting and invoicing needs.
            Get started today and experience the difference.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/invoicing-accounting/onboarding`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Get Started
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
