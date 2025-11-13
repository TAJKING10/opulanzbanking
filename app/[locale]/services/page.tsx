"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calculator, Scale, TrendingUp, Heart, Building2, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const services = [
    {
      title: t('services.accounting.title'),
      description: t('services.accounting.description'),
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop',
      href: `/${locale}/invoicing-accounting`,
    },
    {
      title: t('nav.openAccount'),
      description: t('home.services.banking.description'),
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop',
      href: `/${locale}/open-account`,
    },
    {
      title: t('nav.companyFormation'),
      description: t('home.services.formation.description'),
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: `/${locale}/company-formation`,
    },
    {
      title: t('services.tax.title'),
      description: t('services.tax.description'),
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
      href: `/${locale}/tax-advisory`,
    },
    {
      title: t('services.investment.title'),
      description: t('services.investment.description'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      href: `/${locale}/investment-advisory`,
    },
    {
      title: t('services.lifeInsurance.title'),
      description: t('services.lifeInsurance.description'),
      image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=500&fit=crop',
      href: `/${locale}/life-insurance`,
    },
  ];

  const features = [
    {
      icon: Calculator,
      title: "Expert Financial Services",
      description: "Professional accounting, bookkeeping, and financial management services tailored to your business.",
    },
    {
      icon: Scale,
      title: "Tax Optimization",
      description: "Strategic tax planning and advisory services to minimize your tax burden while ensuring compliance.",
    },
    {
      icon: TrendingUp,
      title: "Investment Management",
      description: "Personalized investment strategies and wealth management to help you achieve your financial goals.",
    },
    {
      icon: Heart,
      title: "Insurance Solutions",
      description: "Comprehensive life insurance products to protect what matters most to you and your family.",
    },
    {
      icon: Building2,
      title: "Company Formation",
      description: "Complete support for establishing your business in Luxembourg with legal and regulatory guidance.",
    },
    {
      icon: CreditCard,
      title: "Banking Services",
      description: "Modern digital banking solutions with multi-currency accounts and international payment capabilities.",
    },
  ];

  const whyChooseUs = [
    "Regulated by ACPR and AMF for your peace of mind",
    "Over 25 years of combined expertise in financial services",
    "Personalized service from dedicated account managers",
    "Competitive rates and transparent fee structure",
    "Multi-lingual support in English and French",
    "Cutting-edge digital platforms for 24/7 access",
    "Comprehensive suite of services under one roof",
  ];

  return (
    <>
      <Hero
        title="Complete Financial Services for Your Success"
        subtitle="From banking to investment advisory, discover our comprehensive range of financial services designed to help individuals and businesses thrive in Luxembourg and beyond."
        primaryCta={{
          label: "Open an Account",
          href: `/${locale}/open-account`,
        }}
        secondaryCta={{
          label: "Explore Services",
          href: "#services",
        }}
      />

      {/* Services Grid Section */}
      <section id="services" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Services"
            title="Everything You Need Under One Roof"
            description="Explore our comprehensive range of financial services designed to support your personal and business goals."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Why Opulanz"
            title="Your Trusted Financial Partner"
            description="We provide comprehensive financial solutions with the expertise, security, and personalized service you deserve."
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

      {/* Why Choose Us Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                Why Choose Opulanz?
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                Opulanz brings together the best of traditional banking expertise and modern fintech innovation.
                As a fully regulated financial institution with presence in Luxembourg and France, we offer the
                security and reliability you need, combined with the flexibility and innovation you want.
              </p>
              <p className="mb-8 text-lg text-brand-grayMed">
                Whether you're an individual looking for banking and investment services, or a business seeking
                comprehensive financial solutions, we have the expertise and services to support your success.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <a href={`/${locale}/open-account`}>Get Started Today</a>
              </Button>
            </div>
            <div className="space-y-4">
              {whyChooseUs.map((reason) => (
                <div key={reason} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                  <p className="text-brand-dark">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Trusted & Regulated"
            title="Your Security is Our Priority"
            description="We are regulated by leading European financial authorities, ensuring the highest standards of security and compliance."
          />
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="text-center">
                <div className="mb-4 text-4xl font-bold text-brand-gold">ACPR</div>
                <CardTitle>{t('home.regulatory.france')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-brand-grayMed">{t('home.regulatory.acpr')}</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="text-center">
                <div className="mb-4 text-4xl font-bold text-brand-gold">AMF</div>
                <CardTitle>{t('home.regulatory.france')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-brand-grayMed">{t('home.regulatory.amf')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Experience Banking Excellence?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Join thousands of satisfied clients who trust Opulanz for their financial needs.
            Open your account today and discover the difference.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/open-account`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Open an Account
            </a>
            <a
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
