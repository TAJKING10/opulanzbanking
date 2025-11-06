"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Heart, Shield, Users, Home, CheckCircle, Umbrella, Baby, Briefcase } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LifeInsurancePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const products = [
    {
      icon: Shield,
      title: "Term Life Insurance",
      description: "Affordable coverage for a specific period to protect your loved ones during critical years.",
    },
    {
      icon: Heart,
      title: "Whole Life Insurance",
      description: "Permanent coverage with cash value accumulation for lifelong protection and financial growth.",
    },
    {
      icon: Users,
      title: "Family Protection",
      description: "Comprehensive coverage designed to secure your family's financial future.",
    },
    {
      icon: Home,
      title: "Mortgage Protection",
      description: "Ensure your mortgage is paid off if something happens, keeping your family in their home.",
    },
    {
      icon: Baby,
      title: "Child Education Plans",
      description: "Build funds for your children's education while providing insurance protection.",
    },
    {
      icon: Briefcase,
      title: "Key Person Insurance",
      description: "Protect your business against the loss of key executives or employees.",
    },
  ];

  const benefits = [
    "Financial security for your loved ones",
    "Tax-advantaged savings component",
    "Flexible premium payment options",
    "Coverage customized to your needs",
    "Protection against critical illness",
    "Estate planning benefits",
    "Peace of mind for you and your family",
  ];

  const coverageOptions = [
    {
      type: "Basic Coverage",
      amount: "€100,000 - €500,000",
      features: ["Death benefit", "Affordable premiums", "Simple application"],
    },
    {
      type: "Enhanced Coverage",
      amount: "€500,000 - €2,000,000",
      features: ["Higher coverage", "Critical illness rider", "Disability waiver"],
    },
    {
      type: "Premium Coverage",
      amount: "€2,000,000+",
      features: ["Maximum protection", "Investment options", "Estate planning"],
    },
  ];

  return (
    <>
      <Hero
        title={t('services.lifeInsurance.title')}
        subtitle={t('services.lifeInsurance.description')}
        primaryCta={{
          label: "Get a Quote",
          href: `/${locale}/insurance`,
        }}
        secondaryCta={{
          label: "Learn More",
          href: "#products",
        }}
      />

      {/* Products Section */}
      <section id="products" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Products"
            title="Comprehensive Life Insurance Solutions"
            description="Protect what matters most with our range of life insurance products designed for every stage of life."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <Card key={product.title} className="border-none shadow-sm">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <CardTitle className="text-xl">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-grayMed">{product.description}</p>
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
                Secure Your Family's Future
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                Life insurance is more than just a policy—it's a promise to protect those you love most.
                Our experienced advisors work with you to understand your unique situation and recommend
                coverage that fits your needs and budget. With flexible options and competitive rates,
                we make it easy to get the protection your family deserves.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <a href={`/${locale}/insurance`}>Get Started Today</a>
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

      {/* Coverage Options Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Coverage Options"
            title="Choose the Right Protection Level"
            description="Select from our flexible coverage options designed to meet your specific needs and budget."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {coverageOptions.map((option) => (
              <Card key={option.type} className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{option.type}</CardTitle>
                  <div className="mt-2 text-2xl font-bold text-brand-gold">{option.amount}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                        <span className="text-sm text-brand-grayMed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Simple Process"
            title="How to Get Coverage"
            description="Getting life insurance is easier than you think. Follow these simple steps."
          />
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Get a Quote</h3>
              <p className="text-sm text-brand-grayMed">Answer a few questions to receive your personalized quote</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Choose Coverage</h3>
              <p className="text-sm text-brand-grayMed">Select the policy that best fits your needs and budget</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Complete Application</h3>
              <p className="text-sm text-brand-grayMed">Fill out the application and undergo medical evaluation if needed</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-2xl font-bold text-white">
                4
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Get Protected</h3>
              <p className="text-sm text-brand-grayMed">Your coverage begins and your family is protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Protect Your Loved Ones Today
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Don't wait to secure your family's financial future. Get a free quote and discover
            how affordable life insurance can be.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/insurance`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Get Free Quote
            </a>
            <a
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Talk to an Advisor
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
