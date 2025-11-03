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
      icon: Scale,
      title: "Tax Planning",
      description: "Strategic tax planning to minimize your tax liability while ensuring full compliance with regulations.",
    },
    {
      icon: FileCheck,
      title: "Tax Return Preparation",
      description: "Professional preparation and filing of corporate and individual tax returns across multiple jurisdictions.",
    },
    {
      icon: Globe,
      title: "International Tax",
      description: "Expert guidance on cross-border tax matters, transfer pricing, and double taxation treaties.",
    },
    {
      icon: Briefcase,
      title: "Corporate Tax",
      description: "Comprehensive corporate tax services including restructuring, M&A tax advice, and VAT consulting.",
    },
    {
      icon: Shield,
      title: "Tax Compliance",
      description: "Ensure ongoing compliance with changing tax laws and regulations in Luxembourg and beyond.",
    },
    {
      icon: UserCheck,
      title: "Personal Tax Advisory",
      description: "Personalized tax advice for high-net-worth individuals and expatriates.",
    },
  ];

  const benefits = [
    "Reduce tax burden through strategic planning",
    "Stay compliant with complex tax regulations",
    "Expert knowledge of Luxembourg and EU tax law",
    "Proactive advice on tax-efficient structures",
    "Support during tax audits and disputes",
    "Regular updates on tax law changes",
    "Multi-jurisdictional tax expertise",
  ];

  return (
    <>
      <Hero
        title={t('services.tax.title')}
        subtitle={t('services.tax.description')}
        primaryCta={{
          label: "Schedule Consultation",
          href: `/${locale}/tax-advisory/schedule`,
        }}
        secondaryCta={{
          label: "Our Services",
          href: "#services",
        }}
      />

      {/* Services Section */}
      <section id="services" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Tax Services"
            title="Expert Tax Advisory for Businesses & Individuals"
            description="Navigate complex tax regulations with confidence. Our experienced tax advisors provide strategic guidance to optimize your tax position."
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
                Trusted Tax Experts in Luxembourg
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                With decades of combined experience and deep knowledge of Luxembourg and international tax law,
                our team of certified tax advisors delivers practical, actionable advice that protects your
                interests and optimizes your tax position. We stay ahead of regulatory changes to keep you
                compliant and competitive.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <Link href={`/${locale}/tax-advisory/schedule`}>Book a Consultation</Link>
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

      {/* Expertise Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Expertise"
            title="Comprehensive Tax Coverage"
            description="From local compliance to international tax structures, we cover all aspects of tax advisory."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <TrendingDown className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-xl font-bold text-brand-dark">Tax Optimization</h3>
              <p className="text-sm text-brand-grayMed">Minimize tax burden legally and ethically</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-xl font-bold text-brand-dark">Compliance</h3>
              <p className="text-sm text-brand-grayMed">Full adherence to tax regulations</p>
            </div>
            <div className="text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-xl font-bold text-brand-dark">International</h3>
              <p className="text-sm text-brand-grayMed">Cross-border tax expertise</p>
            </div>
            <div className="text-center">
              <UserCheck className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-xl font-bold text-brand-dark">Personal Service</h3>
              <p className="text-sm text-brand-grayMed">Dedicated tax advisors for your needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Let's Optimize Your Tax Strategy
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Schedule a consultation with our tax experts to discover how we can help you reduce
            your tax burden while staying fully compliant.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/tax-advisory/schedule`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Schedule Consultation
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
