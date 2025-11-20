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
    "Independent broker representing your interests",
    "Access to policies from multiple leading insurance providers",
    "Personalized needs analysis and coverage recommendations",
    "Expert guidance on advanced features and estate planning",
    "Ongoing policy management and support",
  ];

  return (
    <>
      <Hero
        title="Life Insurance Brokerage Services"
        subtitle="As your trusted insurance broker, we connect you with comprehensive life insurance solutions to financially protect your loved ones"
        primaryCta={{
          label: "Get a Quote",
          href: `/${locale}/life-insurance/schedule`,
        }}
        secondaryCta={{
          label: "Learn More",
          href: "#overview",
        }}
      />

      {/* Stats Banner */}
      <section className="bg-brand-gold py-8">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">18+</div>
              <div className="text-sm text-white/90">Years of Experience</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-white/90">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-sm text-white/90">Insurance Partners</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-white/90">Independent Advice</div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                overline="Overview"
                title="Your Trusted Life Insurance Broker"
                align="left"
                className="mb-6"
              />
              <p className="text-lg text-brand-grayMed mb-6">
                As an independent insurance broker, we work on your behalf to find and connect you with the best
                life insurance solutions from leading providers, ensuring your loved ones are financially protected.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-lg">
                  <Shield className="h-5 w-5 text-brand-gold" />
                  <span className="text-sm font-semibold text-brand-dark">Unbiased Advice</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-lg">
                  <Users className="h-5 w-5 text-brand-gold" />
                  <span className="text-sm font-semibold text-brand-dark">Multiple Providers</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-lg">
                  <Heart className="h-5 w-5 text-brand-gold" />
                  <span className="text-sm font-semibold text-brand-dark">Family Protection</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-brand-grayLight">
              <h3 className="text-xl font-bold text-brand-dark mb-4">Why Choose a Broker?</h3>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-gold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-brand-dark">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Services"
            title="Life Insurance Products We Broker"
            description="We help you access a wide range of life insurance solutions from trusted providers to meet your specific protection needs."
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => {
              const Icon = product.icon;
              return (
                <Card key={product.title} className="border-none shadow-md hover:shadow-xl transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-brand-gold/40">0{idx + 1}</span>
                    </div>
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-grayMed leading-relaxed">{product.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Simple Process"
            title="How We Help You Find the Right Coverage"
            align="center"
            className="mb-12"
          />
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white text-2xl font-bold mb-4">1</div>
              <h3 className="text-lg font-bold text-brand-dark mb-2">Free Consultation</h3>
              <p className="text-sm text-brand-grayMed">Schedule a no-obligation meeting to discuss your needs</p>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-brand-gold/20 -translate-x-1/2"></div>
            </div>
            <div className="text-center relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white text-2xl font-bold mb-4">2</div>
              <h3 className="text-lg font-bold text-brand-dark mb-2">Compare Options</h3>
              <p className="text-sm text-brand-grayMed">We present policies from multiple top providers</p>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-brand-gold/20 -translate-x-1/2"></div>
            </div>
            <div className="text-center relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white text-2xl font-bold mb-4">3</div>
              <h3 className="text-lg font-bold text-brand-dark mb-2">Expert Guidance</h3>
              <p className="text-sm text-brand-grayMed">Get unbiased recommendations tailored to you</p>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-brand-gold/20 -translate-x-1/2"></div>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white text-2xl font-bold mb-4">4</div>
              <h3 className="text-lg font-bold text-brand-dark mb-2">Ongoing Support</h3>
              <p className="text-sm text-brand-grayMed">Continuous assistance throughout your policy lifecycle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Why We're Different"
            title="Professional Insurance Brokerage Expertise"
            description="As independent brokers, we provide unbiased advice and access to the best insurance solutions for your needs."
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-brand-grayLight">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-gold/10 mb-4">
                <Shield className="h-7 w-7 text-brand-gold" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-brand-dark">Expert Brokers</h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">Specialized knowledge to connect you with the right insurance products</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-brand-grayLight">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-gold/10 mb-4">
                <FileText className="h-7 w-7 text-brand-gold" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-brand-dark">Needs Analysis</h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">Personalized assessment to find the perfect coverage from multiple providers</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-brand-grayLight">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-gold/10 mb-4">
                <TrendingUp className="h-7 w-7 text-brand-gold" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-brand-dark">Wealth Building</h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">Guidance on tax-advantaged strategies for long-term financial growth</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-brand-grayLight">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-gold/10 mb-4">
                <Users className="h-7 w-7 text-brand-gold" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-brand-dark">Ongoing Support</h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">Continuous policy management and brokerage support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Protect Your Family's Future Today
              </h2>
              <p className="mx-auto max-w-2xl text-balance text-lg text-white/90">
                Get started with a personalized consultation. We'll help you compare options from leading
                insurance providers to find the solution that best fits your family's needs and financial goals.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center bg-white/10 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">Free Consultation</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">Compare Multiple Providers</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">Expert Guidance</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`/${locale}/life-insurance/schedule`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-lg transition-all hover:bg-gray-50 hover:scale-105"
              >
                Get Free Quote
              </a>
              <a
                href={`/${locale}/life-insurance/schedule`}
                className="inline-flex h-14 min-w-56 items-center justify-center rounded-2xl border-2 border-white bg-white/10 px-8 text-base font-semibold text-white transition-all hover:bg-white/20"
              >
                Talk to an Advisor
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
