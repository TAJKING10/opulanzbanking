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
      icon: FileCheck,
      title: "Tax Return Preparation",
      description: "Professional preparation and filing of corporate and individual tax returns across multiple jurisdictions.",
      href: `/${locale}/tax-advisory/tax-return-preparation`,
      price: "€299",
    },
    {
      icon: Globe,
      title: "International Tax",
      description: "Expert guidance on cross-border tax matters, transfer pricing, and double taxation treaties.",
      href: `/${locale}/tax-advisory/international-tax`,
      price: "€250",
    },
    {
      icon: Briefcase,
      title: "Corporate Tax",
      description: "Comprehensive corporate tax services including restructuring, M&A tax advice, and VAT consulting.",
      href: `/${locale}/tax-advisory/corporate-tax`,
      price: "€150",
    },
    {
      icon: Shield,
      title: "Tax Compliance",
      description: "Ensure ongoing compliance with changing tax laws and regulations in Luxembourg and beyond.",
      href: `/${locale}/tax-advisory/tax-compliance`,
      price: "€250",
    },
    {
      icon: UserCheck,
      title: "Personal Tax Advisory",
      description: "Personalized tax advice for high-net-worth individuals and expatriates.",
      href: `/${locale}/tax-advisory/personal-tax-advisory`,
      price: "€100",
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
          href: `/${locale}/tax-advisory/booking`,
        }}
        secondaryCta={{
          label: "Our Services",
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
            overline="Tax Services"
            title="Expert Tax Advisory for Businesses & Individuals"
            description="Navigate complex tax regulations with confidence. Our experienced tax advisors provide strategic guidance to optimize your tax position."
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
                  Trusted Tax Experts in Luxembourg
                </h2>
                <p className="mb-8 text-lg text-brand-grayMed">
                  With decades of combined experience and deep knowledge of Luxembourg and international tax law,
                  our team of certified tax advisors delivers practical, actionable advice that protects your
                  interests and optimizes your tax position. We stay ahead of regulatory changes to keep you
                  compliant and competitive.
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
            overline="Our Expertise"
            title="Comprehensive Tax Coverage"
            description="From local compliance to international tax structures, we cover all aspects of tax advisory."
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
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">Tax Optimization</h3>
              <p className="text-sm text-brand-grayMed">Minimize tax burden legally and ethically</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <Shield className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">Compliance</h3>
              <p className="text-sm text-brand-grayMed">Full adherence to tax regulations</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <Globe className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">International</h3>
              <p className="text-sm text-brand-grayMed">Cross-border tax expertise</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <UserCheck className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">Personal Service</h3>
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
              href={`/${locale}/tax-advisory/booking`}
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
