"use client";

import * as React from "react";
import { Heart, Shield, Users, TrendingUp, CheckCircle, FileText, DollarSign, Briefcase, Clock } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LifeInsurancePage({ params: { locale } }: { params: { locale: string } }) {

  const products = [
    {
      icon: Clock,
      title: "Term Life Insurance",
      description: "10, 20, or 30-year term options with level premiums for affordable protection during your most critical years.",
    },
    {
      icon: Heart,
      title: "Whole Life Insurance",
      description: "Lifetime coverage with cash value accumulation that provides permanent protection and financial growth.",
    },
    {
      icon: TrendingUp,
      title: "Universal Life Insurance",
      description: "Flexible premiums and adjustable death benefits that adapt to your changing financial situation.",
    },
    {
      icon: DollarSign,
      title: "Variable Life Insurance",
      description: "Investment-linked cash value growth that allows you to potentially increase your policy's value over time.",
    },
    {
      icon: Briefcase,
      title: "Group Life Insurance",
      description: "Employer-sponsored life insurance plans that provide coverage at competitive group rates.",
    },
  ];

  const benefits = [
    "Specialized expertise in life insurance products",
    "Personalized needs analysis and coverage recommendations",
    "Advanced features like living benefits and estate planning",
    "Tax-advantaged wealth building strategies",
    "Ongoing policy management and support",
  ];

  return (
    <>
      <Hero
        title="Life Insurance Services"
        subtitle="Comprehensive life insurance solutions that ensure your loved ones are financially protected when they need it most"
        primaryCta={{
          label: "Get a Quote",
          href: `/${locale}/support`,
        }}
        secondaryCta={{
          label: "Learn More",
          href: "#overview",
        }}
      />

      {/* Overview Section */}
      <section id="overview" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline="Overview"
            title="Dedicated Life Insurance Solutions"
            align="center"
            className="mb-12"
          />

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-brand-grayMed text-center mb-12">
              Our dedicated life insurance services focus exclusively on providing comprehensive life insurance
              solutions that ensure your loved ones are financially protected when they need it most.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Services"
            title="Comprehensive Life Insurance Products"
            description="Choose from our range of life insurance solutions designed to meet your specific protection needs."
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

      {/* Key Benefits Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                Why Choose Our Life Insurance Services?
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed">
                Our dedicated focus on life insurance means you get specialized expertise and personalized service
                that generic financial firms simply cannot match. We understand that protecting your family is your
                top priority, and we're here to help you find the right solution with confidence.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <a href={`/${locale}/support`}>Contact an Advisor</a>
              </Button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-dark mb-6">Key Benefits:</h3>
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

      {/* Features Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Why We're Different"
            title="Specialized Life Insurance Expertise"
            description="Our exclusive focus on life insurance allows us to provide unmatched service and expertise."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Expert Advisors</h3>
              <p className="text-sm text-brand-grayMed">Specialized knowledge in all types of life insurance products</p>
            </div>
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Needs Analysis</h3>
              <p className="text-sm text-brand-grayMed">Personalized assessment to find the perfect coverage</p>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Wealth Building</h3>
              <p className="text-sm text-brand-grayMed">Tax-advantaged strategies for long-term financial growth</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-brand-gold" />
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Ongoing Support</h3>
              <p className="text-sm text-brand-grayMed">Continuous policy management and service</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Protect Your Family's Future Today
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Get started with a personalized consultation to discover the life insurance solution
            that best fits your family's needs and financial goals.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/support`}
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
