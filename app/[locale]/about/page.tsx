"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Target, Eye, Award, Users, Shield, Globe, CheckCircle, BadgeCheck, FileCheck, LockKeyhole } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();

  const strengths = [
    {
      icon: Users,
      title: "Business Banking Expertise",
      description: "Over 18+ years of experience serving commercial companies, financial institutions, and investment funds across Europe.",
    },
    {
      icon: Target,
      title: "All-in-One Platform",
      description: "Complete business solution from company formation to banking, accounting, tax advisory, investment, and insurance.",
    },
    {
      icon: Globe,
      title: "Modern Technology",
      description: "Leveraging Artificial Intelligence and Blockchain to make business banking better, easier, and more efficient.",
    },
  ];

  const certifications = [
    {
      icon: BadgeCheck,
      title: "State Licensed",
      description: "State Licensed Agents",
    },
    {
      icon: Award,
      title: "Certified",
      description: "Industry Certified Professionals",
    },
    {
      icon: Shield,
      title: "Bonded",
      description: "Bonded & Insured Operations",
    },
    {
      icon: FileCheck,
      title: "Accredited",
      description: "Better Business Bureau Accredited",
    },
  ];

  const stats = [
    { number: "18+", label: "Years of Experience" },
    { number: "500+", label: "Business Clients" },
  ];

  return (
    <>
      <Hero
        title="About Opulanz"
        subtitle="The One-Stop-Shop Business Banking Platform"
      />

      {/* Our Story */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline="OUR STORY"
            title="Transforming Business Banking"
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-brand-goldLight/20 to-brand-gold/10 p-8 border-l-4 border-brand-gold">
              <p className="text-base text-brand-grayMed leading-relaxed">
                Opulanz is part of <span className="font-semibold text-brand-dark">Groupe Advensys Luxembourg S.A.</span>, a holding company with over <span className="font-semibold text-brand-gold">18+ years of experience</span> in providing comprehensive business solutions across Europe. We built Opulanz with a clear vision: to become the leader in European online banking for businesses.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-brand-grayLight">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-brand-dark">Our Mission</h3>
                </div>
                <p className="text-base text-brand-grayMed leading-relaxed">
                  To improve the ecosystem of business banking, payments, and operational processes using modern technology including AI and Blockchain.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-brand-grayLight">
                <div className="flex items-start gap-3 mb-3">
                  <Eye className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-brand-dark">Our Vision</h3>
                </div>
                <p className="text-base text-brand-grayMed leading-relaxed">
                  To become the leaders of the European online banking market with full banking license and integrated blockchain technologies.
                </p>
              </div>
            </div>

            <p className="text-base text-brand-grayMed leading-relaxed text-center">
              Today, we serve <span className="font-semibold text-brand-dark">commercial companies, financial institutions, investment funds, and freelancers</span> across Europe. Our experienced team continues to innovate with cutting-edge technology while maintaining the highest standards of security, compliance, and customer service. We represent quality, trust, and innovation in business banking.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand-grayDark to-brand-dark py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-brand-gold text-sm font-bold tracking-wider uppercase">Our Impact</span>
              <div className="h-1 w-16 bg-gradient-to-r from-brand-gold to-brand-goldDark mx-auto mt-2 rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by Businesses Across Europe
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our growth reflects the trust our clients place in us
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold via-brand-goldDark to-brand-gold rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl scale-105"></div>
                <Card className="relative border-2 border-brand-gold/30 bg-white/10 backdrop-blur-md text-center shadow-2xl hover:shadow-brand-gold/20 transition-all duration-500 hover:scale-110 hover:-translate-y-2 min-w-[280px]">
                  <CardContent className="p-10">
                    <div className="mb-4 text-6xl md:text-7xl font-black bg-gradient-to-br from-brand-gold via-brand-goldLight to-brand-goldDark bg-clip-text text-transparent drop-shadow-lg">
                      {stat.number}
                    </div>
                    <div className="h-1 w-12 bg-gradient-to-r from-brand-gold to-brand-goldDark mx-auto mb-4 rounded-full"></div>
                    <p className="text-lg font-bold text-white tracking-wide">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Strengths */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="OUR STRENGTHS"
            title="What Sets Us Apart"
            description="Three key pillars of our success"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-3">
            {strengths.map((strength, index) => {
              const Icon = strength.icon;
              return (
                <Card key={index} className="card-hover border-none text-center">
                  <CardContent className="p-8">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                      <Icon className="h-8 w-8 text-brand-goldDark" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-brand-dark">
                      {strength.title}
                    </h3>
                    <p className="text-base text-brand-grayMed leading-relaxed">
                      {strength.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Licenses & Certifications */}
      <section className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="LICENSES & CERTIFICATIONS"
            title="Fully Licensed & Certified"
            description="We maintain all necessary licenses and certifications to provide business banking and financial services across Europe, ensuring compliance with industry regulations and standards."
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <Card key={index} className="border-none text-center shadow-sm">
                  <CardContent className="p-8">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-brand-grayMed">
                      {cert.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title="Why Choose Opulanz?"
            description="What makes us your trusted business banking partner"
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            {[
              {
                title: "One-Stop-Shop Platform",
                description: "Complete business solution covering company formation, banking, accounting, tax advisory, investment, insurance, and more - all in one platform.",
              },
              {
                title: "18+ Years of Experience",
                description: "Part of Groupe Advensys Luxembourg S.A., we bring nearly two decades of expertise in serving businesses across Europe.",
              },
              {
                title: "Modern Technology Stack",
                description: "Built with cutting-edge Artificial Intelligence and Blockchain technology to provide efficient, secure, and innovative banking solutions.",
              },
              {
                title: "Business-Focused Approach",
                description: "Specifically designed for commercial companies, financial institutions, investment funds, and freelancers - not retail banking.",
              },
              {
                title: "European Quality Standards",
                description: "Operating across Europe, we maintain the highest standards of quality, trust, and compliance with banking regulations.",
              },
              {
                title: "Future-Ready Vision",
                description: "Working towards full banking license with integrated blockchain and green technologies to lead the European online banking market.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="border-none">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">
                      {benefit.title}
                    </h3>
                    <p className="text-base text-brand-grayMed leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Join thousands of businesses across Europe who trust Opulanz as their all-in-one banking and business solution platform.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-48 bg-white text-brand-dark hover:bg-gray-50"
            >
              <Link href={`/${locale}/open-account`}>Open an Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-48 border-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link href={`/${locale}/support`}>Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
