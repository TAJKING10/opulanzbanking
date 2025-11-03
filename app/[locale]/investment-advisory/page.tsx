"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { TrendingUp, PieChart, Shield, Target, CheckCircle, Wallet, BarChart3, Users } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvestmentAdvisoryPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const services = [
    {
      icon: Target,
      title: "Wealth Management",
      description: "Comprehensive wealth management solutions tailored to your financial goals and risk profile.",
    },
    {
      icon: PieChart,
      title: "Portfolio Diversification",
      description: "Strategic asset allocation across multiple investment classes to optimize returns and manage risk.",
    },
    {
      icon: BarChart3,
      title: "Investment Strategy",
      description: "Customized investment strategies aligned with your long-term financial objectives.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Sophisticated risk assessment and mitigation strategies to protect your investments.",
    },
    {
      icon: Wallet,
      title: "Asset Management",
      description: "Professional management of your investment portfolio with regular performance reviews.",
    },
    {
      icon: Users,
      title: "Retirement Planning",
      description: "Strategic retirement planning to ensure financial security in your golden years.",
    },
  ];

  const benefits = [
    "Access to exclusive investment opportunities",
    "Personalized investment strategies",
    "Regular portfolio rebalancing",
    "Transparent fee structure",
    "Expert market analysis and insights",
    "Tax-efficient investment solutions",
    "Ongoing portfolio monitoring and reporting",
  ];

  const investmentOptions = [
    {
      title: "Equities",
      description: "Global stock market investments with growth potential",
      risk: "Medium to High",
    },
    {
      title: "Fixed Income",
      description: "Bonds and other debt securities for stable returns",
      risk: "Low to Medium",
    },
    {
      title: "Alternative Investments",
      description: "Private equity, real estate, and hedge funds",
      risk: "Medium to High",
    },
    {
      title: "Sustainable Investing",
      description: "ESG-focused investments for responsible growth",
      risk: "Medium",
    },
  ];

  return (
    <>
      <Hero
        title={t('services.investment.title')}
        subtitle={t('services.investment.description')}
        primaryCta={{
          label: "Schedule Meeting",
          href: `/${locale}/investment-advisory/schedule`,
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
            overline="Investment Services"
            title="Professional Investment Advisory"
            description="Build and grow your wealth with expert investment guidance tailored to your unique financial situation."
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
                Grow Your Wealth with Confidence
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                Our investment advisory team brings decades of experience in global markets and financial planning.
                We combine sophisticated analysis with personalized service to help you achieve your financial goals.
                Whether you're planning for retirement, building wealth, or seeking passive income, we provide the
                expertise and support you need.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <Link href={`/${locale}/investment-advisory/schedule`}>Schedule Consultation</Link>
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

      {/* Investment Options Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Investment Options"
            title="Diverse Investment Opportunities"
            description="Access a wide range of investment vehicles tailored to your risk tolerance and financial objectives."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {investmentOptions.map((option) => (
              <Card key={option.title} className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-brand-grayMed">{option.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-dark">Risk Level:</span>
                    <span className="text-xs text-brand-grayMed">{option.risk}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-brand-gold">€2.5B+</div>
              <p className="text-sm text-brand-grayMed">Assets Under Management</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-brand-gold">5,000+</div>
              <p className="text-sm text-brand-grayMed">Satisfied Clients</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-brand-gold">25+</div>
              <p className="text-sm text-brand-grayMed">Years of Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Start Building Your Investment Portfolio
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Take the first step towards financial freedom. Schedule a consultation with our
            investment advisors and discover how we can help you reach your financial goals.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/investment-advisory/schedule`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Schedule Meeting
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
